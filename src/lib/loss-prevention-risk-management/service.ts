import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  lprRiskRegisters,
  lprHsseRecords,
  lprNearMissReports,
  lprIncidentInvestigations,
  lprPiClubScorings,
  lprContinuityPlans,
  lprEmergencyProcedures,
  lprRiskKpiDashboards,
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
// Enterprise Risk Register Management
// ==========================================
export async function listRiskRegisters({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(lprRiskRegisters.tenantId, tenantId), isNull(lprRiskRegisters.deletedAt)];
  if (search) conditions.push(or(ilike(lprRiskRegisters.riskRef, `%${search}%`), ilike(lprRiskRegisters.title, `%${search}%`))!);
  if (status) conditions.push(eq(lprRiskRegisters.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(lprRiskRegisters.createdAt, lprRiskRegisters.id, cc)); }
  const results = await db.select().from(lprRiskRegisters).where(and(...conditions)).orderBy(desc(lprRiskRegisters.createdAt), desc(lprRiskRegisters.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getRiskRegister(id: string, tenantId: string) {
  const [record] = await db.select().from(lprRiskRegisters).where(and(eq(lprRiskRegisters.id, id), eq(lprRiskRegisters.tenantId, tenantId), isNull(lprRiskRegisters.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// HSSE Health Safety Security Environment
// ==========================================
export async function listHsseRecords({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(lprHsseRecords.tenantId, tenantId), isNull(lprHsseRecords.deletedAt)];
  if (search) conditions.push(or(ilike(lprHsseRecords.hsseRef, `%${search}%`), ilike(lprHsseRecords.title, `%${search}%`))!);
  if (status) conditions.push(eq(lprHsseRecords.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(lprHsseRecords.createdAt, lprHsseRecords.id, cc)); }
  const results = await db.select().from(lprHsseRecords).where(and(...conditions)).orderBy(desc(lprHsseRecords.createdAt), desc(lprHsseRecords.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getHsseRecord(id: string, tenantId: string) {
  const [record] = await db.select().from(lprHsseRecords).where(and(eq(lprHsseRecords.id, id), eq(lprHsseRecords.tenantId, tenantId), isNull(lprHsseRecords.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Near-Miss & Unsafe Act Reporting
// ==========================================
export async function listNearMissReports({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(lprNearMissReports.tenantId, tenantId), isNull(lprNearMissReports.deletedAt)];
  if (search) conditions.push(or(ilike(lprNearMissReports.nearMissRef, `%${search}%`), ilike(lprNearMissReports.title, `%${search}%`))!);
  if (status) conditions.push(eq(lprNearMissReports.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(lprNearMissReports.createdAt, lprNearMissReports.id, cc)); }
  const results = await db.select().from(lprNearMissReports).where(and(...conditions)).orderBy(desc(lprNearMissReports.createdAt), desc(lprNearMissReports.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getNearMissReport(id: string, tenantId: string) {
  const [record] = await db.select().from(lprNearMissReports).where(and(eq(lprNearMissReports.id, id), eq(lprNearMissReports.tenantId, tenantId), isNull(lprNearMissReports.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Incident Investigation & Root Cause Analysis
// ==========================================
export async function listIncidentInvestigations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(lprIncidentInvestigations.tenantId, tenantId), isNull(lprIncidentInvestigations.deletedAt)];
  if (search) conditions.push(or(ilike(lprIncidentInvestigations.investigationRef, `%${search}%`), ilike(lprIncidentInvestigations.title, `%${search}%`))!);
  if (status) conditions.push(eq(lprIncidentInvestigations.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(lprIncidentInvestigations.createdAt, lprIncidentInvestigations.id, cc)); }
  const results = await db.select().from(lprIncidentInvestigations).where(and(...conditions)).orderBy(desc(lprIncidentInvestigations.createdAt), desc(lprIncidentInvestigations.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getIncidentInvestigation(id: string, tenantId: string) {
  const [record] = await db.select().from(lprIncidentInvestigations).where(and(eq(lprIncidentInvestigations.id, id), eq(lprIncidentInvestigations.tenantId, tenantId), isNull(lprIncidentInvestigations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// P&I Club Risk Scoring AI
// ==========================================
export async function listPiClubScorings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(lprPiClubScorings.tenantId, tenantId), isNull(lprPiClubScorings.deletedAt)];
  if (search) conditions.push(or(ilike(lprPiClubScorings.scoringRef, `%${search}%`), ilike(lprPiClubScorings.title, `%${search}%`))!);
  if (status) conditions.push(eq(lprPiClubScorings.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(lprPiClubScorings.createdAt, lprPiClubScorings.id, cc)); }
  const results = await db.select().from(lprPiClubScorings).where(and(...conditions)).orderBy(desc(lprPiClubScorings.createdAt), desc(lprPiClubScorings.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getPiClubScoring(id: string, tenantId: string) {
  const [record] = await db.select().from(lprPiClubScorings).where(and(eq(lprPiClubScorings.id, id), eq(lprPiClubScorings.tenantId, tenantId), isNull(lprPiClubScorings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Business Continuity Plan Management
// ==========================================
export async function listContinuityPlans({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(lprContinuityPlans.tenantId, tenantId), isNull(lprContinuityPlans.deletedAt)];
  if (search) conditions.push(or(ilike(lprContinuityPlans.planRef, `%${search}%`), ilike(lprContinuityPlans.title, `%${search}%`))!);
  if (status) conditions.push(eq(lprContinuityPlans.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(lprContinuityPlans.createdAt, lprContinuityPlans.id, cc)); }
  const results = await db.select().from(lprContinuityPlans).where(and(...conditions)).orderBy(desc(lprContinuityPlans.createdAt), desc(lprContinuityPlans.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getContinuityPlan(id: string, tenantId: string) {
  const [record] = await db.select().from(lprContinuityPlans).where(and(eq(lprContinuityPlans.id, id), eq(lprContinuityPlans.tenantId, tenantId), isNull(lprContinuityPlans.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Emergency Response Procedure Library
// ==========================================
export async function listEmergencyProcedures({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(lprEmergencyProcedures.tenantId, tenantId), isNull(lprEmergencyProcedures.deletedAt)];
  if (search) conditions.push(or(ilike(lprEmergencyProcedures.procedureRef, `%${search}%`), ilike(lprEmergencyProcedures.title, `%${search}%`))!);
  if (status) conditions.push(eq(lprEmergencyProcedures.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(lprEmergencyProcedures.createdAt, lprEmergencyProcedures.id, cc)); }
  const results = await db.select().from(lprEmergencyProcedures).where(and(...conditions)).orderBy(desc(lprEmergencyProcedures.createdAt), desc(lprEmergencyProcedures.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getEmergencyProcedure(id: string, tenantId: string) {
  const [record] = await db.select().from(lprEmergencyProcedures).where(and(eq(lprEmergencyProcedures.id, id), eq(lprEmergencyProcedures.tenantId, tenantId), isNull(lprEmergencyProcedures.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Risk KPI Dashboard & Board Reporting
// ==========================================
export async function listRiskKpiDashboards({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(lprRiskKpiDashboards.tenantId, tenantId), isNull(lprRiskKpiDashboards.deletedAt)];
  if (search) conditions.push(or(ilike(lprRiskKpiDashboards.dashboardRef, `%${search}%`), ilike(lprRiskKpiDashboards.title, `%${search}%`))!);
  if (status) conditions.push(eq(lprRiskKpiDashboards.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(lprRiskKpiDashboards.createdAt, lprRiskKpiDashboards.id, cc)); }
  const results = await db.select().from(lprRiskKpiDashboards).where(and(...conditions)).orderBy(desc(lprRiskKpiDashboards.createdAt), desc(lprRiskKpiDashboards.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getRiskKpiDashboard(id: string, tenantId: string) {
  const [record] = await db.select().from(lprRiskKpiDashboards).where(and(eq(lprRiskKpiDashboards.id, id), eq(lprRiskKpiDashboards.tenantId, tenantId), isNull(lprRiskKpiDashboards.deletedAt))).limit(1);
  return record ?? null;
}
