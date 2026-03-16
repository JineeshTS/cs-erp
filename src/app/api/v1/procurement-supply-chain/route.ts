import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  pscPurchaseRequisitions,
  pscVendorSourcings,
  pscPurchaseOrders,
  pscProcurementContracts,
  pscInventoryStockControls,
  pscGoodsReceiptInspections,
  pscSpendAnalytics,
  pscSupplierScorecards,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "procurement:read")))
      return forbiddenResponse();

    const [
      pendingRequisitions,
      openSourcings,
      activePurchaseOrders,
      activeContracts,
      activeInventory,
      pendingReceipts,
      draftAnalytics,
      draftScorecards,
    ] = await Promise.all([
      db.select({ value: count() }).from(pscPurchaseRequisitions)
        .where(and(eq(pscPurchaseRequisitions.tenantId, user.tenantId), isNull(pscPurchaseRequisitions.deletedAt), eq(pscPurchaseRequisitions.status, "pending")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(pscVendorSourcings)
        .where(and(eq(pscVendorSourcings.tenantId, user.tenantId), isNull(pscVendorSourcings.deletedAt), eq(pscVendorSourcings.status, "open")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(pscPurchaseOrders)
        .where(and(eq(pscPurchaseOrders.tenantId, user.tenantId), isNull(pscPurchaseOrders.deletedAt), eq(pscPurchaseOrders.status, "approved")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(pscProcurementContracts)
        .where(and(eq(pscProcurementContracts.tenantId, user.tenantId), isNull(pscProcurementContracts.deletedAt), eq(pscProcurementContracts.status, "active")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(pscInventoryStockControls)
        .where(and(eq(pscInventoryStockControls.tenantId, user.tenantId), isNull(pscInventoryStockControls.deletedAt), eq(pscInventoryStockControls.status, "active")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(pscGoodsReceiptInspections)
        .where(and(eq(pscGoodsReceiptInspections.tenantId, user.tenantId), isNull(pscGoodsReceiptInspections.deletedAt), eq(pscGoodsReceiptInspections.status, "pending")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(pscSpendAnalytics)
        .where(and(eq(pscSpendAnalytics.tenantId, user.tenantId), isNull(pscSpendAnalytics.deletedAt), eq(pscSpendAnalytics.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(pscSupplierScorecards)
        .where(and(eq(pscSupplierScorecards.tenantId, user.tenantId), isNull(pscSupplierScorecards.deletedAt), eq(pscSupplierScorecards.status, "draft")))
        .then(([r]) => r.value),
    ]);

    return NextResponse.json({
      data: {
        pendingRequisitions,
        openSourcings,
        activePurchaseOrders,
        activeContracts,
        activeInventory,
        pendingReceipts,
        draftAnalytics,
        draftScorecards,
      },
    });
  } catch (error) {
    console.error("Failed to get procurement hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
