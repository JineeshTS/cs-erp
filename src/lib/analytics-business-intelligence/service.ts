import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  abiExecutiveKpiDashboards,
  abiVoyageAnalytics,
  abiTradeLaneAnalytics,
  abiCustomerRevenueAnalytics,
  abiPredictiveForecasts,
  abiMarketIntelligenceReports,
  abiOperationalEfficiencies,
  abiBiReports,
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
// Executive KPI Dashboards
// ==========================================
export async function listExecutiveKpiDashboards({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(abiExecutiveKpiDashboards.tenantId, tenantId), isNull(abiExecutiveKpiDashboards.deletedAt)];
  if (search) conditions.push(or(ilike(abiExecutiveKpiDashboards.dashboardRef, `%${search}%`), ilike(abiExecutiveKpiDashboards.dashboardType, `%${search}%`))!);
  if (status) conditions.push(eq(abiExecutiveKpiDashboards.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(abiExecutiveKpiDashboards.createdAt, abiExecutiveKpiDashboards.id, cc)); }
  const results = await db.select().from(abiExecutiveKpiDashboards).where(and(...conditions)).orderBy(desc(abiExecutiveKpiDashboards.createdAt), desc(abiExecutiveKpiDashboards.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getExecutiveKpiDashboard(id: string, tenantId: string) {
  const [record] = await db.select().from(abiExecutiveKpiDashboards).where(and(eq(abiExecutiveKpiDashboards.id, id), eq(abiExecutiveKpiDashboards.tenantId, tenantId), isNull(abiExecutiveKpiDashboards.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Voyage Analytics
// ==========================================
export async function listVoyageAnalytics({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(abiVoyageAnalytics.tenantId, tenantId), isNull(abiVoyageAnalytics.deletedAt)];
  if (search) conditions.push(or(ilike(abiVoyageAnalytics.analyticsRef, `%${search}%`), ilike(abiVoyageAnalytics.vesselName, `%${search}%`), ilike(abiVoyageAnalytics.serviceName, `%${search}%`))!);
  if (status) conditions.push(eq(abiVoyageAnalytics.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(abiVoyageAnalytics.createdAt, abiVoyageAnalytics.id, cc)); }
  const results = await db.select().from(abiVoyageAnalytics).where(and(...conditions)).orderBy(desc(abiVoyageAnalytics.createdAt), desc(abiVoyageAnalytics.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getVoyageAnalytic(id: string, tenantId: string) {
  const [record] = await db.select().from(abiVoyageAnalytics).where(and(eq(abiVoyageAnalytics.id, id), eq(abiVoyageAnalytics.tenantId, tenantId), isNull(abiVoyageAnalytics.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Trade Lane Analytics
// ==========================================
export async function listTradeLaneAnalytics({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(abiTradeLaneAnalytics.tenantId, tenantId), isNull(abiTradeLaneAnalytics.deletedAt)];
  if (search) conditions.push(or(ilike(abiTradeLaneAnalytics.analyticsRef, `%${search}%`), ilike(abiTradeLaneAnalytics.tradeLaneName, `%${search}%`))!);
  if (status) conditions.push(eq(abiTradeLaneAnalytics.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(abiTradeLaneAnalytics.createdAt, abiTradeLaneAnalytics.id, cc)); }
  const results = await db.select().from(abiTradeLaneAnalytics).where(and(...conditions)).orderBy(desc(abiTradeLaneAnalytics.createdAt), desc(abiTradeLaneAnalytics.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getTradeLaneAnalytic(id: string, tenantId: string) {
  const [record] = await db.select().from(abiTradeLaneAnalytics).where(and(eq(abiTradeLaneAnalytics.id, id), eq(abiTradeLaneAnalytics.tenantId, tenantId), isNull(abiTradeLaneAnalytics.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Customer Revenue Analytics
// ==========================================
export async function listCustomerRevenueAnalytics({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(abiCustomerRevenueAnalytics.tenantId, tenantId), isNull(abiCustomerRevenueAnalytics.deletedAt)];
  if (search) conditions.push(or(ilike(abiCustomerRevenueAnalytics.analyticsRef, `%${search}%`), ilike(abiCustomerRevenueAnalytics.customerName, `%${search}%`), ilike(abiCustomerRevenueAnalytics.customerCode, `%${search}%`))!);
  if (status) conditions.push(eq(abiCustomerRevenueAnalytics.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(abiCustomerRevenueAnalytics.createdAt, abiCustomerRevenueAnalytics.id, cc)); }
  const results = await db.select().from(abiCustomerRevenueAnalytics).where(and(...conditions)).orderBy(desc(abiCustomerRevenueAnalytics.createdAt), desc(abiCustomerRevenueAnalytics.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getCustomerRevenueAnalytic(id: string, tenantId: string) {
  const [record] = await db.select().from(abiCustomerRevenueAnalytics).where(and(eq(abiCustomerRevenueAnalytics.id, id), eq(abiCustomerRevenueAnalytics.tenantId, tenantId), isNull(abiCustomerRevenueAnalytics.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Predictive Forecasts
// ==========================================
export async function listPredictiveForecasts({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(abiPredictiveForecasts.tenantId, tenantId), isNull(abiPredictiveForecasts.deletedAt)];
  if (search) conditions.push(or(ilike(abiPredictiveForecasts.forecastRef, `%${search}%`), ilike(abiPredictiveForecasts.targetMetric, `%${search}%`), ilike(abiPredictiveForecasts.modelName, `%${search}%`))!);
  if (status) conditions.push(eq(abiPredictiveForecasts.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(abiPredictiveForecasts.createdAt, abiPredictiveForecasts.id, cc)); }
  const results = await db.select().from(abiPredictiveForecasts).where(and(...conditions)).orderBy(desc(abiPredictiveForecasts.createdAt), desc(abiPredictiveForecasts.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getPredictiveForecast(id: string, tenantId: string) {
  const [record] = await db.select().from(abiPredictiveForecasts).where(and(eq(abiPredictiveForecasts.id, id), eq(abiPredictiveForecasts.tenantId, tenantId), isNull(abiPredictiveForecasts.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Market Intelligence Reports
// ==========================================
export async function listMarketIntelligenceReports({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(abiMarketIntelligenceReports.tenantId, tenantId), isNull(abiMarketIntelligenceReports.deletedAt)];
  if (search) conditions.push(or(ilike(abiMarketIntelligenceReports.reportRef, `%${search}%`), ilike(abiMarketIntelligenceReports.title, `%${search}%`), ilike(abiMarketIntelligenceReports.region, `%${search}%`))!);
  if (status) conditions.push(eq(abiMarketIntelligenceReports.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(abiMarketIntelligenceReports.createdAt, abiMarketIntelligenceReports.id, cc)); }
  const results = await db.select().from(abiMarketIntelligenceReports).where(and(...conditions)).orderBy(desc(abiMarketIntelligenceReports.createdAt), desc(abiMarketIntelligenceReports.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getMarketIntelligenceReport(id: string, tenantId: string) {
  const [record] = await db.select().from(abiMarketIntelligenceReports).where(and(eq(abiMarketIntelligenceReports.id, id), eq(abiMarketIntelligenceReports.tenantId, tenantId), isNull(abiMarketIntelligenceReports.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Operational Efficiencies
// ==========================================
export async function listOperationalEfficiencies({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(abiOperationalEfficiencies.tenantId, tenantId), isNull(abiOperationalEfficiencies.deletedAt)];
  if (search) conditions.push(or(ilike(abiOperationalEfficiencies.analyticsRef, `%${search}%`), ilike(abiOperationalEfficiencies.entityName, `%${search}%`))!);
  if (status) conditions.push(eq(abiOperationalEfficiencies.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(abiOperationalEfficiencies.createdAt, abiOperationalEfficiencies.id, cc)); }
  const results = await db.select().from(abiOperationalEfficiencies).where(and(...conditions)).orderBy(desc(abiOperationalEfficiencies.createdAt), desc(abiOperationalEfficiencies.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getOperationalEfficiency(id: string, tenantId: string) {
  const [record] = await db.select().from(abiOperationalEfficiencies).where(and(eq(abiOperationalEfficiencies.id, id), eq(abiOperationalEfficiencies.tenantId, tenantId), isNull(abiOperationalEfficiencies.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// BI Reports
// ==========================================
export async function listBiReports({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(abiBiReports.tenantId, tenantId), isNull(abiBiReports.deletedAt)];
  if (search) conditions.push(or(ilike(abiBiReports.reportRef, `%${search}%`), ilike(abiBiReports.title, `%${search}%`), ilike(abiBiReports.category, `%${search}%`))!);
  if (status) conditions.push(eq(abiBiReports.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(abiBiReports.createdAt, abiBiReports.id, cc)); }
  const results = await db.select().from(abiBiReports).where(and(...conditions)).orderBy(desc(abiBiReports.createdAt), desc(abiBiReports.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getBiReport(id: string, tenantId: string) {
  const [record] = await db.select().from(abiBiReports).where(and(eq(abiBiReports.id, id), eq(abiBiReports.tenantId, tenantId), isNull(abiBiReports.deletedAt))).limit(1);
  return record ?? null;
}
