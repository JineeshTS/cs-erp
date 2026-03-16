import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  icdDryPorts,
  icdRailPlans,
  icdTruckBookings,
  icdLastMileDeliveries,
  icdRouteOptimizations,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "intermodal:read")))
      return forbiddenResponse();

    const [
      activePorts,
      planningRailPlans,
      pendingTruckBookings,
      pendingDeliveries,
      pendingOptimizations,
    ] = await Promise.all([
      db.select({ value: count() }).from(icdDryPorts)
        .where(and(eq(icdDryPorts.tenantId, user.tenantId), isNull(icdDryPorts.deletedAt), eq(icdDryPorts.status, "active")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(icdRailPlans)
        .where(and(eq(icdRailPlans.tenantId, user.tenantId), isNull(icdRailPlans.deletedAt), eq(icdRailPlans.status, "planning")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(icdTruckBookings)
        .where(and(eq(icdTruckBookings.tenantId, user.tenantId), isNull(icdTruckBookings.deletedAt), eq(icdTruckBookings.status, "pending")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(icdLastMileDeliveries)
        .where(and(eq(icdLastMileDeliveries.tenantId, user.tenantId), isNull(icdLastMileDeliveries.deletedAt), eq(icdLastMileDeliveries.status, "pending")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(icdRouteOptimizations)
        .where(and(eq(icdRouteOptimizations.tenantId, user.tenantId), isNull(icdRouteOptimizations.deletedAt), eq(icdRouteOptimizations.status, "pending")))
        .then(([r]) => r.value),
    ]);

    return NextResponse.json({
      data: {
        activePorts,
        planningRailPlans,
        pendingTruckBookings,
        pendingDeliveries,
        pendingOptimizations,
      },
    });
  } catch (error) {
    console.error("Failed to get intermodal ICD hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
