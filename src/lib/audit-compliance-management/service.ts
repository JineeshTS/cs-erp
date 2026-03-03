import { and, eq, ilike, isNull, gt, desc, or } from "drizzle-orm";
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
  if (cursor) conditions.push(gt(acmInternalAudits.createdAt, new Date(cursor)));
  const results = await db.select().from(acmInternalAudits).where(and(...conditions)).orderBy(desc(acmInternalAudits.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
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
  if (cursor) conditions.push(gt(acmRegulatoryComplianceCalendars.createdAt, new Date(cursor)));
  const results = await db.select().from(acmRegulatoryComplianceCalendars).where(and(...conditions)).orderBy(desc(acmRegulatoryComplianceCalendars.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
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
  if (cursor) conditions.push(gt(acmRiskRegisters.createdAt, new Date(cursor)));
  const results = await db.select().from(acmRiskRegisters).where(and(...conditions)).orderBy(desc(acmRiskRegisters.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
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
  if (cursor) conditions.push(gt(acmPolicyProcedures.createdAt, new Date(cursor)));
  const results = await db.select().from(acmPolicyProcedures).where(and(...conditions)).orderBy(desc(acmPolicyProcedures.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
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
  if (cursor) conditions.push(gt(acmRegulatoryReportingSubmissions.createdAt, new Date(cursor)));
  const results = await db.select().from(acmRegulatoryReportingSubmissions).where(and(...conditions)).orderBy(desc(acmRegulatoryReportingSubmissions.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
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
  if (cursor) conditions.push(gt(acmSoxFinancialControls.createdAt, new Date(cursor)));
  const results = await db.select().from(acmSoxFinancialControls).where(and(...conditions)).orderBy(desc(acmSoxFinancialControls.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
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
  if (cursor) conditions.push(gt(acmIsoCertificationTrackings.createdAt, new Date(cursor)));
  const results = await db.select().from(acmIsoCertificationTrackings).where(and(...conditions)).orderBy(desc(acmIsoCertificationTrackings.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
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
  if (cursor) conditions.push(gt(acmAiRiskDetections.createdAt, new Date(cursor)));
  const results = await db.select().from(acmAiRiskDetections).where(and(...conditions)).orderBy(desc(acmAiRiskDetections.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getAiRiskDetection(id: string, tenantId: string) {
  const [record] = await db.select().from(acmAiRiskDetections).where(and(eq(acmAiRiskDetections.id, id), eq(acmAiRiskDetections.tenantId, tenantId), isNull(acmAiRiskDetections.deletedAt))).limit(1);
  return record ?? null;
}
