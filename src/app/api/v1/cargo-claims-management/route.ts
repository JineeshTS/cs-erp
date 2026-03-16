import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  ccmClaimRegistrations,
  ccmLiabilityAssessments,
  ccmDamageSurveys,
  ccmTimeBarTrackings,
  ccmClaimSettlements,
  ccmSubrogationRecoveries,
  ccmClaimPredictions,
  ccmPortfolioAnalytics,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "ccm:read")))
      return forbiddenResponse();

    const [
      draftClaimRegistrations,
      draftLiabilityAssessments,
      draftDamageSurveys,
      draftTimeBarTrackings,
      draftClaimSettlements,
      draftSubrogationRecoveries,
      draftClaimPredictions,
      draftPortfolioAnalytics,
    ] = await Promise.all([
      db.select({ value: count() }).from(ccmClaimRegistrations)
        .where(and(eq(ccmClaimRegistrations.tenantId, user.tenantId), isNull(ccmClaimRegistrations.deletedAt), eq(ccmClaimRegistrations.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(ccmLiabilityAssessments)
        .where(and(eq(ccmLiabilityAssessments.tenantId, user.tenantId), isNull(ccmLiabilityAssessments.deletedAt), eq(ccmLiabilityAssessments.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(ccmDamageSurveys)
        .where(and(eq(ccmDamageSurveys.tenantId, user.tenantId), isNull(ccmDamageSurveys.deletedAt), eq(ccmDamageSurveys.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(ccmTimeBarTrackings)
        .where(and(eq(ccmTimeBarTrackings.tenantId, user.tenantId), isNull(ccmTimeBarTrackings.deletedAt), eq(ccmTimeBarTrackings.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(ccmClaimSettlements)
        .where(and(eq(ccmClaimSettlements.tenantId, user.tenantId), isNull(ccmClaimSettlements.deletedAt), eq(ccmClaimSettlements.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(ccmSubrogationRecoveries)
        .where(and(eq(ccmSubrogationRecoveries.tenantId, user.tenantId), isNull(ccmSubrogationRecoveries.deletedAt), eq(ccmSubrogationRecoveries.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(ccmClaimPredictions)
        .where(and(eq(ccmClaimPredictions.tenantId, user.tenantId), isNull(ccmClaimPredictions.deletedAt), eq(ccmClaimPredictions.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(ccmPortfolioAnalytics)
        .where(and(eq(ccmPortfolioAnalytics.tenantId, user.tenantId), isNull(ccmPortfolioAnalytics.deletedAt), eq(ccmPortfolioAnalytics.status, "draft")))
        .then(([r]) => r.value),
    ]);

    return NextResponse.json({
      data: {
        draftClaimRegistrations,
        draftLiabilityAssessments,
        draftDamageSurveys,
        draftTimeBarTrackings,
        draftClaimSettlements,
        draftSubrogationRecoveries,
        draftClaimPredictions,
        draftPortfolioAnalytics,
      },
    });
  } catch (error) {
    console.error("Failed to get CCM hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
