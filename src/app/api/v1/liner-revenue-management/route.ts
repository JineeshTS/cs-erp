import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  lrmTeuMaximizations,
  lrmCargoMixes,
  lrmDemandForecasts,
  lrmFreightContracts,
  lrmLeakageDetections,
  lrmRateIntegrities,
  lrmRevenueAccruals,
  lrmMaximizationEngines,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "lrm:read")))
      return forbiddenResponse();

    const [
      draftTeuMaximizations,
      draftCargoMixes,
      draftDemandForecasts,
      draftFreightContracts,
      draftLeakageDetections,
      draftRateIntegrities,
      draftRevenueAccruals,
      draftMaximizationEngines,
    ] = await Promise.all([
      db.select({ id: lrmTeuMaximizations.id }).from(lrmTeuMaximizations)
        .where(and(eq(lrmTeuMaximizations.tenantId, user.tenantId), isNull(lrmTeuMaximizations.deletedAt), eq(lrmTeuMaximizations.status, "draft")))
        .then((r) => r.length),
      db.select({ id: lrmCargoMixes.id }).from(lrmCargoMixes)
        .where(and(eq(lrmCargoMixes.tenantId, user.tenantId), isNull(lrmCargoMixes.deletedAt), eq(lrmCargoMixes.status, "draft")))
        .then((r) => r.length),
      db.select({ id: lrmDemandForecasts.id }).from(lrmDemandForecasts)
        .where(and(eq(lrmDemandForecasts.tenantId, user.tenantId), isNull(lrmDemandForecasts.deletedAt), eq(lrmDemandForecasts.status, "draft")))
        .then((r) => r.length),
      db.select({ id: lrmFreightContracts.id }).from(lrmFreightContracts)
        .where(and(eq(lrmFreightContracts.tenantId, user.tenantId), isNull(lrmFreightContracts.deletedAt), eq(lrmFreightContracts.status, "draft")))
        .then((r) => r.length),
      db.select({ id: lrmLeakageDetections.id }).from(lrmLeakageDetections)
        .where(and(eq(lrmLeakageDetections.tenantId, user.tenantId), isNull(lrmLeakageDetections.deletedAt), eq(lrmLeakageDetections.status, "draft")))
        .then((r) => r.length),
      db.select({ id: lrmRateIntegrities.id }).from(lrmRateIntegrities)
        .where(and(eq(lrmRateIntegrities.tenantId, user.tenantId), isNull(lrmRateIntegrities.deletedAt), eq(lrmRateIntegrities.status, "draft")))
        .then((r) => r.length),
      db.select({ id: lrmRevenueAccruals.id }).from(lrmRevenueAccruals)
        .where(and(eq(lrmRevenueAccruals.tenantId, user.tenantId), isNull(lrmRevenueAccruals.deletedAt), eq(lrmRevenueAccruals.status, "draft")))
        .then((r) => r.length),
      db.select({ id: lrmMaximizationEngines.id }).from(lrmMaximizationEngines)
        .where(and(eq(lrmMaximizationEngines.tenantId, user.tenantId), isNull(lrmMaximizationEngines.deletedAt), eq(lrmMaximizationEngines.status, "draft")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        draftTeuMaximizations,
        draftCargoMixes,
        draftDemandForecasts,
        draftFreightContracts,
        draftLeakageDetections,
        draftRateIntegrities,
        draftRevenueAccruals,
        draftMaximizationEngines,
      },
    });
  } catch (error) {
    console.error("Failed to get Liner Revenue Management hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
