import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  bfmBunkerOrders,
  bfmBunkerStems,
  bfmQualityClaims,
  bfmEmissionsRecords,
  bfmOptimizationRuns,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "bunker:read")))
      return forbiddenResponse();

    const [
      activeOrders,
      plannedStems,
      openClaims,
      pendingEmissions,
      runningOptimizations,
    ] = await Promise.all([
      db.select({ id: bfmBunkerOrders.id }).from(bfmBunkerOrders)
        .where(and(eq(bfmBunkerOrders.tenantId, user.tenantId), isNull(bfmBunkerOrders.deletedAt), eq(bfmBunkerOrders.status, "confirmed")))
        .then((r) => r.length),
      db.select({ id: bfmBunkerStems.id }).from(bfmBunkerStems)
        .where(and(eq(bfmBunkerStems.tenantId, user.tenantId), isNull(bfmBunkerStems.deletedAt), eq(bfmBunkerStems.status, "planned")))
        .then((r) => r.length),
      db.select({ id: bfmQualityClaims.id }).from(bfmQualityClaims)
        .where(and(eq(bfmQualityClaims.tenantId, user.tenantId), isNull(bfmQualityClaims.deletedAt), eq(bfmQualityClaims.status, "open")))
        .then((r) => r.length),
      db.select({ id: bfmEmissionsRecords.id }).from(bfmEmissionsRecords)
        .where(and(eq(bfmEmissionsRecords.tenantId, user.tenantId), isNull(bfmEmissionsRecords.deletedAt), eq(bfmEmissionsRecords.status, "draft")))
        .then((r) => r.length),
      db.select({ id: bfmOptimizationRuns.id }).from(bfmOptimizationRuns)
        .where(and(eq(bfmOptimizationRuns.tenantId, user.tenantId), isNull(bfmOptimizationRuns.deletedAt), eq(bfmOptimizationRuns.status, "running")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        activeOrders,
        plannedStems,
        openClaims,
        pendingEmissions,
        runningOptimizations,
      },
    });
  } catch (error) {
    console.error("Failed to get bunker fuel hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
