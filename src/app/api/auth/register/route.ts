import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tenants, users, roles } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { registerSchema, formatZodErrors } from "@/lib/validation";
import { logAuditEvent } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodErrors(parsed.error) },
        { status: 422 }
      );
    }

    const { email, password, tenantName, displayName } = parsed.data;
    const ip = getClientIp(request);
    const ua = getUserAgent(request);

    // Create tenant
    const slug = slugify(tenantName) + "-" + Date.now().toString(36);
    const [tenant] = await db
      .insert(tenants)
      .values({
        name: tenantName,
        slug,
        plan: "starter",
        region: "global",
        status: "trial",
      })
      .returning({ id: tenants.id });

    // Create admin role for the tenant
    const [adminRole] = await db
      .insert(roles)
      .values({
        tenantId: tenant.id,
        name: "Admin",
        description: "Tenant administrator with full access",
        isSystem: true,
        permissions: ["*"],
      })
      .returning({ id: roles.id });

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
        status: "pending_verification",
        emailVerified: false,
      })
      .returning({ id: users.id });

    // Stub: log verification email to console
    console.log(
      `[email-stub] Verification email for ${email}, user=${user.id}`
    );

    await logAuditEvent({
      tenantId: tenant.id,
      userId: user.id,
      eventType: "user_created",
      ipAddress: ip,
      userAgent: ua,
      metadata: { email, tenantName },
    });

    return NextResponse.json(
      { message: "Verification email sent" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
