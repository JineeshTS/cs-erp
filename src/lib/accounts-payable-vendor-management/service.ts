import { and, eq, ilike, isNull, gt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  apvmVendorMasters,
  apvmPurchaseOrders,
  apvmVendorInvoices,
  apvmThreeWayMatches,
  apvmPaymentSchedules,
  apvmVendorReconciliations,
  apvmOcrExtractions,
  apvmSpendAnalytics,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Vendor Masters
// ==========================================

export async function listVendorMasters({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(apvmVendorMasters.tenantId, tenantId), isNull(apvmVendorMasters.deletedAt)];
  if (search) conditions.push(or(ilike(apvmVendorMasters.vendorName, `%${search}%`), ilike(apvmVendorMasters.vendorCode, `%${search}%`))!);
  if (status) conditions.push(eq(apvmVendorMasters.status, status));
  if (cursor) conditions.push(gt(apvmVendorMasters.createdAt, new Date(cursor)));
  const results = await db.select().from(apvmVendorMasters).where(and(...conditions)).orderBy(desc(apvmVendorMasters.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getVendorMaster(id: string, tenantId: string) {
  const [record] = await db.select().from(apvmVendorMasters).where(and(eq(apvmVendorMasters.id, id), eq(apvmVendorMasters.tenantId, tenantId), isNull(apvmVendorMasters.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Purchase Orders
// ==========================================

export async function listPurchaseOrders({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(apvmPurchaseOrders.tenantId, tenantId), isNull(apvmPurchaseOrders.deletedAt)];
  if (search) conditions.push(or(ilike(apvmPurchaseOrders.poNumber, `%${search}%`), ilike(apvmPurchaseOrders.vendorName, `%${search}%`))!);
  if (status) conditions.push(eq(apvmPurchaseOrders.status, status));
  if (cursor) conditions.push(gt(apvmPurchaseOrders.createdAt, new Date(cursor)));
  const results = await db.select().from(apvmPurchaseOrders).where(and(...conditions)).orderBy(desc(apvmPurchaseOrders.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPurchaseOrder(id: string, tenantId: string) {
  const [record] = await db.select().from(apvmPurchaseOrders).where(and(eq(apvmPurchaseOrders.id, id), eq(apvmPurchaseOrders.tenantId, tenantId), isNull(apvmPurchaseOrders.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Vendor Invoices
// ==========================================

export async function listVendorInvoices({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(apvmVendorInvoices.tenantId, tenantId), isNull(apvmVendorInvoices.deletedAt)];
  if (search) conditions.push(or(ilike(apvmVendorInvoices.invoiceNumber, `%${search}%`), ilike(apvmVendorInvoices.vendorName, `%${search}%`))!);
  if (status) conditions.push(eq(apvmVendorInvoices.status, status));
  if (cursor) conditions.push(gt(apvmVendorInvoices.createdAt, new Date(cursor)));
  const results = await db.select().from(apvmVendorInvoices).where(and(...conditions)).orderBy(desc(apvmVendorInvoices.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getVendorInvoice(id: string, tenantId: string) {
  const [record] = await db.select().from(apvmVendorInvoices).where(and(eq(apvmVendorInvoices.id, id), eq(apvmVendorInvoices.tenantId, tenantId), isNull(apvmVendorInvoices.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Three-Way Matches
// ==========================================

export async function listThreeWayMatches({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(apvmThreeWayMatches.tenantId, tenantId), isNull(apvmThreeWayMatches.deletedAt)];
  if (search) conditions.push(or(ilike(apvmThreeWayMatches.matchRef, `%${search}%`), ilike(apvmThreeWayMatches.vendorName, `%${search}%`))!);
  if (status) conditions.push(eq(apvmThreeWayMatches.status, status));
  if (cursor) conditions.push(gt(apvmThreeWayMatches.createdAt, new Date(cursor)));
  const results = await db.select().from(apvmThreeWayMatches).where(and(...conditions)).orderBy(desc(apvmThreeWayMatches.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getThreeWayMatch(id: string, tenantId: string) {
  const [record] = await db.select().from(apvmThreeWayMatches).where(and(eq(apvmThreeWayMatches.id, id), eq(apvmThreeWayMatches.tenantId, tenantId), isNull(apvmThreeWayMatches.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Payment Schedules
// ==========================================

export async function listPaymentSchedules({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(apvmPaymentSchedules.tenantId, tenantId), isNull(apvmPaymentSchedules.deletedAt)];
  if (search) conditions.push(or(ilike(apvmPaymentSchedules.scheduleRef, `%${search}%`), ilike(apvmPaymentSchedules.vendorName, `%${search}%`))!);
  if (status) conditions.push(eq(apvmPaymentSchedules.status, status));
  if (cursor) conditions.push(gt(apvmPaymentSchedules.createdAt, new Date(cursor)));
  const results = await db.select().from(apvmPaymentSchedules).where(and(...conditions)).orderBy(desc(apvmPaymentSchedules.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPaymentSchedule(id: string, tenantId: string) {
  const [record] = await db.select().from(apvmPaymentSchedules).where(and(eq(apvmPaymentSchedules.id, id), eq(apvmPaymentSchedules.tenantId, tenantId), isNull(apvmPaymentSchedules.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Vendor Reconciliations
// ==========================================

export async function listVendorReconciliations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(apvmVendorReconciliations.tenantId, tenantId), isNull(apvmVendorReconciliations.deletedAt)];
  if (search) conditions.push(or(ilike(apvmVendorReconciliations.reconciliationRef, `%${search}%`), ilike(apvmVendorReconciliations.vendorName, `%${search}%`))!);
  if (status) conditions.push(eq(apvmVendorReconciliations.status, status));
  if (cursor) conditions.push(gt(apvmVendorReconciliations.createdAt, new Date(cursor)));
  const results = await db.select().from(apvmVendorReconciliations).where(and(...conditions)).orderBy(desc(apvmVendorReconciliations.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getVendorReconciliation(id: string, tenantId: string) {
  const [record] = await db.select().from(apvmVendorReconciliations).where(and(eq(apvmVendorReconciliations.id, id), eq(apvmVendorReconciliations.tenantId, tenantId), isNull(apvmVendorReconciliations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// OCR Extractions
// ==========================================

export async function listOcrExtractions({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(apvmOcrExtractions.tenantId, tenantId), isNull(apvmOcrExtractions.deletedAt)];
  if (search) conditions.push(or(ilike(apvmOcrExtractions.extractionRef, `%${search}%`), ilike(apvmOcrExtractions.fileName, `%${search}%`))!);
  if (status) conditions.push(eq(apvmOcrExtractions.status, status));
  if (cursor) conditions.push(gt(apvmOcrExtractions.createdAt, new Date(cursor)));
  const results = await db.select().from(apvmOcrExtractions).where(and(...conditions)).orderBy(desc(apvmOcrExtractions.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getOcrExtraction(id: string, tenantId: string) {
  const [record] = await db.select().from(apvmOcrExtractions).where(and(eq(apvmOcrExtractions.id, id), eq(apvmOcrExtractions.tenantId, tenantId), isNull(apvmOcrExtractions.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Spend Analytics
// ==========================================

export async function listSpendAnalytics({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(apvmSpendAnalytics.tenantId, tenantId), isNull(apvmSpendAnalytics.deletedAt)];
  if (search) conditions.push(or(ilike(apvmSpendAnalytics.reportRef, `%${search}%`), ilike(apvmSpendAnalytics.reportType, `%${search}%`))!);
  if (status) conditions.push(eq(apvmSpendAnalytics.status, status));
  if (cursor) conditions.push(gt(apvmSpendAnalytics.createdAt, new Date(cursor)));
  const results = await db.select().from(apvmSpendAnalytics).where(and(...conditions)).orderBy(desc(apvmSpendAnalytics.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getSpendAnalytic(id: string, tenantId: string) {
  const [record] = await db.select().from(apvmSpendAnalytics).where(and(eq(apvmSpendAnalytics.id, id), eq(apvmSpendAnalytics.tenantId, tenantId), isNull(apvmSpendAnalytics.deletedAt))).limit(1);
  return record ?? null;
}
