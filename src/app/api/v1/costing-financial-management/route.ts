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
import { eq, and, isNull } from "drizzle-orm";

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
      db.select({ id: cfmVoyageBudgets.id }).from(cfmVoyageBudgets)
        .where(and(eq(cfmVoyageBudgets.tenantId, user.tenantId), isNull(cfmVoyageBudgets.deletedAt), eq(cfmVoyageBudgets.status, "approved")))
        .then((r) => r.length),
      db.select({ id: cfmPortDisbursements.id }).from(cfmPortDisbursements)
        .where(and(eq(cfmPortDisbursements.tenantId, user.tenantId), isNull(cfmPortDisbursements.deletedAt), eq(cfmPortDisbursements.status, "submitted")))
        .then((r) => r.length),
      db.select({ id: cfmAgencyCommissions.id }).from(cfmAgencyCommissions)
        .where(and(eq(cfmAgencyCommissions.tenantId, user.tenantId), isNull(cfmAgencyCommissions.deletedAt), eq(cfmAgencyCommissions.status, "draft")))
        .then((r) => r.length),
      db.select({ id: cfmAnomalyDetections.id }).from(cfmAnomalyDetections)
        .where(and(eq(cfmAnomalyDetections.tenantId, user.tenantId), isNull(cfmAnomalyDetections.deletedAt), eq(cfmAnomalyDetections.status, "detected")))
        .then((r) => r.length),
      db.select({ id: cfmKpiReports.id }).from(cfmKpiReports)
        .where(and(eq(cfmKpiReports.tenantId, user.tenantId), isNull(cfmKpiReports.deletedAt), eq(cfmKpiReports.status, "draft")))
        .then((r) => r.length),
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
