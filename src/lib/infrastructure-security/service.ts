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
  if (cursor) conditions.push(lt(isfK8sClusters.createdAt, new Date(cursor)));

  const results = await db.select().from(isfK8sClusters).where(and(...conditions)).orderBy(desc(isfK8sClusters.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
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
  if (cursor) conditions.push(lt(isfK8sNamespaces.createdAt, new Date(cursor)));

  const results = await db.select().from(isfK8sNamespaces).where(and(...conditions)).orderBy(desc(isfK8sNamespaces.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
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
  if (cursor) conditions.push(lt(isfDeploymentConfigs.createdAt, new Date(cursor)));

  const results = await db.select().from(isfDeploymentConfigs).where(and(...conditions)).orderBy(desc(isfDeploymentConfigs.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
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
  if (cursor) conditions.push(lt(isfIamPolicies.createdAt, new Date(cursor)));

  const results = await db.select().from(isfIamPolicies).where(and(...conditions)).orderBy(desc(isfIamPolicies.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
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
  if (cursor) conditions.push(lt(isfServiceAccounts.createdAt, new Date(cursor)));

  const results = await db.select().from(isfServiceAccounts).where(and(...conditions)).orderBy(desc(isfServiceAccounts.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
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
  if (cursor) conditions.push(lt(isfApiKeys.createdAt, new Date(cursor)));

  const results = await db.select().from(isfApiKeys).where(and(...conditions)).orderBy(desc(isfApiKeys.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
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
  if (cursor) conditions.push(lt(isfJitAccessRequests.createdAt, new Date(cursor)));

  const results = await db.select().from(isfJitAccessRequests).where(and(...conditions)).orderBy(desc(isfJitAccessRequests.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

// ==========================================
// Encryption Keys
// ==========================================

export async function listEncryptionKeys({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(isfEncryptionKeys.tenantId, tenantId), isNull(isfEncryptionKeys.deletedAt)];
  if (search) conditions.push(ilike(isfEncryptionKeys.keyName, `%${search}%`));
  if (status) conditions.push(eq(isfEncryptionKeys.status, status));
  if (cursor) conditions.push(lt(isfEncryptionKeys.createdAt, new Date(cursor)));

  const results = await db.select().from(isfEncryptionKeys).where(and(...conditions)).orderBy(desc(isfEncryptionKeys.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
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
  if (cursor) conditions.push(lt(isfKeyRotationLog.createdAt, new Date(cursor)));

  const results = await db.select().from(isfKeyRotationLog).where(and(...conditions)).orderBy(desc(isfKeyRotationLog.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

// ==========================================
// Audit Events
// ==========================================

export async function listAuditEvents({ tenantId, search, status, cursor, limit = 50 }: ListParams & { eventType?: string }, eventType?: string) {
  const conditions = [eq(isfAuditEvents.tenantId, tenantId), isNull(isfAuditEvents.deletedAt)];
  if (search) conditions.push(ilike(isfAuditEvents.eventCode, `%${search}%`));
  if (eventType) conditions.push(eq(isfAuditEvents.eventType, eventType));
  if (status) conditions.push(eq(isfAuditEvents.severity, status));
  if (cursor) conditions.push(lt(isfAuditEvents.createdAt, new Date(cursor)));

  const results = await db.select().from(isfAuditEvents).where(and(...conditions)).orderBy(desc(isfAuditEvents.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
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
  if (cursor) conditions.push(lt(isfComplianceReports.createdAt, new Date(cursor)));

  const results = await db.select().from(isfComplianceReports).where(and(...conditions)).orderBy(desc(isfComplianceReports.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getComplianceReport(id: string, tenantId: string) {
  const [record] = await db.select().from(isfComplianceReports).where(and(eq(isfComplianceReports.id, id), eq(isfComplianceReports.tenantId, tenantId), isNull(isfComplianceReports.deletedAt))).limit(1);
  return record ?? null;
}
