import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  adminModuleConfigs,
  adminFeatureConfigs,
  adminAiAgentConfigs,
  adminApprovalMatrices,
  adminIntegrationEndpoints,
  adminMasterDataConfigs,
  adminAuditLogs,
  adminSystemHealthMetrics,
  adminFeatureFlags,
  adminLicenses,
  adminImportExportJobs,
  adminNotificationConfigs,
} from "@/db/schema/admin-portal";

// Module Configs
export type ModuleConfig = InferSelectModel<typeof adminModuleConfigs>;
export type NewModuleConfig = InferInsertModel<typeof adminModuleConfigs>;

// Feature Configs
export type FeatureConfig = InferSelectModel<typeof adminFeatureConfigs>;
export type NewFeatureConfig = InferInsertModel<typeof adminFeatureConfigs>;

// AI Agent Configs
export type AiAgentConfig = InferSelectModel<typeof adminAiAgentConfigs>;
export type NewAiAgentConfig = InferInsertModel<typeof adminAiAgentConfigs>;

// Approval Matrices
export type ApprovalMatrix = InferSelectModel<typeof adminApprovalMatrices>;
export type NewApprovalMatrix = InferInsertModel<typeof adminApprovalMatrices>;

// Integration Endpoints
export type IntegrationEndpoint = InferSelectModel<typeof adminIntegrationEndpoints>;
export type NewIntegrationEndpoint = InferInsertModel<typeof adminIntegrationEndpoints>;

// Master Data Configs
export type MasterDataConfig = InferSelectModel<typeof adminMasterDataConfigs>;
export type NewMasterDataConfig = InferInsertModel<typeof adminMasterDataConfigs>;

// Audit Logs
export type AuditLog = InferSelectModel<typeof adminAuditLogs>;
export type NewAuditLog = InferInsertModel<typeof adminAuditLogs>;

// System Health Metrics
export type SystemHealthMetric = InferSelectModel<typeof adminSystemHealthMetrics>;
export type NewSystemHealthMetric = InferInsertModel<typeof adminSystemHealthMetrics>;

// Feature Flags
export type FeatureFlag = InferSelectModel<typeof adminFeatureFlags>;
export type NewFeatureFlag = InferInsertModel<typeof adminFeatureFlags>;

// Licenses
export type License = InferSelectModel<typeof adminLicenses>;
export type NewLicense = InferInsertModel<typeof adminLicenses>;

// Import/Export Jobs
export type ImportExportJob = InferSelectModel<typeof adminImportExportJobs>;
export type NewImportExportJob = InferInsertModel<typeof adminImportExportJobs>;

// Notification Configs
export type NotificationConfig = InferSelectModel<typeof adminNotificationConfigs>;
export type NewNotificationConfig = InferInsertModel<typeof adminNotificationConfigs>;
