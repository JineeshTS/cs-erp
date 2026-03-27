import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  vtmPlannedMaintenanceTasks,
  vtmDryDockPlans,
  vtmSurveyTrackings,
  vtmDefectRepairs,
  vtmSpareParts,
  vtmTechnicalProcurements,
  vtmComplianceRecords,
  vtmPredictiveMaintenance,
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
// Planned Maintenance Tasks
// ==========================================

export async function listPlannedMaintenanceTasks({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(vtmPlannedMaintenanceTasks.tenantId, tenantId), isNull(vtmPlannedMaintenanceTasks.deletedAt)];
  if (search) conditions.push(or(ilike(vtmPlannedMaintenanceTasks.taskRef, `%${search}%`), ilike(vtmPlannedMaintenanceTasks.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(vtmPlannedMaintenanceTasks.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(vtmPlannedMaintenanceTasks.createdAt, vtmPlannedMaintenanceTasks.id, cc)); }
  const results = await db.select().from(vtmPlannedMaintenanceTasks).where(and(...conditions)).orderBy(desc(vtmPlannedMaintenanceTasks.createdAt), desc(vtmPlannedMaintenanceTasks.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getPlannedMaintenanceTask(id: string, tenantId: string) {
  const [record] = await db.select().from(vtmPlannedMaintenanceTasks).where(and(eq(vtmPlannedMaintenanceTasks.id, id), eq(vtmPlannedMaintenanceTasks.tenantId, tenantId), isNull(vtmPlannedMaintenanceTasks.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Dry Dock Plans
// ==========================================

export async function listDryDockPlans({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(vtmDryDockPlans.tenantId, tenantId), isNull(vtmDryDockPlans.deletedAt)];
  if (search) conditions.push(or(ilike(vtmDryDockPlans.planRef, `%${search}%`), ilike(vtmDryDockPlans.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(vtmDryDockPlans.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(vtmDryDockPlans.createdAt, vtmDryDockPlans.id, cc)); }
  const results = await db.select().from(vtmDryDockPlans).where(and(...conditions)).orderBy(desc(vtmDryDockPlans.createdAt), desc(vtmDryDockPlans.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getDryDockPlan(id: string, tenantId: string) {
  const [record] = await db.select().from(vtmDryDockPlans).where(and(eq(vtmDryDockPlans.id, id), eq(vtmDryDockPlans.tenantId, tenantId), isNull(vtmDryDockPlans.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Survey Trackings
// ==========================================

export async function listSurveyTrackings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(vtmSurveyTrackings.tenantId, tenantId), isNull(vtmSurveyTrackings.deletedAt)];
  if (search) conditions.push(or(ilike(vtmSurveyTrackings.surveyRef, `%${search}%`), ilike(vtmSurveyTrackings.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(vtmSurveyTrackings.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(vtmSurveyTrackings.createdAt, vtmSurveyTrackings.id, cc)); }
  const results = await db.select().from(vtmSurveyTrackings).where(and(...conditions)).orderBy(desc(vtmSurveyTrackings.createdAt), desc(vtmSurveyTrackings.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getSurveyTracking(id: string, tenantId: string) {
  const [record] = await db.select().from(vtmSurveyTrackings).where(and(eq(vtmSurveyTrackings.id, id), eq(vtmSurveyTrackings.tenantId, tenantId), isNull(vtmSurveyTrackings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Defect Repairs
// ==========================================

export async function listDefectRepairs({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(vtmDefectRepairs.tenantId, tenantId), isNull(vtmDefectRepairs.deletedAt)];
  if (search) conditions.push(or(ilike(vtmDefectRepairs.defectRef, `%${search}%`), ilike(vtmDefectRepairs.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(vtmDefectRepairs.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(vtmDefectRepairs.createdAt, vtmDefectRepairs.id, cc)); }
  const results = await db.select().from(vtmDefectRepairs).where(and(...conditions)).orderBy(desc(vtmDefectRepairs.createdAt), desc(vtmDefectRepairs.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getDefectRepair(id: string, tenantId: string) {
  const [record] = await db.select().from(vtmDefectRepairs).where(and(eq(vtmDefectRepairs.id, id), eq(vtmDefectRepairs.tenantId, tenantId), isNull(vtmDefectRepairs.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Spare Parts
// ==========================================

export async function listSpareParts({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(vtmSpareParts.tenantId, tenantId), isNull(vtmSpareParts.deletedAt)];
  if (search) conditions.push(or(ilike(vtmSpareParts.partRef, `%${search}%`), ilike(vtmSpareParts.partName, `%${search}%`))!);
  if (status) conditions.push(eq(vtmSpareParts.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(vtmSpareParts.createdAt, vtmSpareParts.id, cc)); }
  const results = await db.select().from(vtmSpareParts).where(and(...conditions)).orderBy(desc(vtmSpareParts.createdAt), desc(vtmSpareParts.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getSparePart(id: string, tenantId: string) {
  const [record] = await db.select().from(vtmSpareParts).where(and(eq(vtmSpareParts.id, id), eq(vtmSpareParts.tenantId, tenantId), isNull(vtmSpareParts.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Technical Procurements
// ==========================================

export async function listTechnicalProcurements({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(vtmTechnicalProcurements.tenantId, tenantId), isNull(vtmTechnicalProcurements.deletedAt)];
  if (search) conditions.push(or(ilike(vtmTechnicalProcurements.procurementRef, `%${search}%`), ilike(vtmTechnicalProcurements.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(vtmTechnicalProcurements.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(vtmTechnicalProcurements.createdAt, vtmTechnicalProcurements.id, cc)); }
  const results = await db.select().from(vtmTechnicalProcurements).where(and(...conditions)).orderBy(desc(vtmTechnicalProcurements.createdAt), desc(vtmTechnicalProcurements.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getTechnicalProcurement(id: string, tenantId: string) {
  const [record] = await db.select().from(vtmTechnicalProcurements).where(and(eq(vtmTechnicalProcurements.id, id), eq(vtmTechnicalProcurements.tenantId, tenantId), isNull(vtmTechnicalProcurements.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Compliance Records
// ==========================================

export async function listComplianceRecords({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(vtmComplianceRecords.tenantId, tenantId), isNull(vtmComplianceRecords.deletedAt)];
  if (search) conditions.push(or(ilike(vtmComplianceRecords.recordRef, `%${search}%`), ilike(vtmComplianceRecords.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(vtmComplianceRecords.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(vtmComplianceRecords.createdAt, vtmComplianceRecords.id, cc)); }
  const results = await db.select().from(vtmComplianceRecords).where(and(...conditions)).orderBy(desc(vtmComplianceRecords.createdAt), desc(vtmComplianceRecords.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getComplianceRecord(id: string, tenantId: string) {
  const [record] = await db.select().from(vtmComplianceRecords).where(and(eq(vtmComplianceRecords.id, id), eq(vtmComplianceRecords.tenantId, tenantId), isNull(vtmComplianceRecords.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Predictive Maintenance
// ==========================================

export async function listPredictiveMaintenance({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(vtmPredictiveMaintenance.tenantId, tenantId), isNull(vtmPredictiveMaintenance.deletedAt)];
  if (search) conditions.push(or(ilike(vtmPredictiveMaintenance.predictionRef, `%${search}%`), ilike(vtmPredictiveMaintenance.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(vtmPredictiveMaintenance.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(vtmPredictiveMaintenance.createdAt, vtmPredictiveMaintenance.id, cc)); }
  const results = await db.select().from(vtmPredictiveMaintenance).where(and(...conditions)).orderBy(desc(vtmPredictiveMaintenance.createdAt), desc(vtmPredictiveMaintenance.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getPredictiveMaintenance(id: string, tenantId: string) {
  const [record] = await db.select().from(vtmPredictiveMaintenance).where(and(eq(vtmPredictiveMaintenance.id, id), eq(vtmPredictiveMaintenance.tenantId, tenantId), isNull(vtmPredictiveMaintenance.deletedAt))).limit(1);
  return record ?? null;
}
