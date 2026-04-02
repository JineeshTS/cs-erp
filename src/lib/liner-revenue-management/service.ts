import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  lrmTeuMaximizations,
  lrmCargoMixes,
  lrmDemandForecasts,
  lrmFreightContracts,
  lrmLeakageDetections,
  lrmRateIntegrities,
  lrmRevenueAccruals,
  lrmMaximizationEngines,
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
// Revenue per TEU Maximization Strategy
// ==========================================
export async function listTeuMaximizations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(lrmTeuMaximizations.tenantId, tenantId), isNull(lrmTeuMaximizations.deletedAt)];
  if (search) conditions.push(or(ilike(lrmTeuMaximizations.strategyRef, `%${search}%`), ilike(lrmTeuMaximizations.tradeLane, `%${search}%`))!);
  if (status) conditions.push(eq(lrmTeuMaximizations.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(lrmTeuMaximizations.createdAt, lrmTeuMaximizations.id, cc)); }
  const results = await db.select().from(lrmTeuMaximizations).where(and(...conditions)).orderBy(desc(lrmTeuMaximizations.createdAt), desc(lrmTeuMaximizations.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getTeuMaximization(id: string, tenantId: string) {
  const [record] = await db.select().from(lrmTeuMaximizations).where(and(eq(lrmTeuMaximizations.id, id), eq(lrmTeuMaximizations.tenantId, tenantId), isNull(lrmTeuMaximizations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Cargo Mix & Portfolio Management
// ==========================================
export async function listCargoMixes({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(lrmCargoMixes.tenantId, tenantId), isNull(lrmCargoMixes.deletedAt)];
  if (search) conditions.push(or(ilike(lrmCargoMixes.mixRef, `%${search}%`), ilike(lrmCargoMixes.commodityGroup, `%${search}%`))!);
  if (status) conditions.push(eq(lrmCargoMixes.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(lrmCargoMixes.createdAt, lrmCargoMixes.id, cc)); }
  const results = await db.select().from(lrmCargoMixes).where(and(...conditions)).orderBy(desc(lrmCargoMixes.createdAt), desc(lrmCargoMixes.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getCargoMix(id: string, tenantId: string) {
  const [record] = await db.select().from(lrmCargoMixes).where(and(eq(lrmCargoMixes.id, id), eq(lrmCargoMixes.tenantId, tenantId), isNull(lrmCargoMixes.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// AI Demand Forecasting per Trade Lane
// ==========================================
export async function listDemandForecasts({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(lrmDemandForecasts.tenantId, tenantId), isNull(lrmDemandForecasts.deletedAt)];
  if (search) conditions.push(or(ilike(lrmDemandForecasts.forecastRef, `%${search}%`), ilike(lrmDemandForecasts.tradeLane, `%${search}%`))!);
  if (status) conditions.push(eq(lrmDemandForecasts.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(lrmDemandForecasts.createdAt, lrmDemandForecasts.id, cc)); }
  const results = await db.select().from(lrmDemandForecasts).where(and(...conditions)).orderBy(desc(lrmDemandForecasts.createdAt), desc(lrmDemandForecasts.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getDemandForecast(id: string, tenantId: string) {
  const [record] = await db.select().from(lrmDemandForecasts).where(and(eq(lrmDemandForecasts.id, id), eq(lrmDemandForecasts.tenantId, tenantId), isNull(lrmDemandForecasts.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Freight Forward Contracts & Futures
// ==========================================
export async function listFreightContracts({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(lrmFreightContracts.tenantId, tenantId), isNull(lrmFreightContracts.deletedAt)];
  if (search) conditions.push(or(ilike(lrmFreightContracts.contractRef, `%${search}%`), ilike(lrmFreightContracts.counterparty, `%${search}%`))!);
  if (status) conditions.push(eq(lrmFreightContracts.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(lrmFreightContracts.createdAt, lrmFreightContracts.id, cc)); }
  const results = await db.select().from(lrmFreightContracts).where(and(...conditions)).orderBy(desc(lrmFreightContracts.createdAt), desc(lrmFreightContracts.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getFreightContract(id: string, tenantId: string) {
  const [record] = await db.select().from(lrmFreightContracts).where(and(eq(lrmFreightContracts.id, id), eq(lrmFreightContracts.tenantId, tenantId), isNull(lrmFreightContracts.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Revenue Leakage Detection & Prevention
// ==========================================
export async function listLeakageDetections({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(lrmLeakageDetections.tenantId, tenantId), isNull(lrmLeakageDetections.deletedAt)];
  if (search) conditions.push(or(ilike(lrmLeakageDetections.leakageRef, `%${search}%`), ilike(lrmLeakageDetections.customerName, `%${search}%`))!);
  if (status) conditions.push(eq(lrmLeakageDetections.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(lrmLeakageDetections.createdAt, lrmLeakageDetections.id, cc)); }
  const results = await db.select().from(lrmLeakageDetections).where(and(...conditions)).orderBy(desc(lrmLeakageDetections.createdAt), desc(lrmLeakageDetections.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getLeakageDetection(id: string, tenantId: string) {
  const [record] = await db.select().from(lrmLeakageDetections).where(and(eq(lrmLeakageDetections.id, id), eq(lrmLeakageDetections.tenantId, tenantId), isNull(lrmLeakageDetections.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Rate Integrity & Unauthorized Discount Control
// ==========================================
export async function listRateIntegrities({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(lrmRateIntegrities.tenantId, tenantId), isNull(lrmRateIntegrities.deletedAt)];
  if (search) conditions.push(or(ilike(lrmRateIntegrities.integrityRef, `%${search}%`), ilike(lrmRateIntegrities.customerName, `%${search}%`))!);
  if (status) conditions.push(eq(lrmRateIntegrities.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(lrmRateIntegrities.createdAt, lrmRateIntegrities.id, cc)); }
  const results = await db.select().from(lrmRateIntegrities).where(and(...conditions)).orderBy(desc(lrmRateIntegrities.createdAt), desc(lrmRateIntegrities.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getRateIntegrity(id: string, tenantId: string) {
  const [record] = await db.select().from(lrmRateIntegrities).where(and(eq(lrmRateIntegrities.id, id), eq(lrmRateIntegrities.tenantId, tenantId), isNull(lrmRateIntegrities.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Revenue Accrual Management
// ==========================================
export async function listRevenueAccruals({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(lrmRevenueAccruals.tenantId, tenantId), isNull(lrmRevenueAccruals.deletedAt)];
  if (search) conditions.push(or(ilike(lrmRevenueAccruals.accrualRef, `%${search}%`), ilike(lrmRevenueAccruals.voyageRef, `%${search}%`))!);
  if (status) conditions.push(eq(lrmRevenueAccruals.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(lrmRevenueAccruals.createdAt, lrmRevenueAccruals.id, cc)); }
  const results = await db.select().from(lrmRevenueAccruals).where(and(...conditions)).orderBy(desc(lrmRevenueAccruals.createdAt), desc(lrmRevenueAccruals.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getRevenueAccrual(id: string, tenantId: string) {
  const [record] = await db.select().from(lrmRevenueAccruals).where(and(eq(lrmRevenueAccruals.id, id), eq(lrmRevenueAccruals.tenantId, tenantId), isNull(lrmRevenueAccruals.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// AI Revenue Maximization Engine
// ==========================================
export async function listMaximizationEngines({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(lrmMaximizationEngines.tenantId, tenantId), isNull(lrmMaximizationEngines.deletedAt)];
  if (search) conditions.push(or(ilike(lrmMaximizationEngines.engineRef, `%${search}%`), ilike(lrmMaximizationEngines.tradeLane, `%${search}%`))!);
  if (status) conditions.push(eq(lrmMaximizationEngines.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(lrmMaximizationEngines.createdAt, lrmMaximizationEngines.id, cc)); }
  const results = await db.select().from(lrmMaximizationEngines).where(and(...conditions)).orderBy(desc(lrmMaximizationEngines.createdAt), desc(lrmMaximizationEngines.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getMaximizationEngine(id: string, tenantId: string) {
  const [record] = await db.select().from(lrmMaximizationEngines).where(and(eq(lrmMaximizationEngines.id, id), eq(lrmMaximizationEngines.tenantId, tenantId), isNull(lrmMaximizationEngines.deletedAt))).limit(1);
  return record ?? null;
}
