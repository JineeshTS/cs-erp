import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  ecrInventorySnapshots,
  ecrRepositioningPlans,
  ecrCostTrackings,
  ecrRouteOptimizers,
  ecrDemandForecasts,
  ecrLeasingDecisions,
  ecrReturnIncentives,
  ecrPnlAttributions,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "ecr:read")))
      return forbiddenResponse();

    const [
      draftInventorySnapshots,
      draftRepositioningPlans,
      draftCostTrackings,
      draftRouteOptimizers,
      draftDemandForecasts,
      draftLeasingDecisions,
      draftReturnIncentives,
      draftPnlAttributions,
    ] = await Promise.all([
      db.select({ id: ecrInventorySnapshots.id }).from(ecrInventorySnapshots)
        .where(and(eq(ecrInventorySnapshots.tenantId, user.tenantId), isNull(ecrInventorySnapshots.deletedAt), eq(ecrInventorySnapshots.status, "draft")))
        .then((r) => r.length),
      db.select({ id: ecrRepositioningPlans.id }).from(ecrRepositioningPlans)
        .where(and(eq(ecrRepositioningPlans.tenantId, user.tenantId), isNull(ecrRepositioningPlans.deletedAt), eq(ecrRepositioningPlans.status, "draft")))
        .then((r) => r.length),
      db.select({ id: ecrCostTrackings.id }).from(ecrCostTrackings)
        .where(and(eq(ecrCostTrackings.tenantId, user.tenantId), isNull(ecrCostTrackings.deletedAt), eq(ecrCostTrackings.status, "draft")))
        .then((r) => r.length),
      db.select({ id: ecrRouteOptimizers.id }).from(ecrRouteOptimizers)
        .where(and(eq(ecrRouteOptimizers.tenantId, user.tenantId), isNull(ecrRouteOptimizers.deletedAt), eq(ecrRouteOptimizers.status, "draft")))
        .then((r) => r.length),
      db.select({ id: ecrDemandForecasts.id }).from(ecrDemandForecasts)
        .where(and(eq(ecrDemandForecasts.tenantId, user.tenantId), isNull(ecrDemandForecasts.deletedAt), eq(ecrDemandForecasts.status, "draft")))
        .then((r) => r.length),
      db.select({ id: ecrLeasingDecisions.id }).from(ecrLeasingDecisions)
        .where(and(eq(ecrLeasingDecisions.tenantId, user.tenantId), isNull(ecrLeasingDecisions.deletedAt), eq(ecrLeasingDecisions.status, "draft")))
        .then((r) => r.length),
      db.select({ id: ecrReturnIncentives.id }).from(ecrReturnIncentives)
        .where(and(eq(ecrReturnIncentives.tenantId, user.tenantId), isNull(ecrReturnIncentives.deletedAt), eq(ecrReturnIncentives.status, "draft")))
        .then((r) => r.length),
      db.select({ id: ecrPnlAttributions.id }).from(ecrPnlAttributions)
        .where(and(eq(ecrPnlAttributions.tenantId, user.tenantId), isNull(ecrPnlAttributions.deletedAt), eq(ecrPnlAttributions.status, "draft")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        draftInventorySnapshots,
        draftRepositioningPlans,
        draftCostTrackings,
        draftRouteOptimizers,
        draftDemandForecasts,
        draftLeasingDecisions,
        draftReturnIncentives,
        draftPnlAttributions,
      },
    });
  } catch (error) {
    console.error("Failed to get Empty Container Repositioning AI hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
