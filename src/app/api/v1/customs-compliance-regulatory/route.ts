import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  ccrImportClearances,
  ccrExportFilings,
  ccrTransitProcedures,
  ccrDutyCalculations,
  ccrAeoCompliances,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "customs:read")))
      return forbiddenResponse();

    const [
      pendingClearances,
      pendingFilings,
      activeTransits,
      pendingCalculations,
      activeAeoCompliances,
    ] = await Promise.all([
      db.select({ value: count() }).from(ccrImportClearances)
        .where(and(eq(ccrImportClearances.tenantId, user.tenantId), isNull(ccrImportClearances.deletedAt), eq(ccrImportClearances.status, "pending")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(ccrExportFilings)
        .where(and(eq(ccrExportFilings.tenantId, user.tenantId), isNull(ccrExportFilings.deletedAt), eq(ccrExportFilings.status, "pending")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(ccrTransitProcedures)
        .where(and(eq(ccrTransitProcedures.tenantId, user.tenantId), isNull(ccrTransitProcedures.deletedAt), eq(ccrTransitProcedures.status, "active")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(ccrDutyCalculations)
        .where(and(eq(ccrDutyCalculations.tenantId, user.tenantId), isNull(ccrDutyCalculations.deletedAt), eq(ccrDutyCalculations.status, "pending")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(ccrAeoCompliances)
        .where(and(eq(ccrAeoCompliances.tenantId, user.tenantId), isNull(ccrAeoCompliances.deletedAt), eq(ccrAeoCompliances.status, "active")))
        .then(([r]) => r.value),
    ]);

    return NextResponse.json({
      data: {
        pendingClearances,
        pendingFilings,
        activeTransits,
        pendingCalculations,
        activeAeoCompliances,
      },
    });
  } catch (error) {
    console.error("Failed to get customs compliance hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
