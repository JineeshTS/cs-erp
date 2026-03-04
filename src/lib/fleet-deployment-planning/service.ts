import { and, eq, ilike, isNull, gt, desc, or } from "drizzle-orm";
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
  if (cursor) conditions.push(gt(fdpDeploymentDecisions.createdAt, new Date(cursor)));
  const results = await db.select().from(fdpDeploymentDecisions).where(and(...conditions)).orderBy(desc(fdpDeploymentDecisions.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
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
  if (cursor) conditions.push(gt(fdpFleetUtilizations.createdAt, new Date(cursor)));
  const results = await db.select().from(fdpFleetUtilizations).where(and(...conditions)).orderBy(desc(fdpFleetUtilizations.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
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
  if (cursor) conditions.push(gt(fdpNetworkDesigns.createdAt, new Date(cursor)));
  const results = await db.select().from(fdpNetworkDesigns).where(and(...conditions)).orderBy(desc(fdpNetworkDesigns.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
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
  if (cursor) conditions.push(gt(fdpDeploymentOptimizers.createdAt, new Date(cursor)));
  const results = await db.select().from(fdpDeploymentOptimizers).where(and(...conditions)).orderBy(desc(fdpDeploymentOptimizers.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
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
  if (cursor) conditions.push(gt(fdpFleetFinancials.createdAt, new Date(cursor)));
  const results = await db.select().from(fdpFleetFinancials).where(and(...conditions)).orderBy(desc(fdpFleetFinancials.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
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
  if (cursor) conditions.push(gt(fdpVesselSwaps.createdAt, new Date(cursor)));
  const results = await db.select().from(fdpVesselSwaps).where(and(...conditions)).orderBy(desc(fdpVesselSwaps.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
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
  if (cursor) conditions.push(gt(fdpDeploymentContracts.createdAt, new Date(cursor)));
  const results = await db.select().from(fdpDeploymentContracts).where(and(...conditions)).orderBy(desc(fdpDeploymentContracts.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
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
  if (cursor) conditions.push(gt(fdpMarketIntelligence.createdAt, new Date(cursor)));
  const results = await db.select().from(fdpMarketIntelligence).where(and(...conditions)).orderBy(desc(fdpMarketIntelligence.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getMarketIntelligence(id: string, tenantId: string) {
  const [record] = await db.select().from(fdpMarketIntelligence).where(and(eq(fdpMarketIntelligence.id, id), eq(fdpMarketIntelligence.tenantId, tenantId), isNull(fdpMarketIntelligence.deletedAt))).limit(1);
  return record ?? null;
}
