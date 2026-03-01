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
// FEAT-004-1-001: Oracle Fusion Integration
// ==========================================

export const ielIntegrationConnections = pgTable(
  "iel_integration_connections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    connectionName: varchar("connection_name", { length: 255 }).notNull(),
    connectionCode: varchar("connection_code", { length: 50 }).notNull(),
    connectionType: varchar("connection_type", { length: 50 }).notNull(),
    provider: varchar("provider", { length: 50 }).notNull(),
    baseUrl: varchar("base_url", { length: 500 }),
    authType: varchar("auth_type", { length: 30 }).notNull().default("oauth2"),
    authConfig: jsonb("auth_config"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    healthStatus: varchar("health_status", { length: 20 }).notNull().default("unknown"),
    lastHealthCheckAt: timestamp("last_health_check_at", { withTimezone: true }),
    retryPolicy: jsonb("retry_policy"),
    rateLimitPerMinute: integer("rate_limit_per_minute"),
    timeoutMs: integer("timeout_ms").default(30000),
    notes: text("notes"),
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
    index("iel_conn_tenant_id_idx").on(table.tenantId),
    uniqueIndex("iel_conn_tenant_code_idx").on(table.tenantId, table.connectionCode),
    index("iel_conn_type_idx").on(table.connectionType),
    index("iel_conn_provider_idx").on(table.provider),
    index("iel_conn_status_idx").on(table.status),
  ]
);

export const ielIntegrationEndpoints = pgTable(
  "iel_integration_endpoints",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    connectionId: uuid("connection_id")
      .notNull()
      .references(() => ielIntegrationConnections.id),
    endpointName: varchar("endpoint_name", { length: 255 }).notNull(),
    endpointCode: varchar("endpoint_code", { length: 50 }).notNull(),
    httpMethod: varchar("http_method", { length: 10 }).notNull().default("GET"),
    path: varchar("path", { length: 500 }).notNull(),
    requestSchema: jsonb("request_schema"),
    responseSchema: jsonb("response_schema"),
    transformConfig: jsonb("transform_config"),
    isActive: boolean("is_active").notNull().default(true),
    notes: text("notes"),
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
    index("iel_ep_tenant_id_idx").on(table.tenantId),
    index("iel_ep_connection_id_idx").on(table.connectionId),
    uniqueIndex("iel_ep_conn_code_idx").on(table.connectionId, table.endpointCode),
    index("iel_ep_method_idx").on(table.httpMethod),
    index("iel_ep_is_active_idx").on(table.isActive),
  ]
);

export const ielOracleSyncJobs = pgTable(
  "iel_oracle_sync_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    connectionId: uuid("connection_id")
      .references(() => ielIntegrationConnections.id),
    jobCode: varchar("job_code", { length: 50 }).notNull(),
    syncType: varchar("sync_type", { length: 30 }).notNull(),
    direction: varchar("direction", { length: 20 }).notNull().default("inbound"),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    recordsTotal: integer("records_total").default(0),
    recordsProcessed: integer("records_processed").default(0),
    recordsFailed: integer("records_failed").default(0),
    errorLog: jsonb("error_log"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    scheduleCron: varchar("schedule_cron", { length: 100 }),
    lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
    syncConfig: jsonb("sync_config"),
    notes: text("notes"),
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
    index("iel_oracle_jobs_tenant_id_idx").on(table.tenantId),
    uniqueIndex("iel_oracle_jobs_tenant_code_idx").on(table.tenantId, table.jobCode),
    index("iel_oracle_jobs_conn_id_idx").on(table.connectionId),
    index("iel_oracle_jobs_sync_type_idx").on(table.syncType),
    index("iel_oracle_jobs_status_idx").on(table.status),
    index("iel_oracle_jobs_entity_type_idx").on(table.entityType),
  ]
);

export const ielOracleSyncMappings = pgTable(
  "iel_oracle_sync_mappings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    jobId: uuid("job_id")
      .references(() => ielOracleSyncJobs.id),
    sourceField: varchar("source_field", { length: 255 }).notNull(),
    targetField: varchar("target_field", { length: 255 }).notNull(),
    transformExpression: text("transform_expression"),
    defaultValue: text("default_value"),
    isRequired: boolean("is_required").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    notes: text("notes"),
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
    index("iel_oracle_map_tenant_id_idx").on(table.tenantId),
    index("iel_oracle_map_job_id_idx").on(table.jobId),
  ]
);

// ==========================================
// FEAT-004-1-002: EDI Processing Engine
// ==========================================

export const ielEdiMessages = pgTable(
  "iel_edi_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    messageRef: varchar("message_ref", { length: 50 }).notNull(),
    messageType: varchar("message_type", { length: 30 }).notNull(),
    ediStandard: varchar("edi_standard", { length: 20 }).notNull().default("EDIFACT"),
    direction: varchar("direction", { length: 20 }).notNull(),
    senderCode: varchar("sender_code", { length: 50 }).notNull(),
    receiverCode: varchar("receiver_code", { length: 50 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("received"),
    rawContent: text("raw_content"),
    parsedContent: jsonb("parsed_content"),
    validationErrors: jsonb("validation_errors"),
    connectionId: uuid("connection_id")
      .references(() => ielIntegrationConnections.id),
    relatedEntityType: varchar("related_entity_type", { length: 50 }),
    relatedEntityId: uuid("related_entity_id"),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
    notes: text("notes"),
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
    index("iel_edi_msg_tenant_id_idx").on(table.tenantId),
    uniqueIndex("iel_edi_msg_tenant_ref_idx").on(table.tenantId, table.messageRef),
    index("iel_edi_msg_type_idx").on(table.messageType),
    index("iel_edi_msg_direction_idx").on(table.direction),
    index("iel_edi_msg_status_idx").on(table.status),
    index("iel_edi_msg_sender_idx").on(table.senderCode),
    index("iel_edi_msg_receiver_idx").on(table.receiverCode),
    index("iel_edi_msg_conn_id_idx").on(table.connectionId),
    index("iel_edi_msg_related_idx").on(table.relatedEntityType, table.relatedEntityId),
  ]
);

export const ielEdiMessageSegments = pgTable(
  "iel_edi_message_segments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    messageId: uuid("message_id")
      .notNull()
      .references(() => ielEdiMessages.id),
    segmentIndex: integer("segment_index").notNull(),
    segmentTag: varchar("segment_tag", { length: 10 }).notNull(),
    segmentData: jsonb("segment_data"),
    rawSegment: text("raw_segment"),
    validationStatus: varchar("validation_status", { length: 20 }).notNull().default("pending"),
    validationErrors: jsonb("validation_errors"),
    notes: text("notes"),
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
    index("iel_edi_seg_tenant_id_idx").on(table.tenantId),
    index("iel_edi_seg_message_id_idx").on(table.messageId),
    index("iel_edi_seg_tag_idx").on(table.segmentTag),
    index("iel_edi_seg_validation_idx").on(table.validationStatus),
  ]
);

export const ielEdiProcessingLogs = pgTable(
  "iel_edi_processing_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    messageId: uuid("message_id")
      .references(() => ielEdiMessages.id),
    logLevel: varchar("log_level", { length: 20 }).notNull().default("info"),
    step: varchar("step", { length: 50 }).notNull(),
    message: text("message").notNull(),
    details: jsonb("details"),
    durationMs: integer("duration_ms"),
    notes: text("notes"),
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
    index("iel_edi_log_tenant_id_idx").on(table.tenantId),
    index("iel_edi_log_message_id_idx").on(table.messageId),
    index("iel_edi_log_level_idx").on(table.logLevel),
    index("iel_edi_log_step_idx").on(table.step),
    index("iel_edi_log_created_at_idx").on(table.createdAt),
  ]
);

// ==========================================
// FEAT-004-1-003: DPW PortConnect Integration
// ==========================================

export const ielPortConnectMessages = pgTable(
  "iel_port_connect_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    messageRef: varchar("message_ref", { length: 50 }).notNull(),
    messageType: varchar("message_type", { length: 50 }).notNull(),
    direction: varchar("direction", { length: 20 }).notNull(),
    portCode: varchar("port_code", { length: 20 }).notNull(),
    terminalCode: varchar("terminal_code", { length: 20 }),
    vesselImo: varchar("vessel_imo", { length: 20 }),
    voyageRef: varchar("voyage_ref", { length: 50 }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    payload: jsonb("payload"),
    responsePayload: jsonb("response_payload"),
    connectionId: uuid("connection_id")
      .references(() => ielIntegrationConnections.id),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    errorMessage: text("error_message"),
    retryCount: integer("retry_count").default(0),
    notes: text("notes"),
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
    index("iel_port_msg_tenant_id_idx").on(table.tenantId),
    uniqueIndex("iel_port_msg_tenant_ref_idx").on(table.tenantId, table.messageRef),
    index("iel_port_msg_type_idx").on(table.messageType),
    index("iel_port_msg_direction_idx").on(table.direction),
    index("iel_port_msg_port_code_idx").on(table.portCode),
    index("iel_port_msg_status_idx").on(table.status),
    index("iel_port_msg_vessel_idx").on(table.vesselImo),
    index("iel_port_msg_conn_id_idx").on(table.connectionId),
  ]
);

// ==========================================
// FEAT-004-1-004: Customs Authority Integration
// ==========================================

export const ielCustomsFilings = pgTable(
  "iel_customs_filings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    filingRef: varchar("filing_ref", { length: 50 }).notNull(),
    filingType: varchar("filing_type", { length: 50 }).notNull(),
    customsAuthority: varchar("customs_authority", { length: 50 }).notNull(),
    countryCode: varchar("country_code", { length: 3 }).notNull(),
    portCode: varchar("port_code", { length: 20 }),
    declarationType: varchar("declaration_type", { length: 30 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    declarationData: jsonb("declaration_data"),
    lineItems: jsonb("line_items"),
    hsCode: varchar("hs_code", { length: 20 }),
    totalValue: integer("total_value"),
    currency: varchar("currency", { length: 3 }).default("USD"),
    dutyAmount: integer("duty_amount"),
    taxAmount: integer("tax_amount"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    submittedBy: uuid("submitted_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    rejectedAt: timestamp("rejected_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
    connectionId: uuid("connection_id")
      .references(() => ielIntegrationConnections.id),
    notes: text("notes"),
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
    index("iel_customs_fil_tenant_id_idx").on(table.tenantId),
    uniqueIndex("iel_customs_fil_tenant_ref_idx").on(table.tenantId, table.filingRef),
    index("iel_customs_fil_type_idx").on(table.filingType),
    index("iel_customs_fil_authority_idx").on(table.customsAuthority),
    index("iel_customs_fil_country_idx").on(table.countryCode),
    index("iel_customs_fil_status_idx").on(table.status),
    index("iel_customs_fil_decl_type_idx").on(table.declarationType),
    index("iel_customs_fil_conn_id_idx").on(table.connectionId),
  ]
);

export const ielCustomsResponses = pgTable(
  "iel_customs_responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    filingId: uuid("filing_id")
      .notNull()
      .references(() => ielCustomsFilings.id),
    responseRef: varchar("response_ref", { length: 50 }).notNull(),
    responseType: varchar("response_type", { length: 30 }).notNull(),
    status: varchar("status", { length: 20 }).notNull(),
    responseData: jsonb("response_data"),
    errorCodes: jsonb("error_codes"),
    officerName: varchar("officer_name", { length: 255 }),
    officerNotes: text("officer_notes"),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
    notes: text("notes"),
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
    index("iel_customs_resp_tenant_id_idx").on(table.tenantId),
    index("iel_customs_resp_filing_id_idx").on(table.filingId),
    index("iel_customs_resp_type_idx").on(table.responseType),
    index("iel_customs_resp_status_idx").on(table.status),
  ]
);
