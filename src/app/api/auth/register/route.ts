import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tenants, users, roles, sessions } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { signAccessToken } from "@/lib/jwt";
import { generateRefreshToken, hashToken } from "@/lib/tokens";
import { logAuditEvent } from "@/lib/audit";
import { setAuthCookies } from "@/lib/cookies";
import { getClientIp, getUserAgent } from "@/lib/request";
import { registerSchema, formatZodErrors } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { createHash } from "crypto";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // Rate limit: 5 registrations per hour per IP
    const rlKey = `register:${createHash("sha256").update(ip).digest("hex")}`;
    const rl = await checkRateLimit(rlKey, 5, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: { code: "RATE_LIMIT", message: "Too many registration attempts. Please try again later." } },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt.getTime() - Date.now()) / 1000)) } }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Invalid JSON body" } },
        { status: 400 }
      );
    }
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Validation failed", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { email, password, tenantName, displayName, country, timezone } = parsed.data;
    const ua = getUserAgent(request);

    // Map country to region/currency
    const regionMap: Record<string, string> = { QA: "qa", AE: "ae", SA: "sa", IN: "in" };
    const currencyMap: Record<string, string> = { QA: "QAR", AE: "AED", SA: "SAR", IN: "INR" };

    const slug = slugify(tenantName) + "-" + Date.now().toString(36);

    // Create tenant
    const [tenant] = await db
      .insert(tenants)
      .values({
        name: tenantName,
        slug,
        plan: "starter",
        region: (regionMap[country || "QA"] || "global") as "qa" | "ae" | "sa" | "in" | "global",
        status: "trial",
        country: country || "QA",
        timezone: timezone || "Asia/Qatar",
        currency: currencyMap[country || "QA"] || "QAR",
      })
      .returning({ id: tenants.id });

    // Find the seeded tenant_admin system role
    const [adminRole] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.name, "tenant_admin"))
      .limit(1);

    if (!adminRole) {
      throw new Error("tenant_admin role not found. Run RBAC seed.");
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const [user] = await db
      .insert(users)
      .values({
        tenantId: tenant.id,
        email,
        displayName: displayName || email.split("@")[0],
        passwordHash,
        roleId: adminRole.id,
        status: "active",
        emailVerified: false,
      })
      .returning({ id: users.id });

    await logAuditEvent({
      tenantId: tenant.id,
      userId: user.id,
      eventType: "user_created",
      ipAddress: ip,
      userAgent: ua,
      metadata: { email, tenantName },
    });

    // Auto-login: generate tokens
    const accessToken = await signAccessToken({
      sub: user.id,
      tid: tenant.id,
      email,
      role: "tenant_admin",
    });

    const refreshToken = generateRefreshToken();
    await db.insert(sessions).values({
      userId: user.id,
      tenantId: tenant.id,
      refreshTokenHash: hashToken(refreshToken),
      userAgent: ua,
      ipAddress: ip,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const response = NextResponse.json(
      {
        data: {
          userId: user.id,
          tenantId: tenant.id,
          redirect: "/onboarding",
        },
      },
      { status: 201 }
    );

    setAuthCookies(response, accessToken, refreshToken);
    return response;
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Registration failed" } },
      { status: 500 }
    );
  }
}
