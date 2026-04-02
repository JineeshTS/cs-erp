import { z } from "zod/v4";
import { metadataSchema } from "@/lib/validation";

// ==========================================
// K8s Clusters
// ==========================================

export const createClusterSchema = z.object({
  clusterName: z.string().min(1).max(255),
  clusterCode: z.string().min(1).max(50),
  provider: z.string().min(1).max(50),
  region: z.string().min(1).max(100),
  environment: z.enum(["production", "staging", "development", "testing"]).optional(),
  version: z.string().max(30).optional(),
  endpoint: z.string().max(500).optional(),
  status: z.enum(["active", "inactive", "provisioning", "decommissioned"]).optional(),
  nodeCount: z.number().int().optional(),
  cpuCapacity: z.number().int().optional(),
  memoryCapacityMb: z.number().int().optional(),
  costPerHour: z.number().int().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  tags: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});

export const updateClusterSchema = createClusterSchema.partial();

// ==========================================
// K8s Namespaces
// ==========================================

export const createNamespaceSchema = z.object({
  clusterId: z.string().uuid(),
  namespaceName: z.string().min(1).max(255),
  environment: z.enum(["production", "staging", "development", "testing"]).optional(),
  status: z.enum(["active", "inactive", "terminating"]).optional(),
  resourceQuota: z.record(z.string(), z.unknown()).optional(),
  limitRange: z.record(z.string(), z.unknown()).optional(),
  labels: z.record(z.string(), z.unknown()).optional(),
  annotations: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});

export const updateNamespaceSchema = createNamespaceSchema.partial();

// ==========================================
// Deployment Configs
// ==========================================

export const createDeploymentSchema = z.object({
  clusterId: z.string().uuid(),
  namespaceId: z.string().uuid().optional(),
  deploymentName: z.string().min(1).max(255),
  deploymentCode: z.string().min(1).max(50),
  imageName: z.string().min(1).max(500),
  imageTag: z.string().min(1).max(100),
  replicas: z.number().int().min(0).optional(),
  strategy: z.enum(["rolling", "recreate", "blue_green", "canary"]).optional(),
  status: z.enum(["pending", "deploying", "running", "failed", "stopped"]).optional(),
  cpuRequest: z.number().int().optional(),
  cpuLimit: z.number().int().optional(),
  memoryRequestMb: z.number().int().optional(),
  memoryLimitMb: z.number().int().optional(),
  envVars: z.record(z.string(), z.unknown()).optional(),
  volumeMounts: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});

export const updateDeploymentSchema = createDeploymentSchema.partial();

export const rollbackDeploymentSchema = z.object({
  targetVersion: z.string().min(1).max(100),
  reason: z.string().optional(),
});

// ==========================================
// IAM Policies
// ==========================================

export const createIamPolicySchema = z.object({
  policyName: z.string().min(1).max(255),
  policyCode: z.string().min(1).max(50),
  description: z.string().optional(),
  policyType: z.enum(["rbac", "abac", "resource", "network", "custom"]),
  effect: z.enum(["allow", "deny"]).optional(),
  resources: z.array(z.string()).optional(),
  actions: z.array(z.string()).optional(),
  conditions: z.record(z.string(), z.unknown()).optional(),
  priority: z.number().int().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});

export const updateIamPolicySchema = createIamPolicySchema.partial();

// ==========================================
// Service Accounts
// ==========================================

export const createServiceAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  accountCode: z.string().min(1).max(50),
  description: z.string().optional(),
  serviceType: z.enum(["application", "system", "integration", "ci_cd", "monitoring"]),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  policyIds: z.array(z.string().uuid()).optional(),
  ipWhitelist: z.array(z.string()).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});

export const updateServiceAccountSchema = createServiceAccountSchema.partial();

// ==========================================
// API Keys
// ==========================================

export const createApiKeySchema = z.object({
  keyName: z.string().min(1).max(255),
  serviceAccountId: z.string().uuid().optional(),
  scopes: z.array(z.string()).optional(),
  rateLimit: z.number().int().optional(),
  expiresAt: z.coerce.date().optional(),
  ipWhitelist: z.array(z.string()).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});

export const revokeApiKeySchema = z.object({
  reason: z.string().min(1),
});

// ==========================================
// JIT Access
// ==========================================

export const createJitAccessSchema = z.object({
  resourceType: z.string().min(1).max(50),
  resourceId: z.string().uuid().optional(),
  accessLevel: z.enum(["read", "write", "admin", "superadmin"]),
  justification: z.string().min(1),
  expiresAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});

// ==========================================
// Encryption Keys
// ==========================================

export const createEncryptionKeySchema = z.object({
  keyName: z.string().min(1).max(255),
  keyCode: z.string().min(1).max(50),
  keyType: z.enum(["symmetric", "asymmetric", "hmac", "kek"]),
  algorithm: z.enum(["AES-256-GCM", "RSA-2048", "RSA-4096", "ECDSA-P256", "HMAC-SHA256"]),
  keySize: z.number().int().min(128),
  purpose: z.enum(["data_encryption", "key_wrapping", "signing", "authentication", "tokenization"]),
  status: z.enum(["active", "inactive", "pending_rotation", "compromised", "destroyed"]).optional(),
  autoRotateIntervalDays: z.number().int().min(1).optional(),
  provider: z.string().max(50).optional(),
  providerKeyId: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});

export const updateEncryptionKeySchema = createEncryptionKeySchema.partial();

export const rotateKeySchema = z.object({
  reason: z.string().optional(),
});

// ==========================================
// Audit Events
// ==========================================

export const createAuditEventSchema = z.object({
  eventCode: z.string().min(1).max(50),
  eventType: z.enum(["authentication", "authorization", "data_access", "data_modification", "system", "security", "compliance"]),
  action: z.string().min(1).max(50),
  resourceType: z.string().min(1).max(50),
  resourceId: z.string().uuid().optional(),
  actorId: z.string().uuid().optional(),
  actorType: z.enum(["user", "service_account", "system", "api_key"]).optional(),
  severity: z.enum(["debug", "info", "warning", "error", "critical"]).optional(),
  outcome: z.enum(["success", "failure", "denied", "error"]).optional(),
  ipAddress: z.string().max(45).optional(),
  userAgent: z.string().optional(),
  previousState: z.record(z.string(), z.unknown()).optional(),
  newState: z.record(z.string(), z.unknown()).optional(),
  changeDiff: z.record(z.string(), z.unknown()).optional(),
  geoLocation: z.record(z.string(), z.unknown()).optional(),
  sessionId: z.string().max(255).optional(),
  correlationId: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});

// ==========================================
// Compliance Reports
// ==========================================

export const createComplianceReportSchema = z.object({
  reportCode: z.string().min(1).max(50),
  reportName: z.string().min(1).max(255),
  reportType: z.enum(["soc2", "iso27001", "gdpr", "pci_dss", "hipaa", "custom"]),
  framework: z.string().max(50).optional(),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
  status: z.enum(["draft", "in_progress", "review", "published", "archived"]).optional(),
  findings: z.array(z.record(z.string(), z.unknown())).optional(),
  recommendations: z.array(z.record(z.string(), z.unknown())).optional(),
  evidenceRefs: z.array(z.string()).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});

export const updateComplianceReportSchema = createComplianceReportSchema.partial();
