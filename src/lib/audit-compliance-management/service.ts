import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  acmInternalAudits,
  acmRegulatoryComplianceCalendars,
  acmRiskRegisters,
  acmPolicyProcedures,
  acmRegulatoryReportingSubmissions,
  acmSoxFinancialControls,
  acmIsoCertificationTrackings,
  acmAiRiskDetections,
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
// Internal Audits
// ==========================================
export async function listInternalAudits({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(acmInternalAudits.tenantId, tenantId), isNull(acmInternalAudits.deletedAt)];
  if (search) conditions.push(or(ilike(acmInternalAudits.auditRef, `%${search}%`), ilike(acmInternalAudits.title, `%${search}%`))!);
  if (status) conditions.push(eq(acmInternalAudits.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(acmInternalAudits.createdAt, acmInternalAudits.id, cc)); }
  const results = await db.select().from(acmInternalAudits).where(and(...conditions)).orderBy(desc(acmInternalAudits.createdAt), desc(acmInternalAudits.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getInternalAudit(id: string, tenantId: string) {
  const [record] = await db.select().from(acmInternalAudits).where(and(eq(acmInternalAudits.id, id), eq(acmInternalAudits.tenantId, tenantId), isNull(acmInternalAudits.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Regulatory Compliance Calendars
// ==========================================
export async function listRegulatoryComplianceCalendars({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(acmRegulatoryComplianceCalendars.tenantId, tenantId), isNull(acmRegulatoryComplianceCalendars.deletedAt)];
  if (search) conditions.push(or(ilike(acmRegulatoryComplianceCalendars.calendarRef, `%${search}%`), ilike(acmRegulatoryComplianceCalendars.title, `%${search}%`))!);
  if (status) conditions.push(eq(acmRegulatoryComplianceCalendars.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(acmRegulatoryComplianceCalendars.createdAt, acmRegulatoryComplianceCalendars.id, cc)); }
  const results = await db.select().from(acmRegulatoryComplianceCalendars).where(and(...conditions)).orderBy(desc(acmRegulatoryComplianceCalendars.createdAt), desc(acmRegulatoryComplianceCalendars.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getRegulatoryComplianceCalendar(id: string, tenantId: string) {
  const [record] = await db.select().from(acmRegulatoryComplianceCalendars).where(and(eq(acmRegulatoryComplianceCalendars.id, id), eq(acmRegulatoryComplianceCalendars.tenantId, tenantId), isNull(acmRegulatoryComplianceCalendars.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Risk Registers
// ==========================================
export async function listRiskRegisters({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(acmRiskRegisters.tenantId, tenantId), isNull(acmRiskRegisters.deletedAt)];
  if (search) conditions.push(or(ilike(acmRiskRegisters.riskRef, `%${search}%`), ilike(acmRiskRegisters.title, `%${search}%`))!);
  if (status) conditions.push(eq(acmRiskRegisters.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(acmRiskRegisters.createdAt, acmRiskRegisters.id, cc)); }
  const results = await db.select().from(acmRiskRegisters).where(and(...conditions)).orderBy(desc(acmRiskRegisters.createdAt), desc(acmRiskRegisters.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getRiskRegister(id: string, tenantId: string) {
  const [record] = await db.select().from(acmRiskRegisters).where(and(eq(acmRiskRegisters.id, id), eq(acmRiskRegisters.tenantId, tenantId), isNull(acmRiskRegisters.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Policy & Procedures
// ==========================================
export async function listPolicyProcedures({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(acmPolicyProcedures.tenantId, tenantId), isNull(acmPolicyProcedures.deletedAt)];
  if (search) conditions.push(or(ilike(acmPolicyProcedures.policyRef, `%${search}%`), ilike(acmPolicyProcedures.title, `%${search}%`))!);
  if (status) conditions.push(eq(acmPolicyProcedures.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(acmPolicyProcedures.createdAt, acmPolicyProcedures.id, cc)); }
  const results = await db.select().from(acmPolicyProcedures).where(and(...conditions)).orderBy(desc(acmPolicyProcedures.createdAt), desc(acmPolicyProcedures.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getPolicyProcedure(id: string, tenantId: string) {
  const [record] = await db.select().from(acmPolicyProcedures).where(and(eq(acmPolicyProcedures.id, id), eq(acmPolicyProcedures.tenantId, tenantId), isNull(acmPolicyProcedures.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Regulatory Reporting Submissions
// ==========================================
export async function listRegulatoryReportingSubmissions({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(acmRegulatoryReportingSubmissions.tenantId, tenantId), isNull(acmRegulatoryReportingSubmissions.deletedAt)];
  if (search) conditions.push(or(ilike(acmRegulatoryReportingSubmissions.submissionRef, `%${search}%`), ilike(acmRegulatoryReportingSubmissions.title, `%${search}%`))!);
  if (status) conditions.push(eq(acmRegulatoryReportingSubmissions.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(acmRegulatoryReportingSubmissions.createdAt, acmRegulatoryReportingSubmissions.id, cc)); }
  const results = await db.select().from(acmRegulatoryReportingSubmissions).where(and(...conditions)).orderBy(desc(acmRegulatoryReportingSubmissions.createdAt), desc(acmRegulatoryReportingSubmissions.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getRegulatoryReportingSubmission(id: string, tenantId: string) {
  const [record] = await db.select().from(acmRegulatoryReportingSubmissions).where(and(eq(acmRegulatoryReportingSubmissions.id, id), eq(acmRegulatoryReportingSubmissions.tenantId, tenantId), isNull(acmRegulatoryReportingSubmissions.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// SOX Financial Controls
// ==========================================
export async function listSoxFinancialControls({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(acmSoxFinancialControls.tenantId, tenantId), isNull(acmSoxFinancialControls.deletedAt)];
  if (search) conditions.push(or(ilike(acmSoxFinancialControls.controlRef, `%${search}%`), ilike(acmSoxFinancialControls.title, `%${search}%`))!);
  if (status) conditions.push(eq(acmSoxFinancialControls.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(acmSoxFinancialControls.createdAt, acmSoxFinancialControls.id, cc)); }
  const results = await db.select().from(acmSoxFinancialControls).where(and(...conditions)).orderBy(desc(acmSoxFinancialControls.createdAt), desc(acmSoxFinancialControls.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getSoxFinancialControl(id: string, tenantId: string) {
  const [record] = await db.select().from(acmSoxFinancialControls).where(and(eq(acmSoxFinancialControls.id, id), eq(acmSoxFinancialControls.tenantId, tenantId), isNull(acmSoxFinancialControls.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// ISO Certification Trackings
// ==========================================
export async function listIsoCertificationTrackings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(acmIsoCertificationTrackings.tenantId, tenantId), isNull(acmIsoCertificationTrackings.deletedAt)];
  if (search) conditions.push(or(ilike(acmIsoCertificationTrackings.certificationRef, `%${search}%`), ilike(acmIsoCertificationTrackings.standard, `%${search}%`))!);
  if (status) conditions.push(eq(acmIsoCertificationTrackings.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(acmIsoCertificationTrackings.createdAt, acmIsoCertificationTrackings.id, cc)); }
  const results = await db.select().from(acmIsoCertificationTrackings).where(and(...conditions)).orderBy(desc(acmIsoCertificationTrackings.createdAt), desc(acmIsoCertificationTrackings.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getIsoCertificationTracking(id: string, tenantId: string) {
  const [record] = await db.select().from(acmIsoCertificationTrackings).where(and(eq(acmIsoCertificationTrackings.id, id), eq(acmIsoCertificationTrackings.tenantId, tenantId), isNull(acmIsoCertificationTrackings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// AI Risk Detections
// ==========================================
export async function listAiRiskDetections({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(acmAiRiskDetections.tenantId, tenantId), isNull(acmAiRiskDetections.deletedAt)];
  if (search) conditions.push(or(ilike(acmAiRiskDetections.detectionRef, `%${search}%`), ilike(acmAiRiskDetections.title, `%${search}%`))!);
  if (status) conditions.push(eq(acmAiRiskDetections.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(acmAiRiskDetections.createdAt, acmAiRiskDetections.id, cc)); }
  const results = await db.select().from(acmAiRiskDetections).where(and(...conditions)).orderBy(desc(acmAiRiskDetections.createdAt), desc(acmAiRiskDetections.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getAiRiskDetection(id: string, tenantId: string) {
  const [record] = await db.select().from(acmAiRiskDetections).where(and(eq(acmAiRiskDetections.id, id), eq(acmAiRiskDetections.tenantId, tenantId), isNull(acmAiRiskDetections.deletedAt))).limit(1);
  return record ?? null;
}
