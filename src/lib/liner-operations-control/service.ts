import { and, eq, ilike, isNull, gt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  locCargoCutoffs,
  locOverbookingRollovers,
  locRollingUpgrades,
  locRevenueIntegrityAudits,
  locSlotSwapCoordinations,
  locScheduleDeviations,
  locCargoMixOptimizations,
  locLoadFactorReports,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Cargo Cut-Off Management per Port
// ==========================================
export async function listCargoCutoffs({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(locCargoCutoffs.tenantId, tenantId), isNull(locCargoCutoffs.deletedAt)];
  if (search) conditions.push(or(ilike(locCargoCutoffs.cutoffRef, `%${search}%`), ilike(locCargoCutoffs.portName, `%${search}%`))!);
  if (status) conditions.push(eq(locCargoCutoffs.status, status));
  if (cursor) conditions.push(gt(locCargoCutoffs.createdAt, new Date(cursor)));
  const results = await db.select().from(locCargoCutoffs).where(and(...conditions)).orderBy(desc(locCargoCutoffs.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCargoCutoff(id: string, tenantId: string) {
  const [record] = await db.select().from(locCargoCutoffs).where(and(eq(locCargoCutoffs.id, id), eq(locCargoCutoffs.tenantId, tenantId), isNull(locCargoCutoffs.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Overbooking & Rollover Management
// ==========================================
export async function listOverbookingRollovers({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(locOverbookingRollovers.tenantId, tenantId), isNull(locOverbookingRollovers.deletedAt)];
  if (search) conditions.push(or(ilike(locOverbookingRollovers.rolloverRef, `%${search}%`), ilike(locOverbookingRollovers.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(locOverbookingRollovers.status, status));
  if (cursor) conditions.push(gt(locOverbookingRollovers.createdAt, new Date(cursor)));
  const results = await db.select().from(locOverbookingRollovers).where(and(...conditions)).orderBy(desc(locOverbookingRollovers.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getOverbookingRollover(id: string, tenantId: string) {
  const [record] = await db.select().from(locOverbookingRollovers).where(and(eq(locOverbookingRollovers.id, id), eq(locOverbookingRollovers.tenantId, tenantId), isNull(locOverbookingRollovers.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Rolling & Upgrade Management
// ==========================================
export async function listRollingUpgrades({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(locRollingUpgrades.tenantId, tenantId), isNull(locRollingUpgrades.deletedAt)];
  if (search) conditions.push(or(ilike(locRollingUpgrades.upgradeRef, `%${search}%`), ilike(locRollingUpgrades.customerName, `%${search}%`))!);
  if (status) conditions.push(eq(locRollingUpgrades.status, status));
  if (cursor) conditions.push(gt(locRollingUpgrades.createdAt, new Date(cursor)));
  const results = await db.select().from(locRollingUpgrades).where(and(...conditions)).orderBy(desc(locRollingUpgrades.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getRollingUpgrade(id: string, tenantId: string) {
  const [record] = await db.select().from(locRollingUpgrades).where(and(eq(locRollingUpgrades.id, id), eq(locRollingUpgrades.tenantId, tenantId), isNull(locRollingUpgrades.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Revenue Integrity & Rate Audit
// ==========================================
export async function listRevenueIntegrityAudits({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(locRevenueIntegrityAudits.tenantId, tenantId), isNull(locRevenueIntegrityAudits.deletedAt)];
  if (search) conditions.push(or(ilike(locRevenueIntegrityAudits.auditRef, `%${search}%`), ilike(locRevenueIntegrityAudits.customerName, `%${search}%`))!);
  if (status) conditions.push(eq(locRevenueIntegrityAudits.status, status));
  if (cursor) conditions.push(gt(locRevenueIntegrityAudits.createdAt, new Date(cursor)));
  const results = await db.select().from(locRevenueIntegrityAudits).where(and(...conditions)).orderBy(desc(locRevenueIntegrityAudits.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getRevenueIntegrityAudit(id: string, tenantId: string) {
  const [record] = await db.select().from(locRevenueIntegrityAudits).where(and(eq(locRevenueIntegrityAudits.id, id), eq(locRevenueIntegrityAudits.tenantId, tenantId), isNull(locRevenueIntegrityAudits.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Slot Swap Coordination with Partners
// ==========================================
export async function listSlotSwapCoordinations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(locSlotSwapCoordinations.tenantId, tenantId), isNull(locSlotSwapCoordinations.deletedAt)];
  if (search) conditions.push(or(ilike(locSlotSwapCoordinations.swapRef, `%${search}%`), ilike(locSlotSwapCoordinations.partnerName, `%${search}%`))!);
  if (status) conditions.push(eq(locSlotSwapCoordinations.status, status));
  if (cursor) conditions.push(gt(locSlotSwapCoordinations.createdAt, new Date(cursor)));
  const results = await db.select().from(locSlotSwapCoordinations).where(and(...conditions)).orderBy(desc(locSlotSwapCoordinations.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getSlotSwapCoordination(id: string, tenantId: string) {
  const [record] = await db.select().from(locSlotSwapCoordinations).where(and(eq(locSlotSwapCoordinations.id, id), eq(locSlotSwapCoordinations.tenantId, tenantId), isNull(locSlotSwapCoordinations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Schedule Deviation & Recovery Management
// ==========================================
export async function listScheduleDeviations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(locScheduleDeviations.tenantId, tenantId), isNull(locScheduleDeviations.deletedAt)];
  if (search) conditions.push(or(ilike(locScheduleDeviations.deviationRef, `%${search}%`), ilike(locScheduleDeviations.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(locScheduleDeviations.status, status));
  if (cursor) conditions.push(gt(locScheduleDeviations.createdAt, new Date(cursor)));
  const results = await db.select().from(locScheduleDeviations).where(and(...conditions)).orderBy(desc(locScheduleDeviations.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getScheduleDeviation(id: string, tenantId: string) {
  const [record] = await db.select().from(locScheduleDeviations).where(and(eq(locScheduleDeviations.id, id), eq(locScheduleDeviations.tenantId, tenantId), isNull(locScheduleDeviations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// AI Cargo Mix Optimization
// ==========================================
export async function listCargoMixOptimizations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(locCargoMixOptimizations.tenantId, tenantId), isNull(locCargoMixOptimizations.deletedAt)];
  if (search) conditions.push(or(ilike(locCargoMixOptimizations.optimizationRef, `%${search}%`), ilike(locCargoMixOptimizations.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(locCargoMixOptimizations.status, status));
  if (cursor) conditions.push(gt(locCargoMixOptimizations.createdAt, new Date(cursor)));
  const results = await db.select().from(locCargoMixOptimizations).where(and(...conditions)).orderBy(desc(locCargoMixOptimizations.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCargoMixOptimization(id: string, tenantId: string) {
  const [record] = await db.select().from(locCargoMixOptimizations).where(and(eq(locCargoMixOptimizations.id, id), eq(locCargoMixOptimizations.tenantId, tenantId), isNull(locCargoMixOptimizations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Load Factor & Utilization Reporting
// ==========================================
export async function listLoadFactorReports({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(locLoadFactorReports.tenantId, tenantId), isNull(locLoadFactorReports.deletedAt)];
  if (search) conditions.push(or(ilike(locLoadFactorReports.reportRef, `%${search}%`), ilike(locLoadFactorReports.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(locLoadFactorReports.status, status));
  if (cursor) conditions.push(gt(locLoadFactorReports.createdAt, new Date(cursor)));
  const results = await db.select().from(locLoadFactorReports).where(and(...conditions)).orderBy(desc(locLoadFactorReports.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getLoadFactorReport(id: string, tenantId: string) {
  const [record] = await db.select().from(locLoadFactorReports).where(and(eq(locLoadFactorReports.id, id), eq(locLoadFactorReports.tenantId, tenantId), isNull(locLoadFactorReports.deletedAt))).limit(1);
  return record ?? null;
}
