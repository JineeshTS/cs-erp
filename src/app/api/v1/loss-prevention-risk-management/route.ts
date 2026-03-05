import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  lprRiskRegisters, lprHsseRecords, lprNearMissReports, lprIncidentInvestigations,
  lprPiClubScorings, lprContinuityPlans, lprEmergencyProcedures, lprRiskKpiDashboards,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "lpr:read"))) return forbiddenResponse();

    const [d1, d2, d3, d4, d5, d6, d7, d8] = await Promise.all([
      db.select({ id: lprRiskRegisters.id }).from(lprRiskRegisters).where(and(eq(lprRiskRegisters.tenantId, user.tenantId), isNull(lprRiskRegisters.deletedAt), eq(lprRiskRegisters.status, "draft"))).then((r) => r.length),
      db.select({ id: lprHsseRecords.id }).from(lprHsseRecords).where(and(eq(lprHsseRecords.tenantId, user.tenantId), isNull(lprHsseRecords.deletedAt), eq(lprHsseRecords.status, "draft"))).then((r) => r.length),
      db.select({ id: lprNearMissReports.id }).from(lprNearMissReports).where(and(eq(lprNearMissReports.tenantId, user.tenantId), isNull(lprNearMissReports.deletedAt), eq(lprNearMissReports.status, "draft"))).then((r) => r.length),
      db.select({ id: lprIncidentInvestigations.id }).from(lprIncidentInvestigations).where(and(eq(lprIncidentInvestigations.tenantId, user.tenantId), isNull(lprIncidentInvestigations.deletedAt), eq(lprIncidentInvestigations.status, "draft"))).then((r) => r.length),
      db.select({ id: lprPiClubScorings.id }).from(lprPiClubScorings).where(and(eq(lprPiClubScorings.tenantId, user.tenantId), isNull(lprPiClubScorings.deletedAt), eq(lprPiClubScorings.status, "draft"))).then((r) => r.length),
      db.select({ id: lprContinuityPlans.id }).from(lprContinuityPlans).where(and(eq(lprContinuityPlans.tenantId, user.tenantId), isNull(lprContinuityPlans.deletedAt), eq(lprContinuityPlans.status, "draft"))).then((r) => r.length),
      db.select({ id: lprEmergencyProcedures.id }).from(lprEmergencyProcedures).where(and(eq(lprEmergencyProcedures.tenantId, user.tenantId), isNull(lprEmergencyProcedures.deletedAt), eq(lprEmergencyProcedures.status, "draft"))).then((r) => r.length),
      db.select({ id: lprRiskKpiDashboards.id }).from(lprRiskKpiDashboards).where(and(eq(lprRiskKpiDashboards.tenantId, user.tenantId), isNull(lprRiskKpiDashboards.deletedAt), eq(lprRiskKpiDashboards.status, "draft"))).then((r) => r.length),
    ]);

    return NextResponse.json({
      data: { draftRiskRegisters: d1, draftHsseRecords: d2, draftNearMissReports: d3, draftIncidentInvestigations: d4, draftPiClubScorings: d5, draftContinuityPlans: d6, draftEmergencyProcedures: d7, draftRiskKpiDashboards: d8 },
    });
  } catch (error) {
    console.error("Failed to get Loss Prevention & Risk Management hub:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
