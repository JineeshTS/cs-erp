import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  dgmImdgCompliance,
  dgmBookingScreenings,
  dgmSegregationRules,
  dgmPlacardRequirements,
  dgmManifests,
  dgmEmergencyProcedures,
  dgmChemicalSafetyData,
  dgmIncidentReports,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// IMDG Compliance
// ==========================================

export async function listImdgCompliance({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(dgmImdgCompliance.tenantId, tenantId), isNull(dgmImdgCompliance.deletedAt)];
  if (search) conditions.push(or(ilike(dgmImdgCompliance.complianceRef, `%${search}%`), ilike(dgmImdgCompliance.unNumber, `%${search}%`), ilike(dgmImdgCompliance.properShippingName, `%${search}%`))!);
  if (status) conditions.push(eq(dgmImdgCompliance.status, status));
  if (cursor) conditions.push(lt(dgmImdgCompliance.createdAt, new Date(cursor)));
  const results = await db.select().from(dgmImdgCompliance).where(and(...conditions)).orderBy(desc(dgmImdgCompliance.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getImdgCompliance(id: string, tenantId: string) {
  const [record] = await db.select().from(dgmImdgCompliance).where(and(eq(dgmImdgCompliance.id, id), eq(dgmImdgCompliance.tenantId, tenantId), isNull(dgmImdgCompliance.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Booking Screenings
// ==========================================

export async function listBookingScreenings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(dgmBookingScreenings.tenantId, tenantId), isNull(dgmBookingScreenings.deletedAt)];
  if (search) conditions.push(or(ilike(dgmBookingScreenings.screeningRef, `%${search}%`), ilike(dgmBookingScreenings.bookingRef, `%${search}%`), ilike(dgmBookingScreenings.customerName, `%${search}%`))!);
  if (status) conditions.push(eq(dgmBookingScreenings.status, status));
  if (cursor) conditions.push(lt(dgmBookingScreenings.createdAt, new Date(cursor)));
  const results = await db.select().from(dgmBookingScreenings).where(and(...conditions)).orderBy(desc(dgmBookingScreenings.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getBookingScreening(id: string, tenantId: string) {
  const [record] = await db.select().from(dgmBookingScreenings).where(and(eq(dgmBookingScreenings.id, id), eq(dgmBookingScreenings.tenantId, tenantId), isNull(dgmBookingScreenings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Segregation Rules
// ==========================================

export async function listSegregationRules({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(dgmSegregationRules.tenantId, tenantId), isNull(dgmSegregationRules.deletedAt)];
  if (search) conditions.push(or(ilike(dgmSegregationRules.ruleRef, `%${search}%`), ilike(dgmSegregationRules.ruleName, `%${search}%`))!);
  if (status) conditions.push(eq(dgmSegregationRules.status, status));
  if (cursor) conditions.push(lt(dgmSegregationRules.createdAt, new Date(cursor)));
  const results = await db.select().from(dgmSegregationRules).where(and(...conditions)).orderBy(desc(dgmSegregationRules.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getSegregationRule(id: string, tenantId: string) {
  const [record] = await db.select().from(dgmSegregationRules).where(and(eq(dgmSegregationRules.id, id), eq(dgmSegregationRules.tenantId, tenantId), isNull(dgmSegregationRules.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Placard Requirements
// ==========================================

export async function listPlacardRequirements({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(dgmPlacardRequirements.tenantId, tenantId), isNull(dgmPlacardRequirements.deletedAt)];
  if (search) conditions.push(or(ilike(dgmPlacardRequirements.placardRef, `%${search}%`), ilike(dgmPlacardRequirements.imdgClass, `%${search}%`))!);
  if (status) conditions.push(eq(dgmPlacardRequirements.status, status));
  if (cursor) conditions.push(lt(dgmPlacardRequirements.createdAt, new Date(cursor)));
  const results = await db.select().from(dgmPlacardRequirements).where(and(...conditions)).orderBy(desc(dgmPlacardRequirements.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPlacardRequirement(id: string, tenantId: string) {
  const [record] = await db.select().from(dgmPlacardRequirements).where(and(eq(dgmPlacardRequirements.id, id), eq(dgmPlacardRequirements.tenantId, tenantId), isNull(dgmPlacardRequirements.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// DG Manifests
// ==========================================

export async function listDgmManifests({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(dgmManifests.tenantId, tenantId), isNull(dgmManifests.deletedAt)];
  if (search) conditions.push(or(ilike(dgmManifests.manifestRef, `%${search}%`), ilike(dgmManifests.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(dgmManifests.status, status));
  if (cursor) conditions.push(lt(dgmManifests.createdAt, new Date(cursor)));
  const results = await db.select().from(dgmManifests).where(and(...conditions)).orderBy(desc(dgmManifests.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getDgmManifest(id: string, tenantId: string) {
  const [record] = await db.select().from(dgmManifests).where(and(eq(dgmManifests.id, id), eq(dgmManifests.tenantId, tenantId), isNull(dgmManifests.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Emergency Procedures
// ==========================================

export async function listEmergencyProcedures({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(dgmEmergencyProcedures.tenantId, tenantId), isNull(dgmEmergencyProcedures.deletedAt)];
  if (search) conditions.push(or(ilike(dgmEmergencyProcedures.procedureRef, `%${search}%`), ilike(dgmEmergencyProcedures.procedureName, `%${search}%`))!);
  if (status) conditions.push(eq(dgmEmergencyProcedures.status, status));
  if (cursor) conditions.push(lt(dgmEmergencyProcedures.createdAt, new Date(cursor)));
  const results = await db.select().from(dgmEmergencyProcedures).where(and(...conditions)).orderBy(desc(dgmEmergencyProcedures.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getEmergencyProcedure(id: string, tenantId: string) {
  const [record] = await db.select().from(dgmEmergencyProcedures).where(and(eq(dgmEmergencyProcedures.id, id), eq(dgmEmergencyProcedures.tenantId, tenantId), isNull(dgmEmergencyProcedures.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Chemical Safety Data
// ==========================================

export async function listChemicalSafetyData({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(dgmChemicalSafetyData.tenantId, tenantId), isNull(dgmChemicalSafetyData.deletedAt)];
  if (search) conditions.push(or(ilike(dgmChemicalSafetyData.safetyDataRef, `%${search}%`), ilike(dgmChemicalSafetyData.chemicalName, `%${search}%`))!);
  if (status) conditions.push(eq(dgmChemicalSafetyData.status, status));
  if (cursor) conditions.push(lt(dgmChemicalSafetyData.createdAt, new Date(cursor)));
  const results = await db.select().from(dgmChemicalSafetyData).where(and(...conditions)).orderBy(desc(dgmChemicalSafetyData.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getChemicalSafetyDataRecord(id: string, tenantId: string) {
  const [record] = await db.select().from(dgmChemicalSafetyData).where(and(eq(dgmChemicalSafetyData.id, id), eq(dgmChemicalSafetyData.tenantId, tenantId), isNull(dgmChemicalSafetyData.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Incident Reports
// ==========================================

export async function listIncidentReports({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(dgmIncidentReports.tenantId, tenantId), isNull(dgmIncidentReports.deletedAt)];
  if (search) conditions.push(or(ilike(dgmIncidentReports.incidentRef, `%${search}%`), ilike(dgmIncidentReports.locationDescription, `%${search}%`))!);
  if (status) conditions.push(eq(dgmIncidentReports.status, status));
  if (cursor) conditions.push(lt(dgmIncidentReports.createdAt, new Date(cursor)));
  const results = await db.select().from(dgmIncidentReports).where(and(...conditions)).orderBy(desc(dgmIncidentReports.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getIncidentReport(id: string, tenantId: string) {
  const [record] = await db.select().from(dgmIncidentReports).where(and(eq(dgmIncidentReports.id, id), eq(dgmIncidentReports.tenantId, tenantId), isNull(dgmIncidentReports.deletedAt))).limit(1);
  return record ?? null;
}
