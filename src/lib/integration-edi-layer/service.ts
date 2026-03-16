import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  ielIntegrationConnections,
  ielIntegrationEndpoints,
  ielOracleSyncJobs,
  ielOracleSyncMappings,
  ielEdiMessages,
  ielEdiMessageSegments,
  ielEdiProcessingLogs,
  ielPortConnectMessages,
  ielCustomsFilings,
  ielCustomsResponses,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Integration Connections
// ==========================================

export async function listConnections({ tenantId, search, status, cursor, limit = 50 }: ListParams & { connectionType?: string }, connectionType?: string) {
  const conditions = [eq(ielIntegrationConnections.tenantId, tenantId), isNull(ielIntegrationConnections.deletedAt)];
  if (search) conditions.push(or(ilike(ielIntegrationConnections.connectionName, `%${search}%`), ilike(ielIntegrationConnections.connectionCode, `%${search}%`))!);
  if (status) conditions.push(eq(ielIntegrationConnections.status, status));
  if (connectionType) conditions.push(eq(ielIntegrationConnections.connectionType, connectionType));
  if (cursor) conditions.push(lt(ielIntegrationConnections.createdAt, new Date(cursor)));

  const results = await db.select().from(ielIntegrationConnections).where(and(...conditions)).orderBy(desc(ielIntegrationConnections.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getConnection(id: string, tenantId: string) {
  const [record] = await db.select().from(ielIntegrationConnections).where(and(eq(ielIntegrationConnections.id, id), eq(ielIntegrationConnections.tenantId, tenantId), isNull(ielIntegrationConnections.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Integration Endpoints
// ==========================================

export async function listEndpoints({ tenantId, search, cursor, limit = 50 }: ListParams, connectionId?: string) {
  const conditions = [eq(ielIntegrationEndpoints.tenantId, tenantId), isNull(ielIntegrationEndpoints.deletedAt)];
  if (connectionId) conditions.push(eq(ielIntegrationEndpoints.connectionId, connectionId));
  if (search) conditions.push(ilike(ielIntegrationEndpoints.endpointName, `%${search}%`));
  if (cursor) conditions.push(lt(ielIntegrationEndpoints.createdAt, new Date(cursor)));

  const results = await db.select().from(ielIntegrationEndpoints).where(and(...conditions)).orderBy(desc(ielIntegrationEndpoints.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getEndpoint(id: string, tenantId: string) {
  const [record] = await db.select().from(ielIntegrationEndpoints).where(and(eq(ielIntegrationEndpoints.id, id), eq(ielIntegrationEndpoints.tenantId, tenantId), isNull(ielIntegrationEndpoints.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Oracle Sync Jobs
// ==========================================

export async function listOracleSyncJobs({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ielOracleSyncJobs.tenantId, tenantId), isNull(ielOracleSyncJobs.deletedAt)];
  if (search) conditions.push(ilike(ielOracleSyncJobs.jobCode, `%${search}%`));
  if (status) conditions.push(eq(ielOracleSyncJobs.status, status));
  if (cursor) conditions.push(lt(ielOracleSyncJobs.createdAt, new Date(cursor)));

  const results = await db.select().from(ielOracleSyncJobs).where(and(...conditions)).orderBy(desc(ielOracleSyncJobs.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getOracleSyncJob(id: string, tenantId: string) {
  const [record] = await db.select().from(ielOracleSyncJobs).where(and(eq(ielOracleSyncJobs.id, id), eq(ielOracleSyncJobs.tenantId, tenantId), isNull(ielOracleSyncJobs.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Oracle Sync Mappings
// ==========================================

export async function listOracleSyncMappings(tenantId: string, jobId?: string) {
  const conditions = [eq(ielOracleSyncMappings.tenantId, tenantId), isNull(ielOracleSyncMappings.deletedAt)];
  if (jobId) conditions.push(eq(ielOracleSyncMappings.jobId, jobId));

  return db.select().from(ielOracleSyncMappings).where(and(...conditions)).orderBy(desc(ielOracleSyncMappings.createdAt));
}

// ==========================================
// EDI Messages
// ==========================================

export async function listEdiMessages({ tenantId, search, status, cursor, limit = 50 }: ListParams & { messageType?: string; direction?: string }, messageType?: string, direction?: string) {
  const conditions = [eq(ielEdiMessages.tenantId, tenantId), isNull(ielEdiMessages.deletedAt)];
  if (search) conditions.push(or(ilike(ielEdiMessages.messageRef, `%${search}%`), ilike(ielEdiMessages.senderCode, `%${search}%`))!);
  if (status) conditions.push(eq(ielEdiMessages.status, status));
  if (messageType) conditions.push(eq(ielEdiMessages.messageType, messageType));
  if (direction) conditions.push(eq(ielEdiMessages.direction, direction));
  if (cursor) conditions.push(lt(ielEdiMessages.createdAt, new Date(cursor)));

  const results = await db.select().from(ielEdiMessages).where(and(...conditions)).orderBy(desc(ielEdiMessages.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getEdiMessage(id: string, tenantId: string) {
  const [record] = await db.select().from(ielEdiMessages).where(and(eq(ielEdiMessages.id, id), eq(ielEdiMessages.tenantId, tenantId), isNull(ielEdiMessages.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// EDI Message Segments
// ==========================================

export async function listEdiMessageSegments(tenantId: string, messageId: string) {
  return db.select().from(ielEdiMessageSegments).where(and(eq(ielEdiMessageSegments.tenantId, tenantId), eq(ielEdiMessageSegments.messageId, messageId), isNull(ielEdiMessageSegments.deletedAt))).orderBy(ielEdiMessageSegments.segmentIndex);
}

// ==========================================
// EDI Processing Logs
// ==========================================

export async function listEdiProcessingLogs(tenantId: string, messageId?: string, limit = 100) {
  const conditions = [eq(ielEdiProcessingLogs.tenantId, tenantId), isNull(ielEdiProcessingLogs.deletedAt)];
  if (messageId) conditions.push(eq(ielEdiProcessingLogs.messageId, messageId));

  return db.select().from(ielEdiProcessingLogs).where(and(...conditions)).orderBy(desc(ielEdiProcessingLogs.createdAt)).limit(limit);
}

// ==========================================
// Port Connect Messages
// ==========================================

export async function listPortConnectMessages({ tenantId, search, status, cursor, limit = 50 }: ListParams & { messageType?: string; direction?: string }, messageType?: string, direction?: string) {
  const conditions = [eq(ielPortConnectMessages.tenantId, tenantId), isNull(ielPortConnectMessages.deletedAt)];
  if (search) conditions.push(or(ilike(ielPortConnectMessages.messageRef, `%${search}%`), ilike(ielPortConnectMessages.portCode, `%${search}%`))!);
  if (status) conditions.push(eq(ielPortConnectMessages.status, status));
  if (messageType) conditions.push(eq(ielPortConnectMessages.messageType, messageType));
  if (direction) conditions.push(eq(ielPortConnectMessages.direction, direction));
  if (cursor) conditions.push(lt(ielPortConnectMessages.createdAt, new Date(cursor)));

  const results = await db.select().from(ielPortConnectMessages).where(and(...conditions)).orderBy(desc(ielPortConnectMessages.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPortConnectMessage(id: string, tenantId: string) {
  const [record] = await db.select().from(ielPortConnectMessages).where(and(eq(ielPortConnectMessages.id, id), eq(ielPortConnectMessages.tenantId, tenantId), isNull(ielPortConnectMessages.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Customs Filings
// ==========================================

export async function listCustomsFilings({ tenantId, search, status, cursor, limit = 50 }: ListParams & { filingType?: string; customsAuthority?: string }, filingType?: string, customsAuthority?: string) {
  const conditions = [eq(ielCustomsFilings.tenantId, tenantId), isNull(ielCustomsFilings.deletedAt)];
  if (search) conditions.push(or(ilike(ielCustomsFilings.filingRef, `%${search}%`), ilike(ielCustomsFilings.hsCode ?? "", `%${search}%`))!);
  if (status) conditions.push(eq(ielCustomsFilings.status, status));
  if (filingType) conditions.push(eq(ielCustomsFilings.filingType, filingType));
  if (customsAuthority) conditions.push(eq(ielCustomsFilings.customsAuthority, customsAuthority));
  if (cursor) conditions.push(lt(ielCustomsFilings.createdAt, new Date(cursor)));

  const results = await db.select().from(ielCustomsFilings).where(and(...conditions)).orderBy(desc(ielCustomsFilings.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCustomsFiling(id: string, tenantId: string) {
  const [record] = await db.select().from(ielCustomsFilings).where(and(eq(ielCustomsFilings.id, id), eq(ielCustomsFilings.tenantId, tenantId), isNull(ielCustomsFilings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Customs Responses
// ==========================================

export async function listCustomsResponses(tenantId: string, filingId: string) {
  return db.select().from(ielCustomsResponses).where(and(eq(ielCustomsResponses.tenantId, tenantId), eq(ielCustomsResponses.filingId, filingId), isNull(ielCustomsResponses.deletedAt))).orderBy(desc(ielCustomsResponses.createdAt));
}

export async function getCustomsResponse(id: string, tenantId: string) {
  const [record] = await db.select().from(ielCustomsResponses).where(and(eq(ielCustomsResponses.id, id), eq(ielCustomsResponses.tenantId, tenantId), isNull(ielCustomsResponses.deletedAt))).limit(1);
  return record ?? null;
}
