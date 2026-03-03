import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  locCargoCutoffs,
  locOverbookingRollovers,
  locRollingUpgrades,
  locRevenueIntegrityAudits,
  locSlotSwapCoordinations,
  locScheduleDeviations,
  locCargoMixOptimizations,
  locLoadFactorReports,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "loc:read")))
      return forbiddenResponse();

    const [
      draftCargoCutoffs,
      draftOverbookingRollovers,
      draftRollingUpgrades,
      draftRevenueIntegrityAudits,
      draftSlotSwapCoordinations,
      draftScheduleDeviations,
      draftCargoMixOptimizations,
      draftLoadFactorReports,
    ] = await Promise.all([
      db.select({ id: locCargoCutoffs.id }).from(locCargoCutoffs)
        .where(and(eq(locCargoCutoffs.tenantId, user.tenantId), isNull(locCargoCutoffs.deletedAt), eq(locCargoCutoffs.status, "draft")))
        .then((r) => r.length),
      db.select({ id: locOverbookingRollovers.id }).from(locOverbookingRollovers)
        .where(and(eq(locOverbookingRollovers.tenantId, user.tenantId), isNull(locOverbookingRollovers.deletedAt), eq(locOverbookingRollovers.status, "draft")))
        .then((r) => r.length),
      db.select({ id: locRollingUpgrades.id }).from(locRollingUpgrades)
        .where(and(eq(locRollingUpgrades.tenantId, user.tenantId), isNull(locRollingUpgrades.deletedAt), eq(locRollingUpgrades.status, "draft")))
        .then((r) => r.length),
      db.select({ id: locRevenueIntegrityAudits.id }).from(locRevenueIntegrityAudits)
        .where(and(eq(locRevenueIntegrityAudits.tenantId, user.tenantId), isNull(locRevenueIntegrityAudits.deletedAt), eq(locRevenueIntegrityAudits.status, "draft")))
        .then((r) => r.length),
      db.select({ id: locSlotSwapCoordinations.id }).from(locSlotSwapCoordinations)
        .where(and(eq(locSlotSwapCoordinations.tenantId, user.tenantId), isNull(locSlotSwapCoordinations.deletedAt), eq(locSlotSwapCoordinations.status, "draft")))
        .then((r) => r.length),
      db.select({ id: locScheduleDeviations.id }).from(locScheduleDeviations)
        .where(and(eq(locScheduleDeviations.tenantId, user.tenantId), isNull(locScheduleDeviations.deletedAt), eq(locScheduleDeviations.status, "draft")))
        .then((r) => r.length),
      db.select({ id: locCargoMixOptimizations.id }).from(locCargoMixOptimizations)
        .where(and(eq(locCargoMixOptimizations.tenantId, user.tenantId), isNull(locCargoMixOptimizations.deletedAt), eq(locCargoMixOptimizations.status, "draft")))
        .then((r) => r.length),
      db.select({ id: locLoadFactorReports.id }).from(locLoadFactorReports)
        .where(and(eq(locLoadFactorReports.tenantId, user.tenantId), isNull(locLoadFactorReports.deletedAt), eq(locLoadFactorReports.status, "draft")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        draftCargoCutoffs,
        draftOverbookingRollovers,
        draftRollingUpgrades,
        draftRevenueIntegrityAudits,
        draftSlotSwapCoordinations,
        draftScheduleDeviations,
        draftCargoMixOptimizations,
        draftLoadFactorReports,
      },
    });
  } catch (error) {
    console.error("Failed to get LOC hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
