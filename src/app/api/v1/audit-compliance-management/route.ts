import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  acmInternalAudits,
  acmRegulatoryComplianceCalendars,
  acmRiskRegisters,
  acmPolicyProcedures,
  acmRegulatoryReportingSubmissions,
  acmSoxFinancialControls,
  acmIsoCertificationTrackings,
  acmAiRiskDetections,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "audit:read")))
      return forbiddenResponse();

    const [
      activeAudits,
      pendingCompliance,
      highRisks,
      activePolicies,
      pendingSubmissions,
      activeControls,
      activeCertifications,
      activeDetections,
    ] = await Promise.all([
      db.select({ value: count() }).from(acmInternalAudits)
        .where(and(eq(acmInternalAudits.tenantId, user.tenantId), isNull(acmInternalAudits.deletedAt), eq(acmInternalAudits.status, "in_progress")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(acmRegulatoryComplianceCalendars)
        .where(and(eq(acmRegulatoryComplianceCalendars.tenantId, user.tenantId), isNull(acmRegulatoryComplianceCalendars.deletedAt), eq(acmRegulatoryComplianceCalendars.status, "pending")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(acmRiskRegisters)
        .where(and(eq(acmRiskRegisters.tenantId, user.tenantId), isNull(acmRiskRegisters.deletedAt), eq(acmRiskRegisters.riskLevel, "high")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(acmPolicyProcedures)
        .where(and(eq(acmPolicyProcedures.tenantId, user.tenantId), isNull(acmPolicyProcedures.deletedAt), eq(acmPolicyProcedures.status, "active")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(acmRegulatoryReportingSubmissions)
        .where(and(eq(acmRegulatoryReportingSubmissions.tenantId, user.tenantId), isNull(acmRegulatoryReportingSubmissions.deletedAt), eq(acmRegulatoryReportingSubmissions.status, "pending")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(acmSoxFinancialControls)
        .where(and(eq(acmSoxFinancialControls.tenantId, user.tenantId), isNull(acmSoxFinancialControls.deletedAt), eq(acmSoxFinancialControls.status, "active")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(acmIsoCertificationTrackings)
        .where(and(eq(acmIsoCertificationTrackings.tenantId, user.tenantId), isNull(acmIsoCertificationTrackings.deletedAt), eq(acmIsoCertificationTrackings.status, "active")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(acmAiRiskDetections)
        .where(and(eq(acmAiRiskDetections.tenantId, user.tenantId), isNull(acmAiRiskDetections.deletedAt), eq(acmAiRiskDetections.status, "active")))
        .then(([r]) => r.value),
    ]);

    return NextResponse.json({
      data: {
        activeAudits,
        pendingCompliance,
        highRisks,
        activePolicies,
        pendingSubmissions,
        activeControls,
        activeCertifications,
        activeDetections,
      },
    });
  } catch (error) {
    console.error("Failed to get audit compliance hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
