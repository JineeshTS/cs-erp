import { NextRequest, NextResponse } from "next/server";
import { and, lt, eq, isNull, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessions } from "@/db/schema";
import { timingSafeCompare } from "@/lib/tokens";
import { sql } from "drizzle-orm";

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
const MAX_SESSIONS_PER_USER = 10;

/**
 * POST /api/internal/cron/session-cleanup
 *
 * 1. Revokes all expired sessions (expires_at < NOW()).
 * 2. Enforces max sessions per user — revokes oldest beyond limit.
 *
 * Auth: INTERNAL_API_KEY header check — not user-facing.
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-internal-api-key");
    if (!INTERNAL_API_KEY || !apiKey || !timingSafeCompare(apiKey, INTERNAL_API_KEY)) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Invalid internal API key" } },
        { status: 401 }
      );
    }

    const now = new Date();

    // 1. Revoke all expired sessions
    const expiredResult = await db
      .update(sessions)
      .set({ revokedAt: now, revokedReason: "expired" })
      .where(
        and(
          lt(sessions.expiresAt, now),
          isNull(sessions.revokedAt)
        )
      )
      .returning({ id: sessions.id });

    // 2. Find users with more than MAX_SESSIONS_PER_USER active sessions
    const usersOverLimit = await db.execute(sql`
      SELECT user_id, array_agg(id ORDER BY created_at DESC) as session_ids
      FROM sessions
      WHERE revoked_at IS NULL
      GROUP BY user_id
      HAVING count(*) > ${MAX_SESSIONS_PER_USER}
    `);

    let sessionsRevoked = 0;
    for (const row of usersOverLimit as unknown as Array<{ user_id: string; session_ids: string[] }>) {
      const toRevoke = row.session_ids.slice(MAX_SESSIONS_PER_USER);
      if (toRevoke.length > 0) {
        await db
          .update(sessions)
          .set({ revokedAt: now, revokedReason: "session_limit" })
          .where(inArray(sessions.id, toRevoke));
        sessionsRevoked += toRevoke.length;
      }
    }

    return NextResponse.json({
      data: {
        cleanedAt: now.toISOString(),
        expiredRevoked: expiredResult.length,
        overLimitRevoked: sessionsRevoked,
      },
    });
  } catch (error) {
    console.error("Session cleanup cron error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to clean up sessions" } },
      { status: 500 }
    );
  }
}
