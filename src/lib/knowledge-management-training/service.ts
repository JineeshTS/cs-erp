import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  kmtSopLibraries,
  kmtTrainingModules,
  kmtCompetencyAssessments,
  kmtOnboardingWorkflows,
  kmtKnowledgeAssistants,
  kmtRegulatoryAlerts,
  kmtLessonsLearned,
  kmtVideoLibraries,
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
// SOP Library & Process Documentation
// ==========================================
export async function listSopLibraries({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(kmtSopLibraries.tenantId, tenantId), isNull(kmtSopLibraries.deletedAt)];
  if (search) conditions.push(or(ilike(kmtSopLibraries.sopRef, `%${search}%`), ilike(kmtSopLibraries.title, `%${search}%`))!);
  if (status) conditions.push(eq(kmtSopLibraries.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(kmtSopLibraries.createdAt, kmtSopLibraries.id, cc)); }
  const results = await db.select().from(kmtSopLibraries).where(and(...conditions)).orderBy(desc(kmtSopLibraries.createdAt), desc(kmtSopLibraries.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getSopLibrary(id: string, tenantId: string) {
  const [record] = await db.select().from(kmtSopLibraries).where(and(eq(kmtSopLibraries.id, id), eq(kmtSopLibraries.tenantId, tenantId), isNull(kmtSopLibraries.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Training Module Creation & Management
// ==========================================
export async function listTrainingModules({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(kmtTrainingModules.tenantId, tenantId), isNull(kmtTrainingModules.deletedAt)];
  if (search) conditions.push(or(ilike(kmtTrainingModules.moduleRef, `%${search}%`), ilike(kmtTrainingModules.title, `%${search}%`))!);
  if (status) conditions.push(eq(kmtTrainingModules.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(kmtTrainingModules.createdAt, kmtTrainingModules.id, cc)); }
  const results = await db.select().from(kmtTrainingModules).where(and(...conditions)).orderBy(desc(kmtTrainingModules.createdAt), desc(kmtTrainingModules.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getTrainingModule(id: string, tenantId: string) {
  const [record] = await db.select().from(kmtTrainingModules).where(and(eq(kmtTrainingModules.id, id), eq(kmtTrainingModules.tenantId, tenantId), isNull(kmtTrainingModules.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Staff Competency Assessment
// ==========================================
export async function listCompetencyAssessments({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(kmtCompetencyAssessments.tenantId, tenantId), isNull(kmtCompetencyAssessments.deletedAt)];
  if (search) conditions.push(or(ilike(kmtCompetencyAssessments.assessmentRef, `%${search}%`), ilike(kmtCompetencyAssessments.employeeName, `%${search}%`))!);
  if (status) conditions.push(eq(kmtCompetencyAssessments.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(kmtCompetencyAssessments.createdAt, kmtCompetencyAssessments.id, cc)); }
  const results = await db.select().from(kmtCompetencyAssessments).where(and(...conditions)).orderBy(desc(kmtCompetencyAssessments.createdAt), desc(kmtCompetencyAssessments.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getCompetencyAssessment(id: string, tenantId: string) {
  const [record] = await db.select().from(kmtCompetencyAssessments).where(and(eq(kmtCompetencyAssessments.id, id), eq(kmtCompetencyAssessments.tenantId, tenantId), isNull(kmtCompetencyAssessments.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Employee Onboarding Workflow Automation
// ==========================================
export async function listOnboardingWorkflows({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(kmtOnboardingWorkflows.tenantId, tenantId), isNull(kmtOnboardingWorkflows.deletedAt)];
  if (search) conditions.push(or(ilike(kmtOnboardingWorkflows.workflowRef, `%${search}%`), ilike(kmtOnboardingWorkflows.employeeName, `%${search}%`))!);
  if (status) conditions.push(eq(kmtOnboardingWorkflows.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(kmtOnboardingWorkflows.createdAt, kmtOnboardingWorkflows.id, cc)); }
  const results = await db.select().from(kmtOnboardingWorkflows).where(and(...conditions)).orderBy(desc(kmtOnboardingWorkflows.createdAt), desc(kmtOnboardingWorkflows.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getOnboardingWorkflow(id: string, tenantId: string) {
  const [record] = await db.select().from(kmtOnboardingWorkflows).where(and(eq(kmtOnboardingWorkflows.id, id), eq(kmtOnboardingWorkflows.tenantId, tenantId), isNull(kmtOnboardingWorkflows.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// AI Knowledge Assistant & Search
// ==========================================
export async function listKnowledgeAssistants({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(kmtKnowledgeAssistants.tenantId, tenantId), isNull(kmtKnowledgeAssistants.deletedAt)];
  if (search) conditions.push(or(ilike(kmtKnowledgeAssistants.assistantRef, `%${search}%`), ilike(kmtKnowledgeAssistants.query, `%${search}%`))!);
  if (status) conditions.push(eq(kmtKnowledgeAssistants.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(kmtKnowledgeAssistants.createdAt, kmtKnowledgeAssistants.id, cc)); }
  const results = await db.select().from(kmtKnowledgeAssistants).where(and(...conditions)).orderBy(desc(kmtKnowledgeAssistants.createdAt), desc(kmtKnowledgeAssistants.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getKnowledgeAssistant(id: string, tenantId: string) {
  const [record] = await db.select().from(kmtKnowledgeAssistants).where(and(eq(kmtKnowledgeAssistants.id, id), eq(kmtKnowledgeAssistants.tenantId, tenantId), isNull(kmtKnowledgeAssistants.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Regulatory Update Alert Management
// ==========================================
export async function listRegulatoryAlerts({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(kmtRegulatoryAlerts.tenantId, tenantId), isNull(kmtRegulatoryAlerts.deletedAt)];
  if (search) conditions.push(or(ilike(kmtRegulatoryAlerts.alertRef, `%${search}%`), ilike(kmtRegulatoryAlerts.title, `%${search}%`))!);
  if (status) conditions.push(eq(kmtRegulatoryAlerts.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(kmtRegulatoryAlerts.createdAt, kmtRegulatoryAlerts.id, cc)); }
  const results = await db.select().from(kmtRegulatoryAlerts).where(and(...conditions)).orderBy(desc(kmtRegulatoryAlerts.createdAt), desc(kmtRegulatoryAlerts.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getRegulatoryAlert(id: string, tenantId: string) {
  const [record] = await db.select().from(kmtRegulatoryAlerts).where(and(eq(kmtRegulatoryAlerts.id, id), eq(kmtRegulatoryAlerts.tenantId, tenantId), isNull(kmtRegulatoryAlerts.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Lessons Learned Repository
// ==========================================
export async function listLessonsLearned({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(kmtLessonsLearned.tenantId, tenantId), isNull(kmtLessonsLearned.deletedAt)];
  if (search) conditions.push(or(ilike(kmtLessonsLearned.lessonRef, `%${search}%`), ilike(kmtLessonsLearned.title, `%${search}%`))!);
  if (status) conditions.push(eq(kmtLessonsLearned.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(kmtLessonsLearned.createdAt, kmtLessonsLearned.id, cc)); }
  const results = await db.select().from(kmtLessonsLearned).where(and(...conditions)).orderBy(desc(kmtLessonsLearned.createdAt), desc(kmtLessonsLearned.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getLessonLearned(id: string, tenantId: string) {
  const [record] = await db.select().from(kmtLessonsLearned).where(and(eq(kmtLessonsLearned.id, id), eq(kmtLessonsLearned.tenantId, tenantId), isNull(kmtLessonsLearned.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Video Training Library Management
// ==========================================
export async function listVideoLibraries({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(kmtVideoLibraries.tenantId, tenantId), isNull(kmtVideoLibraries.deletedAt)];
  if (search) conditions.push(or(ilike(kmtVideoLibraries.videoRef, `%${search}%`), ilike(kmtVideoLibraries.title, `%${search}%`))!);
  if (status) conditions.push(eq(kmtVideoLibraries.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(kmtVideoLibraries.createdAt, kmtVideoLibraries.id, cc)); }
  const results = await db.select().from(kmtVideoLibraries).where(and(...conditions)).orderBy(desc(kmtVideoLibraries.createdAt), desc(kmtVideoLibraries.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getVideoLibrary(id: string, tenantId: string) {
  const [record] = await db.select().from(kmtVideoLibraries).where(and(eq(kmtVideoLibraries.id, id), eq(kmtVideoLibraries.tenantId, tenantId), isNull(kmtVideoLibraries.deletedAt))).limit(1);
  return record ?? null;
}
