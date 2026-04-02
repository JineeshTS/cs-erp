import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db, clearTenantRLS } from "@/lib/db";
import { users, sessions } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { hashToken, timingSafeCompare } from "@/lib/tokens";
import { resetPasswordSchema, formatZodErrors } from "@/lib/validation";
import { logAuditEvent } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp, getUserAgent } from "@/lib/request";
import { createHash } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // Rate limit: 10 attempts per 15 min per IP
    const rlKey = `reset-pwd:${createHash("sha256").update(ip).digest("hex")}`;
    const rl = await checkRateLimit(rlKey, 10, 15 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: { code: "RATE_LIMIT", message: "Too many attempts. Please try again later." } },
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
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Validation failed", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { token, password } = parsed.data;
    const ua = getUserAgent(request);
    const tokenHash = hashToken(token);

    // Clear stale tenant context from pooled connection (prevents RLS filtering)
    await clearTenantRLS();

    // Find user with valid reset token (exclude soft-deleted users)
    const [user] = await db
      .select({
        id: users.id,
        tenantId: users.tenantId,
        passwordResetToken: users.passwordResetToken,
        passwordResetExpires: users.passwordResetExpires,
        lockedUntil: users.lockedUntil,
        status: users.status,
      })
      .from(users)
      .where(
        and(
          eq(users.passwordResetToken, tokenHash),
          isNull(users.deletedAt)
        )
      )
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: { code: "INVALID_TOKEN", message: "Invalid or expired reset token" } },
        { status: 400 }
      );
    }

    // Check expiry
    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      return NextResponse.json(
        { error: { code: "INVALID_TOKEN", message: "Invalid or expired reset token" } },
        { status: 400 }
      );
    }

    // Timing-safe comparison of stored token hash
    if (
      !user.passwordResetToken ||
      !timingSafeCompare(user.passwordResetToken, tokenHash)
    ) {
      return NextResponse.json(
        { error: { code: "INVALID_TOKEN", message: "Invalid or expired reset token" } },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update user: new password, clear reset token
    // Only clear auto-locks (where lockedUntil was set) — don't clear admin-set locks
    const isAutoLocked = user.status === "locked" && user.lockedUntil != null;
    const updates: Record<string, unknown> = {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
      mustChangePassword: false,
    };

    if (isAutoLocked) {
      // Auto-lock from failed attempts — safe to clear
      updates.failedLoginAttempts = 0;
      updates.lockedUntil = null;
      updates.status = "active";
    } else if (user.status !== "locked") {
      // Not locked at all — just reset attempts
      updates.failedLoginAttempts = 0;
    }
    // If status is "locked" but lockedUntil is null → admin-set lock, don't clear

    await db
      .update(users)
      .set(updates)
      .where(eq(users.id, user.id));

    // Revoke all existing sessions
    await db
      .update(sessions)
      .set({ revokedAt: new Date(), revokedReason: "password_reset" })
      .where(
        and(eq(sessions.userId, user.id), isNull(sessions.revokedAt))
      );

    await logAuditEvent({
      tenantId: user.tenantId,
      userId: user.id,
      eventType: "password_reset",
      ipAddress: ip,
      userAgent: ua,
    });

    return NextResponse.json({ data: { message: "Password reset successful" } });
  } catch (error) {
    console.error("[reset-password]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Password reset failed" } },
      { status: 500 }
    );
  }
}
