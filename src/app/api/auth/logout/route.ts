import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db, clearTenantRLS } from "@/lib/db";
import { sessions } from "@/db/schema";
import { hashToken } from "@/lib/tokens";
import { logAuditEvent } from "@/lib/audit";
import { clearAuthCookies } from "@/lib/cookies";
import { getClientIp, getUserAgent } from "@/lib/request";
import { verifyAccessToken, blacklistToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const refreshTokenCookie = request.cookies.get("cs_refresh_token")?.value;
    const accessTokenCookie = request.cookies.get("cs_access_token")?.value;
    const ip = getClientIp(request);
    const ua = getUserAgent(request);

    // CSERP-010: Blacklist the access token so it can't be reused for 15 minutes
    if (accessTokenCookie) {
      try {
        const payload = await verifyAccessToken(accessTokenCookie);
        if (payload.jti) {
          await blacklistToken(payload.jti);
        }
      } catch {
        // Token already expired or invalid — no need to blacklist
      }
    }

    // Clear stale tenant context from pooled connection (prevents RLS filtering)
    await clearTenantRLS();

    if (refreshTokenCookie) {
      const tokenHash = hashToken(refreshTokenCookie);

      // Find and revoke session
      const [session] = await db
        .select({ id: sessions.id, userId: sessions.userId, tenantId: sessions.tenantId })
        .from(sessions)
        .where(
          and(
            eq(sessions.refreshTokenHash, tokenHash),
            isNull(sessions.revokedAt)
          )
        )
        .limit(1);

      if (session) {
        await db
          .update(sessions)
          .set({ revokedAt: new Date(), revokedReason: "user_logout" })
          .where(eq(sessions.id, session.id));

        await logAuditEvent({
          tenantId: session.tenantId,
          userId: session.userId,
          eventType: "logout",
          ipAddress: ip,
          userAgent: ua,
        });
      }
    }

    const response = NextResponse.json({ message: "Logged out" });
    clearAuthCookies(response);
    return response;
  } catch (error) {
    console.error("[logout]", error);
    // Still clear cookies even on error
    const response = NextResponse.json({ message: "Logged out" });
    clearAuthCookies(response);
    return response;
  }
}
