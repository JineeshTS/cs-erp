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
import { eq, and, isNull, count } from "drizzle-orm";

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
      db.select({ value: count() }).from(apvmVendorMasters)
        .where(and(eq(apvmVendorMasters.tenantId, user.tenantId), isNull(apvmVendorMasters.deletedAt), eq(apvmVendorMasters.status, "active")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(apvmPurchaseOrders)
        .where(and(eq(apvmPurchaseOrders.tenantId, user.tenantId), isNull(apvmPurchaseOrders.deletedAt), eq(apvmPurchaseOrders.status, "approved")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(apvmVendorInvoices)
        .where(and(eq(apvmVendorInvoices.tenantId, user.tenantId), isNull(apvmVendorInvoices.deletedAt), eq(apvmVendorInvoices.status, "pending")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(apvmThreeWayMatches)
        .where(and(eq(apvmThreeWayMatches.tenantId, user.tenantId), isNull(apvmThreeWayMatches.deletedAt), eq(apvmThreeWayMatches.status, "exception")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(apvmPaymentSchedules)
        .where(and(eq(apvmPaymentSchedules.tenantId, user.tenantId), isNull(apvmPaymentSchedules.deletedAt), eq(apvmPaymentSchedules.status, "scheduled")))
        .then(([r]) => r.value),
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
