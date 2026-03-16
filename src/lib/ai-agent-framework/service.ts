import { and, eq, ilike, isNull, lt, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  aafAgents,
  aafAgentRuns,
  aafOrchestrationTasks,
  aafDocumentProcessingJobs,
  aafWorkflowDefinitions,
  aafWorkflowInstances,
  aafEscalations,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Agents
// ==========================================

export async function listAgents({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(aafAgents.tenantId, tenantId), isNull(aafAgents.deletedAt)];
  if (search) conditions.push(ilike(aafAgents.agentName, `%${search}%`));
  if (status) conditions.push(eq(aafAgents.status, status));
  if (cursor) conditions.push(lt(aafAgents.createdAt, new Date(cursor)));

  const results = await db.select().from(aafAgents).where(and(...conditions)).orderBy(desc(aafAgents.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getAgent(id: string, tenantId: string) {
  const [record] = await db.select().from(aafAgents).where(and(eq(aafAgents.id, id), eq(aafAgents.tenantId, tenantId), isNull(aafAgents.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Agent Runs
// ==========================================

export async function listAgentRuns({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(aafAgentRuns.tenantId, tenantId), isNull(aafAgentRuns.deletedAt)];
  if (search) conditions.push(ilike(aafAgentRuns.runNumber, `%${search}%`));
  if (status) conditions.push(eq(aafAgentRuns.status, status));
  if (cursor) conditions.push(lt(aafAgentRuns.createdAt, new Date(cursor)));

  const results = await db.select().from(aafAgentRuns).where(and(...conditions)).orderBy(desc(aafAgentRuns.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getAgentRun(id: string, tenantId: string) {
  const [record] = await db.select().from(aafAgentRuns).where(and(eq(aafAgentRuns.id, id), eq(aafAgentRuns.tenantId, tenantId), isNull(aafAgentRuns.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Orchestration Tasks
// ==========================================

export async function listOrchestrationTasks({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(aafOrchestrationTasks.tenantId, tenantId), isNull(aafOrchestrationTasks.deletedAt)];
  if (search) conditions.push(ilike(aafOrchestrationTasks.taskName, `%${search}%`));
  if (status) conditions.push(eq(aafOrchestrationTasks.status, status));
  if (cursor) conditions.push(lt(aafOrchestrationTasks.createdAt, new Date(cursor)));

  const results = await db.select().from(aafOrchestrationTasks).where(and(...conditions)).orderBy(desc(aafOrchestrationTasks.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getOrchestrationTask(id: string, tenantId: string) {
  const [record] = await db.select().from(aafOrchestrationTasks).where(and(eq(aafOrchestrationTasks.id, id), eq(aafOrchestrationTasks.tenantId, tenantId), isNull(aafOrchestrationTasks.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Document Processing Jobs
// ==========================================

export async function listDocumentProcessingJobs({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(aafDocumentProcessingJobs.tenantId, tenantId), isNull(aafDocumentProcessingJobs.deletedAt)];
  if (search) conditions.push(ilike(aafDocumentProcessingJobs.jobReference, `%${search}%`));
  if (status) conditions.push(eq(aafDocumentProcessingJobs.status, status));
  if (cursor) conditions.push(lt(aafDocumentProcessingJobs.createdAt, new Date(cursor)));

  const results = await db.select().from(aafDocumentProcessingJobs).where(and(...conditions)).orderBy(desc(aafDocumentProcessingJobs.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getDocumentProcessingJob(id: string, tenantId: string) {
  const [record] = await db.select().from(aafDocumentProcessingJobs).where(and(eq(aafDocumentProcessingJobs.id, id), eq(aafDocumentProcessingJobs.tenantId, tenantId), isNull(aafDocumentProcessingJobs.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Workflow Definitions
// ==========================================

export async function listWorkflowDefinitions({ tenantId, search, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(aafWorkflowDefinitions.tenantId, tenantId), isNull(aafWorkflowDefinitions.deletedAt)];
  if (search) conditions.push(ilike(aafWorkflowDefinitions.workflowName, `%${search}%`));
  if (cursor) conditions.push(lt(aafWorkflowDefinitions.createdAt, new Date(cursor)));

  const results = await db.select().from(aafWorkflowDefinitions).where(and(...conditions)).orderBy(desc(aafWorkflowDefinitions.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getWorkflowDefinition(id: string, tenantId: string) {
  const [record] = await db.select().from(aafWorkflowDefinitions).where(and(eq(aafWorkflowDefinitions.id, id), eq(aafWorkflowDefinitions.tenantId, tenantId), isNull(aafWorkflowDefinitions.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Workflow Instances
// ==========================================

export async function listWorkflowInstances({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(aafWorkflowInstances.tenantId, tenantId), isNull(aafWorkflowInstances.deletedAt)];
  if (search) conditions.push(ilike(aafWorkflowInstances.instanceRef, `%${search}%`));
  if (status) conditions.push(eq(aafWorkflowInstances.status, status));
  if (cursor) conditions.push(lt(aafWorkflowInstances.createdAt, new Date(cursor)));

  const results = await db.select().from(aafWorkflowInstances).where(and(...conditions)).orderBy(desc(aafWorkflowInstances.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getWorkflowInstance(id: string, tenantId: string) {
  const [record] = await db.select().from(aafWorkflowInstances).where(and(eq(aafWorkflowInstances.id, id), eq(aafWorkflowInstances.tenantId, tenantId), isNull(aafWorkflowInstances.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Escalations
// ==========================================

export async function listEscalations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(aafEscalations.tenantId, tenantId), isNull(aafEscalations.deletedAt)];
  if (search) conditions.push(ilike(aafEscalations.escalationRef, `%${search}%`));
  if (status) conditions.push(eq(aafEscalations.status, status));
  if (cursor) conditions.push(lt(aafEscalations.createdAt, new Date(cursor)));

  const results = await db.select().from(aafEscalations).where(and(...conditions)).orderBy(desc(aafEscalations.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getEscalation(id: string, tenantId: string) {
  const [record] = await db.select().from(aafEscalations).where(and(eq(aafEscalations.id, id), eq(aafEscalations.tenantId, tenantId), isNull(aafEscalations.deletedAt))).limit(1);
  return record ?? null;
}
