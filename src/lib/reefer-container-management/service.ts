import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  rcmReeferBookings,
  rcmTempMonitorings,
  rcmPtiInspections,
  rcmPowerManagement,
  rcmColdChainDocs,
  rcmBreakdownResponses,
  rcmTempAlerts,
  rcmClaimAnalytics,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Reefer Bookings
// ==========================================

export async function listReeferBookings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(rcmReeferBookings.tenantId, tenantId), isNull(rcmReeferBookings.deletedAt)];
  if (search) conditions.push(or(ilike(rcmReeferBookings.bookingRef, `%${search}%`), ilike(rcmReeferBookings.customerName, `%${search}%`), ilike(rcmReeferBookings.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(rcmReeferBookings.status, status));
  if (cursor) conditions.push(lt(rcmReeferBookings.createdAt, new Date(cursor)));
  const results = await db.select().from(rcmReeferBookings).where(and(...conditions)).orderBy(desc(rcmReeferBookings.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getReeferBooking(id: string, tenantId: string) {
  const [record] = await db.select().from(rcmReeferBookings).where(and(eq(rcmReeferBookings.id, id), eq(rcmReeferBookings.tenantId, tenantId), isNull(rcmReeferBookings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Temperature Monitorings
// ==========================================

export async function listTempMonitorings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(rcmTempMonitorings.tenantId, tenantId), isNull(rcmTempMonitorings.deletedAt)];
  if (search) conditions.push(or(ilike(rcmTempMonitorings.monitoringRef, `%${search}%`), ilike(rcmTempMonitorings.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(rcmTempMonitorings.status, status));
  if (cursor) conditions.push(lt(rcmTempMonitorings.createdAt, new Date(cursor)));
  const results = await db.select().from(rcmTempMonitorings).where(and(...conditions)).orderBy(desc(rcmTempMonitorings.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getTempMonitoring(id: string, tenantId: string) {
  const [record] = await db.select().from(rcmTempMonitorings).where(and(eq(rcmTempMonitorings.id, id), eq(rcmTempMonitorings.tenantId, tenantId), isNull(rcmTempMonitorings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// PTI Inspections
// ==========================================

export async function listPtiInspections({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(rcmPtiInspections.tenantId, tenantId), isNull(rcmPtiInspections.deletedAt)];
  if (search) conditions.push(or(ilike(rcmPtiInspections.inspectionRef, `%${search}%`), ilike(rcmPtiInspections.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(rcmPtiInspections.status, status));
  if (cursor) conditions.push(lt(rcmPtiInspections.createdAt, new Date(cursor)));
  const results = await db.select().from(rcmPtiInspections).where(and(...conditions)).orderBy(desc(rcmPtiInspections.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPtiInspection(id: string, tenantId: string) {
  const [record] = await db.select().from(rcmPtiInspections).where(and(eq(rcmPtiInspections.id, id), eq(rcmPtiInspections.tenantId, tenantId), isNull(rcmPtiInspections.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Power Management
// ==========================================

export async function listPowerManagement({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(rcmPowerManagement.tenantId, tenantId), isNull(rcmPowerManagement.deletedAt)];
  if (search) conditions.push(or(ilike(rcmPowerManagement.powerRef, `%${search}%`), ilike(rcmPowerManagement.containerNumber, `%${search}%`), ilike(rcmPowerManagement.locationName, `%${search}%`))!);
  if (status) conditions.push(eq(rcmPowerManagement.status, status));
  if (cursor) conditions.push(lt(rcmPowerManagement.createdAt, new Date(cursor)));
  const results = await db.select().from(rcmPowerManagement).where(and(...conditions)).orderBy(desc(rcmPowerManagement.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPowerManagementRecord(id: string, tenantId: string) {
  const [record] = await db.select().from(rcmPowerManagement).where(and(eq(rcmPowerManagement.id, id), eq(rcmPowerManagement.tenantId, tenantId), isNull(rcmPowerManagement.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Cold Chain Documents
// ==========================================

export async function listColdChainDocs({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(rcmColdChainDocs.tenantId, tenantId), isNull(rcmColdChainDocs.deletedAt)];
  if (search) conditions.push(or(ilike(rcmColdChainDocs.documentRef, `%${search}%`), ilike(rcmColdChainDocs.containerNumber, `%${search}%`), ilike(rcmColdChainDocs.customerName, `%${search}%`))!);
  if (status) conditions.push(eq(rcmColdChainDocs.status, status));
  if (cursor) conditions.push(lt(rcmColdChainDocs.createdAt, new Date(cursor)));
  const results = await db.select().from(rcmColdChainDocs).where(and(...conditions)).orderBy(desc(rcmColdChainDocs.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getColdChainDoc(id: string, tenantId: string) {
  const [record] = await db.select().from(rcmColdChainDocs).where(and(eq(rcmColdChainDocs.id, id), eq(rcmColdChainDocs.tenantId, tenantId), isNull(rcmColdChainDocs.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Breakdown Responses
// ==========================================

export async function listBreakdownResponses({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(rcmBreakdownResponses.tenantId, tenantId), isNull(rcmBreakdownResponses.deletedAt)];
  if (search) conditions.push(or(ilike(rcmBreakdownResponses.breakdownRef, `%${search}%`), ilike(rcmBreakdownResponses.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(rcmBreakdownResponses.status, status));
  if (cursor) conditions.push(lt(rcmBreakdownResponses.createdAt, new Date(cursor)));
  const results = await db.select().from(rcmBreakdownResponses).where(and(...conditions)).orderBy(desc(rcmBreakdownResponses.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getBreakdownResponse(id: string, tenantId: string) {
  const [record] = await db.select().from(rcmBreakdownResponses).where(and(eq(rcmBreakdownResponses.id, id), eq(rcmBreakdownResponses.tenantId, tenantId), isNull(rcmBreakdownResponses.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Temperature Alerts
// ==========================================

export async function listTempAlerts({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(rcmTempAlerts.tenantId, tenantId), isNull(rcmTempAlerts.deletedAt)];
  if (search) conditions.push(or(ilike(rcmTempAlerts.alertRef, `%${search}%`), ilike(rcmTempAlerts.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(rcmTempAlerts.status, status));
  if (cursor) conditions.push(lt(rcmTempAlerts.createdAt, new Date(cursor)));
  const results = await db.select().from(rcmTempAlerts).where(and(...conditions)).orderBy(desc(rcmTempAlerts.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getTempAlert(id: string, tenantId: string) {
  const [record] = await db.select().from(rcmTempAlerts).where(and(eq(rcmTempAlerts.id, id), eq(rcmTempAlerts.tenantId, tenantId), isNull(rcmTempAlerts.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Claim Analytics
// ==========================================

export async function listClaimAnalytics({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(rcmClaimAnalytics.tenantId, tenantId), isNull(rcmClaimAnalytics.deletedAt)];
  if (search) conditions.push(or(ilike(rcmClaimAnalytics.analyticsRef, `%${search}%`), ilike(rcmClaimAnalytics.containerNumber, `%${search}%`), ilike(rcmClaimAnalytics.customerName, `%${search}%`))!);
  if (status) conditions.push(eq(rcmClaimAnalytics.status, status));
  if (cursor) conditions.push(lt(rcmClaimAnalytics.createdAt, new Date(cursor)));
  const results = await db.select().from(rcmClaimAnalytics).where(and(...conditions)).orderBy(desc(rcmClaimAnalytics.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getClaimAnalytic(id: string, tenantId: string) {
  const [record] = await db.select().from(rcmClaimAnalytics).where(and(eq(rcmClaimAnalytics.id, id), eq(rcmClaimAnalytics.tenantId, tenantId), isNull(rcmClaimAnalytics.deletedAt))).limit(1);
  return record ?? null;
}
