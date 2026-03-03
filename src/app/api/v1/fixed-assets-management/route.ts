import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  famAssetRegistries,
  famDepreciationSchedules,
  famAssetDisposals,
  famInsuranceValuations,
  famMaintenanceSchedules,
  famCapexOpexClassifications,
  famImpairmentTests,
  famLeaseAccounting,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "asset:read")))
      return forbiddenResponse();

    const [
      activeAssets,
      activeSchedules,
      draftDisposals,
      activeInsurance,
      scheduledMaintenance,
      draftClassifications,
      draftImpairments,
      activeLeases,
    ] = await Promise.all([
      db.select({ id: famAssetRegistries.id }).from(famAssetRegistries)
        .where(and(eq(famAssetRegistries.tenantId, user.tenantId), isNull(famAssetRegistries.deletedAt), eq(famAssetRegistries.status, "active")))
        .then((r) => r.length),
      db.select({ id: famDepreciationSchedules.id }).from(famDepreciationSchedules)
        .where(and(eq(famDepreciationSchedules.tenantId, user.tenantId), isNull(famDepreciationSchedules.deletedAt), eq(famDepreciationSchedules.status, "active")))
        .then((r) => r.length),
      db.select({ id: famAssetDisposals.id }).from(famAssetDisposals)
        .where(and(eq(famAssetDisposals.tenantId, user.tenantId), isNull(famAssetDisposals.deletedAt), eq(famAssetDisposals.status, "draft")))
        .then((r) => r.length),
      db.select({ id: famInsuranceValuations.id }).from(famInsuranceValuations)
        .where(and(eq(famInsuranceValuations.tenantId, user.tenantId), isNull(famInsuranceValuations.deletedAt), eq(famInsuranceValuations.status, "active")))
        .then((r) => r.length),
      db.select({ id: famMaintenanceSchedules.id }).from(famMaintenanceSchedules)
        .where(and(eq(famMaintenanceSchedules.tenantId, user.tenantId), isNull(famMaintenanceSchedules.deletedAt), eq(famMaintenanceSchedules.status, "scheduled")))
        .then((r) => r.length),
      db.select({ id: famCapexOpexClassifications.id }).from(famCapexOpexClassifications)
        .where(and(eq(famCapexOpexClassifications.tenantId, user.tenantId), isNull(famCapexOpexClassifications.deletedAt), eq(famCapexOpexClassifications.status, "draft")))
        .then((r) => r.length),
      db.select({ id: famImpairmentTests.id }).from(famImpairmentTests)
        .where(and(eq(famImpairmentTests.tenantId, user.tenantId), isNull(famImpairmentTests.deletedAt), eq(famImpairmentTests.status, "draft")))
        .then((r) => r.length),
      db.select({ id: famLeaseAccounting.id }).from(famLeaseAccounting)
        .where(and(eq(famLeaseAccounting.tenantId, user.tenantId), isNull(famLeaseAccounting.deletedAt), eq(famLeaseAccounting.status, "active")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        activeAssets,
        activeSchedules,
        draftDisposals,
        activeInsurance,
        scheduledMaintenance,
        draftClassifications,
        draftImpairments,
        activeLeases,
      },
    });
  } catch (error) {
    console.error("Failed to get fixed assets hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
