import { NextRequest, NextResponse } from "next/server";
import { and, lt, isNull, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { vtmSurveyTrackings } from "@/db/schema";
import { timingSafeCompare } from "@/lib/tokens";

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

/**
 * POST /api/internal/cron/certificate-expiry-check
 *
 * Finds vessel survey/certificate records expiring within 30 days.
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
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Find surveys/certs expiring within 30 days that haven't been flagged
    const expiring = await db
      .select({
        id: vtmSurveyTrackings.id,
        vesselName: vtmSurveyTrackings.vesselName,
        surveyType: vtmSurveyTrackings.surveyType,
        expiryDate: vtmSurveyTrackings.expiryDate,
      })
      .from(vtmSurveyTrackings)
      .where(
        and(
          isNull(vtmSurveyTrackings.deletedAt),
          lt(vtmSurveyTrackings.expiryDate, thirtyDaysFromNow),
          gte(vtmSurveyTrackings.expiryDate, now)
        )
      )
      .limit(200);

    // Log results — in production, this would emit notifications
    for (const cert of expiring) {
      const daysRemaining = Math.ceil(
        ((cert.expiryDate?.getTime() ?? 0) - now.getTime()) / (24 * 60 * 60 * 1000)
      );
      console.log(
        `[CertExpiry] ${cert.vesselName} — ${cert.surveyType} expires in ${daysRemaining} days`
      );
    }

    return NextResponse.json({
      data: { checkedAt: now.toISOString(), expiringCount: expiring.length },
    });
  } catch (error) {
    console.error("Certificate expiry check cron error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Certificate expiry check failed" } },
      { status: 500 }
    );
  }
}
