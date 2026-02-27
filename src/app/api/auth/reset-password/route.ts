import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, sessions } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { hashToken, timingSafeCompare } from "@/lib/tokens";
import { resetPasswordSchema, formatZodErrors } from "@/lib/validation";
import { logAuditEvent } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodErrors(parsed.error) },
        { status: 422 }
      );
    }

    const { token, password } = parsed.data;
    const ip = getClientIp(request);
    const ua = getUserAgent(request);
    const tokenHash = hashToken(token);

    // Find user with valid reset token
    const allUsers = await db
      .select({
        id: users.id,
        tenantId: users.tenantId,
        passwordResetToken: users.passwordResetToken,
        passwordResetExpires: users.passwordResetExpires,
      })
      .from(users)
      .where(eq(users.passwordResetToken, tokenHash))
      .limit(1);

    const user = allUsers[0];

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Check expiry
    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Timing-safe comparison of stored token hash
    if (
      !user.passwordResetToken ||
      !timingSafeCompare(user.passwordResetToken, tokenHash)
    ) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update user: new password, clear reset token, reset lockout
    await db
      .update(users)
      .set({
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
        status: "active",
        mustChangePassword: false,
      })
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

    return NextResponse.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("[reset-password]", error);
    return NextResponse.json(
      { error: "Password reset failed" },
      { status: 500 }
    );
  }
}
