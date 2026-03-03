import { and, eq, ilike, isNull, gt, desc, or } from "drizzle-orm";
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

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Purchase Requisitions
// ==========================================
export async function listPurchaseRequisitions({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pscPurchaseRequisitions.tenantId, tenantId), isNull(pscPurchaseRequisitions.deletedAt)];
  if (search) conditions.push(or(ilike(pscPurchaseRequisitions.requisitionRef, `%${search}%`), ilike(pscPurchaseRequisitions.title, `%${search}%`))!);
  if (status) conditions.push(eq(pscPurchaseRequisitions.status, status));
  if (cursor) conditions.push(gt(pscPurchaseRequisitions.createdAt, new Date(cursor)));
  const results = await db.select().from(pscPurchaseRequisitions).where(and(...conditions)).orderBy(desc(pscPurchaseRequisitions.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPurchaseRequisition(id: string, tenantId: string) {
  const [record] = await db.select().from(pscPurchaseRequisitions).where(and(eq(pscPurchaseRequisitions.id, id), eq(pscPurchaseRequisitions.tenantId, tenantId), isNull(pscPurchaseRequisitions.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Vendor Sourcings
// ==========================================
export async function listVendorSourcings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pscVendorSourcings.tenantId, tenantId), isNull(pscVendorSourcings.deletedAt)];
  if (search) conditions.push(or(ilike(pscVendorSourcings.sourcingRef, `%${search}%`), ilike(pscVendorSourcings.title, `%${search}%`))!);
  if (status) conditions.push(eq(pscVendorSourcings.status, status));
  if (cursor) conditions.push(gt(pscVendorSourcings.createdAt, new Date(cursor)));
  const results = await db.select().from(pscVendorSourcings).where(and(...conditions)).orderBy(desc(pscVendorSourcings.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getVendorSourcing(id: string, tenantId: string) {
  const [record] = await db.select().from(pscVendorSourcings).where(and(eq(pscVendorSourcings.id, id), eq(pscVendorSourcings.tenantId, tenantId), isNull(pscVendorSourcings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Purchase Orders
// ==========================================
export async function listPurchaseOrders({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pscPurchaseOrders.tenantId, tenantId), isNull(pscPurchaseOrders.deletedAt)];
  if (search) conditions.push(or(ilike(pscPurchaseOrders.poRef, `%${search}%`), ilike(pscPurchaseOrders.vendorName, `%${search}%`))!);
  if (status) conditions.push(eq(pscPurchaseOrders.status, status));
  if (cursor) conditions.push(gt(pscPurchaseOrders.createdAt, new Date(cursor)));
  const results = await db.select().from(pscPurchaseOrders).where(and(...conditions)).orderBy(desc(pscPurchaseOrders.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPurchaseOrder(id: string, tenantId: string) {
  const [record] = await db.select().from(pscPurchaseOrders).where(and(eq(pscPurchaseOrders.id, id), eq(pscPurchaseOrders.tenantId, tenantId), isNull(pscPurchaseOrders.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Procurement Contracts
// ==========================================
export async function listProcurementContracts({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pscProcurementContracts.tenantId, tenantId), isNull(pscProcurementContracts.deletedAt)];
  if (search) conditions.push(or(ilike(pscProcurementContracts.contractRef, `%${search}%`), ilike(pscProcurementContracts.title, `%${search}%`))!);
  if (status) conditions.push(eq(pscProcurementContracts.status, status));
  if (cursor) conditions.push(gt(pscProcurementContracts.createdAt, new Date(cursor)));
  const results = await db.select().from(pscProcurementContracts).where(and(...conditions)).orderBy(desc(pscProcurementContracts.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getProcurementContract(id: string, tenantId: string) {
  const [record] = await db.select().from(pscProcurementContracts).where(and(eq(pscProcurementContracts.id, id), eq(pscProcurementContracts.tenantId, tenantId), isNull(pscProcurementContracts.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Inventory Stock Controls
// ==========================================
export async function listInventoryStockControls({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pscInventoryStockControls.tenantId, tenantId), isNull(pscInventoryStockControls.deletedAt)];
  if (search) conditions.push(or(ilike(pscInventoryStockControls.inventoryRef, `%${search}%`), ilike(pscInventoryStockControls.itemName, `%${search}%`))!);
  if (status) conditions.push(eq(pscInventoryStockControls.status, status));
  if (cursor) conditions.push(gt(pscInventoryStockControls.createdAt, new Date(cursor)));
  const results = await db.select().from(pscInventoryStockControls).where(and(...conditions)).orderBy(desc(pscInventoryStockControls.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getInventoryStockControl(id: string, tenantId: string) {
  const [record] = await db.select().from(pscInventoryStockControls).where(and(eq(pscInventoryStockControls.id, id), eq(pscInventoryStockControls.tenantId, tenantId), isNull(pscInventoryStockControls.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Goods Receipt Inspections
// ==========================================
export async function listGoodsReceiptInspections({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pscGoodsReceiptInspections.tenantId, tenantId), isNull(pscGoodsReceiptInspections.deletedAt)];
  if (search) conditions.push(or(ilike(pscGoodsReceiptInspections.receiptRef, `%${search}%`), ilike(pscGoodsReceiptInspections.vendorName, `%${search}%`))!);
  if (status) conditions.push(eq(pscGoodsReceiptInspections.status, status));
  if (cursor) conditions.push(gt(pscGoodsReceiptInspections.createdAt, new Date(cursor)));
  const results = await db.select().from(pscGoodsReceiptInspections).where(and(...conditions)).orderBy(desc(pscGoodsReceiptInspections.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getGoodsReceiptInspection(id: string, tenantId: string) {
  const [record] = await db.select().from(pscGoodsReceiptInspections).where(and(eq(pscGoodsReceiptInspections.id, id), eq(pscGoodsReceiptInspections.tenantId, tenantId), isNull(pscGoodsReceiptInspections.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Spend Analytics
// ==========================================
export async function listSpendAnalytics({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pscSpendAnalytics.tenantId, tenantId), isNull(pscSpendAnalytics.deletedAt)];
  if (search) conditions.push(or(ilike(pscSpendAnalytics.analyticsRef, `%${search}%`), ilike(pscSpendAnalytics.title, `%${search}%`))!);
  if (status) conditions.push(eq(pscSpendAnalytics.status, status));
  if (cursor) conditions.push(gt(pscSpendAnalytics.createdAt, new Date(cursor)));
  const results = await db.select().from(pscSpendAnalytics).where(and(...conditions)).orderBy(desc(pscSpendAnalytics.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getSpendAnalytic(id: string, tenantId: string) {
  const [record] = await db.select().from(pscSpendAnalytics).where(and(eq(pscSpendAnalytics.id, id), eq(pscSpendAnalytics.tenantId, tenantId), isNull(pscSpendAnalytics.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Supplier Scorecards
// ==========================================
export async function listSupplierScorecards({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pscSupplierScorecards.tenantId, tenantId), isNull(pscSupplierScorecards.deletedAt)];
  if (search) conditions.push(or(ilike(pscSupplierScorecards.scorecardRef, `%${search}%`), ilike(pscSupplierScorecards.vendorName, `%${search}%`))!);
  if (status) conditions.push(eq(pscSupplierScorecards.status, status));
  if (cursor) conditions.push(gt(pscSupplierScorecards.createdAt, new Date(cursor)));
  const results = await db.select().from(pscSupplierScorecards).where(and(...conditions)).orderBy(desc(pscSupplierScorecards.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getSupplierScorecard(id: string, tenantId: string) {
  const [record] = await db.select().from(pscSupplierScorecards).where(and(eq(pscSupplierScorecards.id, id), eq(pscSupplierScorecards.tenantId, tenantId), isNull(pscSupplierScorecards.deletedAt))).limit(1);
  return record ?? null;
}
