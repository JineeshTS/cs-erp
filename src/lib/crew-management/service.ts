import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  crmCrewRotations,
  crmCertificateTrackings,
  crmPayrollAllotments,
  crmFlagStateCompliance,
  crmManningAgencies,
  crmVisaTravelRecords,
  crmWelfareMedicalRecords,
  crmMlcCompliance,
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
// Crew Rotations
// ==========================================

export async function listCrewRotations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(crmCrewRotations.tenantId, tenantId), isNull(crmCrewRotations.deletedAt)];
  if (search) conditions.push(or(ilike(crmCrewRotations.rotationRef, `%${search}%`), ilike(crmCrewRotations.crewMemberName, `%${search}%`))!);
  if (status) conditions.push(eq(crmCrewRotations.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(crmCrewRotations.createdAt, crmCrewRotations.id, cc)); }
  const results = await db.select().from(crmCrewRotations).where(and(...conditions)).orderBy(desc(crmCrewRotations.createdAt), desc(crmCrewRotations.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getCrewRotation(id: string, tenantId: string) {
  const [record] = await db.select().from(crmCrewRotations).where(and(eq(crmCrewRotations.id, id), eq(crmCrewRotations.tenantId, tenantId), isNull(crmCrewRotations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Certificate Trackings
// ==========================================

export async function listCertificateTrackings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(crmCertificateTrackings.tenantId, tenantId), isNull(crmCertificateTrackings.deletedAt)];
  if (search) conditions.push(or(ilike(crmCertificateTrackings.certificateRef, `%${search}%`), ilike(crmCertificateTrackings.crewMemberName, `%${search}%`))!);
  if (status) conditions.push(eq(crmCertificateTrackings.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(crmCertificateTrackings.createdAt, crmCertificateTrackings.id, cc)); }
  const results = await db.select().from(crmCertificateTrackings).where(and(...conditions)).orderBy(desc(crmCertificateTrackings.createdAt), desc(crmCertificateTrackings.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getCertificateTracking(id: string, tenantId: string) {
  const [record] = await db.select().from(crmCertificateTrackings).where(and(eq(crmCertificateTrackings.id, id), eq(crmCertificateTrackings.tenantId, tenantId), isNull(crmCertificateTrackings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Payroll Allotments
// ==========================================

export async function listPayrollAllotments({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(crmPayrollAllotments.tenantId, tenantId), isNull(crmPayrollAllotments.deletedAt)];
  if (search) conditions.push(or(ilike(crmPayrollAllotments.allotmentRef, `%${search}%`), ilike(crmPayrollAllotments.crewMemberName, `%${search}%`))!);
  if (status) conditions.push(eq(crmPayrollAllotments.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(crmPayrollAllotments.createdAt, crmPayrollAllotments.id, cc)); }
  const results = await db.select().from(crmPayrollAllotments).where(and(...conditions)).orderBy(desc(crmPayrollAllotments.createdAt), desc(crmPayrollAllotments.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getPayrollAllotment(id: string, tenantId: string) {
  const [record] = await db.select().from(crmPayrollAllotments).where(and(eq(crmPayrollAllotments.id, id), eq(crmPayrollAllotments.tenantId, tenantId), isNull(crmPayrollAllotments.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Flag State Compliance
// ==========================================

export async function listFlagStateCompliance({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(crmFlagStateCompliance.tenantId, tenantId), isNull(crmFlagStateCompliance.deletedAt)];
  if (search) conditions.push(or(ilike(crmFlagStateCompliance.complianceRef, `%${search}%`), ilike(crmFlagStateCompliance.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(crmFlagStateCompliance.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(crmFlagStateCompliance.createdAt, crmFlagStateCompliance.id, cc)); }
  const results = await db.select().from(crmFlagStateCompliance).where(and(...conditions)).orderBy(desc(crmFlagStateCompliance.createdAt), desc(crmFlagStateCompliance.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getFlagStateCompliance(id: string, tenantId: string) {
  const [record] = await db.select().from(crmFlagStateCompliance).where(and(eq(crmFlagStateCompliance.id, id), eq(crmFlagStateCompliance.tenantId, tenantId), isNull(crmFlagStateCompliance.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Manning Agencies
// ==========================================

export async function listManningAgencies({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(crmManningAgencies.tenantId, tenantId), isNull(crmManningAgencies.deletedAt)];
  if (search) conditions.push(or(ilike(crmManningAgencies.agencyRef, `%${search}%`), ilike(crmManningAgencies.agencyName, `%${search}%`))!);
  if (status) conditions.push(eq(crmManningAgencies.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(crmManningAgencies.createdAt, crmManningAgencies.id, cc)); }
  const results = await db.select().from(crmManningAgencies).where(and(...conditions)).orderBy(desc(crmManningAgencies.createdAt), desc(crmManningAgencies.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getManningAgency(id: string, tenantId: string) {
  const [record] = await db.select().from(crmManningAgencies).where(and(eq(crmManningAgencies.id, id), eq(crmManningAgencies.tenantId, tenantId), isNull(crmManningAgencies.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Visa Travel Records
// ==========================================

export async function listVisaTravelRecords({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(crmVisaTravelRecords.tenantId, tenantId), isNull(crmVisaTravelRecords.deletedAt)];
  if (search) conditions.push(or(ilike(crmVisaTravelRecords.recordRef, `%${search}%`), ilike(crmVisaTravelRecords.crewMemberName, `%${search}%`))!);
  if (status) conditions.push(eq(crmVisaTravelRecords.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(crmVisaTravelRecords.createdAt, crmVisaTravelRecords.id, cc)); }
  const results = await db.select().from(crmVisaTravelRecords).where(and(...conditions)).orderBy(desc(crmVisaTravelRecords.createdAt), desc(crmVisaTravelRecords.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getVisaTravelRecord(id: string, tenantId: string) {
  const [record] = await db.select().from(crmVisaTravelRecords).where(and(eq(crmVisaTravelRecords.id, id), eq(crmVisaTravelRecords.tenantId, tenantId), isNull(crmVisaTravelRecords.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Welfare Medical Records
// ==========================================

export async function listWelfareMedicalRecords({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(crmWelfareMedicalRecords.tenantId, tenantId), isNull(crmWelfareMedicalRecords.deletedAt)];
  if (search) conditions.push(or(ilike(crmWelfareMedicalRecords.recordRef, `%${search}%`), ilike(crmWelfareMedicalRecords.crewMemberName, `%${search}%`))!);
  if (status) conditions.push(eq(crmWelfareMedicalRecords.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(crmWelfareMedicalRecords.createdAt, crmWelfareMedicalRecords.id, cc)); }
  const results = await db.select().from(crmWelfareMedicalRecords).where(and(...conditions)).orderBy(desc(crmWelfareMedicalRecords.createdAt), desc(crmWelfareMedicalRecords.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getWelfareMedicalRecord(id: string, tenantId: string) {
  const [record] = await db.select().from(crmWelfareMedicalRecords).where(and(eq(crmWelfareMedicalRecords.id, id), eq(crmWelfareMedicalRecords.tenantId, tenantId), isNull(crmWelfareMedicalRecords.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// MLC Compliance
// ==========================================

export async function listMlcCompliance({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(crmMlcCompliance.tenantId, tenantId), isNull(crmMlcCompliance.deletedAt)];
  if (search) conditions.push(or(ilike(crmMlcCompliance.complianceRef, `%${search}%`), ilike(crmMlcCompliance.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(crmMlcCompliance.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(crmMlcCompliance.createdAt, crmMlcCompliance.id, cc)); }
  const results = await db.select().from(crmMlcCompliance).where(and(...conditions)).orderBy(desc(crmMlcCompliance.createdAt), desc(crmMlcCompliance.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getMlcCompliance(id: string, tenantId: string) {
  const [record] = await db.select().from(crmMlcCompliance).where(and(eq(crmMlcCompliance.id, id), eq(crmMlcCompliance.tenantId, tenantId), isNull(crmMlcCompliance.deletedAt))).limit(1);
  return record ?? null;
}
