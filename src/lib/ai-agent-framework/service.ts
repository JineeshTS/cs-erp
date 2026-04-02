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
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";

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
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(aafAgents.createdAt, aafAgents.id, cc)); }

  const results = await db.select().from(aafAgents).where(and(...conditions)).orderBy(desc(aafAgents.createdAt), desc(aafAgents.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
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
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(aafAgentRuns.createdAt, aafAgentRuns.id, cc)); }

  const results = await db.select().from(aafAgentRuns).where(and(...conditions)).orderBy(desc(aafAgentRuns.createdAt), desc(aafAgentRuns.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
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
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(aafOrchestrationTasks.createdAt, aafOrchestrationTasks.id, cc)); }

  const results = await db.select().from(aafOrchestrationTasks).where(and(...conditions)).orderBy(desc(aafOrchestrationTasks.createdAt), desc(aafOrchestrationTasks.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
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
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(aafDocumentProcessingJobs.createdAt, aafDocumentProcessingJobs.id, cc)); }

  const results = await db.select().from(aafDocumentProcessingJobs).where(and(...conditions)).orderBy(desc(aafDocumentProcessingJobs.createdAt), desc(aafDocumentProcessingJobs.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
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
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(aafWorkflowDefinitions.createdAt, aafWorkflowDefinitions.id, cc)); }

  const results = await db.select().from(aafWorkflowDefinitions).where(and(...conditions)).orderBy(desc(aafWorkflowDefinitions.createdAt), desc(aafWorkflowDefinitions.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
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
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(aafWorkflowInstances.createdAt, aafWorkflowInstances.id, cc)); }

  const results = await db.select().from(aafWorkflowInstances).where(and(...conditions)).orderBy(desc(aafWorkflowInstances.createdAt), desc(aafWorkflowInstances.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
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
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(aafEscalations.createdAt, aafEscalations.id, cc)); }

  const results = await db.select().from(aafEscalations).where(and(...conditions)).orderBy(desc(aafEscalations.createdAt), desc(aafEscalations.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getEscalation(id: string, tenantId: string) {
  const [record] = await db.select().from(aafEscalations).where(and(eq(aafEscalations.id, id), eq(aafEscalations.tenantId, tenantId), isNull(aafEscalations.deletedAt))).limit(1);
  return record ?? null;
}
