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
import { eq, and, isNull } from "drizzle-orm";

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
      db.select({ id: pscPurchaseRequisitions.id }).from(pscPurchaseRequisitions)
        .where(and(eq(pscPurchaseRequisitions.tenantId, user.tenantId), isNull(pscPurchaseRequisitions.deletedAt), eq(pscPurchaseRequisitions.status, "pending")))
        .then((r) => r.length),
      db.select({ id: pscVendorSourcings.id }).from(pscVendorSourcings)
        .where(and(eq(pscVendorSourcings.tenantId, user.tenantId), isNull(pscVendorSourcings.deletedAt), eq(pscVendorSourcings.status, "open")))
        .then((r) => r.length),
      db.select({ id: pscPurchaseOrders.id }).from(pscPurchaseOrders)
        .where(and(eq(pscPurchaseOrders.tenantId, user.tenantId), isNull(pscPurchaseOrders.deletedAt), eq(pscPurchaseOrders.status, "approved")))
        .then((r) => r.length),
      db.select({ id: pscProcurementContracts.id }).from(pscProcurementContracts)
        .where(and(eq(pscProcurementContracts.tenantId, user.tenantId), isNull(pscProcurementContracts.deletedAt), eq(pscProcurementContracts.status, "active")))
        .then((r) => r.length),
      db.select({ id: pscInventoryStockControls.id }).from(pscInventoryStockControls)
        .where(and(eq(pscInventoryStockControls.tenantId, user.tenantId), isNull(pscInventoryStockControls.deletedAt), eq(pscInventoryStockControls.status, "active")))
        .then((r) => r.length),
      db.select({ id: pscGoodsReceiptInspections.id }).from(pscGoodsReceiptInspections)
        .where(and(eq(pscGoodsReceiptInspections.tenantId, user.tenantId), isNull(pscGoodsReceiptInspections.deletedAt), eq(pscGoodsReceiptInspections.status, "pending")))
        .then((r) => r.length),
      db.select({ id: pscSpendAnalytics.id }).from(pscSpendAnalytics)
        .where(and(eq(pscSpendAnalytics.tenantId, user.tenantId), isNull(pscSpendAnalytics.deletedAt), eq(pscSpendAnalytics.status, "draft")))
        .then((r) => r.length),
      db.select({ id: pscSupplierScorecards.id }).from(pscSupplierScorecards)
        .where(and(eq(pscSupplierScorecards.tenantId, user.tenantId), isNull(pscSupplierScorecards.deletedAt), eq(pscSupplierScorecards.status, "draft")))
        .then((r) => r.length),
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
