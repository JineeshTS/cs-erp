import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  ddmDemurrageCalculations,
  ddmFreeTimeRules,
  ddmDetentionTrackings,
  ddmInvoices,
  ddmDisputes,
  ddmWaivers,
  ddmPredictions,
  ddmNotifications,
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
// Demurrage Calculations
// ==========================================

export async function listDemurrageCalculations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ddmDemurrageCalculations.tenantId, tenantId), isNull(ddmDemurrageCalculations.deletedAt)];
  if (search) conditions.push(or(ilike(ddmDemurrageCalculations.calculationRef, `%${search}%`), ilike(ddmDemurrageCalculations.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(ddmDemurrageCalculations.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(ddmDemurrageCalculations.createdAt, ddmDemurrageCalculations.id, cc)); }
  const results = await db.select().from(ddmDemurrageCalculations).where(and(...conditions)).orderBy(desc(ddmDemurrageCalculations.createdAt), desc(ddmDemurrageCalculations.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getDemurrageCalculation(id: string, tenantId: string) {
  const [record] = await db.select().from(ddmDemurrageCalculations).where(and(eq(ddmDemurrageCalculations.id, id), eq(ddmDemurrageCalculations.tenantId, tenantId), isNull(ddmDemurrageCalculations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Free Time Rules
// ==========================================

export async function listFreeTimeRules({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ddmFreeTimeRules.tenantId, tenantId), isNull(ddmFreeTimeRules.deletedAt)];
  if (search) conditions.push(or(ilike(ddmFreeTimeRules.ruleRef, `%${search}%`), ilike(ddmFreeTimeRules.ruleName, `%${search}%`))!);
  if (status) conditions.push(eq(ddmFreeTimeRules.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(ddmFreeTimeRules.createdAt, ddmFreeTimeRules.id, cc)); }
  const results = await db.select().from(ddmFreeTimeRules).where(and(...conditions)).orderBy(desc(ddmFreeTimeRules.createdAt), desc(ddmFreeTimeRules.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getFreeTimeRule(id: string, tenantId: string) {
  const [record] = await db.select().from(ddmFreeTimeRules).where(and(eq(ddmFreeTimeRules.id, id), eq(ddmFreeTimeRules.tenantId, tenantId), isNull(ddmFreeTimeRules.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Detention Trackings
// ==========================================

export async function listDetentionTrackings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ddmDetentionTrackings.tenantId, tenantId), isNull(ddmDetentionTrackings.deletedAt)];
  if (search) conditions.push(or(ilike(ddmDetentionTrackings.trackingRef, `%${search}%`), ilike(ddmDetentionTrackings.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(ddmDetentionTrackings.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(ddmDetentionTrackings.createdAt, ddmDetentionTrackings.id, cc)); }
  const results = await db.select().from(ddmDetentionTrackings).where(and(...conditions)).orderBy(desc(ddmDetentionTrackings.createdAt), desc(ddmDetentionTrackings.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getDetentionTracking(id: string, tenantId: string) {
  const [record] = await db.select().from(ddmDetentionTrackings).where(and(eq(ddmDetentionTrackings.id, id), eq(ddmDetentionTrackings.tenantId, tenantId), isNull(ddmDetentionTrackings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// D&D Invoices
// ==========================================

export async function listDdmInvoices({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ddmInvoices.tenantId, tenantId), isNull(ddmInvoices.deletedAt)];
  if (search) conditions.push(or(ilike(ddmInvoices.invoiceRef, `%${search}%`), ilike(ddmInvoices.customerName, `%${search}%`))!);
  if (status) conditions.push(eq(ddmInvoices.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(ddmInvoices.createdAt, ddmInvoices.id, cc)); }
  const results = await db.select().from(ddmInvoices).where(and(...conditions)).orderBy(desc(ddmInvoices.createdAt), desc(ddmInvoices.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getDdmInvoice(id: string, tenantId: string) {
  const [record] = await db.select().from(ddmInvoices).where(and(eq(ddmInvoices.id, id), eq(ddmInvoices.tenantId, tenantId), isNull(ddmInvoices.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// D&D Disputes
// ==========================================

export async function listDdmDisputes({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ddmDisputes.tenantId, tenantId), isNull(ddmDisputes.deletedAt)];
  if (search) conditions.push(or(ilike(ddmDisputes.disputeRef, `%${search}%`), ilike(ddmDisputes.customerName, `%${search}%`))!);
  if (status) conditions.push(eq(ddmDisputes.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(ddmDisputes.createdAt, ddmDisputes.id, cc)); }
  const results = await db.select().from(ddmDisputes).where(and(...conditions)).orderBy(desc(ddmDisputes.createdAt), desc(ddmDisputes.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getDdmDispute(id: string, tenantId: string) {
  const [record] = await db.select().from(ddmDisputes).where(and(eq(ddmDisputes.id, id), eq(ddmDisputes.tenantId, tenantId), isNull(ddmDisputes.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// D&D Waivers
// ==========================================

export async function listDdmWaivers({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ddmWaivers.tenantId, tenantId), isNull(ddmWaivers.deletedAt)];
  if (search) conditions.push(or(ilike(ddmWaivers.waiverRef, `%${search}%`), ilike(ddmWaivers.customerName, `%${search}%`))!);
  if (status) conditions.push(eq(ddmWaivers.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(ddmWaivers.createdAt, ddmWaivers.id, cc)); }
  const results = await db.select().from(ddmWaivers).where(and(...conditions)).orderBy(desc(ddmWaivers.createdAt), desc(ddmWaivers.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getDdmWaiver(id: string, tenantId: string) {
  const [record] = await db.select().from(ddmWaivers).where(and(eq(ddmWaivers.id, id), eq(ddmWaivers.tenantId, tenantId), isNull(ddmWaivers.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// D&D Predictions
// ==========================================

export async function listDdmPredictions({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ddmPredictions.tenantId, tenantId), isNull(ddmPredictions.deletedAt)];
  if (search) conditions.push(or(ilike(ddmPredictions.predictionRef, `%${search}%`), ilike(ddmPredictions.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(ddmPredictions.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(ddmPredictions.createdAt, ddmPredictions.id, cc)); }
  const results = await db.select().from(ddmPredictions).where(and(...conditions)).orderBy(desc(ddmPredictions.createdAt), desc(ddmPredictions.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getDdmPrediction(id: string, tenantId: string) {
  const [record] = await db.select().from(ddmPredictions).where(and(eq(ddmPredictions.id, id), eq(ddmPredictions.tenantId, tenantId), isNull(ddmPredictions.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// D&D Notifications
// ==========================================

export async function listDdmNotifications({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ddmNotifications.tenantId, tenantId), isNull(ddmNotifications.deletedAt)];
  if (search) conditions.push(or(ilike(ddmNotifications.notificationRef, `%${search}%`), ilike(ddmNotifications.customerName, `%${search}%`))!);
  if (status) conditions.push(eq(ddmNotifications.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(ddmNotifications.createdAt, ddmNotifications.id, cc)); }
  const results = await db.select().from(ddmNotifications).where(and(...conditions)).orderBy(desc(ddmNotifications.createdAt), desc(ddmNotifications.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getDdmNotification(id: string, tenantId: string) {
  const [record] = await db.select().from(ddmNotifications).where(and(eq(ddmNotifications.id, id), eq(ddmNotifications.tenantId, tenantId), isNull(ddmNotifications.deletedAt))).limit(1);
  return record ?? null;
}
