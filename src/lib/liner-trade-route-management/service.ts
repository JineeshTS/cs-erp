import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  ltrServiceLoops,
  ltrPortPairTradeLanes,
  ltrTradeLanePnl,
  ltrSlotAgreements,
  ltrAllianceAgreements,
  ltrPortStayAnalyses,
  ltrRouteOptimizations,
  ltrMarketIntelligence,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Service Loops
// ==========================================

export async function listServiceLoops({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ltrServiceLoops.tenantId, tenantId), isNull(ltrServiceLoops.deletedAt)];
  if (search) conditions.push(or(ilike(ltrServiceLoops.loopRef, `%${search}%`), ilike(ltrServiceLoops.loopName, `%${search}%`))!);
  if (status) conditions.push(eq(ltrServiceLoops.status, status));
  if (cursor) conditions.push(lt(ltrServiceLoops.createdAt, new Date(cursor)));
  const results = await db.select().from(ltrServiceLoops).where(and(...conditions)).orderBy(desc(ltrServiceLoops.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getServiceLoop(id: string, tenantId: string) {
  const [record] = await db.select().from(ltrServiceLoops).where(and(eq(ltrServiceLoops.id, id), eq(ltrServiceLoops.tenantId, tenantId), isNull(ltrServiceLoops.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Port Pair Trade Lanes
// ==========================================

export async function listPortPairTradeLanes({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ltrPortPairTradeLanes.tenantId, tenantId), isNull(ltrPortPairTradeLanes.deletedAt)];
  if (search) conditions.push(or(ilike(ltrPortPairTradeLanes.tradeLaneRef, `%${search}%`), ilike(ltrPortPairTradeLanes.originPort, `%${search}%`))!);
  if (status) conditions.push(eq(ltrPortPairTradeLanes.status, status));
  if (cursor) conditions.push(lt(ltrPortPairTradeLanes.createdAt, new Date(cursor)));
  const results = await db.select().from(ltrPortPairTradeLanes).where(and(...conditions)).orderBy(desc(ltrPortPairTradeLanes.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPortPairTradeLane(id: string, tenantId: string) {
  const [record] = await db.select().from(ltrPortPairTradeLanes).where(and(eq(ltrPortPairTradeLanes.id, id), eq(ltrPortPairTradeLanes.tenantId, tenantId), isNull(ltrPortPairTradeLanes.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Trade Lane P&L
// ==========================================

export async function listTradeLanePnl({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ltrTradeLanePnl.tenantId, tenantId), isNull(ltrTradeLanePnl.deletedAt)];
  if (search) conditions.push(or(ilike(ltrTradeLanePnl.pnlRef, `%${search}%`), ilike(ltrTradeLanePnl.tradeLaneName, `%${search}%`))!);
  if (status) conditions.push(eq(ltrTradeLanePnl.status, status));
  if (cursor) conditions.push(lt(ltrTradeLanePnl.createdAt, new Date(cursor)));
  const results = await db.select().from(ltrTradeLanePnl).where(and(...conditions)).orderBy(desc(ltrTradeLanePnl.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getTradeLanePnl(id: string, tenantId: string) {
  const [record] = await db.select().from(ltrTradeLanePnl).where(and(eq(ltrTradeLanePnl.id, id), eq(ltrTradeLanePnl.tenantId, tenantId), isNull(ltrTradeLanePnl.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Slot Agreements
// ==========================================

export async function listSlotAgreements({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ltrSlotAgreements.tenantId, tenantId), isNull(ltrSlotAgreements.deletedAt)];
  if (search) conditions.push(or(ilike(ltrSlotAgreements.agreementRef, `%${search}%`), ilike(ltrSlotAgreements.partnerName, `%${search}%`))!);
  if (status) conditions.push(eq(ltrSlotAgreements.status, status));
  if (cursor) conditions.push(lt(ltrSlotAgreements.createdAt, new Date(cursor)));
  const results = await db.select().from(ltrSlotAgreements).where(and(...conditions)).orderBy(desc(ltrSlotAgreements.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getSlotAgreement(id: string, tenantId: string) {
  const [record] = await db.select().from(ltrSlotAgreements).where(and(eq(ltrSlotAgreements.id, id), eq(ltrSlotAgreements.tenantId, tenantId), isNull(ltrSlotAgreements.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Alliance Agreements
// ==========================================

export async function listAllianceAgreements({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ltrAllianceAgreements.tenantId, tenantId), isNull(ltrAllianceAgreements.deletedAt)];
  if (search) conditions.push(or(ilike(ltrAllianceAgreements.allianceRef, `%${search}%`), ilike(ltrAllianceAgreements.allianceName, `%${search}%`))!);
  if (status) conditions.push(eq(ltrAllianceAgreements.status, status));
  if (cursor) conditions.push(lt(ltrAllianceAgreements.createdAt, new Date(cursor)));
  const results = await db.select().from(ltrAllianceAgreements).where(and(...conditions)).orderBy(desc(ltrAllianceAgreements.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getAllianceAgreement(id: string, tenantId: string) {
  const [record] = await db.select().from(ltrAllianceAgreements).where(and(eq(ltrAllianceAgreements.id, id), eq(ltrAllianceAgreements.tenantId, tenantId), isNull(ltrAllianceAgreements.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Port Stay Analyses
// ==========================================

export async function listPortStayAnalyses({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ltrPortStayAnalyses.tenantId, tenantId), isNull(ltrPortStayAnalyses.deletedAt)];
  if (search) conditions.push(or(ilike(ltrPortStayAnalyses.analysisRef, `%${search}%`), ilike(ltrPortStayAnalyses.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(ltrPortStayAnalyses.status, status));
  if (cursor) conditions.push(lt(ltrPortStayAnalyses.createdAt, new Date(cursor)));
  const results = await db.select().from(ltrPortStayAnalyses).where(and(...conditions)).orderBy(desc(ltrPortStayAnalyses.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPortStayAnalysis(id: string, tenantId: string) {
  const [record] = await db.select().from(ltrPortStayAnalyses).where(and(eq(ltrPortStayAnalyses.id, id), eq(ltrPortStayAnalyses.tenantId, tenantId), isNull(ltrPortStayAnalyses.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Route Optimizations
// ==========================================

export async function listRouteOptimizations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ltrRouteOptimizations.tenantId, tenantId), isNull(ltrRouteOptimizations.deletedAt)];
  if (search) conditions.push(or(ilike(ltrRouteOptimizations.optimizationRef, `%${search}%`), ilike(ltrRouteOptimizations.tradeRoute, `%${search}%`))!);
  if (status) conditions.push(eq(ltrRouteOptimizations.status, status));
  if (cursor) conditions.push(lt(ltrRouteOptimizations.createdAt, new Date(cursor)));
  const results = await db.select().from(ltrRouteOptimizations).where(and(...conditions)).orderBy(desc(ltrRouteOptimizations.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getRouteOptimization(id: string, tenantId: string) {
  const [record] = await db.select().from(ltrRouteOptimizations).where(and(eq(ltrRouteOptimizations.id, id), eq(ltrRouteOptimizations.tenantId, tenantId), isNull(ltrRouteOptimizations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Market Intelligence
// ==========================================

export async function listMarketIntelligence({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ltrMarketIntelligence.tenantId, tenantId), isNull(ltrMarketIntelligence.deletedAt)];
  if (search) conditions.push(or(ilike(ltrMarketIntelligence.intelligenceRef, `%${search}%`), ilike(ltrMarketIntelligence.tradeRoute, `%${search}%`))!);
  if (status) conditions.push(eq(ltrMarketIntelligence.status, status));
  if (cursor) conditions.push(lt(ltrMarketIntelligence.createdAt, new Date(cursor)));
  const results = await db.select().from(ltrMarketIntelligence).where(and(...conditions)).orderBy(desc(ltrMarketIntelligence.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getMarketIntelligence(id: string, tenantId: string) {
  const [record] = await db.select().from(ltrMarketIntelligence).where(and(eq(ltrMarketIntelligence.id, id), eq(ltrMarketIntelligence.tenantId, tenantId), isNull(ltrMarketIntelligence.deletedAt))).limit(1);
  return record ?? null;
}
