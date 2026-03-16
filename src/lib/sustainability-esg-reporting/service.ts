import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  serCarbonFootprints,
  serGhgReports,
  serSeaCargoCharters,
  serPoseidonAlignments,
  serDecarbRoadmaps,
  serAltFuelTrackings,
  serEsgKpis,
  serTcfdReports,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Carbon Footprint Calculation per Voyage
// ==========================================
export async function listCarbonFootprints({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(serCarbonFootprints.tenantId, tenantId), isNull(serCarbonFootprints.deletedAt)];
  if (search) conditions.push(or(ilike(serCarbonFootprints.footprintRef, `%${search}%`), ilike(serCarbonFootprints.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(serCarbonFootprints.status, status));
  if (cursor) conditions.push(lt(serCarbonFootprints.createdAt, new Date(cursor)));
  const results = await db.select().from(serCarbonFootprints).where(and(...conditions)).orderBy(desc(serCarbonFootprints.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCarbonFootprint(id: string, tenantId: string) {
  const [record] = await db.select().from(serCarbonFootprints).where(and(eq(serCarbonFootprints.id, id), eq(serCarbonFootprints.tenantId, tenantId), isNull(serCarbonFootprints.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// GHG Protocol Scope 1 2 3 Reporting
// ==========================================
export async function listGhgReports({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(serGhgReports.tenantId, tenantId), isNull(serGhgReports.deletedAt)];
  if (search) conditions.push(or(ilike(serGhgReports.reportRef, `%${search}%`), ilike(serGhgReports.verificationBody, `%${search}%`))!);
  if (status) conditions.push(eq(serGhgReports.status, status));
  if (cursor) conditions.push(lt(serGhgReports.createdAt, new Date(cursor)));
  const results = await db.select().from(serGhgReports).where(and(...conditions)).orderBy(desc(serGhgReports.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getGhgReport(id: string, tenantId: string) {
  const [record] = await db.select().from(serGhgReports).where(and(eq(serGhgReports.id, id), eq(serGhgReports.tenantId, tenantId), isNull(serGhgReports.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Sea Cargo Charter Annual Reporting
// ==========================================
export async function listSeaCargoCharters({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(serSeaCargoCharters.tenantId, tenantId), isNull(serSeaCargoCharters.deletedAt)];
  if (search) conditions.push(or(ilike(serSeaCargoCharters.charterRef, `%${search}%`), ilike(serSeaCargoCharters.climateTarget, `%${search}%`))!);
  if (status) conditions.push(eq(serSeaCargoCharters.status, status));
  if (cursor) conditions.push(lt(serSeaCargoCharters.createdAt, new Date(cursor)));
  const results = await db.select().from(serSeaCargoCharters).where(and(...conditions)).orderBy(desc(serSeaCargoCharters.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getSeaCargoCharter(id: string, tenantId: string) {
  const [record] = await db.select().from(serSeaCargoCharters).where(and(eq(serSeaCargoCharters.id, id), eq(serSeaCargoCharters.tenantId, tenantId), isNull(serSeaCargoCharters.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// POSEIDON Principles Alignment
// ==========================================
export async function listPoseidonAlignments({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(serPoseidonAlignments.tenantId, tenantId), isNull(serPoseidonAlignments.deletedAt)];
  if (search) conditions.push(or(ilike(serPoseidonAlignments.alignmentRef, `%${search}%`), ilike(serPoseidonAlignments.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(serPoseidonAlignments.status, status));
  if (cursor) conditions.push(lt(serPoseidonAlignments.createdAt, new Date(cursor)));
  const results = await db.select().from(serPoseidonAlignments).where(and(...conditions)).orderBy(desc(serPoseidonAlignments.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPoseidonAlignment(id: string, tenantId: string) {
  const [record] = await db.select().from(serPoseidonAlignments).where(and(eq(serPoseidonAlignments.id, id), eq(serPoseidonAlignments.tenantId, tenantId), isNull(serPoseidonAlignments.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Decarbonization Roadmap Tracking
// ==========================================
export async function listDecarbRoadmaps({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(serDecarbRoadmaps.tenantId, tenantId), isNull(serDecarbRoadmaps.deletedAt)];
  if (search) conditions.push(or(ilike(serDecarbRoadmaps.roadmapRef, `%${search}%`), ilike(serDecarbRoadmaps.milestoneName, `%${search}%`))!);
  if (status) conditions.push(eq(serDecarbRoadmaps.status, status));
  if (cursor) conditions.push(lt(serDecarbRoadmaps.createdAt, new Date(cursor)));
  const results = await db.select().from(serDecarbRoadmaps).where(and(...conditions)).orderBy(desc(serDecarbRoadmaps.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getDecarbRoadmap(id: string, tenantId: string) {
  const [record] = await db.select().from(serDecarbRoadmaps).where(and(eq(serDecarbRoadmaps.id, id), eq(serDecarbRoadmaps.tenantId, tenantId), isNull(serDecarbRoadmaps.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Alternative Fuel & Green Fuel Tracking
// ==========================================
export async function listAltFuelTrackings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(serAltFuelTrackings.tenantId, tenantId), isNull(serAltFuelTrackings.deletedAt)];
  if (search) conditions.push(or(ilike(serAltFuelTrackings.trackingRef, `%${search}%`), ilike(serAltFuelTrackings.fuelName, `%${search}%`))!);
  if (status) conditions.push(eq(serAltFuelTrackings.status, status));
  if (cursor) conditions.push(lt(serAltFuelTrackings.createdAt, new Date(cursor)));
  const results = await db.select().from(serAltFuelTrackings).where(and(...conditions)).orderBy(desc(serAltFuelTrackings.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getAltFuelTracking(id: string, tenantId: string) {
  const [record] = await db.select().from(serAltFuelTrackings).where(and(eq(serAltFuelTrackings.id, id), eq(serAltFuelTrackings.tenantId, tenantId), isNull(serAltFuelTrackings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// ESG KPI Dashboard & Benchmarking
// ==========================================
export async function listEsgKpis({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(serEsgKpis.tenantId, tenantId), isNull(serEsgKpis.deletedAt)];
  if (search) conditions.push(or(ilike(serEsgKpis.kpiRef, `%${search}%`), ilike(serEsgKpis.kpiName, `%${search}%`))!);
  if (status) conditions.push(eq(serEsgKpis.status, status));
  if (cursor) conditions.push(lt(serEsgKpis.createdAt, new Date(cursor)));
  const results = await db.select().from(serEsgKpis).where(and(...conditions)).orderBy(desc(serEsgKpis.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getEsgKpi(id: string, tenantId: string) {
  const [record] = await db.select().from(serEsgKpis).where(and(eq(serEsgKpis.id, id), eq(serEsgKpis.tenantId, tenantId), isNull(serEsgKpis.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// TCFD Sustainability Reporting
// ==========================================
export async function listTcfdReports({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(serTcfdReports.tenantId, tenantId), isNull(serTcfdReports.deletedAt)];
  if (search) conditions.push(or(ilike(serTcfdReports.tcfdRef, `%${search}%`), ilike(serTcfdReports.disclosureTitle, `%${search}%`))!);
  if (status) conditions.push(eq(serTcfdReports.status, status));
  if (cursor) conditions.push(lt(serTcfdReports.createdAt, new Date(cursor)));
  const results = await db.select().from(serTcfdReports).where(and(...conditions)).orderBy(desc(serTcfdReports.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getTcfdReport(id: string, tenantId: string) {
  const [record] = await db.select().from(serTcfdReports).where(and(eq(serTcfdReports.id, id), eq(serTcfdReports.tenantId, tenantId), isNull(serTcfdReports.deletedAt))).limit(1);
  return record ?? null;
}
