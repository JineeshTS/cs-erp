import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  icmProjectPlans,
  icmDataMigrations,
  icmUatManagements,
  icmGoLiveChecklists,
  icmChangeRequests,
  icmSystemConfigs,
  icmTrainingCompletions,
  icmHypercareSupports,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Project Plan & Milestone Tracking
// ==========================================
export async function listProjectPlans({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(icmProjectPlans.tenantId, tenantId), isNull(icmProjectPlans.deletedAt)];
  if (search) conditions.push(or(ilike(icmProjectPlans.planRef, `%${search}%`), ilike(icmProjectPlans.title, `%${search}%`))!);
  if (status) conditions.push(eq(icmProjectPlans.status, status));
  if (cursor) conditions.push(lt(icmProjectPlans.createdAt, new Date(cursor)));
  const results = await db.select().from(icmProjectPlans).where(and(...conditions)).orderBy(desc(icmProjectPlans.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getProjectPlan(id: string, tenantId: string) {
  const [record] = await db.select().from(icmProjectPlans).where(and(eq(icmProjectPlans.id, id), eq(icmProjectPlans.tenantId, tenantId), isNull(icmProjectPlans.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Data Migration Strategy & Tooling
// ==========================================
export async function listDataMigrations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(icmDataMigrations.tenantId, tenantId), isNull(icmDataMigrations.deletedAt)];
  if (search) conditions.push(or(ilike(icmDataMigrations.migrationRef, `%${search}%`), ilike(icmDataMigrations.title, `%${search}%`))!);
  if (status) conditions.push(eq(icmDataMigrations.status, status));
  if (cursor) conditions.push(lt(icmDataMigrations.createdAt, new Date(cursor)));
  const results = await db.select().from(icmDataMigrations).where(and(...conditions)).orderBy(desc(icmDataMigrations.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getDataMigration(id: string, tenantId: string) {
  const [record] = await db.select().from(icmDataMigrations).where(and(eq(icmDataMigrations.id, id), eq(icmDataMigrations.tenantId, tenantId), isNull(icmDataMigrations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// User Acceptance Testing UAT Management
// ==========================================
export async function listUatManagements({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(icmUatManagements.tenantId, tenantId), isNull(icmUatManagements.deletedAt)];
  if (search) conditions.push(or(ilike(icmUatManagements.uatRef, `%${search}%`), ilike(icmUatManagements.title, `%${search}%`))!);
  if (status) conditions.push(eq(icmUatManagements.status, status));
  if (cursor) conditions.push(lt(icmUatManagements.createdAt, new Date(cursor)));
  const results = await db.select().from(icmUatManagements).where(and(...conditions)).orderBy(desc(icmUatManagements.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getUatManagement(id: string, tenantId: string) {
  const [record] = await db.select().from(icmUatManagements).where(and(eq(icmUatManagements.id, id), eq(icmUatManagements.tenantId, tenantId), isNull(icmUatManagements.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Go-Live Readiness Checklist
// ==========================================
export async function listGoLiveChecklists({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(icmGoLiveChecklists.tenantId, tenantId), isNull(icmGoLiveChecklists.deletedAt)];
  if (search) conditions.push(or(ilike(icmGoLiveChecklists.checklistRef, `%${search}%`), ilike(icmGoLiveChecklists.title, `%${search}%`))!);
  if (status) conditions.push(eq(icmGoLiveChecklists.status, status));
  if (cursor) conditions.push(lt(icmGoLiveChecklists.createdAt, new Date(cursor)));
  const results = await db.select().from(icmGoLiveChecklists).where(and(...conditions)).orderBy(desc(icmGoLiveChecklists.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getGoLiveChecklist(id: string, tenantId: string) {
  const [record] = await db.select().from(icmGoLiveChecklists).where(and(eq(icmGoLiveChecklists.id, id), eq(icmGoLiveChecklists.tenantId, tenantId), isNull(icmGoLiveChecklists.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Change Request Management Workflow
// ==========================================
export async function listChangeRequests({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(icmChangeRequests.tenantId, tenantId), isNull(icmChangeRequests.deletedAt)];
  if (search) conditions.push(or(ilike(icmChangeRequests.changeRef, `%${search}%`), ilike(icmChangeRequests.title, `%${search}%`))!);
  if (status) conditions.push(eq(icmChangeRequests.status, status));
  if (cursor) conditions.push(lt(icmChangeRequests.createdAt, new Date(cursor)));
  const results = await db.select().from(icmChangeRequests).where(and(...conditions)).orderBy(desc(icmChangeRequests.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getChangeRequest(id: string, tenantId: string) {
  const [record] = await db.select().from(icmChangeRequests).where(and(eq(icmChangeRequests.id, id), eq(icmChangeRequests.tenantId, tenantId), isNull(icmChangeRequests.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// System Configuration Management
// ==========================================
export async function listSystemConfigs({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(icmSystemConfigs.tenantId, tenantId), isNull(icmSystemConfigs.deletedAt)];
  if (search) conditions.push(or(ilike(icmSystemConfigs.configRef, `%${search}%`), ilike(icmSystemConfigs.title, `%${search}%`))!);
  if (status) conditions.push(eq(icmSystemConfigs.status, status));
  if (cursor) conditions.push(lt(icmSystemConfigs.createdAt, new Date(cursor)));
  const results = await db.select().from(icmSystemConfigs).where(and(...conditions)).orderBy(desc(icmSystemConfigs.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getSystemConfig(id: string, tenantId: string) {
  const [record] = await db.select().from(icmSystemConfigs).where(and(eq(icmSystemConfigs.id, id), eq(icmSystemConfigs.tenantId, tenantId), isNull(icmSystemConfigs.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// User Training Completion Tracking
// ==========================================
export async function listTrainingCompletions({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(icmTrainingCompletions.tenantId, tenantId), isNull(icmTrainingCompletions.deletedAt)];
  if (search) conditions.push(or(ilike(icmTrainingCompletions.completionRef, `%${search}%`), ilike(icmTrainingCompletions.employeeName, `%${search}%`))!);
  if (status) conditions.push(eq(icmTrainingCompletions.status, status));
  if (cursor) conditions.push(lt(icmTrainingCompletions.createdAt, new Date(cursor)));
  const results = await db.select().from(icmTrainingCompletions).where(and(...conditions)).orderBy(desc(icmTrainingCompletions.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getTrainingCompletion(id: string, tenantId: string) {
  const [record] = await db.select().from(icmTrainingCompletions).where(and(eq(icmTrainingCompletions.id, id), eq(icmTrainingCompletions.tenantId, tenantId), isNull(icmTrainingCompletions.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Post-Go-Live Hypercare Support
// ==========================================
export async function listHypercareSupports({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(icmHypercareSupports.tenantId, tenantId), isNull(icmHypercareSupports.deletedAt)];
  if (search) conditions.push(or(ilike(icmHypercareSupports.supportRef, `%${search}%`), ilike(icmHypercareSupports.title, `%${search}%`))!);
  if (status) conditions.push(eq(icmHypercareSupports.status, status));
  if (cursor) conditions.push(lt(icmHypercareSupports.createdAt, new Date(cursor)));
  const results = await db.select().from(icmHypercareSupports).where(and(...conditions)).orderBy(desc(icmHypercareSupports.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getHypercareSupport(id: string, tenantId: string) {
  const [record] = await db.select().from(icmHypercareSupports).where(and(eq(icmHypercareSupports.id, id), eq(icmHypercareSupports.tenantId, tenantId), isNull(icmHypercareSupports.deletedAt))).limit(1);
  return record ?? null;
}
