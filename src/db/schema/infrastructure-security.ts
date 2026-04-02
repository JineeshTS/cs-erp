import {
  pgTable,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// FEAT-002-1-001: Cloud Native Deployment
// ==========================================

export const isfK8sClusters = pgTable(
  "isf_k8s_clusters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    clusterName: varchar("cluster_name", { length: 255 }).notNull(),
    clusterCode: varchar("cluster_code", { length: 50 }).notNull(),
    provider: varchar("provider", { length: 50 }).notNull(),
    region: varchar("region", { length: 100 }).notNull(),
    environment: varchar("environment", { length: 30 }).notNull().default("production"),
    version: varchar("version", { length: 30 }),
    endpoint: varchar("endpoint", { length: 500 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    nodeCount: integer("node_count"),
    cpuCapacity: integer("cpu_capacity"),
    memoryCapacityMb: integer("memory_capacity_mb"),
    costPerHour: integer("cost_per_hour"),
    config: jsonb("config"),
    tags: jsonb("tags"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("isf_clusters_tenant_id_idx").on(table.tenantId),
    uniqueIndex("isf_clusters_tenant_code_idx").on(table.tenantId, table.clusterCode),
    index("isf_clusters_provider_idx").on(table.provider),
    index("isf_clusters_environment_idx").on(table.environment),
    index("isf_clusters_status_idx").on(table.status),
  ]
);

export const isfK8sNamespaces = pgTable(
  "isf_k8s_namespaces",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    clusterId: uuid("cluster_id")
      .notNull()
      .references(() => isfK8sClusters.id),
    namespaceName: varchar("namespace_name", { length: 255 }).notNull(),
    environment: varchar("environment", { length: 30 }).notNull().default("production"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    resourceQuota: jsonb("resource_quota"),
    limitRange: jsonb("limit_range"),
    labels: jsonb("labels"),
    annotations: jsonb("annotations"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("isf_namespaces_tenant_id_idx").on(table.tenantId),
    index("isf_namespaces_cluster_id_idx").on(table.clusterId),
    uniqueIndex("isf_namespaces_cluster_name_idx").on(table.clusterId, table.namespaceName),
    index("isf_namespaces_environment_idx").on(table.environment),
    index("isf_namespaces_status_idx").on(table.status),
  ]
);

export const isfDeploymentConfigs = pgTable(
  "isf_deployment_configs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    clusterId: uuid("cluster_id")
      .notNull()
      .references(() => isfK8sClusters.id),
    namespaceId: uuid("namespace_id").references(() => isfK8sNamespaces.id),
    deploymentName: varchar("deployment_name", { length: 255 }).notNull(),
    deploymentCode: varchar("deployment_code", { length: 50 }).notNull(),
    imageName: varchar("image_name", { length: 500 }).notNull(),
    imageTag: varchar("image_tag", { length: 100 }).notNull(),
    replicas: integer("replicas").notNull().default(1),
    strategy: varchar("strategy", { length: 30 }).notNull().default("rolling"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    healthStatus: varchar("health_status", { length: 20 }).notNull().default("unknown"),
    cpuRequest: integer("cpu_request"),
    cpuLimit: integer("cpu_limit"),
    memoryRequestMb: integer("memory_request_mb"),
    memoryLimitMb: integer("memory_limit_mb"),
    envVars: jsonb("env_vars"),
    volumeMounts: jsonb("volume_mounts"),
    rollbackVersion: varchar("rollback_version", { length: 100 }),
    lastDeployedAt: timestamp("last_deployed_at", { withTimezone: true }),
    lastRollbackAt: timestamp("last_rollback_at", { withTimezone: true }),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("isf_deployments_tenant_id_idx").on(table.tenantId),
    index("isf_deployments_cluster_id_idx").on(table.clusterId),
    index("isf_deployments_namespace_id_idx").on(table.namespaceId),
    uniqueIndex("isf_deployments_tenant_code_idx").on(table.tenantId, table.deploymentCode),
    index("isf_deployments_status_idx").on(table.status),
    index("isf_deployments_health_status_idx").on(table.healthStatus),
  ]
);

// ==========================================
// FEAT-002-1-002: Identity & Access Management
// ==========================================

export const isfIamPolicies = pgTable(
  "isf_iam_policies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    policyName: varchar("policy_name", { length: 255 }).notNull(),
    policyCode: varchar("policy_code", { length: 50 }).notNull(),
    description: text("description"),
    policyType: varchar("policy_type", { length: 30 }).notNull(),
    effect: varchar("effect", { length: 10 }).notNull().default("allow"),
    resources: jsonb("resources"),
    actions: jsonb("actions"),
    conditions: jsonb("conditions"),
    priority: integer("priority").default(0),
    isActive: boolean("is_active").notNull().default(true),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("isf_iam_policies_tenant_id_idx").on(table.tenantId),
    uniqueIndex("isf_iam_policies_tenant_code_idx").on(table.tenantId, table.policyCode),
    index("isf_iam_policies_policy_type_idx").on(table.policyType),
    index("isf_iam_policies_is_active_idx").on(table.isActive),
  ]
);

export const isfServiceAccounts = pgTable(
  "isf_service_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    accountName: varchar("account_name", { length: 255 }).notNull(),
    accountCode: varchar("account_code", { length: 50 }).notNull(),
    description: text("description"),
    serviceType: varchar("service_type", { length: 30 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    policyIds: jsonb("policy_ids"),
    credentialHash: varchar("credential_hash", { length: 500 }),
    lastRotatedAt: timestamp("last_rotated_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    ipWhitelist: jsonb("ip_whitelist"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("isf_svc_accounts_tenant_id_idx").on(table.tenantId),
    uniqueIndex("isf_svc_accounts_tenant_code_idx").on(table.tenantId, table.accountCode),
    index("isf_svc_accounts_service_type_idx").on(table.serviceType),
    index("isf_svc_accounts_status_idx").on(table.status),
  ]
);

export const isfApiKeys = pgTable(
  "isf_api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    keyName: varchar("key_name", { length: 255 }).notNull(),
    keyPrefix: varchar("key_prefix", { length: 10 }).notNull(),
    keyHash: varchar("key_hash", { length: 500 }).notNull(),
    serviceAccountId: uuid("service_account_id").references(() => isfServiceAccounts.id),
    scopes: jsonb("scopes"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    rateLimit: integer("rate_limit"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    revokedBy: uuid("revoked_by"),
    revokeReason: text("revoke_reason"),
    ipWhitelist: jsonb("ip_whitelist"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("isf_api_keys_tenant_id_idx").on(table.tenantId),
    index("isf_api_keys_key_prefix_idx").on(table.keyPrefix),
    index("isf_api_keys_service_account_id_idx").on(table.serviceAccountId),
    index("isf_api_keys_status_idx").on(table.status),
    index("isf_api_keys_expires_at_idx").on(table.expiresAt),
  ]
);

export const isfJitAccessRequests = pgTable(
  "isf_jit_access_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    requestRef: varchar("request_ref", { length: 50 }).notNull(),
    requestedBy: uuid("requested_by").notNull(),
    resourceType: varchar("resource_type", { length: 50 }).notNull(),
    resourceId: uuid("resource_id"),
    accessLevel: varchar("access_level", { length: 30 }).notNull(),
    justification: text("justification").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    approvedBy: uuid("approved_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("isf_jit_access_tenant_id_idx").on(table.tenantId),
    uniqueIndex("isf_jit_access_tenant_ref_idx").on(table.tenantId, table.requestRef),
    index("isf_jit_access_requested_by_idx").on(table.requestedBy),
    index("isf_jit_access_status_idx").on(table.status),
    index("isf_jit_access_expires_at_idx").on(table.expiresAt),
  ]
);

// ==========================================
// FEAT-002-1-003: Data Encryption & Key Management
// ==========================================

export const isfEncryptionKeys = pgTable(
  "isf_encryption_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    keyName: varchar("key_name", { length: 255 }).notNull(),
    keyCode: varchar("key_code", { length: 50 }).notNull(),
    keyType: varchar("key_type", { length: 30 }).notNull(),
    algorithm: varchar("algorithm", { length: 50 }).notNull(),
    keySize: integer("key_size").notNull(),
    purpose: varchar("purpose", { length: 50 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    version: integer("version").notNull().default(1),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    lastRotatedAt: timestamp("last_rotated_at", { withTimezone: true }),
    autoRotateIntervalDays: integer("auto_rotate_interval_days"),
    provider: varchar("provider", { length: 50 }),
    providerKeyId: varchar("provider_key_id", { length: 255 }),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("isf_enc_keys_tenant_id_idx").on(table.tenantId),
    uniqueIndex("isf_enc_keys_tenant_code_idx").on(table.tenantId, table.keyCode),
    index("isf_enc_keys_key_type_idx").on(table.keyType),
    index("isf_enc_keys_purpose_idx").on(table.purpose),
    index("isf_enc_keys_status_idx").on(table.status),
    index("isf_enc_keys_expires_at_idx").on(table.expiresAt),
  ]
);

export const isfKeyRotationLog = pgTable(
  "isf_key_rotation_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    keyId: uuid("key_id")
      .notNull()
      .references(() => isfEncryptionKeys.id),
    previousVersion: integer("previous_version").notNull(),
    newVersion: integer("new_version").notNull(),
    rotationType: varchar("rotation_type", { length: 20 }).notNull().default("manual"),
    rotatedBy: uuid("rotated_by"),
    reason: text("reason"),
    status: varchar("status", { length: 20 }).notNull().default("completed"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("isf_key_rotation_tenant_id_idx").on(table.tenantId),
    index("isf_key_rotation_key_id_idx").on(table.keyId),
    index("isf_key_rotation_type_idx").on(table.rotationType),
    index("isf_key_rotation_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-002-1-004: Audit Trail & Compliance Logging
// ==========================================

export const isfAuditEvents = pgTable(
  "isf_audit_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    eventCode: varchar("event_code", { length: 50 }).notNull(),
    eventType: varchar("event_type", { length: 30 }).notNull(),
    action: varchar("action", { length: 50 }).notNull(),
    resourceType: varchar("resource_type", { length: 50 }).notNull(),
    resourceId: uuid("resource_id"),
    actorId: uuid("actor_id"),
    actorType: varchar("actor_type", { length: 30 }).notNull().default("user"),
    severity: varchar("severity", { length: 20 }).notNull().default("info"),
    outcome: varchar("outcome", { length: 20 }).notNull().default("success"),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    previousState: jsonb("previous_state"),
    newState: jsonb("new_state"),
    changeDiff: jsonb("change_diff"),
    geoLocation: jsonb("geo_location"),
    sessionId: varchar("session_id", { length: 255 }),
    correlationId: varchar("correlation_id", { length: 255 }),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("isf_audit_tenant_id_idx").on(table.tenantId),
    index("isf_audit_event_type_idx").on(table.eventType),
    index("isf_audit_action_idx").on(table.action),
    index("isf_audit_resource_type_idx").on(table.resourceType),
    index("isf_audit_resource_id_idx").on(table.resourceId),
    index("isf_audit_actor_id_idx").on(table.actorId),
    index("isf_audit_severity_idx").on(table.severity),
    index("isf_audit_outcome_idx").on(table.outcome),
    index("isf_audit_created_at_idx").on(table.createdAt),
    index("isf_audit_correlation_id_idx").on(table.correlationId),
  ]
);

export const isfComplianceReports = pgTable(
  "isf_compliance_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    reportCode: varchar("report_code", { length: 50 }).notNull(),
    reportName: varchar("report_name", { length: 255 }).notNull(),
    reportType: varchar("report_type", { length: 50 }).notNull(),
    framework: varchar("framework", { length: 50 }),
    periodStart: timestamp("period_start", { withTimezone: true }),
    periodEnd: timestamp("period_end", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    overallScore: integer("overall_score"),
    findings: jsonb("findings"),
    recommendations: jsonb("recommendations"),
    evidenceRefs: jsonb("evidence_refs"),
    generatedBy: uuid("generated_by"),
    reviewedBy: uuid("reviewed_by"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("isf_compliance_tenant_id_idx").on(table.tenantId),
    uniqueIndex("isf_compliance_tenant_code_idx").on(table.tenantId, table.reportCode),
    index("isf_compliance_report_type_idx").on(table.reportType),
    index("isf_compliance_framework_idx").on(table.framework),
    index("isf_compliance_status_idx").on(table.status),
    index("isf_compliance_period_start_idx").on(table.periodStart),
  ]
);
