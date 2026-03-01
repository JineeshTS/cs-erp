import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  cspPortalBookings,
  cspShipmentTracking,
  cspPortalDocuments,
  cspPortalInvoices,
  cspPortalPayments,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "portal:read")))
      return forbiddenResponse();

    const [
      activeBookings,
      inTransitShipments,
      availableDocuments,
      unpaidInvoices,
      pendingPayments,
    ] = await Promise.all([
      db.select({ id: cspPortalBookings.id }).from(cspPortalBookings)
        .where(and(eq(cspPortalBookings.tenantId, user.tenantId), isNull(cspPortalBookings.deletedAt), eq(cspPortalBookings.status, "confirmed")))
        .then((r) => r.length),
      db.select({ id: cspShipmentTracking.id }).from(cspShipmentTracking)
        .where(and(eq(cspShipmentTracking.tenantId, user.tenantId), isNull(cspShipmentTracking.deletedAt), eq(cspShipmentTracking.currentStatus, "in_transit")))
        .then((r) => r.length),
      db.select({ id: cspPortalDocuments.id }).from(cspPortalDocuments)
        .where(and(eq(cspPortalDocuments.tenantId, user.tenantId), isNull(cspPortalDocuments.deletedAt), eq(cspPortalDocuments.status, "available")))
        .then((r) => r.length),
      db.select({ id: cspPortalInvoices.id }).from(cspPortalInvoices)
        .where(and(eq(cspPortalInvoices.tenantId, user.tenantId), isNull(cspPortalInvoices.deletedAt), eq(cspPortalInvoices.status, "issued")))
        .then((r) => r.length),
      db.select({ id: cspPortalPayments.id }).from(cspPortalPayments)
        .where(and(eq(cspPortalPayments.tenantId, user.tenantId), isNull(cspPortalPayments.deletedAt), eq(cspPortalPayments.status, "pending")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        activeBookings,
        inTransitShipments,
        availableDocuments,
        unpaidInvoices,
        pendingPayments,
      },
    });
  } catch (error) {
    console.error("Failed to get portal hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
