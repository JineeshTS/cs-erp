import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  ecrInventorySnapshots,
  ecrRepositioningPlans,
  ecrCostTrackings,
  ecrRouteOptimizers,
  ecrDemandForecasts,
  ecrLeasingDecisions,
  ecrReturnIncentives,
  ecrPnlAttributions,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Empty Container Inventory Visibility
// ==========================================
export async function listInventorySnapshots({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ecrInventorySnapshots.tenantId, tenantId), isNull(ecrInventorySnapshots.deletedAt)];
  if (search) conditions.push(or(ilike(ecrInventorySnapshots.snapshotRef, `%${search}%`), ilike(ecrInventorySnapshots.title, `%${search}%`))!);
  if (status) conditions.push(eq(ecrInventorySnapshots.status, status));
  if (cursor) conditions.push(lt(ecrInventorySnapshots.createdAt, new Date(cursor)));
  const results = await db.select().from(ecrInventorySnapshots).where(and(...conditions)).orderBy(desc(ecrInventorySnapshots.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getInventorySnapshot(id: string, tenantId: string) {
  const [record] = await db.select().from(ecrInventorySnapshots).where(and(eq(ecrInventorySnapshots.id, id), eq(ecrInventorySnapshots.tenantId, tenantId), isNull(ecrInventorySnapshots.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Cross-Trade Repositioning Planning
// ==========================================
export async function listRepositioningPlans({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ecrRepositioningPlans.tenantId, tenantId), isNull(ecrRepositioningPlans.deletedAt)];
  if (search) conditions.push(or(ilike(ecrRepositioningPlans.planRef, `%${search}%`), ilike(ecrRepositioningPlans.title, `%${search}%`))!);
  if (status) conditions.push(eq(ecrRepositioningPlans.status, status));
  if (cursor) conditions.push(lt(ecrRepositioningPlans.createdAt, new Date(cursor)));
  const results = await db.select().from(ecrRepositioningPlans).where(and(...conditions)).orderBy(desc(ecrRepositioningPlans.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getRepositioningPlan(id: string, tenantId: string) {
  const [record] = await db.select().from(ecrRepositioningPlans).where(and(eq(ecrRepositioningPlans.id, id), eq(ecrRepositioningPlans.tenantId, tenantId), isNull(ecrRepositioningPlans.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Repositioning Cost Tracking & Approval
// ==========================================
export async function listCostTrackings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ecrCostTrackings.tenantId, tenantId), isNull(ecrCostTrackings.deletedAt)];
  if (search) conditions.push(or(ilike(ecrCostTrackings.costRef, `%${search}%`), ilike(ecrCostTrackings.title, `%${search}%`))!);
  if (status) conditions.push(eq(ecrCostTrackings.status, status));
  if (cursor) conditions.push(lt(ecrCostTrackings.createdAt, new Date(cursor)));
  const results = await db.select().from(ecrCostTrackings).where(and(...conditions)).orderBy(desc(ecrCostTrackings.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCostTracking(id: string, tenantId: string) {
  const [record] = await db.select().from(ecrCostTrackings).where(and(eq(ecrCostTrackings.id, id), eq(ecrCostTrackings.tenantId, tenantId), isNull(ecrCostTrackings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// AI Repositioning Route Optimizer
// ==========================================
export async function listRouteOptimizers({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ecrRouteOptimizers.tenantId, tenantId), isNull(ecrRouteOptimizers.deletedAt)];
  if (search) conditions.push(or(ilike(ecrRouteOptimizers.optimizerRef, `%${search}%`), ilike(ecrRouteOptimizers.title, `%${search}%`))!);
  if (status) conditions.push(eq(ecrRouteOptimizers.status, status));
  if (cursor) conditions.push(lt(ecrRouteOptimizers.createdAt, new Date(cursor)));
  const results = await db.select().from(ecrRouteOptimizers).where(and(...conditions)).orderBy(desc(ecrRouteOptimizers.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getRouteOptimizer(id: string, tenantId: string) {
  const [record] = await db.select().from(ecrRouteOptimizers).where(and(eq(ecrRouteOptimizers.id, id), eq(ecrRouteOptimizers.tenantId, tenantId), isNull(ecrRouteOptimizers.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// AI Demand Forecast by Trade Lane
// ==========================================
export async function listDemandForecasts({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ecrDemandForecasts.tenantId, tenantId), isNull(ecrDemandForecasts.deletedAt)];
  if (search) conditions.push(or(ilike(ecrDemandForecasts.forecastRef, `%${search}%`), ilike(ecrDemandForecasts.title, `%${search}%`))!);
  if (status) conditions.push(eq(ecrDemandForecasts.status, status));
  if (cursor) conditions.push(lt(ecrDemandForecasts.createdAt, new Date(cursor)));
  const results = await db.select().from(ecrDemandForecasts).where(and(...conditions)).orderBy(desc(ecrDemandForecasts.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getDemandForecast(id: string, tenantId: string) {
  const [record] = await db.select().from(ecrDemandForecasts).where(and(eq(ecrDemandForecasts.id, id), eq(ecrDemandForecasts.tenantId, tenantId), isNull(ecrDemandForecasts.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Leasing vs Repositioning Decision Engine
// ==========================================
export async function listLeasingDecisions({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ecrLeasingDecisions.tenantId, tenantId), isNull(ecrLeasingDecisions.deletedAt)];
  if (search) conditions.push(or(ilike(ecrLeasingDecisions.decisionRef, `%${search}%`), ilike(ecrLeasingDecisions.title, `%${search}%`))!);
  if (status) conditions.push(eq(ecrLeasingDecisions.status, status));
  if (cursor) conditions.push(lt(ecrLeasingDecisions.createdAt, new Date(cursor)));
  const results = await db.select().from(ecrLeasingDecisions).where(and(...conditions)).orderBy(desc(ecrLeasingDecisions.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getLeasingDecision(id: string, tenantId: string) {
  const [record] = await db.select().from(ecrLeasingDecisions).where(and(eq(ecrLeasingDecisions.id, id), eq(ecrLeasingDecisions.tenantId, tenantId), isNull(ecrLeasingDecisions.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Empty Return Incentive Management
// ==========================================
export async function listReturnIncentives({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ecrReturnIncentives.tenantId, tenantId), isNull(ecrReturnIncentives.deletedAt)];
  if (search) conditions.push(or(ilike(ecrReturnIncentives.incentiveRef, `%${search}%`), ilike(ecrReturnIncentives.title, `%${search}%`))!);
  if (status) conditions.push(eq(ecrReturnIncentives.status, status));
  if (cursor) conditions.push(lt(ecrReturnIncentives.createdAt, new Date(cursor)));
  const results = await db.select().from(ecrReturnIncentives).where(and(...conditions)).orderBy(desc(ecrReturnIncentives.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getReturnIncentive(id: string, tenantId: string) {
  const [record] = await db.select().from(ecrReturnIncentives).where(and(eq(ecrReturnIncentives.id, id), eq(ecrReturnIncentives.tenantId, tenantId), isNull(ecrReturnIncentives.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Repositioning P&L Attribution
// ==========================================
export async function listPnlAttributions({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ecrPnlAttributions.tenantId, tenantId), isNull(ecrPnlAttributions.deletedAt)];
  if (search) conditions.push(or(ilike(ecrPnlAttributions.attributionRef, `%${search}%`), ilike(ecrPnlAttributions.title, `%${search}%`))!);
  if (status) conditions.push(eq(ecrPnlAttributions.status, status));
  if (cursor) conditions.push(lt(ecrPnlAttributions.createdAt, new Date(cursor)));
  const results = await db.select().from(ecrPnlAttributions).where(and(...conditions)).orderBy(desc(ecrPnlAttributions.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPnlAttribution(id: string, tenantId: string) {
  const [record] = await db.select().from(ecrPnlAttributions).where(and(eq(ecrPnlAttributions.id, id), eq(ecrPnlAttributions.tenantId, tenantId), isNull(ecrPnlAttributions.deletedAt))).limit(1);
  return record ?? null;
}
