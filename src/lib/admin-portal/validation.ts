import { z } from "zod";

// Module Config schemas
export const createModuleConfigSchema = z.object({
  moduleSlug: z.string().min(1).max(100),
  moduleName: z.string().min(1).max(255),
  description: z.string().optional(),
  isEnabled: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});
export const updateModuleConfigSchema = createModuleConfigSchema.partial();

// Feature Config schemas
export const createFeatureConfigSchema = z.object({
  moduleConfigId: z.string().uuid(),
  featureSlug: z.string().min(1).max(100),
  featureName: z.string().min(1).max(255),
  description: z.string().optional(),
  isEnabled: z.boolean().optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});
export const updateFeatureConfigSchema = createFeatureConfigSchema.partial();

// AI Agent Config schemas
export const createAiAgentConfigSchema = z.object({
  agentSlug: z.string().min(1).max(100),
  agentName: z.string().min(1).max(255),
  description: z.string().optional(),
  modelProvider: z.string().max(50).optional(),
  modelId: z.string().min(1).max(100),
  temperature: z.number().int().min(0).max(100).optional(),
  maxTokens: z.number().int().positive().optional(),
  systemPrompt: z.string().optional(),
  automationLevel: z.number().int().min(0).max(100).optional(),
  humanReviewThreshold: z.number().int().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});
export const updateAiAgentConfigSchema = createAiAgentConfigSchema.partial();

// Approval Matrix schemas
export const createApprovalMatrixSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100),
  description: z.string().optional(),
  entityType: z.string().min(1).max(50),
  conditionField: z.string().min(1).max(100),
  conditionOperator: z.enum(["eq", "gt", "gte", "lt", "lte", "ne"]).optional(),
  thresholdAmount: z.number().int().min(0).optional(),
  currency: z.string().length(3).optional(),
  approverRoleId: z.string().uuid().optional(),
  approverUserId: z.string().uuid().optional(),
  requiredApprovals: z.number().int().positive().optional(),
  escalationTimeoutMinutes: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});
export const updateApprovalMatrixSchema = createApprovalMatrixSchema.partial();

// Integration Endpoint schemas
export const createIntegrationEndpointSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100),
  description: z.string().optional(),
  provider: z.string().min(1).max(100),
  endpointUrl: z.string().url().max(1000),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).optional(),
  authType: z.enum(["bearer", "api_key", "basic", "oauth2", "none"]).optional(),
  authConfig: z.record(z.string(), z.unknown()).optional(),
  headers: z.record(z.string(), z.unknown()).optional(),
  retryPolicy: z.record(z.string(), z.unknown()).optional(),
  timeoutMs: z.number().int().positive().optional(),
  rateLimitPerMinute: z.number().int().positive().optional(),
  status: z.enum(["active", "inactive", "testing", "error"]).optional(),
});
export const updateIntegrationEndpointSchema = createIntegrationEndpointSchema.partial();

// Master Data Config schemas
export const createMasterDataConfigSchema = z.object({
  entityType: z.string().min(1).max(100),
  entityName: z.string().min(1).max(255),
  description: z.string().optional(),
  validationRules: z.record(z.string(), z.unknown()).optional(),
  defaultValues: z.record(z.string(), z.unknown()).optional(),
  requiredFields: z.array(z.string()).optional(),
  uniqueFields: z.array(z.string()).optional(),
  isLocked: z.boolean().optional(),
});
export const updateMasterDataConfigSchema = createMasterDataConfigSchema.partial();

// Audit Log schemas (create only - audit logs are immutable)
export const createAuditLogSchema = z.object({
  userId: z.string().uuid().optional(),
  userEmail: z.string().email().optional(),
  action: z.string().min(1).max(100),
  entityType: z.string().min(1).max(100),
  entityId: z.string().uuid().optional(),
  module: z.string().max(100).optional(),
  ipAddress: z.string().max(45).optional(),
  userAgent: z.string().optional(),
  previousData: z.record(z.string(), z.unknown()).optional(),
  newData: z.record(z.string(), z.unknown()).optional(),
  severity: z.enum(["info", "warning", "error", "critical"]).optional(),
});

// System Health Metric schemas
export const createSystemHealthMetricSchema = z.object({
  metricName: z.string().min(1).max(100),
  metricCategory: z.enum(["system", "database", "api", "queue", "storage", "network"]).optional(),
  value: z.number().int(),
  unit: z.string().max(30).optional(),
  threshold: z.number().int().optional(),
  status: z.enum(["healthy", "degraded", "critical", "unknown"]).optional(),
  source: z.string().max(100).optional(),
});
export const updateSystemHealthMetricSchema = createSystemHealthMetricSchema.partial();

// Feature Flag schemas
export const createFeatureFlagSchema = z.object({
  flagKey: z.string().min(1).max(100),
  flagName: z.string().min(1).max(255),
  description: z.string().optional(),
  isEnabled: z.boolean().optional(),
  rolloutPercentage: z.number().int().min(0).max(100).optional(),
  targetRoles: z.array(z.string()).optional(),
  targetUsers: z.array(z.string()).optional(),
  conditions: z.record(z.string(), z.unknown()).optional(),
  expiresAt: z.string().datetime().optional(),
});
export const updateFeatureFlagSchema = createFeatureFlagSchema.partial();

// License schemas
export const createLicenseSchema = z.object({
  licenseKey: z.string().min(1).max(255),
  licenseName: z.string().min(1).max(255),
  description: z.string().optional(),
  licenseType: z.enum(["subscription", "perpetual", "trial", "enterprise"]).optional(),
  plan: z.enum(["starter", "growth", "enterprise", "enterprise_plus"]).optional(),
  status: z.enum(["active", "expired", "suspended", "cancelled"]).optional(),
  maxUsers: z.number().int().positive().optional(),
  maxStorage: z.number().int().positive().optional(),
  features: z.record(z.string(), z.unknown()).optional(),
  billingCycle: z.enum(["monthly", "quarterly", "annual"]).optional(),
  amountPerCycle: z.number().int().min(0).optional(),
  currency: z.string().length(3).optional(),
  startsAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});
export const updateLicenseSchema = createLicenseSchema.partial();

// Import/Export Job schemas
export const createImportExportJobSchema = z.object({
  jobType: z.enum(["import", "export"]),
  entityType: z.string().min(1).max(100),
  fileName: z.string().max(500).optional(),
  fileSize: z.number().int().positive().optional(),
  fileFormat: z.enum(["csv", "xlsx", "json"]).optional(),
  columnMapping: z.record(z.string(), z.unknown()).optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
});
export const updateImportExportJobSchema = z.object({
  status: z.enum(["pending", "processing", "completed", "failed", "cancelled"]).optional(),
  totalRecords: z.number().int().min(0).optional(),
  processedRecords: z.number().int().min(0).optional(),
  failedRecords: z.number().int().min(0).optional(),
  errorLog: z.record(z.string(), z.unknown()).optional(),
  resultFilePath: z.string().max(1000).optional(),
});

// Notification Config schemas
export const createNotificationConfigSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100),
  description: z.string().optional(),
  channel: z.enum(["email", "sms", "whatsapp", "in_app", "push"]).optional(),
  eventTrigger: z.string().min(1).max(100),
  subject: z.string().max(500).optional(),
  bodyTemplate: z.string().min(1),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  recipientType: z.enum(["user", "role", "group", "custom"]).optional(),
  recipientConfig: z.record(z.string(), z.unknown()).optional(),
});
export const updateNotificationConfigSchema = createNotificationConfigSchema.partial();
