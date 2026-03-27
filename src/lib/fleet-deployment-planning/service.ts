import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  fdpDeploymentDecisions,
  fdpFleetUtilizations,
  fdpNetworkDesigns,
  fdpDeploymentOptimizers,
  fdpFleetFinancials,
  fdpVesselSwaps,
  fdpDeploymentContracts,
  fdpMarketIntelligence,
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
// Vessel Deployment Decision Matrix
// ==========================================
export async function listDeploymentDecisions({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(fdpDeploymentDecisions.tenantId, tenantId), isNull(fdpDeploymentDecisions.deletedAt)];
  if (search) conditions.push(or(ilike(fdpDeploymentDecisions.decisionRef, `%${search}%`), ilike(fdpDeploymentDecisions.title, `%${search}%`))!);
  if (status) conditions.push(eq(fdpDeploymentDecisions.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(fdpDeploymentDecisions.createdAt, fdpDeploymentDecisions.id, cc)); }
  const results = await db.select().from(fdpDeploymentDecisions).where(and(...conditions)).orderBy(desc(fdpDeploymentDecisions.createdAt), desc(fdpDeploymentDecisions.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getDeploymentDecision(id: string, tenantId: string) {
  const [record] = await db.select().from(fdpDeploymentDecisions).where(and(eq(fdpDeploymentDecisions.id, id), eq(fdpDeploymentDecisions.tenantId, tenantId), isNull(fdpDeploymentDecisions.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Fleet Utilization & Capacity Planning
// ==========================================
export async function listFleetUtilizations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(fdpFleetUtilizations.tenantId, tenantId), isNull(fdpFleetUtilizations.deletedAt)];
  if (search) conditions.push(or(ilike(fdpFleetUtilizations.utilizationRef, `%${search}%`), ilike(fdpFleetUtilizations.title, `%${search}%`))!);
  if (status) conditions.push(eq(fdpFleetUtilizations.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(fdpFleetUtilizations.createdAt, fdpFleetUtilizations.id, cc)); }
  const results = await db.select().from(fdpFleetUtilizations).where(and(...conditions)).orderBy(desc(fdpFleetUtilizations.createdAt), desc(fdpFleetUtilizations.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getFleetUtilization(id: string, tenantId: string) {
  const [record] = await db.select().from(fdpFleetUtilizations).where(and(eq(fdpFleetUtilizations.id, id), eq(fdpFleetUtilizations.tenantId, tenantId), isNull(fdpFleetUtilizations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Service Network Design & Evaluation
// ==========================================
export async function listNetworkDesigns({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(fdpNetworkDesigns.tenantId, tenantId), isNull(fdpNetworkDesigns.deletedAt)];
  if (search) conditions.push(or(ilike(fdpNetworkDesigns.networkRef, `%${search}%`), ilike(fdpNetworkDesigns.title, `%${search}%`))!);
  if (status) conditions.push(eq(fdpNetworkDesigns.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(fdpNetworkDesigns.createdAt, fdpNetworkDesigns.id, cc)); }
  const results = await db.select().from(fdpNetworkDesigns).where(and(...conditions)).orderBy(desc(fdpNetworkDesigns.createdAt), desc(fdpNetworkDesigns.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getNetworkDesign(id: string, tenantId: string) {
  const [record] = await db.select().from(fdpNetworkDesigns).where(and(eq(fdpNetworkDesigns.id, id), eq(fdpNetworkDesigns.tenantId, tenantId), isNull(fdpNetworkDesigns.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// AI Fleet Deployment Optimizer
// ==========================================
export async function listDeploymentOptimizers({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(fdpDeploymentOptimizers.tenantId, tenantId), isNull(fdpDeploymentOptimizers.deletedAt)];
  if (search) conditions.push(or(ilike(fdpDeploymentOptimizers.optimizerRef, `%${search}%`), ilike(fdpDeploymentOptimizers.title, `%${search}%`))!);
  if (status) conditions.push(eq(fdpDeploymentOptimizers.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(fdpDeploymentOptimizers.createdAt, fdpDeploymentOptimizers.id, cc)); }
  const results = await db.select().from(fdpDeploymentOptimizers).where(and(...conditions)).orderBy(desc(fdpDeploymentOptimizers.createdAt), desc(fdpDeploymentOptimizers.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getDeploymentOptimizer(id: string, tenantId: string) {
  const [record] = await db.select().from(fdpDeploymentOptimizers).where(and(eq(fdpDeploymentOptimizers.id, id), eq(fdpDeploymentOptimizers.tenantId, tenantId), isNull(fdpDeploymentOptimizers.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Fleet Size & Mix Financial Analysis
// ==========================================
export async function listFleetFinancials({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(fdpFleetFinancials.tenantId, tenantId), isNull(fdpFleetFinancials.deletedAt)];
  if (search) conditions.push(or(ilike(fdpFleetFinancials.financialRef, `%${search}%`), ilike(fdpFleetFinancials.title, `%${search}%`))!);
  if (status) conditions.push(eq(fdpFleetFinancials.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(fdpFleetFinancials.createdAt, fdpFleetFinancials.id, cc)); }
  const results = await db.select().from(fdpFleetFinancials).where(and(...conditions)).orderBy(desc(fdpFleetFinancials.createdAt), desc(fdpFleetFinancials.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getFleetFinancial(id: string, tenantId: string) {
  const [record] = await db.select().from(fdpFleetFinancials).where(and(eq(fdpFleetFinancials.id, id), eq(fdpFleetFinancials.tenantId, tenantId), isNull(fdpFleetFinancials.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Vessel Substitution & Swap Management
// ==========================================
export async function listVesselSwaps({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(fdpVesselSwaps.tenantId, tenantId), isNull(fdpVesselSwaps.deletedAt)];
  if (search) conditions.push(or(ilike(fdpVesselSwaps.swapRef, `%${search}%`), ilike(fdpVesselSwaps.title, `%${search}%`))!);
  if (status) conditions.push(eq(fdpVesselSwaps.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(fdpVesselSwaps.createdAt, fdpVesselSwaps.id, cc)); }
  const results = await db.select().from(fdpVesselSwaps).where(and(...conditions)).orderBy(desc(fdpVesselSwaps.createdAt), desc(fdpVesselSwaps.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getVesselSwap(id: string, tenantId: string) {
  const [record] = await db.select().from(fdpVesselSwaps).where(and(eq(fdpVesselSwaps.id, id), eq(fdpVesselSwaps.tenantId, tenantId), isNull(fdpVesselSwaps.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Long-Term Deployment Contract Management
// ==========================================
export async function listDeploymentContracts({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(fdpDeploymentContracts.tenantId, tenantId), isNull(fdpDeploymentContracts.deletedAt)];
  if (search) conditions.push(or(ilike(fdpDeploymentContracts.contractRef, `%${search}%`), ilike(fdpDeploymentContracts.title, `%${search}%`))!);
  if (status) conditions.push(eq(fdpDeploymentContracts.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(fdpDeploymentContracts.createdAt, fdpDeploymentContracts.id, cc)); }
  const results = await db.select().from(fdpDeploymentContracts).where(and(...conditions)).orderBy(desc(fdpDeploymentContracts.createdAt), desc(fdpDeploymentContracts.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getDeploymentContract(id: string, tenantId: string) {
  const [record] = await db.select().from(fdpDeploymentContracts).where(and(eq(fdpDeploymentContracts.id, id), eq(fdpDeploymentContracts.tenantId, tenantId), isNull(fdpDeploymentContracts.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Freight Market Intelligence Integration
// ==========================================
export async function listMarketIntelligence({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(fdpMarketIntelligence.tenantId, tenantId), isNull(fdpMarketIntelligence.deletedAt)];
  if (search) conditions.push(or(ilike(fdpMarketIntelligence.intelRef, `%${search}%`), ilike(fdpMarketIntelligence.title, `%${search}%`))!);
  if (status) conditions.push(eq(fdpMarketIntelligence.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(fdpMarketIntelligence.createdAt, fdpMarketIntelligence.id, cc)); }
  const results = await db.select().from(fdpMarketIntelligence).where(and(...conditions)).orderBy(desc(fdpMarketIntelligence.createdAt), desc(fdpMarketIntelligence.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getMarketIntelligence(id: string, tenantId: string) {
  const [record] = await db.select().from(fdpMarketIntelligence).where(and(eq(fdpMarketIntelligence.id, id), eq(fdpMarketIntelligence.tenantId, tenantId), isNull(fdpMarketIntelligence.deletedAt))).limit(1);
  return record ?? null;
}
