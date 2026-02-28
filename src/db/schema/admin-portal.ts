import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// FEAT-036-1-002: Module & Feature Configuration
// ==========================================

export const adminModuleConfigs = pgTable(
  "admin_module_configs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    moduleSlug: varchar("module_slug", { length: 100 }).notNull(),
    moduleName: varchar("module_name", { length: 255 }).notNull(),
    description: text("description"),
    isEnabled: boolean("is_enabled").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    settings: jsonb("settings"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("admin_module_configs_tenant_id_idx").on(table.tenantId),
    uniqueIndex("admin_module_configs_tenant_slug_idx").on(
      table.tenantId,
      table.moduleSlug
    ),
    index("admin_module_configs_is_enabled_idx").on(table.isEnabled),
  ]
);

export const adminFeatureConfigs = pgTable(
  "admin_feature_configs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    moduleConfigId: uuid("module_config_id")
      .notNull()
      .references(() => adminModuleConfigs.id, { onDelete: "cascade" }),
    featureSlug: varchar("feature_slug", { length: 100 }).notNull(),
    featureName: varchar("feature_name", { length: 255 }).notNull(),
    description: text("description"),
    isEnabled: boolean("is_enabled").notNull().default(true),
    settings: jsonb("settings"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("admin_feature_configs_tenant_id_idx").on(table.tenantId),
    index("admin_feature_configs_module_config_id_idx").on(
      table.moduleConfigId
    ),
    uniqueIndex("admin_feature_configs_tenant_slug_idx").on(
      table.tenantId,
      table.moduleConfigId,
      table.featureSlug
    ),
    index("admin_feature_configs_is_enabled_idx").on(table.isEnabled),
  ]
);

// ==========================================
// FEAT-036-1-003: AI Agent Configuration 95-5 Tuning
// ==========================================

export const adminAiAgentConfigs = pgTable(
  "admin_ai_agent_configs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    agentSlug: varchar("agent_slug", { length: 100 }).notNull(),
    agentName: varchar("agent_name", { length: 255 }).notNull(),
    description: text("description"),
    modelProvider: varchar("model_provider", { length: 50 })
      .notNull()
      .default("anthropic"),
    modelId: varchar("model_id", { length: 100 }).notNull(),
    temperature: integer("temperature").notNull().default(70),
    maxTokens: integer("max_tokens").notNull().default(4096),
    systemPrompt: text("system_prompt"),
    automationLevel: integer("automation_level").notNull().default(95),
    humanReviewThreshold: integer("human_review_threshold")
      .notNull()
      .default(5),
    isActive: boolean("is_active").notNull().default(true),
    settings: jsonb("settings"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("admin_ai_agent_configs_tenant_id_idx").on(table.tenantId),
    uniqueIndex("admin_ai_agent_configs_tenant_slug_idx").on(
      table.tenantId,
      table.agentSlug
    ),
    index("admin_ai_agent_configs_is_active_idx").on(table.isActive),
  ]
);

// ==========================================
// FEAT-036-1-004: Approval Matrix & DOA Administration
// ==========================================

export const adminApprovalMatrices = pgTable(
  "admin_approval_matrices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    description: text("description"),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    conditionField: varchar("condition_field", { length: 100 }).notNull(),
    conditionOperator: varchar("condition_operator", { length: 20 })
      .notNull()
      .default("gte"),
    thresholdAmount: integer("threshold_amount").notNull().default(0),
    currency: varchar("currency", { length: 3 }).notNull().default("QAR"),
    approverRoleId: uuid("approver_role_id"),
    approverUserId: uuid("approver_user_id"),
    requiredApprovals: integer("required_approvals").notNull().default(1),
    escalationTimeoutMinutes: integer("escalation_timeout_minutes"),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("admin_approval_matrices_tenant_id_idx").on(table.tenantId),
    uniqueIndex("admin_approval_matrices_tenant_slug_idx").on(
      table.tenantId,
      table.slug
    ),
    index("admin_approval_matrices_entity_type_idx").on(table.entityType),
    index("admin_approval_matrices_is_active_idx").on(table.isActive),
  ]
);

// ==========================================
// FEAT-036-2-001: Integration Endpoint Management
// ==========================================

export const adminIntegrationEndpoints = pgTable(
  "admin_integration_endpoints",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    description: text("description"),
    provider: varchar("provider", { length: 100 }).notNull(),
    endpointUrl: varchar("endpoint_url", { length: 1000 }).notNull(),
    method: varchar("method", { length: 10 }).notNull().default("POST"),
    authType: varchar("auth_type", { length: 30 })
      .notNull()
      .default("bearer"),
    authConfig: jsonb("auth_config"),
    headers: jsonb("headers"),
    retryPolicy: jsonb("retry_policy"),
    timeoutMs: integer("timeout_ms").notNull().default(30000),
    rateLimitPerMinute: integer("rate_limit_per_minute"),
    status: varchar("status", { length: 30 }).notNull().default("active"),
    lastTestedAt: timestamp("last_tested_at", { withTimezone: true }),
    lastTestResult: varchar("last_test_result", { length: 30 }),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("admin_integration_endpoints_tenant_id_idx").on(table.tenantId),
    uniqueIndex("admin_integration_endpoints_tenant_slug_idx").on(
      table.tenantId,
      table.slug
    ),
    index("admin_integration_endpoints_provider_idx").on(table.provider),
    index("admin_integration_endpoints_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-036-2-002: Master Data Administration Tools
// ==========================================

export const adminMasterDataConfigs = pgTable(
  "admin_master_data_configs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    entityName: varchar("entity_name", { length: 255 }).notNull(),
    description: text("description"),
    validationRules: jsonb("validation_rules"),
    defaultValues: jsonb("default_values"),
    requiredFields: jsonb("required_fields"),
    uniqueFields: jsonb("unique_fields"),
    isLocked: boolean("is_locked").notNull().default(false),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    recordCount: integer("record_count").notNull().default(0),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("admin_master_data_configs_tenant_id_idx").on(table.tenantId),
    uniqueIndex("admin_master_data_configs_tenant_entity_idx").on(
      table.tenantId,
      table.entityType
    ),
    index("admin_master_data_configs_is_locked_idx").on(table.isLocked),
  ]
);

// ==========================================
// FEAT-036-2-003: Audit Log Viewer & Search
// ==========================================

export const adminAuditLogs = pgTable(
  "admin_audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: uuid("user_id"),
    userEmail: varchar("user_email", { length: 255 }),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    entityId: uuid("entity_id"),
    module: varchar("module", { length: 100 }),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    previousData: jsonb("previous_data"),
    newData: jsonb("new_data"),
    severity: varchar("severity", { length: 20 })
      .notNull()
      .default("info"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("admin_audit_logs_tenant_id_idx").on(table.tenantId),
    index("admin_audit_logs_user_id_idx").on(table.userId),
    index("admin_audit_logs_action_idx").on(table.action),
    index("admin_audit_logs_entity_type_idx").on(table.entityType),
    index("admin_audit_logs_entity_id_idx").on(table.entityId),
    index("admin_audit_logs_module_idx").on(table.module),
    index("admin_audit_logs_severity_idx").on(table.severity),
    index("admin_audit_logs_created_at_idx").on(table.createdAt),
  ]
);

// ==========================================
// FEAT-036-2-004: System Health & Performance Dashboard
// ==========================================

export const adminSystemHealthMetrics = pgTable(
  "admin_system_health_metrics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    metricName: varchar("metric_name", { length: 100 }).notNull(),
    metricCategory: varchar("metric_category", { length: 50 })
      .notNull()
      .default("system"),
    value: integer("value").notNull(),
    unit: varchar("unit", { length: 30 }).notNull().default("count"),
    threshold: integer("threshold"),
    status: varchar("status", { length: 20 }).notNull().default("healthy"),
    source: varchar("source", { length: 100 }),
    recordedAt: timestamp("recorded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("admin_system_health_metrics_tenant_id_idx").on(table.tenantId),
    index("admin_system_health_metrics_metric_name_idx").on(
      table.metricName
    ),
    index("admin_system_health_metrics_category_idx").on(
      table.metricCategory
    ),
    index("admin_system_health_metrics_status_idx").on(table.status),
    index("admin_system_health_metrics_recorded_at_idx").on(
      table.recordedAt
    ),
  ]
);

// ==========================================
// FEAT-036-3-001: Feature Flag Management
// ==========================================

export const adminFeatureFlags = pgTable(
  "admin_feature_flags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    flagKey: varchar("flag_key", { length: 100 }).notNull(),
    flagName: varchar("flag_name", { length: 255 }).notNull(),
    description: text("description"),
    isEnabled: boolean("is_enabled").notNull().default(false),
    rolloutPercentage: integer("rollout_percentage")
      .notNull()
      .default(0),
    targetRoles: jsonb("target_roles"),
    targetUsers: jsonb("target_users"),
    conditions: jsonb("conditions"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("admin_feature_flags_tenant_id_idx").on(table.tenantId),
    uniqueIndex("admin_feature_flags_tenant_key_idx").on(
      table.tenantId,
      table.flagKey
    ),
    index("admin_feature_flags_is_enabled_idx").on(table.isEnabled),
  ]
);

// ==========================================
// FEAT-036-3-002: License & Subscription Management
// ==========================================

export const adminLicenses = pgTable(
  "admin_licenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    licenseKey: varchar("license_key", { length: 255 }).notNull(),
    licenseName: varchar("license_name", { length: 255 }).notNull(),
    description: text("description"),
    licenseType: varchar("license_type", { length: 50 })
      .notNull()
      .default("subscription"),
    plan: varchar("plan", { length: 50 }).notNull().default("starter"),
    status: varchar("status", { length: 30 }).notNull().default("active"),
    maxUsers: integer("max_users").notNull().default(10),
    maxStorage: integer("max_storage").notNull().default(5120),
    features: jsonb("features"),
    billingCycle: varchar("billing_cycle", { length: 20 })
      .notNull()
      .default("monthly"),
    amountPerCycle: integer("amount_per_cycle").notNull().default(0),
    currency: varchar("currency", { length: 3 }).notNull().default("QAR"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    renewedAt: timestamp("renewed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("admin_licenses_tenant_id_idx").on(table.tenantId),
    uniqueIndex("admin_licenses_key_idx").on(table.licenseKey),
    index("admin_licenses_status_idx").on(table.status),
    index("admin_licenses_plan_idx").on(table.plan),
    index("admin_licenses_expires_at_idx").on(table.expiresAt),
  ]
);

// ==========================================
// FEAT-036-3-003: Bulk Data Import & Export Tools
// ==========================================

export const adminImportExportJobs = pgTable(
  "admin_import_export_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    jobType: varchar("job_type", { length: 20 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    fileName: varchar("file_name", { length: 500 }),
    fileSize: integer("file_size"),
    fileFormat: varchar("file_format", { length: 20 })
      .notNull()
      .default("csv"),
    status: varchar("status", { length: 30 }).notNull().default("pending"),
    totalRecords: integer("total_records"),
    processedRecords: integer("processed_records").notNull().default(0),
    failedRecords: integer("failed_records").notNull().default(0),
    errorLog: jsonb("error_log"),
    columnMapping: jsonb("column_mapping"),
    filters: jsonb("filters"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    initiatedBy: uuid("initiated_by").notNull(),
    resultFilePath: varchar("result_file_path", { length: 1000 }),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("admin_import_export_jobs_tenant_id_idx").on(table.tenantId),
    index("admin_import_export_jobs_job_type_idx").on(table.jobType),
    index("admin_import_export_jobs_entity_type_idx").on(table.entityType),
    index("admin_import_export_jobs_status_idx").on(table.status),
    index("admin_import_export_jobs_initiated_by_idx").on(
      table.initiatedBy
    ),
    index("admin_import_export_jobs_created_at_idx").on(table.createdAt),
  ]
);

// ==========================================
// FEAT-036-3-004: Notification Template Administration
// ==========================================

export const adminNotificationConfigs = pgTable(
  "admin_notification_configs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    description: text("description"),
    channel: varchar("channel", { length: 30 }).notNull().default("email"),
    eventTrigger: varchar("event_trigger", { length: 100 }).notNull(),
    subject: varchar("subject", { length: 500 }),
    bodyTemplate: text("body_template").notNull(),
    variables: jsonb("variables"),
    isActive: boolean("is_active").notNull().default(true),
    priority: varchar("priority", { length: 20 })
      .notNull()
      .default("normal"),
    recipientType: varchar("recipient_type", { length: 30 })
      .notNull()
      .default("user"),
    recipientConfig: jsonb("recipient_config"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("admin_notification_configs_tenant_id_idx").on(table.tenantId),
    uniqueIndex("admin_notification_configs_tenant_slug_idx").on(
      table.tenantId,
      table.slug
    ),
    index("admin_notification_configs_channel_idx").on(table.channel),
    index("admin_notification_configs_event_trigger_idx").on(
      table.eventTrigger
    ),
    index("admin_notification_configs_is_active_idx").on(table.isActive),
  ]
);
