import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  abiExecutiveKpiDashboards,
  abiVoyageAnalytics,
  abiTradeLaneAnalytics,
  abiCustomerRevenueAnalytics,
  abiPredictiveForecasts,
  abiMarketIntelligenceReports,
  abiOperationalEfficiencies,
  abiBiReports,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "analytics:read")))
      return forbiddenResponse();

    const [
      publishedKpiDashboards,
      draftVoyageAnalytics,
      draftTradeLaneAnalytics,
      draftCustomerAnalytics,
      activePredictions,
      draftMarketReports,
      draftEfficiencyAnalytics,
      scheduledBiReports,
    ] = await Promise.all([
      db.select({ value: count() }).from(abiExecutiveKpiDashboards)
        .where(and(eq(abiExecutiveKpiDashboards.tenantId, user.tenantId), isNull(abiExecutiveKpiDashboards.deletedAt), eq(abiExecutiveKpiDashboards.status, "published")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(abiVoyageAnalytics)
        .where(and(eq(abiVoyageAnalytics.tenantId, user.tenantId), isNull(abiVoyageAnalytics.deletedAt), eq(abiVoyageAnalytics.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(abiTradeLaneAnalytics)
        .where(and(eq(abiTradeLaneAnalytics.tenantId, user.tenantId), isNull(abiTradeLaneAnalytics.deletedAt), eq(abiTradeLaneAnalytics.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(abiCustomerRevenueAnalytics)
        .where(and(eq(abiCustomerRevenueAnalytics.tenantId, user.tenantId), isNull(abiCustomerRevenueAnalytics.deletedAt), eq(abiCustomerRevenueAnalytics.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(abiPredictiveForecasts)
        .where(and(eq(abiPredictiveForecasts.tenantId, user.tenantId), isNull(abiPredictiveForecasts.deletedAt), eq(abiPredictiveForecasts.status, "active")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(abiMarketIntelligenceReports)
        .where(and(eq(abiMarketIntelligenceReports.tenantId, user.tenantId), isNull(abiMarketIntelligenceReports.deletedAt), eq(abiMarketIntelligenceReports.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(abiOperationalEfficiencies)
        .where(and(eq(abiOperationalEfficiencies.tenantId, user.tenantId), isNull(abiOperationalEfficiencies.deletedAt), eq(abiOperationalEfficiencies.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(abiBiReports)
        .where(and(eq(abiBiReports.tenantId, user.tenantId), isNull(abiBiReports.deletedAt), eq(abiBiReports.status, "scheduled")))
        .then(([r]) => r.value),
    ]);

    return NextResponse.json({
      data: {
        publishedKpiDashboards,
        draftVoyageAnalytics,
        draftTradeLaneAnalytics,
        draftCustomerAnalytics,
        activePredictions,
        draftMarketReports,
        draftEfficiencyAnalytics,
        scheduledBiReports,
      },
    });
  } catch (error) {
    console.error("Failed to get analytics hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
