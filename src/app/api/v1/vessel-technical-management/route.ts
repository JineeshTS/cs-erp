import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  vtmPlannedMaintenanceTasks,
  vtmDryDockPlans,
  vtmSurveyTrackings,
  vtmDefectRepairs,
  vtmSpareParts,
  vtmTechnicalProcurements,
  vtmComplianceRecords,
  vtmPredictiveMaintenance,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "technical:read")))
      return forbiddenResponse();

    const [
      overdueTasks,
      activeDryDocks,
      upcomingSurveys,
      openDefects,
      lowStockParts,
    ] = await Promise.all([
      db.select({ value: count() }).from(vtmPlannedMaintenanceTasks)
        .where(and(eq(vtmPlannedMaintenanceTasks.tenantId, user.tenantId), isNull(vtmPlannedMaintenanceTasks.deletedAt), eq(vtmPlannedMaintenanceTasks.status, "overdue")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(vtmDryDockPlans)
        .where(and(eq(vtmDryDockPlans.tenantId, user.tenantId), isNull(vtmDryDockPlans.deletedAt), eq(vtmDryDockPlans.status, "in_progress")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(vtmSurveyTrackings)
        .where(and(eq(vtmSurveyTrackings.tenantId, user.tenantId), isNull(vtmSurveyTrackings.deletedAt), eq(vtmSurveyTrackings.status, "upcoming")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(vtmDefectRepairs)
        .where(and(eq(vtmDefectRepairs.tenantId, user.tenantId), isNull(vtmDefectRepairs.deletedAt), eq(vtmDefectRepairs.status, "reported")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(vtmSpareParts)
        .where(and(eq(vtmSpareParts.tenantId, user.tenantId), isNull(vtmSpareParts.deletedAt), eq(vtmSpareParts.status, "low_stock")))
        .then(([r]) => r.value),
    ]);

    return NextResponse.json({
      data: {
        overdueTasks,
        activeDryDocks,
        upcomingSurveys,
        openDefects,
        lowStockParts,
      },
    });
  } catch (error) {
    console.error("Failed to get VTM hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
