import { and, eq, ilike, isNull, lt, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  isfK8sClusters,
  isfK8sNamespaces,
  isfDeploymentConfigs,
  isfIamPolicies,
  isfServiceAccounts,
  isfApiKeys,
  isfJitAccessRequests,
  isfEncryptionKeys,
  isfKeyRotationLog,
  isfAuditEvents,
  isfComplianceReports,
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
// K8s Clusters
// ==========================================

export async function listClusters({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(isfK8sClusters.tenantId, tenantId), isNull(isfK8sClusters.deletedAt)];
  if (search) conditions.push(ilike(isfK8sClusters.clusterName, `%${search}%`));
  if (status) conditions.push(eq(isfK8sClusters.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(isfK8sClusters.createdAt, isfK8sClusters.id, cc)); }

  const results = await db.select().from(isfK8sClusters).where(and(...conditions)).orderBy(desc(isfK8sClusters.createdAt), desc(isfK8sClusters.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getCluster(id: string, tenantId: string) {
  const [record] = await db.select().from(isfK8sClusters).where(and(eq(isfK8sClusters.id, id), eq(isfK8sClusters.tenantId, tenantId), isNull(isfK8sClusters.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// K8s Namespaces
// ==========================================

export async function listNamespaces({ tenantId, search, status, cursor, limit = 50 }: ListParams & { clusterId?: string }, clusterId?: string) {
  const conditions = [eq(isfK8sNamespaces.tenantId, tenantId), isNull(isfK8sNamespaces.deletedAt)];
  if (clusterId) conditions.push(eq(isfK8sNamespaces.clusterId, clusterId));
  if (search) conditions.push(ilike(isfK8sNamespaces.namespaceName, `%${search}%`));
  if (status) conditions.push(eq(isfK8sNamespaces.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(isfK8sNamespaces.createdAt, isfK8sNamespaces.id, cc)); }

  const results = await db.select().from(isfK8sNamespaces).where(and(...conditions)).orderBy(desc(isfK8sNamespaces.createdAt), desc(isfK8sNamespaces.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getNamespace(id: string, tenantId: string) {
  const [record] = await db.select().from(isfK8sNamespaces).where(and(eq(isfK8sNamespaces.id, id), eq(isfK8sNamespaces.tenantId, tenantId), isNull(isfK8sNamespaces.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Deployment Configs
// ==========================================

export async function listDeployments({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(isfDeploymentConfigs.tenantId, tenantId), isNull(isfDeploymentConfigs.deletedAt)];
  if (search) conditions.push(ilike(isfDeploymentConfigs.deploymentName, `%${search}%`));
  if (status) conditions.push(eq(isfDeploymentConfigs.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(isfDeploymentConfigs.createdAt, isfDeploymentConfigs.id, cc)); }

  const results = await db.select().from(isfDeploymentConfigs).where(and(...conditions)).orderBy(desc(isfDeploymentConfigs.createdAt), desc(isfDeploymentConfigs.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getDeployment(id: string, tenantId: string) {
  const [record] = await db.select().from(isfDeploymentConfigs).where(and(eq(isfDeploymentConfigs.id, id), eq(isfDeploymentConfigs.tenantId, tenantId), isNull(isfDeploymentConfigs.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// IAM Policies
// ==========================================

export async function listIamPolicies({ tenantId, search, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(isfIamPolicies.tenantId, tenantId), isNull(isfIamPolicies.deletedAt)];
  if (search) conditions.push(ilike(isfIamPolicies.policyName, `%${search}%`));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(isfIamPolicies.createdAt, isfIamPolicies.id, cc)); }

  const results = await db.select().from(isfIamPolicies).where(and(...conditions)).orderBy(desc(isfIamPolicies.createdAt), desc(isfIamPolicies.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getIamPolicy(id: string, tenantId: string) {
  const [record] = await db.select().from(isfIamPolicies).where(and(eq(isfIamPolicies.id, id), eq(isfIamPolicies.tenantId, tenantId), isNull(isfIamPolicies.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Service Accounts
// ==========================================

export async function listServiceAccounts({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(isfServiceAccounts.tenantId, tenantId), isNull(isfServiceAccounts.deletedAt)];
  if (search) conditions.push(ilike(isfServiceAccounts.accountName, `%${search}%`));
  if (status) conditions.push(eq(isfServiceAccounts.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(isfServiceAccounts.createdAt, isfServiceAccounts.id, cc)); }

  const results = await db.select().from(isfServiceAccounts).where(and(...conditions)).orderBy(desc(isfServiceAccounts.createdAt), desc(isfServiceAccounts.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getServiceAccount(id: string, tenantId: string) {
  const [record] = await db.select().from(isfServiceAccounts).where(and(eq(isfServiceAccounts.id, id), eq(isfServiceAccounts.tenantId, tenantId), isNull(isfServiceAccounts.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// API Keys
// ==========================================

export async function listApiKeys({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(isfApiKeys.tenantId, tenantId), isNull(isfApiKeys.deletedAt)];
  if (search) conditions.push(ilike(isfApiKeys.keyName, `%${search}%`));
  if (status) conditions.push(eq(isfApiKeys.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(isfApiKeys.createdAt, isfApiKeys.id, cc)); }

  const results = await db.select().from(isfApiKeys).where(and(...conditions)).orderBy(desc(isfApiKeys.createdAt), desc(isfApiKeys.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getApiKeyRecord(id: string, tenantId: string) {
  const [record] = await db.select().from(isfApiKeys).where(and(eq(isfApiKeys.id, id), eq(isfApiKeys.tenantId, tenantId), isNull(isfApiKeys.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// JIT Access Requests
// ==========================================

export async function listJitAccessRequests({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(isfJitAccessRequests.tenantId, tenantId), isNull(isfJitAccessRequests.deletedAt)];
  if (search) conditions.push(ilike(isfJitAccessRequests.requestRef, `%${search}%`));
  if (status) conditions.push(eq(isfJitAccessRequests.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(isfJitAccessRequests.createdAt, isfJitAccessRequests.id, cc)); }

  const results = await db.select().from(isfJitAccessRequests).where(and(...conditions)).orderBy(desc(isfJitAccessRequests.createdAt), desc(isfJitAccessRequests.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

// ==========================================
// Encryption Keys
// ==========================================

export async function listEncryptionKeys({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(isfEncryptionKeys.tenantId, tenantId), isNull(isfEncryptionKeys.deletedAt)];
  if (search) conditions.push(ilike(isfEncryptionKeys.keyName, `%${search}%`));
  if (status) conditions.push(eq(isfEncryptionKeys.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(isfEncryptionKeys.createdAt, isfEncryptionKeys.id, cc)); }

  const results = await db.select().from(isfEncryptionKeys).where(and(...conditions)).orderBy(desc(isfEncryptionKeys.createdAt), desc(isfEncryptionKeys.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getEncryptionKey(id: string, tenantId: string) {
  const [record] = await db.select().from(isfEncryptionKeys).where(and(eq(isfEncryptionKeys.id, id), eq(isfEncryptionKeys.tenantId, tenantId), isNull(isfEncryptionKeys.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Key Rotation Log
// ==========================================

export async function listKeyRotationLog({ tenantId, cursor, limit = 50 }: ListParams, keyId?: string) {
  const conditions = [eq(isfKeyRotationLog.tenantId, tenantId), isNull(isfKeyRotationLog.deletedAt)];
  if (keyId) conditions.push(eq(isfKeyRotationLog.keyId, keyId));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(isfKeyRotationLog.createdAt, isfKeyRotationLog.id, cc)); }

  const results = await db.select().from(isfKeyRotationLog).where(and(...conditions)).orderBy(desc(isfKeyRotationLog.createdAt), desc(isfKeyRotationLog.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

// ==========================================
// Audit Events
// ==========================================

export async function listAuditEvents({ tenantId, search, status, cursor, limit = 50 }: ListParams & { eventType?: string }, eventType?: string) {
  const conditions = [eq(isfAuditEvents.tenantId, tenantId), isNull(isfAuditEvents.deletedAt)];
  if (search) conditions.push(ilike(isfAuditEvents.eventCode, `%${search}%`));
  if (eventType) conditions.push(eq(isfAuditEvents.eventType, eventType));
  if (status) conditions.push(eq(isfAuditEvents.severity, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(isfAuditEvents.createdAt, isfAuditEvents.id, cc)); }

  const results = await db.select().from(isfAuditEvents).where(and(...conditions)).orderBy(desc(isfAuditEvents.createdAt), desc(isfAuditEvents.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getAuditEvent(id: string, tenantId: string) {
  const [record] = await db.select().from(isfAuditEvents).where(and(eq(isfAuditEvents.id, id), eq(isfAuditEvents.tenantId, tenantId), isNull(isfAuditEvents.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Compliance Reports
// ==========================================

export async function listComplianceReports({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(isfComplianceReports.tenantId, tenantId), isNull(isfComplianceReports.deletedAt)];
  if (search) conditions.push(ilike(isfComplianceReports.reportName, `%${search}%`));
  if (status) conditions.push(eq(isfComplianceReports.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(isfComplianceReports.createdAt, isfComplianceReports.id, cc)); }

  const results = await db.select().from(isfComplianceReports).where(and(...conditions)).orderBy(desc(isfComplianceReports.createdAt), desc(isfComplianceReports.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getComplianceReport(id: string, tenantId: string) {
  const [record] = await db.select().from(isfComplianceReports).where(and(eq(isfComplianceReports.id, id), eq(isfComplianceReports.tenantId, tenantId), isNull(isfComplianceReports.deletedAt))).limit(1);
  return record ?? null;
}
