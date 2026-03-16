import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  cfmVoyageBudgets,
  cfmPortDisbursements,
  cfmAgencyCommissions,
  cfmAnomalyDetections,
  cfmKpiReports,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "costing:read")))
      return forbiddenResponse();

    const [
      activeBudgets,
      pendingDisbursements,
      draftCommissions,
      detectedAnomalies,
      draftReports,
    ] = await Promise.all([
      db.select({ value: count() }).from(cfmVoyageBudgets)
        .where(and(eq(cfmVoyageBudgets.tenantId, user.tenantId), isNull(cfmVoyageBudgets.deletedAt), eq(cfmVoyageBudgets.status, "approved")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(cfmPortDisbursements)
        .where(and(eq(cfmPortDisbursements.tenantId, user.tenantId), isNull(cfmPortDisbursements.deletedAt), eq(cfmPortDisbursements.status, "submitted")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(cfmAgencyCommissions)
        .where(and(eq(cfmAgencyCommissions.tenantId, user.tenantId), isNull(cfmAgencyCommissions.deletedAt), eq(cfmAgencyCommissions.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(cfmAnomalyDetections)
        .where(and(eq(cfmAnomalyDetections.tenantId, user.tenantId), isNull(cfmAnomalyDetections.deletedAt), eq(cfmAnomalyDetections.status, "detected")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(cfmKpiReports)
        .where(and(eq(cfmKpiReports.tenantId, user.tenantId), isNull(cfmKpiReports.deletedAt), eq(cfmKpiReports.status, "draft")))
        .then(([r]) => r.value),
    ]);

    return NextResponse.json({
      data: {
        activeBudgets,
        pendingDisbursements,
        draftCommissions,
        detectedAnomalies,
        draftReports,
      },
    });
  } catch (error) {
    console.error("Failed to get costing financial hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
