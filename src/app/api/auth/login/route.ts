import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, roles, sessions } from "@/db/schema";
import { verifyPassword } from "@/lib/password";
import { signAccessToken } from "@/lib/jwt";
import { generateRefreshToken, hashToken } from "@/lib/tokens";
import { loginSchema, formatZodErrors } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { logAuditEvent } from "@/lib/audit";
import { setAuthCookies } from "@/lib/cookies";
import { getClientIp, getUserAgent } from "@/lib/request";
import { createHash } from "crypto";

const RATE_LIMIT_MAX = parseInt(
  process.env.RATE_LIMIT_LOGIN_MAX || "5",
  10
);
const RATE_LIMIT_WINDOW = parseInt(
  process.env.RATE_LIMIT_LOGIN_WINDOW_MS || "900000",
  10
);

const AUTH_ERROR_MSG = "Invalid email or password";

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodErrors(parsed.error) },
        { status: 422 }
      );
    }

    const { email, password } = parsed.data;
    const ip = getClientIp(request);
    const ua = getUserAgent(request);

    // Rate limit by email+IP hash BEFORE any DB query
    const rateLimitKey = `login:${createHash("sha256")
      .update(`${email}:${ip}`)
      .digest("hex")}`;
    const rateCheck = await checkRateLimit(rateLimitKey, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);

    if (!rateCheck.allowed) {
      const retryAfterSeconds = Math.ceil(
        (rateCheck.resetAt.getTime() - Date.now()) / 1000
      );
      return NextResponse.json(
        {
          error: "Too many login attempts. Please try again later.",
          retryAfter: retryAfterSeconds,
        },
        {
          status: 429,
          headers: { "Retry-After": retryAfterSeconds.toString() },
        }
      );
    }

    // Fetch user
    // SECURITY: unique(tenant_id, email) enforced via DB migration
    const [user] = await db
      .select({
        id: users.id,
        tenantId: users.tenantId,
        email: users.email,
        displayName: users.displayName,
        passwordHash: users.passwordHash,
        status: users.status,
        failedLoginAttempts: users.failedLoginAttempts,
        lockedUntil: users.lockedUntil,
        roleId: users.roleId,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Verify password (runs bcrypt even if user not found — timing attack prevention)
    const passwordValid = await verifyPassword(
      password,
      user?.passwordHash ?? null
    );

    if (!user || !passwordValid) {
      if (user) {
        // Increment failed login attempts
        const newAttempts = user.failedLoginAttempts + 1;
        const updates: Record<string, unknown> = {
          failedLoginAttempts: newAttempts,
        };

        // Lock account after 5 failures
        if (newAttempts >= 5) {
          // Exponential backoff: 15min, 30min, 1hr, 2hr...
          const lockMinutes = 15 * Math.pow(2, Math.floor((newAttempts - 5) / 5));
          updates.lockedUntil = new Date(
            Date.now() + lockMinutes * 60 * 1000
          );
          updates.status = "locked";

          await logAuditEvent({
            tenantId: user.tenantId,
            userId: user.id,
            eventType: "account_locked",
            ipAddress: ip,
            userAgent: ua,
            metadata: { failedAttempts: newAttempts, lockMinutes },
          });
        }

        await db
          .update(users)
          .set(updates)
          .where(eq(users.id, user.id));

        await logAuditEvent({
          tenantId: user.tenantId,
          userId: user.id,
          eventType: "login_failed",
          ipAddress: ip,
          userAgent: ua,
        });
      }

      return NextResponse.json({ error: AUTH_ERROR_MSG }, { status: 401 });
    }

    // Check account status
    if (user.status === "locked") {
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        const retryAfterSeconds = Math.ceil(
          (user.lockedUntil.getTime() - Date.now()) / 1000
        );
        return NextResponse.json(
          {
            error: "Account is temporarily locked. Please try again later.",
            retryAfter: retryAfterSeconds,
          },
          {
            status: 423,
            headers: { "Retry-After": retryAfterSeconds.toString() },
          }
        );
      }
      // Lock expired — unlock the account
      await db
        .update(users)
        .set({
          status: "active",
          failedLoginAttempts: 0,
          lockedUntil: null,
        })
        .where(eq(users.id, user.id));
    }

    if (user.status === "inactive") {
      return NextResponse.json({ error: AUTH_ERROR_MSG }, { status: 401 });
    }

    if (user.status === "pending_verification") {
      return NextResponse.json(
        { error: "Please verify your email before logging in." },
        { status: 401 }
      );
    }

    // Get role name
    let roleName = "user";
    if (user.roleId) {
      const [role] = await db
        .select({ name: roles.name })
        .from(roles)
        .where(eq(roles.id, user.roleId))
        .limit(1);
      if (role) roleName = role.name;
    }

    // Generate tokens
    const accessToken = await signAccessToken({
      sub: user.id,
      tid: user.tenantId,
      email: user.email,
      role: roleName,
    });

    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashToken(refreshToken);

    // Store session in DB
    await db.insert(sessions).values({
      userId: user.id,
      tenantId: user.tenantId,
      refreshTokenHash,
      userAgent: ua,
      ipAddress: ip,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    // Reset failed login attempts
    await db
      .update(users)
      .set({
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ip,
        status: "active",
      })
      .where(eq(users.id, user.id));

    await logAuditEvent({
      tenantId: user.tenantId,
      userId: user.id,
      eventType: "login",
      ipAddress: ip,
      userAgent: ua,
    });

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: roleName,
      },
      expiresAt,
    });

    setAuthCookies(response, accessToken, refreshToken);
    return response;
  } catch (error) {
    console.error("[login]", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
