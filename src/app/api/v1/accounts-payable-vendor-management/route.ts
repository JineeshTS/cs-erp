import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  apvmVendorMasters,
  apvmPurchaseOrders,
  apvmVendorInvoices,
  apvmThreeWayMatches,
  apvmPaymentSchedules,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "payable:read")))
      return forbiddenResponse();

    const [
      activeVendors,
      openPurchaseOrders,
      pendingInvoices,
      unmatchedItems,
      scheduledPayments,
    ] = await Promise.all([
      db.select({ id: apvmVendorMasters.id }).from(apvmVendorMasters)
        .where(and(eq(apvmVendorMasters.tenantId, user.tenantId), isNull(apvmVendorMasters.deletedAt), eq(apvmVendorMasters.status, "active")))
        .then((r) => r.length),
      db.select({ id: apvmPurchaseOrders.id }).from(apvmPurchaseOrders)
        .where(and(eq(apvmPurchaseOrders.tenantId, user.tenantId), isNull(apvmPurchaseOrders.deletedAt), eq(apvmPurchaseOrders.status, "approved")))
        .then((r) => r.length),
      db.select({ id: apvmVendorInvoices.id }).from(apvmVendorInvoices)
        .where(and(eq(apvmVendorInvoices.tenantId, user.tenantId), isNull(apvmVendorInvoices.deletedAt), eq(apvmVendorInvoices.status, "pending")))
        .then((r) => r.length),
      db.select({ id: apvmThreeWayMatches.id }).from(apvmThreeWayMatches)
        .where(and(eq(apvmThreeWayMatches.tenantId, user.tenantId), isNull(apvmThreeWayMatches.deletedAt), eq(apvmThreeWayMatches.status, "exception")))
        .then((r) => r.length),
      db.select({ id: apvmPaymentSchedules.id }).from(apvmPaymentSchedules)
        .where(and(eq(apvmPaymentSchedules.tenantId, user.tenantId), isNull(apvmPaymentSchedules.deletedAt), eq(apvmPaymentSchedules.status, "scheduled")))
        .then((r) => r.length),
    ]);

    return NextResponse.json({
      data: {
        activeVendors,
        openPurchaseOrders,
        pendingInvoices,
        unmatchedItems,
        scheduledPayments,
      },
    });
  } catch (error) {
    console.error("Failed to get AP hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
