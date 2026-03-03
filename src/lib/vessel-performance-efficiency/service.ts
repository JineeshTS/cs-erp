import { and, eq, ilike, isNull, gt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  vpeSpeedConsumptions,
  vpeCiiRatings,
  vpeEexiCompliances,
  vpeNoonReports,
  vpeVoyagePerformances,
  vpeWeatherRoutings,
  vpeCarbonEmissions,
  vpeFuelBenchmarks,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Speed Consumption & Performance Monitoring
// ==========================================
export async function listSpeedConsumptions({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(vpeSpeedConsumptions.tenantId, tenantId), isNull(vpeSpeedConsumptions.deletedAt)];
  if (search) conditions.push(or(ilike(vpeSpeedConsumptions.consumptionRef, `%${search}%`), ilike(vpeSpeedConsumptions.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(vpeSpeedConsumptions.status, status));
  if (cursor) conditions.push(gt(vpeSpeedConsumptions.createdAt, new Date(cursor)));
  const results = await db.select().from(vpeSpeedConsumptions).where(and(...conditions)).orderBy(desc(vpeSpeedConsumptions.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getSpeedConsumption(id: string, tenantId: string) {
  const [record] = await db.select().from(vpeSpeedConsumptions).where(and(eq(vpeSpeedConsumptions.id, id), eq(vpeSpeedConsumptions.tenantId, tenantId), isNull(vpeSpeedConsumptions.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// CII Carbon Intensity Rating Calculation
// ==========================================
export async function listCiiRatings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(vpeCiiRatings.tenantId, tenantId), isNull(vpeCiiRatings.deletedAt)];
  if (search) conditions.push(or(ilike(vpeCiiRatings.ratingRef, `%${search}%`), ilike(vpeCiiRatings.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(vpeCiiRatings.status, status));
  if (cursor) conditions.push(gt(vpeCiiRatings.createdAt, new Date(cursor)));
  const results = await db.select().from(vpeCiiRatings).where(and(...conditions)).orderBy(desc(vpeCiiRatings.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCiiRating(id: string, tenantId: string) {
  const [record] = await db.select().from(vpeCiiRatings).where(and(eq(vpeCiiRatings.id, id), eq(vpeCiiRatings.tenantId, tenantId), isNull(vpeCiiRatings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// EEXI Energy Efficiency Compliance
// ==========================================
export async function listEexiCompliances({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(vpeEexiCompliances.tenantId, tenantId), isNull(vpeEexiCompliances.deletedAt)];
  if (search) conditions.push(or(ilike(vpeEexiCompliances.complianceRef, `%${search}%`), ilike(vpeEexiCompliances.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(vpeEexiCompliances.status, status));
  if (cursor) conditions.push(gt(vpeEexiCompliances.createdAt, new Date(cursor)));
  const results = await db.select().from(vpeEexiCompliances).where(and(...conditions)).orderBy(desc(vpeEexiCompliances.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getEexiCompliance(id: string, tenantId: string) {
  const [record] = await db.select().from(vpeEexiCompliances).where(and(eq(vpeEexiCompliances.id, id), eq(vpeEexiCompliances.tenantId, tenantId), isNull(vpeEexiCompliances.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Noon Report Processing & Analysis
// ==========================================
export async function listNoonReports({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(vpeNoonReports.tenantId, tenantId), isNull(vpeNoonReports.deletedAt)];
  if (search) conditions.push(or(ilike(vpeNoonReports.reportRef, `%${search}%`), ilike(vpeNoonReports.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(vpeNoonReports.status, status));
  if (cursor) conditions.push(gt(vpeNoonReports.createdAt, new Date(cursor)));
  const results = await db.select().from(vpeNoonReports).where(and(...conditions)).orderBy(desc(vpeNoonReports.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getNoonReport(id: string, tenantId: string) {
  const [record] = await db.select().from(vpeNoonReports).where(and(eq(vpeNoonReports.id, id), eq(vpeNoonReports.tenantId, tenantId), isNull(vpeNoonReports.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Voyage Performance vs Charter Party Analysis
// ==========================================
export async function listVoyagePerformances({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(vpeVoyagePerformances.tenantId, tenantId), isNull(vpeVoyagePerformances.deletedAt)];
  if (search) conditions.push(or(ilike(vpeVoyagePerformances.performanceRef, `%${search}%`), ilike(vpeVoyagePerformances.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(vpeVoyagePerformances.status, status));
  if (cursor) conditions.push(gt(vpeVoyagePerformances.createdAt, new Date(cursor)));
  const results = await db.select().from(vpeVoyagePerformances).where(and(...conditions)).orderBy(desc(vpeVoyagePerformances.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getVoyagePerformance(id: string, tenantId: string) {
  const [record] = await db.select().from(vpeVoyagePerformances).where(and(eq(vpeVoyagePerformances.id, id), eq(vpeVoyagePerformances.tenantId, tenantId), isNull(vpeVoyagePerformances.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// AI Weather Routing Integration
// ==========================================
export async function listWeatherRoutings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(vpeWeatherRoutings.tenantId, tenantId), isNull(vpeWeatherRoutings.deletedAt)];
  if (search) conditions.push(or(ilike(vpeWeatherRoutings.routingRef, `%${search}%`), ilike(vpeWeatherRoutings.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(vpeWeatherRoutings.status, status));
  if (cursor) conditions.push(gt(vpeWeatherRoutings.createdAt, new Date(cursor)));
  const results = await db.select().from(vpeWeatherRoutings).where(and(...conditions)).orderBy(desc(vpeWeatherRoutings.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getWeatherRouting(id: string, tenantId: string) {
  const [record] = await db.select().from(vpeWeatherRoutings).where(and(eq(vpeWeatherRoutings.id, id), eq(vpeWeatherRoutings.tenantId, tenantId), isNull(vpeWeatherRoutings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// IMO 2050 Carbon Emissions Tracking
// ==========================================
export async function listCarbonEmissions({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(vpeCarbonEmissions.tenantId, tenantId), isNull(vpeCarbonEmissions.deletedAt)];
  if (search) conditions.push(or(ilike(vpeCarbonEmissions.emissionRef, `%${search}%`), ilike(vpeCarbonEmissions.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(vpeCarbonEmissions.status, status));
  if (cursor) conditions.push(gt(vpeCarbonEmissions.createdAt, new Date(cursor)));
  const results = await db.select().from(vpeCarbonEmissions).where(and(...conditions)).orderBy(desc(vpeCarbonEmissions.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCarbonEmission(id: string, tenantId: string) {
  const [record] = await db.select().from(vpeCarbonEmissions).where(and(eq(vpeCarbonEmissions.id, id), eq(vpeCarbonEmissions.tenantId, tenantId), isNull(vpeCarbonEmissions.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Fuel Efficiency Benchmarking & Reporting
// ==========================================
export async function listFuelBenchmarks({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(vpeFuelBenchmarks.tenantId, tenantId), isNull(vpeFuelBenchmarks.deletedAt)];
  if (search) conditions.push(or(ilike(vpeFuelBenchmarks.benchmarkRef, `%${search}%`), ilike(vpeFuelBenchmarks.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(vpeFuelBenchmarks.status, status));
  if (cursor) conditions.push(gt(vpeFuelBenchmarks.createdAt, new Date(cursor)));
  const results = await db.select().from(vpeFuelBenchmarks).where(and(...conditions)).orderBy(desc(vpeFuelBenchmarks.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getFuelBenchmark(id: string, tenantId: string) {
  const [record] = await db.select().from(vpeFuelBenchmarks).where(and(eq(vpeFuelBenchmarks.id, id), eq(vpeFuelBenchmarks.tenantId, tenantId), isNull(vpeFuelBenchmarks.deletedAt))).limit(1);
  return record ?? null;
}
