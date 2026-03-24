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
import { users } from "./users";

// ==========================================
// FEAT-001-1-001: Multi-Agent Orchestration Engine
// ==========================================

export const aafAgents = pgTable(
  "aaf_agents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    agentCode: varchar("agent_code", { length: 50 }).notNull(),
    agentName: varchar("agent_name", { length: 255 }).notNull(),
    agentType: varchar("agent_type", { length: 30 }).notNull(),
    description: text("description"),
    capabilities: jsonb("capabilities"),
    modelProvider: varchar("model_provider", { length: 50 }),
    modelId: varchar("model_id", { length: 100 }),
    endpoint: varchar("endpoint", { length: 500 }),
    config: jsonb("config"),
    maxConcurrency: integer("max_concurrency").default(1),
    timeoutMs: integer("timeout_ms").default(30000),
    retryPolicy: jsonb("retry_policy"),
    isActive: boolean("is_active").notNull().default(true),
    status: varchar("status", { length: 20 }).notNull().default("idle"),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
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
    index("aaf_agents_tenant_id_idx").on(table.tenantId),
    uniqueIndex("aaf_agents_tenant_code_idx").on(table.tenantId, table.agentCode),
    index("aaf_agents_agent_type_idx").on(table.agentType),
    index("aaf_agents_status_idx").on(table.status),
    index("aaf_agents_is_active_idx").on(table.isActive),
  ]
);

export const aafAgentRuns = pgTable(
  "aaf_agent_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => aafAgents.id),
    orchestrationTaskId: uuid("orchestration_task_id"),
    runNumber: varchar("run_number", { length: 50 }).notNull(),
    triggerType: varchar("trigger_type", { length: 30 }).notNull().default("manual"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    priority: varchar("priority", { length: 10 }).notNull().default("normal"),
    input: jsonb("input"),
    output: jsonb("output"),
    errorMessage: text("error_message"),
    errorCode: varchar("error_code", { length: 50 }),
    tokensUsed: integer("tokens_used"),
    costEstimate: integer("cost_estimate"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    durationMs: integer("duration_ms"),
    retryCount: integer("retry_count").default(0),
    parentRunId: uuid("parent_run_id"),
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
    index("aaf_runs_tenant_id_idx").on(table.tenantId),
    index("aaf_runs_agent_id_idx").on(table.agentId),
    index("aaf_runs_orchestration_task_id_idx").on(table.orchestrationTaskId),
    index("aaf_runs_status_idx").on(table.status),
    index("aaf_runs_trigger_type_idx").on(table.triggerType),
    index("aaf_runs_started_at_idx").on(table.startedAt),
    index("aaf_runs_parent_run_id_idx").on(table.parentRunId),
  ]
);

export const aafOrchestrationTasks = pgTable(
  "aaf_orchestration_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    taskCode: varchar("task_code", { length: 50 }).notNull(),
    taskName: varchar("task_name", { length: 255 }).notNull(),
    description: text("description"),
    strategy: varchar("strategy", { length: 30 }).notNull().default("sequential"),
    agentIds: jsonb("agent_ids"),
    agentConfig: jsonb("agent_config"),
    input: jsonb("input"),
    output: jsonb("output"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    priority: varchar("priority", { length: 10 }).notNull().default("normal"),
    currentStep: integer("current_step").default(0),
    totalSteps: integer("total_steps").default(0),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    durationMs: integer("duration_ms"),
    triggeredBy: uuid("triggered_by").references(() => users.id, { onDelete: "set null" }),
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
    index("aaf_orch_tasks_tenant_id_idx").on(table.tenantId),
    uniqueIndex("aaf_orch_tasks_tenant_code_idx").on(table.tenantId, table.taskCode),
    index("aaf_orch_tasks_strategy_idx").on(table.strategy),
    index("aaf_orch_tasks_status_idx").on(table.status),
    index("aaf_orch_tasks_triggered_by_idx").on(table.triggeredBy),
  ]
);

// ==========================================
// FEAT-001-1-002: Document Intelligence Agent
// ==========================================

export const aafDocumentProcessingJobs = pgTable(
  "aaf_document_processing_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    jobReference: varchar("job_reference", { length: 50 }).notNull(),
    documentRef: varchar("document_ref", { length: 255 }),
    documentType: varchar("document_type", { length: 50 }).notNull(),
    jobType: varchar("job_type", { length: 30 }).notNull(),
    agentId: uuid("agent_id").references(() => aafAgents.id),
    status: varchar("status", { length: 20 }).notNull().default("queued"),
    priority: varchar("priority", { length: 10 }).notNull().default("normal"),
    inputData: jsonb("input_data"),
    extractedData: jsonb("extracted_data"),
    validationResult: jsonb("validation_result"),
    confidenceScore: integer("confidence_score"),
    ocrEngine: varchar("ocr_engine", { length: 50 }),
    processingTimeMs: integer("processing_time_ms"),
    errorMessage: text("error_message"),
    retryCount: integer("retry_count").default(0),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    reviewedBy: uuid("reviewed_by"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
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
    index("aaf_doc_jobs_tenant_id_idx").on(table.tenantId),
    uniqueIndex("aaf_doc_jobs_tenant_ref_idx").on(table.tenantId, table.jobReference),
    index("aaf_doc_jobs_document_type_idx").on(table.documentType),
    index("aaf_doc_jobs_job_type_idx").on(table.jobType),
    index("aaf_doc_jobs_agent_id_idx").on(table.agentId),
    index("aaf_doc_jobs_status_idx").on(table.status),
    index("aaf_doc_jobs_started_at_idx").on(table.startedAt),
  ]
);

// ==========================================
// FEAT-001-1-003: AI Workflow Orchestration Agent
// ==========================================

export const aafWorkflowDefinitions = pgTable(
  "aaf_workflow_definitions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    workflowCode: varchar("workflow_code", { length: 50 }).notNull(),
    workflowName: varchar("workflow_name", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 50 }),
    version: integer("version").notNull().default(1),
    steps: jsonb("steps"),
    triggerConfig: jsonb("trigger_config"),
    agentAssignments: jsonb("agent_assignments"),
    inputSchema: jsonb("input_schema"),
    outputSchema: jsonb("output_schema"),
    timeoutMs: integer("timeout_ms").default(300000),
    retryPolicy: jsonb("retry_policy"),
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
    index("aaf_wf_defs_tenant_id_idx").on(table.tenantId),
    uniqueIndex("aaf_wf_defs_tenant_code_version_idx").on(
      table.tenantId,
      table.workflowCode,
      table.version
    ),
    index("aaf_wf_defs_category_idx").on(table.category),
    index("aaf_wf_defs_is_active_idx").on(table.isActive),
  ]
);

export const aafWorkflowInstances = pgTable(
  "aaf_workflow_instances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    definitionId: uuid("definition_id")
      .notNull()
      .references(() => aafWorkflowDefinitions.id),
    instanceRef: varchar("instance_ref", { length: 50 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    currentStep: integer("current_step").default(0),
    totalSteps: integer("total_steps").default(0),
    input: jsonb("input"),
    state: jsonb("state"),
    output: jsonb("output"),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    durationMs: integer("duration_ms"),
    triggeredBy: uuid("triggered_by").references(() => users.id, { onDelete: "set null" }),
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
    index("aaf_wf_instances_tenant_id_idx").on(table.tenantId),
    index("aaf_wf_instances_definition_id_idx").on(table.definitionId),
    uniqueIndex("aaf_wf_instances_tenant_ref_idx").on(table.tenantId, table.instanceRef),
    index("aaf_wf_instances_status_idx").on(table.status),
    index("aaf_wf_instances_triggered_by_idx").on(table.triggeredBy),
    index("aaf_wf_instances_started_at_idx").on(table.startedAt),
  ]
);

// ==========================================
// FEAT-001-1-004: Human-in-Loop Escalation Engine
// ==========================================

export const aafEscalations = pgTable(
  "aaf_escalations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    escalationRef: varchar("escalation_ref", { length: 50 }).notNull(),
    sourceType: varchar("source_type", { length: 30 }).notNull(),
    sourceId: uuid("source_id"),
    agentId: uuid("agent_id").references(() => aafAgents.id),
    runId: uuid("run_id").references(() => aafAgentRuns.id),
    reason: text("reason").notNull(),
    reasonCode: varchar("reason_code", { length: 50 }),
    severity: varchar("severity", { length: 20 }).notNull().default("medium"),
    priority: varchar("priority", { length: 10 }).notNull().default("normal"),
    status: varchar("status", { length: 20 }).notNull().default("open"),
    contextData: jsonb("context_data"),
    suggestedActions: jsonb("suggested_actions"),
    assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
    assignedAt: timestamp("assigned_at", { withTimezone: true }),
    resolvedBy: uuid("resolved_by"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolution: text("resolution"),
    resolutionAction: varchar("resolution_action", { length: 30 }),
    feedbackToAgent: jsonb("feedback_to_agent"),
    slaDeadline: timestamp("sla_deadline", { withTimezone: true }),
    escalatedAt: timestamp("escalated_at", { withTimezone: true }).notNull().defaultNow(),
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
    index("aaf_escalations_tenant_id_idx").on(table.tenantId),
    uniqueIndex("aaf_escalations_tenant_ref_idx").on(table.tenantId, table.escalationRef),
    index("aaf_escalations_source_type_idx").on(table.sourceType),
    index("aaf_escalations_agent_id_idx").on(table.agentId),
    index("aaf_escalations_run_id_idx").on(table.runId),
    index("aaf_escalations_severity_idx").on(table.severity),
    index("aaf_escalations_status_idx").on(table.status),
    index("aaf_escalations_assigned_to_idx").on(table.assignedTo),
    index("aaf_escalations_sla_deadline_idx").on(table.slaDeadline),
  ]
);
