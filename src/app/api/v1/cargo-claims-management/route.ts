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
import { eq, and, isNull } from "drizzle-orm";

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
      db.select({ id: ccmClaimRegistrations.id }).from(ccmClaimRegistrations)
        .where(and(eq(ccmClaimRegistrations.tenantId, user.tenantId), isNull(ccmClaimRegistrations.deletedAt), eq(ccmClaimRegistrations.status, "draft")))
        .then((r) => r.length),
      db.select({ id: ccmLiabilityAssessments.id }).from(ccmLiabilityAssessments)
        .where(and(eq(ccmLiabilityAssessments.tenantId, user.tenantId), isNull(ccmLiabilityAssessments.deletedAt), eq(ccmLiabilityAssessments.status, "draft")))
        .then((r) => r.length),
      db.select({ id: ccmDamageSurveys.id }).from(ccmDamageSurveys)
        .where(and(eq(ccmDamageSurveys.tenantId, user.tenantId), isNull(ccmDamageSurveys.deletedAt), eq(ccmDamageSurveys.status, "draft")))
        .then((r) => r.length),
      db.select({ id: ccmTimeBarTrackings.id }).from(ccmTimeBarTrackings)
        .where(and(eq(ccmTimeBarTrackings.tenantId, user.tenantId), isNull(ccmTimeBarTrackings.deletedAt), eq(ccmTimeBarTrackings.status, "draft")))
        .then((r) => r.length),
      db.select({ id: ccmClaimSettlements.id }).from(ccmClaimSettlements)
        .where(and(eq(ccmClaimSettlements.tenantId, user.tenantId), isNull(ccmClaimSettlements.deletedAt), eq(ccmClaimSettlements.status, "draft")))
        .then((r) => r.length),
      db.select({ id: ccmSubrogationRecoveries.id }).from(ccmSubrogationRecoveries)
        .where(and(eq(ccmSubrogationRecoveries.tenantId, user.tenantId), isNull(ccmSubrogationRecoveries.deletedAt), eq(ccmSubrogationRecoveries.status, "draft")))
        .then((r) => r.length),
      db.select({ id: ccmClaimPredictions.id }).from(ccmClaimPredictions)
        .where(and(eq(ccmClaimPredictions.tenantId, user.tenantId), isNull(ccmClaimPredictions.deletedAt), eq(ccmClaimPredictions.status, "draft")))
        .then((r) => r.length),
      db.select({ id: ccmPortfolioAnalytics.id }).from(ccmPortfolioAnalytics)
        .where(and(eq(ccmPortfolioAnalytics.tenantId, user.tenantId), isNull(ccmPortfolioAnalytics.deletedAt), eq(ccmPortfolioAnalytics.status, "draft")))
        .then((r) => r.length),
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
