import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  hpsEmployeeProfiles,
  hpsLeaveAbsences,
  hpsAttendanceTimeTrackings,
  hpsPerformanceAppraisals,
  hpsPayrollProcessings,
  hpsSocialInsuranceRecords,
  hpsGratuityCalculations,
  hpsVisaResidencyRecords,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "hr:read")))
      return forbiddenResponse();

    const [
      activeEmployees,
      pendingLeaves,
      todayAttendance,
      draftAppraisals,
      draftPayrolls,
      draftInsurance,
      draftGratuities,
      pendingVisas,
    ] = await Promise.all([
      db.select({ id: hpsEmployeeProfiles.id }).from(hpsEmployeeProfiles)
        .where(and(eq(hpsEmployeeProfiles.tenantId, user.tenantId), isNull(hpsEmployeeProfiles.deletedAt), eq(hpsEmployeeProfiles.status, "active")))
        .then((r) => r.length),
      db.select({ id: hpsLeaveAbsences.id }).from(hpsLeaveAbsences)
        .where(and(eq(hpsLeaveAbsences.tenantId, user.tenantId), isNull(hpsLeaveAbsences.deletedAt), eq(hpsLeaveAbsences.status, "pending")))
        .then((r) => r.length),
      db.select({ id: hpsAttendanceTimeTrackings.id }).from(hpsAttendanceTimeTrackings)
        .where(and(eq(hpsAttendanceTimeTrackings.tenantId, user.tenantId), isNull(hpsAttendanceTimeTrackings.deletedAt), eq(hpsAttendanceTimeTrackings.status, "present")))
        .then((r) => r.length),
      db.select({ id: hpsPerformanceAppraisals.id }).from(hpsPerformanceAppraisals)
        .where(and(eq(hpsPerformanceAppraisals.tenantId, user.tenantId), isNull(hpsPerformanceAppraisals.deletedAt), eq(hpsPerformanceAppraisals.status, "draft")))
        .then((r) => r.length),
      db.select({ id: hpsPayrollProcessings.id }).from(hpsPayrollProcessings)
        .where(and(eq(hpsPayrollProcessings.tenantId, user.tenantId), isNull(hpsPayrollProcessings.deletedAt), eq(hpsPayrollProcessings.status, "draft")))
        .then((r) => r.length),
      db.select({ id: hpsSocialInsuranceRecords.id }).from(hpsSocialInsuranceRecords)
        .where(and(eq(hpsSocialInsuranceRecords.tenantId, user.tenantId), isNull(hpsSocialInsuranceRecords.deletedAt), eq(hpsSocialInsuranceRecords.status, "draft")))
        .then((r) => r.length),
      db.select({ id: hpsGratuityCalculations.id }).from(hpsGratuityCalculations)
        .where(and(eq(hpsGratuityCalculations.tenantId, user.tenantId), isNull(hpsGratuityCalculations.deletedAt), eq(hpsGratuityCalculations.status, "draft")))
        .then((r) => r.length),
      db.select({ id: hpsVisaResidencyRecords.id }).from(hpsVisaResidencyRecords)
        .where(and(eq(hpsVisaResidencyRecords.tenantId, user.tenantId), isNull(hpsVisaResidencyRecords.deletedAt), eq(hpsVisaResidencyRecords.status, "pending")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        activeEmployees,
        pendingLeaves,
        todayAttendance,
        draftAppraisals,
        draftPayrolls,
        draftInsurance,
        draftGratuities,
        pendingVisas,
      },
    });
  } catch (error) {
    console.error("Failed to get HR payroll hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
