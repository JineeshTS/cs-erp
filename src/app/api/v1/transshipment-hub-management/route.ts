import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  thmCargoPlans,
  thmFeederCoordinations,
  thmCargoTrackings,
  thmMissedConnections,
  thmRevenueAttributions,
  thmHubEfficiencies,
  thmOptimizationEngines,
  thmPenaltyTrackings,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "thm:read")))
      return forbiddenResponse();

    const [
      draftCargoPlans,
      draftFeederCoordinations,
      draftCargoTrackings,
      draftMissedConnections,
      draftRevenueAttributions,
      draftHubEfficiencies,
      draftOptimizationEngines,
      draftPenaltyTrackings,
    ] = await Promise.all([
      db.select({ id: thmCargoPlans.id }).from(thmCargoPlans)
        .where(and(eq(thmCargoPlans.tenantId, user.tenantId), isNull(thmCargoPlans.deletedAt), eq(thmCargoPlans.status, "draft")))
        .then((r) => r.length),
      db.select({ id: thmFeederCoordinations.id }).from(thmFeederCoordinations)
        .where(and(eq(thmFeederCoordinations.tenantId, user.tenantId), isNull(thmFeederCoordinations.deletedAt), eq(thmFeederCoordinations.status, "draft")))
        .then((r) => r.length),
      db.select({ id: thmCargoTrackings.id }).from(thmCargoTrackings)
        .where(and(eq(thmCargoTrackings.tenantId, user.tenantId), isNull(thmCargoTrackings.deletedAt), eq(thmCargoTrackings.status, "draft")))
        .then((r) => r.length),
      db.select({ id: thmMissedConnections.id }).from(thmMissedConnections)
        .where(and(eq(thmMissedConnections.tenantId, user.tenantId), isNull(thmMissedConnections.deletedAt), eq(thmMissedConnections.status, "draft")))
        .then((r) => r.length),
      db.select({ id: thmRevenueAttributions.id }).from(thmRevenueAttributions)
        .where(and(eq(thmRevenueAttributions.tenantId, user.tenantId), isNull(thmRevenueAttributions.deletedAt), eq(thmRevenueAttributions.status, "draft")))
        .then((r) => r.length),
      db.select({ id: thmHubEfficiencies.id }).from(thmHubEfficiencies)
        .where(and(eq(thmHubEfficiencies.tenantId, user.tenantId), isNull(thmHubEfficiencies.deletedAt), eq(thmHubEfficiencies.status, "draft")))
        .then((r) => r.length),
      db.select({ id: thmOptimizationEngines.id }).from(thmOptimizationEngines)
        .where(and(eq(thmOptimizationEngines.tenantId, user.tenantId), isNull(thmOptimizationEngines.deletedAt), eq(thmOptimizationEngines.status, "draft")))
        .then((r) => r.length),
      db.select({ id: thmPenaltyTrackings.id }).from(thmPenaltyTrackings)
        .where(and(eq(thmPenaltyTrackings.tenantId, user.tenantId), isNull(thmPenaltyTrackings.deletedAt), eq(thmPenaltyTrackings.status, "draft")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        draftCargoPlans,
        draftFeederCoordinations,
        draftCargoTrackings,
        draftMissedConnections,
        draftRevenueAttributions,
        draftHubEfficiencies,
        draftOptimizationEngines,
        draftPenaltyTrackings,
      },
    });
  } catch (error) {
    console.error("Failed to get Transshipment Hub Management hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
