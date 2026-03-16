import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  simCargoSurveys,
  simContainerSurveys,
  simDraftSurveys,
  simHireSurveys,
  simHatchInspections,
  simReeferPtiSurveys,
  simClassificationSurveys,
  simSurveyReports,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Pre-Load Cargo Surveys
// ==========================================
export async function listCargoSurveys({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(simCargoSurveys.tenantId, tenantId), isNull(simCargoSurveys.deletedAt)];
  if (search) conditions.push(or(ilike(simCargoSurveys.surveyRef, `%${search}%`), ilike(simCargoSurveys.vesselName, `%${search}%`), ilike(simCargoSurveys.clientName, `%${search}%`))!);
  if (status) conditions.push(eq(simCargoSurveys.status, status));
  if (cursor) conditions.push(lt(simCargoSurveys.createdAt, new Date(cursor)));
  const results = await db.select().from(simCargoSurveys).where(and(...conditions)).orderBy(desc(simCargoSurveys.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCargoSurvey(id: string, tenantId: string) {
  const [record] = await db.select().from(simCargoSurveys).where(and(eq(simCargoSurveys.id, id), eq(simCargoSurveys.tenantId, tenantId), isNull(simCargoSurveys.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Container Condition Surveys
// ==========================================
export async function listContainerSurveys({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(simContainerSurveys.tenantId, tenantId), isNull(simContainerSurveys.deletedAt)];
  if (search) conditions.push(or(ilike(simContainerSurveys.surveyRef, `%${search}%`), ilike(simContainerSurveys.containerNumber, `%${search}%`), ilike(simContainerSurveys.depotName, `%${search}%`))!);
  if (status) conditions.push(eq(simContainerSurveys.status, status));
  if (cursor) conditions.push(lt(simContainerSurveys.createdAt, new Date(cursor)));
  const results = await db.select().from(simContainerSurveys).where(and(...conditions)).orderBy(desc(simContainerSurveys.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getContainerSurvey(id: string, tenantId: string) {
  const [record] = await db.select().from(simContainerSurveys).where(and(eq(simContainerSurveys.id, id), eq(simContainerSurveys.tenantId, tenantId), isNull(simContainerSurveys.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Draft Surveys
// ==========================================
export async function listDraftSurveys({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(simDraftSurveys.tenantId, tenantId), isNull(simDraftSurveys.deletedAt)];
  if (search) conditions.push(or(ilike(simDraftSurveys.surveyRef, `%${search}%`), ilike(simDraftSurveys.vesselName, `%${search}%`), ilike(simDraftSurveys.portName, `%${search}%`))!);
  if (status) conditions.push(eq(simDraftSurveys.status, status));
  if (cursor) conditions.push(lt(simDraftSurveys.createdAt, new Date(cursor)));
  const results = await db.select().from(simDraftSurveys).where(and(...conditions)).orderBy(desc(simDraftSurveys.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getDraftSurvey(id: string, tenantId: string) {
  const [record] = await db.select().from(simDraftSurveys).where(and(eq(simDraftSurveys.id, id), eq(simDraftSurveys.tenantId, tenantId), isNull(simDraftSurveys.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Hire Surveys
// ==========================================
export async function listHireSurveys({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(simHireSurveys.tenantId, tenantId), isNull(simHireSurveys.deletedAt)];
  if (search) conditions.push(or(ilike(simHireSurveys.surveyRef, `%${search}%`), ilike(simHireSurveys.vesselName, `%${search}%`), ilike(simHireSurveys.chartererName, `%${search}%`))!);
  if (status) conditions.push(eq(simHireSurveys.status, status));
  if (cursor) conditions.push(lt(simHireSurveys.createdAt, new Date(cursor)));
  const results = await db.select().from(simHireSurveys).where(and(...conditions)).orderBy(desc(simHireSurveys.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getHireSurvey(id: string, tenantId: string) {
  const [record] = await db.select().from(simHireSurveys).where(and(eq(simHireSurveys.id, id), eq(simHireSurveys.tenantId, tenantId), isNull(simHireSurveys.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Hatch Inspections
// ==========================================
export async function listHatchInspections({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(simHatchInspections.tenantId, tenantId), isNull(simHatchInspections.deletedAt)];
  if (search) conditions.push(or(ilike(simHatchInspections.inspectionRef, `%${search}%`), ilike(simHatchInspections.vesselName, `%${search}%`), ilike(simHatchInspections.holdNumber, `%${search}%`))!);
  if (status) conditions.push(eq(simHatchInspections.status, status));
  if (cursor) conditions.push(lt(simHatchInspections.createdAt, new Date(cursor)));
  const results = await db.select().from(simHatchInspections).where(and(...conditions)).orderBy(desc(simHatchInspections.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getHatchInspection(id: string, tenantId: string) {
  const [record] = await db.select().from(simHatchInspections).where(and(eq(simHatchInspections.id, id), eq(simHatchInspections.tenantId, tenantId), isNull(simHatchInspections.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Reefer PTI Surveys
// ==========================================
export async function listReeferPtiSurveys({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(simReeferPtiSurveys.tenantId, tenantId), isNull(simReeferPtiSurveys.deletedAt)];
  if (search) conditions.push(or(ilike(simReeferPtiSurveys.surveyRef, `%${search}%`), ilike(simReeferPtiSurveys.containerNumber, `%${search}%`), ilike(simReeferPtiSurveys.depotName, `%${search}%`))!);
  if (status) conditions.push(eq(simReeferPtiSurveys.status, status));
  if (cursor) conditions.push(lt(simReeferPtiSurveys.createdAt, new Date(cursor)));
  const results = await db.select().from(simReeferPtiSurveys).where(and(...conditions)).orderBy(desc(simReeferPtiSurveys.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getReeferPtiSurvey(id: string, tenantId: string) {
  const [record] = await db.select().from(simReeferPtiSurveys).where(and(eq(simReeferPtiSurveys.id, id), eq(simReeferPtiSurveys.tenantId, tenantId), isNull(simReeferPtiSurveys.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Classification Surveys
// ==========================================
export async function listClassificationSurveys({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(simClassificationSurveys.tenantId, tenantId), isNull(simClassificationSurveys.deletedAt)];
  if (search) conditions.push(or(ilike(simClassificationSurveys.surveyRef, `%${search}%`), ilike(simClassificationSurveys.vesselName, `%${search}%`), ilike(simClassificationSurveys.classificationSociety, `%${search}%`))!);
  if (status) conditions.push(eq(simClassificationSurveys.status, status));
  if (cursor) conditions.push(lt(simClassificationSurveys.createdAt, new Date(cursor)));
  const results = await db.select().from(simClassificationSurveys).where(and(...conditions)).orderBy(desc(simClassificationSurveys.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getClassificationSurvey(id: string, tenantId: string) {
  const [record] = await db.select().from(simClassificationSurveys).where(and(eq(simClassificationSurveys.id, id), eq(simClassificationSurveys.tenantId, tenantId), isNull(simClassificationSurveys.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Survey Reports
// ==========================================
export async function listSurveyReports({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(simSurveyReports.tenantId, tenantId), isNull(simSurveyReports.deletedAt)];
  if (search) conditions.push(or(ilike(simSurveyReports.reportRef, `%${search}%`), ilike(simSurveyReports.title, `%${search}%`), ilike(simSurveyReports.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(simSurveyReports.status, status));
  if (cursor) conditions.push(lt(simSurveyReports.createdAt, new Date(cursor)));
  const results = await db.select().from(simSurveyReports).where(and(...conditions)).orderBy(desc(simSurveyReports.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getSurveyReport(id: string, tenantId: string) {
  const [record] = await db.select().from(simSurveyReports).where(and(eq(simSurveyReports.id, id), eq(simSurveyReports.tenantId, tenantId), isNull(simSurveyReports.deletedAt))).limit(1);
  return record ?? null;
}
