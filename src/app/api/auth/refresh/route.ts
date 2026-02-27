import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessions, users, roles } from "@/db/schema";
import { signAccessToken } from "@/lib/jwt";
import { generateRefreshToken, hashToken } from "@/lib/tokens";
import { logAuditEvent } from "@/lib/audit";
import { setAuthCookies } from "@/lib/cookies";
import { getClientIp, getUserAgent } from "@/lib/request";

export async function POST(request: NextRequest) {
  try {
    const refreshTokenCookie = request.cookies.get("cs_refresh_token")?.value;

    if (!refreshTokenCookie) {
      return NextResponse.json(
        { error: "No refresh token provided" },
        { status: 401 }
      );
    }

    const tokenHash = hashToken(refreshTokenCookie);
    const ip = getClientIp(request);
    const ua = getUserAgent(request);

    // Find the session by token hash
    const [session] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.refreshTokenHash, tokenHash),
          isNull(sessions.revokedAt)
        )
      )
      .limit(1);

    if (!session) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    // Check expiry
    if (session.expiresAt < new Date()) {
      await db
        .update(sessions)
        .set({ revokedAt: new Date(), revokedReason: "expired" })
        .where(eq(sessions.id, session.id));
      return NextResponse.json(
        { error: "Refresh token expired" },
        { status: 401 }
      );
    }

    // Revoke old session (token rotation)
    await db
      .update(sessions)
      .set({ revokedAt: new Date(), revokedReason: "rotated" })
      .where(eq(sessions.id, session.id));

    // Get user info
    const [user] = await db
      .select({
        id: users.id,
        tenantId: users.tenantId,
        email: users.email,
        roleId: users.roleId,
        status: users.status,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user || user.status === "inactive" || user.status === "locked") {
      return NextResponse.json(
        { error: "Account is not active" },
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

    // Issue new tokens
    const accessToken = await signAccessToken({
      sub: user.id,
      tid: user.tenantId,
      email: user.email,
      role: roleName,
    });

    const newRefreshToken = generateRefreshToken();
    const newRefreshTokenHash = hashToken(newRefreshToken);

    // Create new session
    await db.insert(sessions).values({
      userId: user.id,
      tenantId: user.tenantId,
      refreshTokenHash: newRefreshTokenHash,
      userAgent: ua,
      ipAddress: ip,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await logAuditEvent({
      tenantId: user.tenantId,
      userId: user.id,
      eventType: "token_refreshed",
      ipAddress: ip,
      userAgent: ua,
    });

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const response = NextResponse.json({ expiresAt });
    setAuthCookies(response, accessToken, newRefreshToken);
    return response;
  } catch (error) {
    console.error("[refresh]", error);
    return NextResponse.json(
      { error: "Token refresh failed" },
      { status: 500 }
    );
  }
}
