import { and, eq, ilike, isNull, gt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  mecAnnexCompliances,
  mecBallastWaters,
  mecAntiFoulings,
  mecWasteManagements,
  mecSulphurCaps,
  mecCiiRatings,
  mecCargoCharters,
  mecEnvironmentalIncidents,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// MARPOL Annex I to VI Compliance Tracking
// ==========================================
export async function listAnnexCompliances({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(mecAnnexCompliances.tenantId, tenantId), isNull(mecAnnexCompliances.deletedAt)];
  if (search) conditions.push(or(ilike(mecAnnexCompliances.complianceRef, `%${search}%`), ilike(mecAnnexCompliances.title, `%${search}%`))!);
  if (status) conditions.push(eq(mecAnnexCompliances.status, status));
  if (cursor) conditions.push(gt(mecAnnexCompliances.createdAt, new Date(cursor)));
  const results = await db.select().from(mecAnnexCompliances).where(and(...conditions)).orderBy(desc(mecAnnexCompliances.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getAnnexCompliance(id: string, tenantId: string) {
  const [record] = await db.select().from(mecAnnexCompliances).where(and(eq(mecAnnexCompliances.id, id), eq(mecAnnexCompliances.tenantId, tenantId), isNull(mecAnnexCompliances.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Ballast Water Management BWM Convention
// ==========================================
export async function listBallastWaters({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(mecBallastWaters.tenantId, tenantId), isNull(mecBallastWaters.deletedAt)];
  if (search) conditions.push(or(ilike(mecBallastWaters.ballastRef, `%${search}%`), ilike(mecBallastWaters.title, `%${search}%`))!);
  if (status) conditions.push(eq(mecBallastWaters.status, status));
  if (cursor) conditions.push(gt(mecBallastWaters.createdAt, new Date(cursor)));
  const results = await db.select().from(mecBallastWaters).where(and(...conditions)).orderBy(desc(mecBallastWaters.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getBallastWater(id: string, tenantId: string) {
  const [record] = await db.select().from(mecBallastWaters).where(and(eq(mecBallastWaters.id, id), eq(mecBallastWaters.tenantId, tenantId), isNull(mecBallastWaters.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Anti-Fouling System AFS Compliance
// ==========================================
export async function listAntiFoulings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(mecAntiFoulings.tenantId, tenantId), isNull(mecAntiFoulings.deletedAt)];
  if (search) conditions.push(or(ilike(mecAntiFoulings.afsRef, `%${search}%`), ilike(mecAntiFoulings.title, `%${search}%`))!);
  if (status) conditions.push(eq(mecAntiFoulings.status, status));
  if (cursor) conditions.push(gt(mecAntiFoulings.createdAt, new Date(cursor)));
  const results = await db.select().from(mecAntiFoulings).where(and(...conditions)).orderBy(desc(mecAntiFoulings.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getAntiFouling(id: string, tenantId: string) {
  const [record] = await db.select().from(mecAntiFoulings).where(and(eq(mecAntiFoulings.id, id), eq(mecAntiFoulings.tenantId, tenantId), isNull(mecAntiFoulings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Vessel Waste Management MARPOL Annex V
// ==========================================
export async function listWasteManagements({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(mecWasteManagements.tenantId, tenantId), isNull(mecWasteManagements.deletedAt)];
  if (search) conditions.push(or(ilike(mecWasteManagements.wasteRef, `%${search}%`), ilike(mecWasteManagements.title, `%${search}%`))!);
  if (status) conditions.push(eq(mecWasteManagements.status, status));
  if (cursor) conditions.push(gt(mecWasteManagements.createdAt, new Date(cursor)));
  const results = await db.select().from(mecWasteManagements).where(and(...conditions)).orderBy(desc(mecWasteManagements.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getWasteManagement(id: string, tenantId: string) {
  const [record] = await db.select().from(mecWasteManagements).where(and(eq(mecWasteManagements.id, id), eq(mecWasteManagements.tenantId, tenantId), isNull(mecWasteManagements.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// 0.5% Sulphur Fuel Cap Compliance
// ==========================================
export async function listSulphurCaps({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(mecSulphurCaps.tenantId, tenantId), isNull(mecSulphurCaps.deletedAt)];
  if (search) conditions.push(or(ilike(mecSulphurCaps.sulphurRef, `%${search}%`), ilike(mecSulphurCaps.title, `%${search}%`))!);
  if (status) conditions.push(eq(mecSulphurCaps.status, status));
  if (cursor) conditions.push(gt(mecSulphurCaps.createdAt, new Date(cursor)));
  const results = await db.select().from(mecSulphurCaps).where(and(...conditions)).orderBy(desc(mecSulphurCaps.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getSulphurCap(id: string, tenantId: string) {
  const [record] = await db.select().from(mecSulphurCaps).where(and(eq(mecSulphurCaps.id, id), eq(mecSulphurCaps.tenantId, tenantId), isNull(mecSulphurCaps.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// CII Rating Tracking & Improvement Planning
// ==========================================
export async function listCiiRatings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(mecCiiRatings.tenantId, tenantId), isNull(mecCiiRatings.deletedAt)];
  if (search) conditions.push(or(ilike(mecCiiRatings.ciiRef, `%${search}%`), ilike(mecCiiRatings.title, `%${search}%`))!);
  if (status) conditions.push(eq(mecCiiRatings.status, status));
  if (cursor) conditions.push(gt(mecCiiRatings.createdAt, new Date(cursor)));
  const results = await db.select().from(mecCiiRatings).where(and(...conditions)).orderBy(desc(mecCiiRatings.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCiiRating(id: string, tenantId: string) {
  const [record] = await db.select().from(mecCiiRatings).where(and(eq(mecCiiRatings.id, id), eq(mecCiiRatings.tenantId, tenantId), isNull(mecCiiRatings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Sea Cargo Charter Annual Disclosure
// ==========================================
export async function listCargoCharters({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(mecCargoCharters.tenantId, tenantId), isNull(mecCargoCharters.deletedAt)];
  if (search) conditions.push(or(ilike(mecCargoCharters.charterRef, `%${search}%`), ilike(mecCargoCharters.title, `%${search}%`))!);
  if (status) conditions.push(eq(mecCargoCharters.status, status));
  if (cursor) conditions.push(gt(mecCargoCharters.createdAt, new Date(cursor)));
  const results = await db.select().from(mecCargoCharters).where(and(...conditions)).orderBy(desc(mecCargoCharters.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCargoCharter(id: string, tenantId: string) {
  const [record] = await db.select().from(mecCargoCharters).where(and(eq(mecCargoCharters.id, id), eq(mecCargoCharters.tenantId, tenantId), isNull(mecCargoCharters.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Environmental Incident Reporting & Investigation
// ==========================================
export async function listEnvironmentalIncidents({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(mecEnvironmentalIncidents.tenantId, tenantId), isNull(mecEnvironmentalIncidents.deletedAt)];
  if (search) conditions.push(or(ilike(mecEnvironmentalIncidents.incidentRef, `%${search}%`), ilike(mecEnvironmentalIncidents.title, `%${search}%`))!);
  if (status) conditions.push(eq(mecEnvironmentalIncidents.status, status));
  if (cursor) conditions.push(gt(mecEnvironmentalIncidents.createdAt, new Date(cursor)));
  const results = await db.select().from(mecEnvironmentalIncidents).where(and(...conditions)).orderBy(desc(mecEnvironmentalIncidents.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getEnvironmentalIncident(id: string, tenantId: string) {
  const [record] = await db.select().from(mecEnvironmentalIncidents).where(and(eq(mecEnvironmentalIncidents.id, id), eq(mecEnvironmentalIncidents.tenantId, tenantId), isNull(mecEnvironmentalIncidents.deletedAt))).limit(1);
  return record ?? null;
}
