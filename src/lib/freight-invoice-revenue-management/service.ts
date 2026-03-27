import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  firmFreightInvoices,
  firmInvoiceLineItems,
  firmDebitCreditNotes,
  firmInvoiceAmendments,
  firmProformaInvoices,
  firmRevenueAccruals,
  firmInvoiceDisputes,
  firmDunningRuns,
  firmDunningActions,
  firmRevenueForecastEntries,
} from "@/db/schema";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Freight Invoices
// ==========================================

export async function listFreightInvoices({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(firmFreightInvoices.tenantId, tenantId), isNull(firmFreightInvoices.deletedAt)];
  if (search) conditions.push(or(ilike(firmFreightInvoices.invoiceNumber, `%${search}%`), ilike(firmFreightInvoices.customerName, `%${search}%`), ilike(firmFreightInvoices.blNumber ?? "", `%${search}%`))!);
  if (status) conditions.push(eq(firmFreightInvoices.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(firmFreightInvoices.createdAt, firmFreightInvoices.id, cc)); }
  const results = await db.select().from(firmFreightInvoices).where(and(...conditions)).orderBy(desc(firmFreightInvoices.createdAt), desc(firmFreightInvoices.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getFreightInvoice(id: string, tenantId: string) {
  const [record] = await db.select().from(firmFreightInvoices).where(and(eq(firmFreightInvoices.id, id), eq(firmFreightInvoices.tenantId, tenantId), isNull(firmFreightInvoices.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Invoice Line Items
// ==========================================

export async function listInvoiceLineItems({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(firmInvoiceLineItems.tenantId, tenantId), isNull(firmInvoiceLineItems.deletedAt)];
  if (search) conditions.push(or(ilike(firmInvoiceLineItems.chargeCode, `%${search}%`), ilike(firmInvoiceLineItems.description, `%${search}%`))!);
  if (status) conditions.push(eq(firmInvoiceLineItems.invoiceId, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(firmInvoiceLineItems.createdAt, firmInvoiceLineItems.id, cc)); }
  const results = await db.select().from(firmInvoiceLineItems).where(and(...conditions)).orderBy(desc(firmInvoiceLineItems.createdAt), desc(firmInvoiceLineItems.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getInvoiceLineItem(id: string, tenantId: string) {
  const [record] = await db.select().from(firmInvoiceLineItems).where(and(eq(firmInvoiceLineItems.id, id), eq(firmInvoiceLineItems.tenantId, tenantId), isNull(firmInvoiceLineItems.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Debit/Credit Notes
// ==========================================

export async function listDebitCreditNotes({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(firmDebitCreditNotes.tenantId, tenantId), isNull(firmDebitCreditNotes.deletedAt)];
  if (search) conditions.push(or(ilike(firmDebitCreditNotes.noteNumber, `%${search}%`), ilike(firmDebitCreditNotes.customerName, `%${search}%`))!);
  if (status) conditions.push(eq(firmDebitCreditNotes.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(firmDebitCreditNotes.createdAt, firmDebitCreditNotes.id, cc)); }
  const results = await db.select().from(firmDebitCreditNotes).where(and(...conditions)).orderBy(desc(firmDebitCreditNotes.createdAt), desc(firmDebitCreditNotes.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getDebitCreditNote(id: string, tenantId: string) {
  const [record] = await db.select().from(firmDebitCreditNotes).where(and(eq(firmDebitCreditNotes.id, id), eq(firmDebitCreditNotes.tenantId, tenantId), isNull(firmDebitCreditNotes.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Invoice Amendments
// ==========================================

export async function listInvoiceAmendments({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(firmInvoiceAmendments.tenantId, tenantId), isNull(firmInvoiceAmendments.deletedAt)];
  if (search) conditions.push(or(ilike(firmInvoiceAmendments.amendmentRef, `%${search}%`), ilike(firmInvoiceAmendments.originalInvoiceNumber, `%${search}%`))!);
  if (status) conditions.push(eq(firmInvoiceAmendments.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(firmInvoiceAmendments.createdAt, firmInvoiceAmendments.id, cc)); }
  const results = await db.select().from(firmInvoiceAmendments).where(and(...conditions)).orderBy(desc(firmInvoiceAmendments.createdAt), desc(firmInvoiceAmendments.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getInvoiceAmendment(id: string, tenantId: string) {
  const [record] = await db.select().from(firmInvoiceAmendments).where(and(eq(firmInvoiceAmendments.id, id), eq(firmInvoiceAmendments.tenantId, tenantId), isNull(firmInvoiceAmendments.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Proforma Invoices
// ==========================================

export async function listProformaInvoices({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(firmProformaInvoices.tenantId, tenantId), isNull(firmProformaInvoices.deletedAt)];
  if (search) conditions.push(or(ilike(firmProformaInvoices.proformaNumber, `%${search}%`), ilike(firmProformaInvoices.customerName, `%${search}%`))!);
  if (status) conditions.push(eq(firmProformaInvoices.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(firmProformaInvoices.createdAt, firmProformaInvoices.id, cc)); }
  const results = await db.select().from(firmProformaInvoices).where(and(...conditions)).orderBy(desc(firmProformaInvoices.createdAt), desc(firmProformaInvoices.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getProformaInvoice(id: string, tenantId: string) {
  const [record] = await db.select().from(firmProformaInvoices).where(and(eq(firmProformaInvoices.id, id), eq(firmProformaInvoices.tenantId, tenantId), isNull(firmProformaInvoices.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Revenue Accruals
// ==========================================

export async function listRevenueAccruals({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(firmRevenueAccruals.tenantId, tenantId), isNull(firmRevenueAccruals.deletedAt)];
  if (search) conditions.push(or(ilike(firmRevenueAccruals.accrualRef, `%${search}%`), ilike(firmRevenueAccruals.voyageRef ?? "", `%${search}%`))!);
  if (status) conditions.push(eq(firmRevenueAccruals.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(firmRevenueAccruals.createdAt, firmRevenueAccruals.id, cc)); }
  const results = await db.select().from(firmRevenueAccruals).where(and(...conditions)).orderBy(desc(firmRevenueAccruals.createdAt), desc(firmRevenueAccruals.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getRevenueAccrual(id: string, tenantId: string) {
  const [record] = await db.select().from(firmRevenueAccruals).where(and(eq(firmRevenueAccruals.id, id), eq(firmRevenueAccruals.tenantId, tenantId), isNull(firmRevenueAccruals.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Invoice Disputes
// ==========================================

export async function listInvoiceDisputes({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(firmInvoiceDisputes.tenantId, tenantId), isNull(firmInvoiceDisputes.deletedAt)];
  if (search) conditions.push(or(ilike(firmInvoiceDisputes.disputeRef, `%${search}%`), ilike(firmInvoiceDisputes.customerName, `%${search}%`), ilike(firmInvoiceDisputes.invoiceNumber, `%${search}%`))!);
  if (status) conditions.push(eq(firmInvoiceDisputes.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(firmInvoiceDisputes.createdAt, firmInvoiceDisputes.id, cc)); }
  const results = await db.select().from(firmInvoiceDisputes).where(and(...conditions)).orderBy(desc(firmInvoiceDisputes.createdAt), desc(firmInvoiceDisputes.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getInvoiceDispute(id: string, tenantId: string) {
  const [record] = await db.select().from(firmInvoiceDisputes).where(and(eq(firmInvoiceDisputes.id, id), eq(firmInvoiceDisputes.tenantId, tenantId), isNull(firmInvoiceDisputes.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Dunning Runs
// ==========================================

export async function listDunningRuns({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(firmDunningRuns.tenantId, tenantId), isNull(firmDunningRuns.deletedAt)];
  if (search) conditions.push(ilike(firmDunningRuns.runRef, `%${search}%`));
  if (status) conditions.push(eq(firmDunningRuns.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(firmDunningRuns.createdAt, firmDunningRuns.id, cc)); }
  const results = await db.select().from(firmDunningRuns).where(and(...conditions)).orderBy(desc(firmDunningRuns.createdAt), desc(firmDunningRuns.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getDunningRun(id: string, tenantId: string) {
  const [record] = await db.select().from(firmDunningRuns).where(and(eq(firmDunningRuns.id, id), eq(firmDunningRuns.tenantId, tenantId), isNull(firmDunningRuns.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Dunning Actions
// ==========================================

export async function listDunningActions({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(firmDunningActions.tenantId, tenantId), isNull(firmDunningActions.deletedAt)];
  if (search) conditions.push(or(ilike(firmDunningActions.actionRef, `%${search}%`), ilike(firmDunningActions.customerName, `%${search}%`))!);
  if (status) conditions.push(eq(firmDunningActions.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(firmDunningActions.createdAt, firmDunningActions.id, cc)); }
  const results = await db.select().from(firmDunningActions).where(and(...conditions)).orderBy(desc(firmDunningActions.createdAt), desc(firmDunningActions.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getDunningAction(id: string, tenantId: string) {
  const [record] = await db.select().from(firmDunningActions).where(and(eq(firmDunningActions.id, id), eq(firmDunningActions.tenantId, tenantId), isNull(firmDunningActions.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Revenue Forecast Entries
// ==========================================

export async function listRevenueForecastEntries({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(firmRevenueForecastEntries.tenantId, tenantId), isNull(firmRevenueForecastEntries.deletedAt)];
  if (search) conditions.push(or(ilike(firmRevenueForecastEntries.forecastRef, `%${search}%`), ilike(firmRevenueForecastEntries.serviceRoute ?? "", `%${search}%`))!);
  if (status) conditions.push(eq(firmRevenueForecastEntries.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(firmRevenueForecastEntries.createdAt, firmRevenueForecastEntries.id, cc)); }
  const results = await db.select().from(firmRevenueForecastEntries).where(and(...conditions)).orderBy(desc(firmRevenueForecastEntries.createdAt), desc(firmRevenueForecastEntries.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getRevenueForecastEntry(id: string, tenantId: string) {
  const [record] = await db.select().from(firmRevenueForecastEntries).where(and(eq(firmRevenueForecastEntries.id, id), eq(firmRevenueForecastEntries.tenantId, tenantId), isNull(firmRevenueForecastEntries.deletedAt))).limit(1);
  return record ?? null;
}
