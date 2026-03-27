import { NextRequest, NextResponse } from "next/server";
import { and, lt, isNull, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { peHumanGates } from "@/db/schema";
import { timingSafeCompare } from "@/lib/tokens";

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

/**
 * POST /api/internal/cron/sla-check
 *
 * Finds human gates past SLA deadline and marks them as breached.
 * Auth: INTERNAL_API_KEY header.
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

    // Find pending gates past their SLA deadline
    const breachedGates = await db
      .select({ id: peHumanGates.id, tenantId: peHumanGates.tenantId })
      .from(peHumanGates)
      .where(
        and(
          isNull(peHumanGates.decidedAt),
          isNull(peHumanGates.deletedAt),
          lt(peHumanGates.slaDeadline, now)
        )
      )
      .limit(100);

    let escalated = 0;
    for (const gate of breachedGates) {
      // Mark SLA as breached in decisionData metadata
      await db
        .update(peHumanGates)
        .set({
          updatedAt: now,
          decisionData: { _slaBreached: true, _breachedAt: now.toISOString() },
        })
        .where(and(eq(peHumanGates.id, gate.id), eq(peHumanGates.tenantId, gate.tenantId)));
      escalated++;
    }

    return NextResponse.json({
      data: { checkedAt: now.toISOString(), breachedCount: breachedGates.length, escalated },
    });
  } catch (error) {
    console.error("SLA check cron error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "SLA check failed" } },
      { status: 500 }
    );
  }
}
