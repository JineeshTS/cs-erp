import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  svpServiceSchedules,
  svpPortSequences,
  svpCanalTransits,
  svpEtaManagements,
  svpVoyageOptimizations,
  svpSpeedFuelAnalyses,
  svpWeatherRoutings,
  svpDeploymentPlans,
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
// Multi-Service Schedule Integration & Publication
// ==========================================
export async function listServiceSchedules({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(svpServiceSchedules.tenantId, tenantId), isNull(svpServiceSchedules.deletedAt)];
  if (search) conditions.push(or(ilike(svpServiceSchedules.scheduleRef, `%${search}%`), ilike(svpServiceSchedules.serviceName, `%${search}%`))!);
  if (status) conditions.push(eq(svpServiceSchedules.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(svpServiceSchedules.createdAt, svpServiceSchedules.id, cc)); }
  const results = await db.select().from(svpServiceSchedules).where(and(...conditions)).orderBy(desc(svpServiceSchedules.createdAt), desc(svpServiceSchedules.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getServiceSchedule(id: string, tenantId: string) {
  const [record] = await db.select().from(svpServiceSchedules).where(and(eq(svpServiceSchedules.id, id), eq(svpServiceSchedules.tenantId, tenantId), isNull(svpServiceSchedules.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Port Sequence & Berth Window Optimization
// ==========================================
export async function listPortSequences({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(svpPortSequences.tenantId, tenantId), isNull(svpPortSequences.deletedAt)];
  if (search) conditions.push(or(ilike(svpPortSequences.sequenceRef, `%${search}%`), ilike(svpPortSequences.portName, `%${search}%`))!);
  if (status) conditions.push(eq(svpPortSequences.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(svpPortSequences.createdAt, svpPortSequences.id, cc)); }
  const results = await db.select().from(svpPortSequences).where(and(...conditions)).orderBy(desc(svpPortSequences.createdAt), desc(svpPortSequences.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getPortSequence(id: string, tenantId: string) {
  const [record] = await db.select().from(svpPortSequences).where(and(eq(svpPortSequences.id, id), eq(svpPortSequences.tenantId, tenantId), isNull(svpPortSequences.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Suez Panama Canal Transit Management
// ==========================================
export async function listCanalTransits({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(svpCanalTransits.tenantId, tenantId), isNull(svpCanalTransits.deletedAt)];
  if (search) conditions.push(or(ilike(svpCanalTransits.transitRef, `%${search}%`), ilike(svpCanalTransits.canalName, `%${search}%`))!);
  if (status) conditions.push(eq(svpCanalTransits.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(svpCanalTransits.createdAt, svpCanalTransits.id, cc)); }
  const results = await db.select().from(svpCanalTransits).where(and(...conditions)).orderBy(desc(svpCanalTransits.createdAt), desc(svpCanalTransits.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getCanalTransit(id: string, tenantId: string) {
  const [record] = await db.select().from(svpCanalTransits).where(and(eq(svpCanalTransits.id, id), eq(svpCanalTransits.tenantId, tenantId), isNull(svpCanalTransits.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// ETA ETD Management & Proactive Updates
// ==========================================
export async function listEtaManagements({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(svpEtaManagements.tenantId, tenantId), isNull(svpEtaManagements.deletedAt)];
  if (search) conditions.push(or(ilike(svpEtaManagements.etaRef, `%${search}%`), ilike(svpEtaManagements.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(svpEtaManagements.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(svpEtaManagements.createdAt, svpEtaManagements.id, cc)); }
  const results = await db.select().from(svpEtaManagements).where(and(...conditions)).orderBy(desc(svpEtaManagements.createdAt), desc(svpEtaManagements.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getEtaManagement(id: string, tenantId: string) {
  const [record] = await db.select().from(svpEtaManagements).where(and(eq(svpEtaManagements.id, id), eq(svpEtaManagements.tenantId, tenantId), isNull(svpEtaManagements.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// AI Voyage Optimization Engine
// ==========================================
export async function listVoyageOptimizations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(svpVoyageOptimizations.tenantId, tenantId), isNull(svpVoyageOptimizations.deletedAt)];
  if (search) conditions.push(or(ilike(svpVoyageOptimizations.optimizationRef, `%${search}%`), ilike(svpVoyageOptimizations.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(svpVoyageOptimizations.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(svpVoyageOptimizations.createdAt, svpVoyageOptimizations.id, cc)); }
  const results = await db.select().from(svpVoyageOptimizations).where(and(...conditions)).orderBy(desc(svpVoyageOptimizations.createdAt), desc(svpVoyageOptimizations.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getVoyageOptimization(id: string, tenantId: string) {
  const [record] = await db.select().from(svpVoyageOptimizations).where(and(eq(svpVoyageOptimizations.id, id), eq(svpVoyageOptimizations.tenantId, tenantId), isNull(svpVoyageOptimizations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Speed vs Fuel Trade-Off Analysis
// ==========================================
export async function listSpeedFuelAnalyses({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(svpSpeedFuelAnalyses.tenantId, tenantId), isNull(svpSpeedFuelAnalyses.deletedAt)];
  if (search) conditions.push(or(ilike(svpSpeedFuelAnalyses.analysisRef, `%${search}%`), ilike(svpSpeedFuelAnalyses.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(svpSpeedFuelAnalyses.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(svpSpeedFuelAnalyses.createdAt, svpSpeedFuelAnalyses.id, cc)); }
  const results = await db.select().from(svpSpeedFuelAnalyses).where(and(...conditions)).orderBy(desc(svpSpeedFuelAnalyses.createdAt), desc(svpSpeedFuelAnalyses.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getSpeedFuelAnalysis(id: string, tenantId: string) {
  const [record] = await db.select().from(svpSpeedFuelAnalyses).where(and(eq(svpSpeedFuelAnalyses.id, id), eq(svpSpeedFuelAnalyses.tenantId, tenantId), isNull(svpSpeedFuelAnalyses.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Weather Routing Integration
// ==========================================
export async function listWeatherRoutings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(svpWeatherRoutings.tenantId, tenantId), isNull(svpWeatherRoutings.deletedAt)];
  if (search) conditions.push(or(ilike(svpWeatherRoutings.routingRef, `%${search}%`), ilike(svpWeatherRoutings.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(svpWeatherRoutings.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(svpWeatherRoutings.createdAt, svpWeatherRoutings.id, cc)); }
  const results = await db.select().from(svpWeatherRoutings).where(and(...conditions)).orderBy(desc(svpWeatherRoutings.createdAt), desc(svpWeatherRoutings.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getWeatherRouting(id: string, tenantId: string) {
  const [record] = await db.select().from(svpWeatherRoutings).where(and(eq(svpWeatherRoutings.id, id), eq(svpWeatherRoutings.tenantId, tenantId), isNull(svpWeatherRoutings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Long-Term Vessel Deployment Planning
// ==========================================
export async function listDeploymentPlans({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(svpDeploymentPlans.tenantId, tenantId), isNull(svpDeploymentPlans.deletedAt)];
  if (search) conditions.push(or(ilike(svpDeploymentPlans.planRef, `%${search}%`), ilike(svpDeploymentPlans.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(svpDeploymentPlans.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(svpDeploymentPlans.createdAt, svpDeploymentPlans.id, cc)); }
  const results = await db.select().from(svpDeploymentPlans).where(and(...conditions)).orderBy(desc(svpDeploymentPlans.createdAt), desc(svpDeploymentPlans.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getDeploymentPlan(id: string, tenantId: string) {
  const [record] = await db.select().from(svpDeploymentPlans).where(and(eq(svpDeploymentPlans.id, id), eq(svpDeploymentPlans.tenantId, tenantId), isNull(svpDeploymentPlans.deletedAt))).limit(1);
  return record ?? null;
}
