import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  crmCrewRotations,
  crmCertificateTrackings,
  crmPayrollAllotments,
  crmFlagStateCompliance,
  crmManningAgencies,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "crew:read")))
      return forbiddenResponse();

    const [
      plannedRotations,
      expiringCertificates,
      pendingPayroll,
      scheduledInspections,
      activeAgencies,
    ] = await Promise.all([
      db.select({ id: crmCrewRotations.id }).from(crmCrewRotations)
        .where(and(eq(crmCrewRotations.tenantId, user.tenantId), isNull(crmCrewRotations.deletedAt), eq(crmCrewRotations.status, "planned")))
        .then((r) => r.length),
      db.select({ id: crmCertificateTrackings.id }).from(crmCertificateTrackings)
        .where(and(eq(crmCertificateTrackings.tenantId, user.tenantId), isNull(crmCertificateTrackings.deletedAt), eq(crmCertificateTrackings.status, "expiring_soon")))
        .then((r) => r.length),
      db.select({ id: crmPayrollAllotments.id }).from(crmPayrollAllotments)
        .where(and(eq(crmPayrollAllotments.tenantId, user.tenantId), isNull(crmPayrollAllotments.deletedAt), eq(crmPayrollAllotments.status, "draft")))
        .then((r) => r.length),
      db.select({ id: crmFlagStateCompliance.id }).from(crmFlagStateCompliance)
        .where(and(eq(crmFlagStateCompliance.tenantId, user.tenantId), isNull(crmFlagStateCompliance.deletedAt), eq(crmFlagStateCompliance.status, "scheduled")))
        .then((r) => r.length),
      db.select({ id: crmManningAgencies.id }).from(crmManningAgencies)
        .where(and(eq(crmManningAgencies.tenantId, user.tenantId), isNull(crmManningAgencies.deletedAt), eq(crmManningAgencies.status, "active")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        plannedRotations,
        expiringCertificates,
        pendingPayroll,
        scheduledInspections,
        activeAgencies,
      },
    });
  } catch (error) {
    console.error("Failed to get crew management hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
