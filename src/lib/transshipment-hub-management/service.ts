import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  thmCargoPlans,
  thmFeederCoordinations,
  thmCargoTrackings,
  thmMissedConnections,
  thmRevenueAttributions,
  thmHubEfficiencies,
  thmOptimizationEngines,
  thmPenaltyTrackings,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Transshipment Cargo Planning & Coordination
// ==========================================
export async function listCargoPlans({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(thmCargoPlans.tenantId, tenantId), isNull(thmCargoPlans.deletedAt)];
  if (search) conditions.push(or(ilike(thmCargoPlans.planRef, `%${search}%`), ilike(thmCargoPlans.hubPort, `%${search}%`))!);
  if (status) conditions.push(eq(thmCargoPlans.status, status));
  if (cursor) conditions.push(lt(thmCargoPlans.createdAt, new Date(cursor)));
  const results = await db.select().from(thmCargoPlans).where(and(...conditions)).orderBy(desc(thmCargoPlans.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCargoPlan(id: string, tenantId: string) {
  const [record] = await db.select().from(thmCargoPlans).where(and(eq(thmCargoPlans.id, id), eq(thmCargoPlans.tenantId, tenantId), isNull(thmCargoPlans.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Feeder Vessel & Connecting Service Coordination
// ==========================================
export async function listFeederCoordinations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(thmFeederCoordinations.tenantId, tenantId), isNull(thmFeederCoordinations.deletedAt)];
  if (search) conditions.push(or(ilike(thmFeederCoordinations.coordinationRef, `%${search}%`), ilike(thmFeederCoordinations.feederVessel, `%${search}%`))!);
  if (status) conditions.push(eq(thmFeederCoordinations.status, status));
  if (cursor) conditions.push(lt(thmFeederCoordinations.createdAt, new Date(cursor)));
  const results = await db.select().from(thmFeederCoordinations).where(and(...conditions)).orderBy(desc(thmFeederCoordinations.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getFeederCoordination(id: string, tenantId: string) {
  const [record] = await db.select().from(thmFeederCoordinations).where(and(eq(thmFeederCoordinations.id, id), eq(thmFeederCoordinations.tenantId, tenantId), isNull(thmFeederCoordinations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// T/S Cargo Tracking Through Hub
// ==========================================
export async function listCargoTrackings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(thmCargoTrackings.tenantId, tenantId), isNull(thmCargoTrackings.deletedAt)];
  if (search) conditions.push(or(ilike(thmCargoTrackings.trackingRef, `%${search}%`), ilike(thmCargoTrackings.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(thmCargoTrackings.status, status));
  if (cursor) conditions.push(lt(thmCargoTrackings.createdAt, new Date(cursor)));
  const results = await db.select().from(thmCargoTrackings).where(and(...conditions)).orderBy(desc(thmCargoTrackings.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCargoTracking(id: string, tenantId: string) {
  const [record] = await db.select().from(thmCargoTrackings).where(and(eq(thmCargoTrackings.id, id), eq(thmCargoTrackings.tenantId, tenantId), isNull(thmCargoTrackings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Missed Connection & Recovery Management
// ==========================================
export async function listMissedConnections({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(thmMissedConnections.tenantId, tenantId), isNull(thmMissedConnections.deletedAt)];
  if (search) conditions.push(or(ilike(thmMissedConnections.connectionRef, `%${search}%`), ilike(thmMissedConnections.hubPort, `%${search}%`))!);
  if (status) conditions.push(eq(thmMissedConnections.status, status));
  if (cursor) conditions.push(lt(thmMissedConnections.createdAt, new Date(cursor)));
  const results = await db.select().from(thmMissedConnections).where(and(...conditions)).orderBy(desc(thmMissedConnections.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getMissedConnection(id: string, tenantId: string) {
  const [record] = await db.select().from(thmMissedConnections).where(and(eq(thmMissedConnections.id, id), eq(thmMissedConnections.tenantId, tenantId), isNull(thmMissedConnections.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// T/S Revenue Attribution & Profitability
// ==========================================
export async function listRevenueAttributions({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(thmRevenueAttributions.tenantId, tenantId), isNull(thmRevenueAttributions.deletedAt)];
  if (search) conditions.push(or(ilike(thmRevenueAttributions.attributionRef, `%${search}%`), ilike(thmRevenueAttributions.hubPort, `%${search}%`))!);
  if (status) conditions.push(eq(thmRevenueAttributions.status, status));
  if (cursor) conditions.push(lt(thmRevenueAttributions.createdAt, new Date(cursor)));
  const results = await db.select().from(thmRevenueAttributions).where(and(...conditions)).orderBy(desc(thmRevenueAttributions.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getRevenueAttribution(id: string, tenantId: string) {
  const [record] = await db.select().from(thmRevenueAttributions).where(and(eq(thmRevenueAttributions.id, id), eq(thmRevenueAttributions.tenantId, tenantId), isNull(thmRevenueAttributions.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Hub Efficiency & Productivity Analytics
// ==========================================
export async function listHubEfficiencies({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(thmHubEfficiencies.tenantId, tenantId), isNull(thmHubEfficiencies.deletedAt)];
  if (search) conditions.push(or(ilike(thmHubEfficiencies.efficiencyRef, `%${search}%`), ilike(thmHubEfficiencies.hubPort, `%${search}%`))!);
  if (status) conditions.push(eq(thmHubEfficiencies.status, status));
  if (cursor) conditions.push(lt(thmHubEfficiencies.createdAt, new Date(cursor)));
  const results = await db.select().from(thmHubEfficiencies).where(and(...conditions)).orderBy(desc(thmHubEfficiencies.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getHubEfficiency(id: string, tenantId: string) {
  const [record] = await db.select().from(thmHubEfficiencies).where(and(eq(thmHubEfficiencies.id, id), eq(thmHubEfficiencies.tenantId, tenantId), isNull(thmHubEfficiencies.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// AI Transshipment Optimization Engine
// ==========================================
export async function listOptimizationEngines({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(thmOptimizationEngines.tenantId, tenantId), isNull(thmOptimizationEngines.deletedAt)];
  if (search) conditions.push(or(ilike(thmOptimizationEngines.engineRef, `%${search}%`), ilike(thmOptimizationEngines.scenarioName, `%${search}%`))!);
  if (status) conditions.push(eq(thmOptimizationEngines.status, status));
  if (cursor) conditions.push(lt(thmOptimizationEngines.createdAt, new Date(cursor)));
  const results = await db.select().from(thmOptimizationEngines).where(and(...conditions)).orderBy(desc(thmOptimizationEngines.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getOptimizationEngine(id: string, tenantId: string) {
  const [record] = await db.select().from(thmOptimizationEngines).where(and(eq(thmOptimizationEngines.id, id), eq(thmOptimizationEngines.tenantId, tenantId), isNull(thmOptimizationEngines.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Long Transshipment Penalty Tracking
// ==========================================
export async function listPenaltyTrackings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(thmPenaltyTrackings.tenantId, tenantId), isNull(thmPenaltyTrackings.deletedAt)];
  if (search) conditions.push(or(ilike(thmPenaltyTrackings.penaltyRef, `%${search}%`), ilike(thmPenaltyTrackings.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(thmPenaltyTrackings.status, status));
  if (cursor) conditions.push(lt(thmPenaltyTrackings.createdAt, new Date(cursor)));
  const results = await db.select().from(thmPenaltyTrackings).where(and(...conditions)).orderBy(desc(thmPenaltyTrackings.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPenaltyTracking(id: string, tenantId: string) {
  const [record] = await db.select().from(thmPenaltyTrackings).where(and(eq(thmPenaltyTrackings.id, id), eq(thmPenaltyTrackings.tenantId, tenantId), isNull(thmPenaltyTrackings.deletedAt))).limit(1);
  return record ?? null;
}
