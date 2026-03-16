import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  vrsVoyageCloses,
  vrsTcSettlements,
  vrsVoyagePnls,
  vrsHireReconciliations,
  vrsResultWorkflows,
  vrsIntercoSettlements,
  vrsProfitBenchmarks,
  vrsVoyageAnalytics,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "vrs:read")))
      return forbiddenResponse();

    const [
      draftVoyageCloses,
      draftTcSettlements,
      draftVoyagePnls,
      draftHireReconciliations,
      draftResultWorkflows,
      draftIntercoSettlements,
      draftProfitBenchmarks,
      draftVoyageAnalytics,
    ] = await Promise.all([
      db.select({ value: count() }).from(vrsVoyageCloses)
        .where(and(eq(vrsVoyageCloses.tenantId, user.tenantId), isNull(vrsVoyageCloses.deletedAt), eq(vrsVoyageCloses.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(vrsTcSettlements)
        .where(and(eq(vrsTcSettlements.tenantId, user.tenantId), isNull(vrsTcSettlements.deletedAt), eq(vrsTcSettlements.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(vrsVoyagePnls)
        .where(and(eq(vrsVoyagePnls.tenantId, user.tenantId), isNull(vrsVoyagePnls.deletedAt), eq(vrsVoyagePnls.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(vrsHireReconciliations)
        .where(and(eq(vrsHireReconciliations.tenantId, user.tenantId), isNull(vrsHireReconciliations.deletedAt), eq(vrsHireReconciliations.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(vrsResultWorkflows)
        .where(and(eq(vrsResultWorkflows.tenantId, user.tenantId), isNull(vrsResultWorkflows.deletedAt), eq(vrsResultWorkflows.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(vrsIntercoSettlements)
        .where(and(eq(vrsIntercoSettlements.tenantId, user.tenantId), isNull(vrsIntercoSettlements.deletedAt), eq(vrsIntercoSettlements.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(vrsProfitBenchmarks)
        .where(and(eq(vrsProfitBenchmarks.tenantId, user.tenantId), isNull(vrsProfitBenchmarks.deletedAt), eq(vrsProfitBenchmarks.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(vrsVoyageAnalytics)
        .where(and(eq(vrsVoyageAnalytics.tenantId, user.tenantId), isNull(vrsVoyageAnalytics.deletedAt), eq(vrsVoyageAnalytics.status, "draft")))
        .then(([r]) => r.value),
    ]);

    return NextResponse.json({
      data: {
        draftVoyageCloses,
        draftTcSettlements,
        draftVoyagePnls,
        draftHireReconciliations,
        draftResultWorkflows,
        draftIntercoSettlements,
        draftProfitBenchmarks,
        draftVoyageAnalytics,
      },
    });
  } catch (error) {
    console.error("Failed to get Voyage Results & Settlement hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
