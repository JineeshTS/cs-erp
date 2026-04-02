import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  bfmBunkerOrders,
  bfmBunkerStems,
  bfmQualityTests,
  bfmQualityClaims,
  bfmFuelRobRecords,
  bfmFuelReconciliations,
  bfmEmissionsRecords,
  bfmSulphurRecords,
  bfmCostAllocations,
  bfmOptimizationRuns,
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
// Bunker Orders
// ==========================================

export async function listBunkerOrders({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(bfmBunkerOrders.tenantId, tenantId), isNull(bfmBunkerOrders.deletedAt)];
  if (search) conditions.push(or(ilike(bfmBunkerOrders.orderRef, `%${search}%`), ilike(bfmBunkerOrders.vesselName, `%${search}%`), ilike(bfmBunkerOrders.supplierName, `%${search}%`))!);
  if (status) conditions.push(eq(bfmBunkerOrders.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(bfmBunkerOrders.createdAt, bfmBunkerOrders.id, cc)); }

  const results = await db.select().from(bfmBunkerOrders).where(and(...conditions)).orderBy(desc(bfmBunkerOrders.createdAt), desc(bfmBunkerOrders.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getBunkerOrder(id: string, tenantId: string) {
  const [record] = await db.select().from(bfmBunkerOrders).where(and(eq(bfmBunkerOrders.id, id), eq(bfmBunkerOrders.tenantId, tenantId), isNull(bfmBunkerOrders.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Bunker Stems
// ==========================================

export async function listBunkerStems({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(bfmBunkerStems.tenantId, tenantId), isNull(bfmBunkerStems.deletedAt)];
  if (search) conditions.push(or(ilike(bfmBunkerStems.stemRef, `%${search}%`), ilike(bfmBunkerStems.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(bfmBunkerStems.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(bfmBunkerStems.createdAt, bfmBunkerStems.id, cc)); }

  const results = await db.select().from(bfmBunkerStems).where(and(...conditions)).orderBy(desc(bfmBunkerStems.createdAt), desc(bfmBunkerStems.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getBunkerStem(id: string, tenantId: string) {
  const [record] = await db.select().from(bfmBunkerStems).where(and(eq(bfmBunkerStems.id, id), eq(bfmBunkerStems.tenantId, tenantId), isNull(bfmBunkerStems.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Quality Tests
// ==========================================

export async function listQualityTests({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(bfmQualityTests.tenantId, tenantId), isNull(bfmQualityTests.deletedAt)];
  if (search) conditions.push(or(ilike(bfmQualityTests.testRef, `%${search}%`), ilike(bfmQualityTests.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(bfmQualityTests.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(bfmQualityTests.createdAt, bfmQualityTests.id, cc)); }

  const results = await db.select().from(bfmQualityTests).where(and(...conditions)).orderBy(desc(bfmQualityTests.createdAt), desc(bfmQualityTests.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getQualityTest(id: string, tenantId: string) {
  const [record] = await db.select().from(bfmQualityTests).where(and(eq(bfmQualityTests.id, id), eq(bfmQualityTests.tenantId, tenantId), isNull(bfmQualityTests.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Quality Claims
// ==========================================

export async function listQualityClaims({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(bfmQualityClaims.tenantId, tenantId), isNull(bfmQualityClaims.deletedAt)];
  if (search) conditions.push(or(ilike(bfmQualityClaims.claimRef, `%${search}%`), ilike(bfmQualityClaims.supplierName, `%${search}%`))!);
  if (status) conditions.push(eq(bfmQualityClaims.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(bfmQualityClaims.createdAt, bfmQualityClaims.id, cc)); }

  const results = await db.select().from(bfmQualityClaims).where(and(...conditions)).orderBy(desc(bfmQualityClaims.createdAt), desc(bfmQualityClaims.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getQualityClaim(id: string, tenantId: string) {
  const [record] = await db.select().from(bfmQualityClaims).where(and(eq(bfmQualityClaims.id, id), eq(bfmQualityClaims.tenantId, tenantId), isNull(bfmQualityClaims.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Fuel ROB Records
// ==========================================

export async function listFuelRobRecords({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(bfmFuelRobRecords.tenantId, tenantId), isNull(bfmFuelRobRecords.deletedAt)];
  if (search) conditions.push(or(ilike(bfmFuelRobRecords.vesselName, `%${search}%`), ilike(bfmFuelRobRecords.voyageRef ?? "", `%${search}%`))!);
  if (status) conditions.push(eq(bfmFuelRobRecords.reportType, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(bfmFuelRobRecords.createdAt, bfmFuelRobRecords.id, cc)); }

  const results = await db.select().from(bfmFuelRobRecords).where(and(...conditions)).orderBy(desc(bfmFuelRobRecords.createdAt), desc(bfmFuelRobRecords.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getFuelRobRecord(id: string, tenantId: string) {
  const [record] = await db.select().from(bfmFuelRobRecords).where(and(eq(bfmFuelRobRecords.id, id), eq(bfmFuelRobRecords.tenantId, tenantId), isNull(bfmFuelRobRecords.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Fuel Reconciliations
// ==========================================

export async function listFuelReconciliations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(bfmFuelReconciliations.tenantId, tenantId), isNull(bfmFuelReconciliations.deletedAt)];
  if (search) conditions.push(or(ilike(bfmFuelReconciliations.reconciliationRef, `%${search}%`), ilike(bfmFuelReconciliations.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(bfmFuelReconciliations.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(bfmFuelReconciliations.createdAt, bfmFuelReconciliations.id, cc)); }

  const results = await db.select().from(bfmFuelReconciliations).where(and(...conditions)).orderBy(desc(bfmFuelReconciliations.createdAt), desc(bfmFuelReconciliations.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getFuelReconciliation(id: string, tenantId: string) {
  const [record] = await db.select().from(bfmFuelReconciliations).where(and(eq(bfmFuelReconciliations.id, id), eq(bfmFuelReconciliations.tenantId, tenantId), isNull(bfmFuelReconciliations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Emissions Records
// ==========================================

export async function listEmissionsRecords({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(bfmEmissionsRecords.tenantId, tenantId), isNull(bfmEmissionsRecords.deletedAt)];
  if (search) conditions.push(or(ilike(bfmEmissionsRecords.recordRef, `%${search}%`), ilike(bfmEmissionsRecords.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(bfmEmissionsRecords.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(bfmEmissionsRecords.createdAt, bfmEmissionsRecords.id, cc)); }

  const results = await db.select().from(bfmEmissionsRecords).where(and(...conditions)).orderBy(desc(bfmEmissionsRecords.createdAt), desc(bfmEmissionsRecords.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getEmissionsRecord(id: string, tenantId: string) {
  const [record] = await db.select().from(bfmEmissionsRecords).where(and(eq(bfmEmissionsRecords.id, id), eq(bfmEmissionsRecords.tenantId, tenantId), isNull(bfmEmissionsRecords.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Sulphur Records
// ==========================================

export async function listSulphurRecords({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(bfmSulphurRecords.tenantId, tenantId), isNull(bfmSulphurRecords.deletedAt)];
  if (search) conditions.push(or(ilike(bfmSulphurRecords.recordRef, `%${search}%`), ilike(bfmSulphurRecords.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(bfmSulphurRecords.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(bfmSulphurRecords.createdAt, bfmSulphurRecords.id, cc)); }

  const results = await db.select().from(bfmSulphurRecords).where(and(...conditions)).orderBy(desc(bfmSulphurRecords.createdAt), desc(bfmSulphurRecords.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getSulphurRecord(id: string, tenantId: string) {
  const [record] = await db.select().from(bfmSulphurRecords).where(and(eq(bfmSulphurRecords.id, id), eq(bfmSulphurRecords.tenantId, tenantId), isNull(bfmSulphurRecords.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Cost Allocations
// ==========================================

export async function listCostAllocations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(bfmCostAllocations.tenantId, tenantId), isNull(bfmCostAllocations.deletedAt)];
  if (search) conditions.push(or(ilike(bfmCostAllocations.allocationRef, `%${search}%`), ilike(bfmCostAllocations.vesselName, `%${search}%`), ilike(bfmCostAllocations.voyageRef, `%${search}%`))!);
  if (status) conditions.push(eq(bfmCostAllocations.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(bfmCostAllocations.createdAt, bfmCostAllocations.id, cc)); }

  const results = await db.select().from(bfmCostAllocations).where(and(...conditions)).orderBy(desc(bfmCostAllocations.createdAt), desc(bfmCostAllocations.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getCostAllocation(id: string, tenantId: string) {
  const [record] = await db.select().from(bfmCostAllocations).where(and(eq(bfmCostAllocations.id, id), eq(bfmCostAllocations.tenantId, tenantId), isNull(bfmCostAllocations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Optimization Runs
// ==========================================

export async function listOptimizationRuns({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(bfmOptimizationRuns.tenantId, tenantId), isNull(bfmOptimizationRuns.deletedAt)];
  if (search) conditions.push(or(ilike(bfmOptimizationRuns.runRef, `%${search}%`), ilike(bfmOptimizationRuns.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(bfmOptimizationRuns.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(bfmOptimizationRuns.createdAt, bfmOptimizationRuns.id, cc)); }

  const results = await db.select().from(bfmOptimizationRuns).where(and(...conditions)).orderBy(desc(bfmOptimizationRuns.createdAt), desc(bfmOptimizationRuns.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getOptimizationRun(id: string, tenantId: string) {
  const [record] = await db.select().from(bfmOptimizationRuns).where(and(eq(bfmOptimizationRuns.id, id), eq(bfmOptimizationRuns.tenantId, tenantId), isNull(bfmOptimizationRuns.deletedAt))).limit(1);
  return record ?? null;
}
