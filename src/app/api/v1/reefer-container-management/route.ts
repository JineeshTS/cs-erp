import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  rcmReeferBookings,
  rcmTempMonitorings,
  rcmPtiInspections,
  rcmBreakdownResponses,
  rcmTempAlerts,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "reefer:read")))
      return forbiddenResponse();

    const [
      pendingBookings,
      activeMonitorings,
      scheduledInspections,
      openBreakdowns,
      activeAlerts,
    ] = await Promise.all([
      db.select({ value: count() }).from(rcmReeferBookings)
        .where(and(eq(rcmReeferBookings.tenantId, user.tenantId), isNull(rcmReeferBookings.deletedAt), eq(rcmReeferBookings.status, "pending")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(rcmTempMonitorings)
        .where(and(eq(rcmTempMonitorings.tenantId, user.tenantId), isNull(rcmTempMonitorings.deletedAt), eq(rcmTempMonitorings.status, "active")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(rcmPtiInspections)
        .where(and(eq(rcmPtiInspections.tenantId, user.tenantId), isNull(rcmPtiInspections.deletedAt), eq(rcmPtiInspections.status, "scheduled")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(rcmBreakdownResponses)
        .where(and(eq(rcmBreakdownResponses.tenantId, user.tenantId), isNull(rcmBreakdownResponses.deletedAt), eq(rcmBreakdownResponses.status, "reported")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(rcmTempAlerts)
        .where(and(eq(rcmTempAlerts.tenantId, user.tenantId), isNull(rcmTempAlerts.deletedAt), eq(rcmTempAlerts.status, "active")))
        .then(([r]) => r.value),
    ]);

    return NextResponse.json({
      data: {
        pendingBookings,
        activeMonitorings,
        scheduledInspections,
        openBreakdowns,
        activeAlerts,
      },
    });
  } catch (error) {
    console.error("Failed to get reefer container hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
