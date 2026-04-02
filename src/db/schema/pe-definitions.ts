import {
  pgTable,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  boolean,
  uuid,
  check,
  numeric,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { tenants } from "./tenants";
import { users } from "./users";
import { wneWorkflows } from "./workflow-notification-engine";

// ══════════════════════════════════════════════════════════════
// TASK-PROCESS-FLOW DEFINITION LAYER
// The template/definition tables that make tasks, processes,
// and E2E flows first-class DB entities.
// Prebuilt system templates have tenant_id = NULL, source = 'system'.
// ══════════════════════════════════════════════════════════════

// ── Task Definitions ──
// The atomic unit of work. Each task has a specific executor type,
// optional sub-steps, and can be linked into processes.

export const peTaskDefinitions = pgTable(
  "pe_task_definitions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id, {
      onDelete: "cascade",
    }),
    taskCode: varchar("task_code", { length: 30 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    domain: varchar("domain", { length: 50 }),

    // Execution config
    executorType: varchar("executor_type", { length: 20 }), // ai_agent | human | system | external
    executorMode: varchar("executor_mode", { length: 20 }), // crud | ai_with_tools | gate | human_form
    entityTable: varchar("entity_table", { length: 100 }), // target DB table
    entityAction: varchar("entity_action", { length: 10 }), // create | update | read
    executorConfig: jsonb("executor_config"), // StepExecutorConfig (field_mapping, tools, etc.)

    // Human/gate config
    gateType: varchar("gate_type", { length: 20 }), // approval | decision | input | exception
    assignedRole: varchar("assigned_role", { length: 100 }),
    slaHours: numeric("sla_hours", { precision: 6, scale: 2 }),
    aiAssistable: boolean("ai_assistable").notNull().default(true),

    // Approval workflow bridge (WNE integration)
    approvalWorkflowId: uuid("approval_workflow_id").references(
      () => wneWorkflows.id,
      { onDelete: "set null" }
    ),
    approvalTrigger: varchar("approval_trigger", { length: 20 }), // before_execute | after_execute | on_condition

    // Template metadata
    source: varchar("source", { length: 10 }).notNull().default("custom"), // system | cloned | custom
    clonedFromId: uuid("cloned_from_id").references(
      (): AnyPgColumn => peTaskDefinitions.id,
      { onDelete: "set null" }
    ),
    version: integer("version").notNull().default(1),
    isPublished: boolean("is_published").notNull().default(true),

    // Input/output spec
    inputFields: jsonb("input_fields"), // StepDataField[]
    outputFields: jsonb("output_fields"), // string[]
    validations: jsonb("validations"), // string[]

    // Standard columns
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
    index("pe_task_def_tenant_idx").on(table.tenantId),
    index("pe_task_def_code_idx").on(table.taskCode),
    index("pe_task_def_domain_idx").on(table.domain),
    index("pe_task_def_source_idx").on(table.source),
    index("pe_task_def_executor_idx").on(table.executorType),
  ]
);

// ── Task Step Definitions ──
// Ordered sub-steps within a task definition.

export const peTaskStepDefinitions = pgTable(
  "pe_task_step_definitions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id, {
      onDelete: "cascade",
    }),
    taskDefinitionId: uuid("task_definition_id")
      .notNull()
      .references(() => peTaskDefinitions.id, { onDelete: "cascade" }),
    stepOrder: integer("step_order").notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    type: varchar("type", { length: 10 }), // ai | human | system
    role: varchar("role", { length: 100 }),
    isOptional: boolean("is_optional").notNull().default(false),
    estimatedDurationMinutes: integer("estimated_duration_minutes"),
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
    index("pe_task_step_def_tenant_idx").on(table.tenantId),
    index("pe_task_step_def_task_idx").on(table.taskDefinitionId),
    uniqueIndex("pe_task_step_def_order_uniq").on(
      table.taskDefinitionId,
      table.stepOrder
    ),
  ]
);

// ══════════════════════════════════════════════════════════════
// PROCESS DEFINITIONS
// Replaces the hardcoded 316 operational processes in
// src/data/operational-processes.ts
// ══════════════════════════════════════════════════════════════

export const peProcessDefinitions = pgTable(
  "pe_process_definitions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id, {
      onDelete: "cascade",
    }),
    processCode: varchar("process_code", { length: 20 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    domain: varchar("domain", { length: 50 }),

    // Agent metadata
    agentName: varchar("agent_name", { length: 200 }),
    agentType: varchar("agent_type", { length: 30 }), // autonomous | semi-autonomous | assistive
    automationLevel: varchar("automation_level", { length: 20 }), // full_auto | semi_auto | ai_assisted | manual_ai_insights
    triggerType: varchar("trigger_type", { length: 20 }), // event | scheduled | manual | api

    // Input/output descriptions
    inputDescription: text("input_description"),
    outputDescription: text("output_description"),
    sla: varchar("sla", { length: 50 }),

    // Connected modules + dependencies
    connectedModules: jsonb("connected_modules"), // string[]
    crossDependencies: jsonb("cross_dependencies"), // string[] (PRC codes)

    // Template metadata
    source: varchar("source", { length: 10 }).notNull().default("custom"),
    clonedFromId: uuid("cloned_from_id").references(
      (): AnyPgColumn => peProcessDefinitions.id,
      { onDelete: "set null" }
    ),
    version: integer("version").notNull().default(1),
    isPublished: boolean("is_published").notNull().default(true),

    // Visual layout (for Process Studio canvas)
    visualLayout: jsonb("visual_layout"), // { nodes: Node[], edges: Edge[] }

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
    index("pe_proc_def_tenant_idx").on(table.tenantId),
    index("pe_proc_def_code_idx").on(table.processCode),
    index("pe_proc_def_domain_idx").on(table.domain),
    index("pe_proc_def_source_idx").on(table.source),
    index("pe_proc_def_automation_idx").on(table.automationLevel),
  ]
);

// ── Process-Task Links ──
// Ordered tasks within a process definition.

export const peProcessTaskLinks = pgTable(
  "pe_process_task_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id, {
      onDelete: "cascade",
    }),
    processDefinitionId: uuid("process_definition_id")
      .notNull()
      .references(() => peProcessDefinitions.id, { onDelete: "cascade" }),
    taskDefinitionId: uuid("task_definition_id")
      .notNull()
      .references(() => peTaskDefinitions.id, { onDelete: "cascade" }),
    taskOrder: integer("task_order").notNull(),
    phase: varchar("phase", { length: 100 }),
    condition: text("condition"), // JS-like condition for conditional execution
    isParallel: boolean("is_parallel").notNull().default(false),
    parallelGroup: varchar("parallel_group", { length: 50 }),
    dependencyRefs: jsonb("dependency_refs"), // [{ref, type, label}]
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
    index("pe_proc_task_link_tenant_idx").on(table.tenantId),
    index("pe_proc_task_link_proc_idx").on(table.processDefinitionId),
    index("pe_proc_task_link_task_idx").on(table.taskDefinitionId),
    uniqueIndex("pe_proc_task_link_order_uniq").on(
      table.processDefinitionId,
      table.taskOrder
    ),
  ]
);

// ══════════════════════════════════════════════════════════════
// E2E FLOW DEFINITIONS
// Replaces the hardcoded 39 E2E flows in
// src/data/e2e-process-flows.ts
// ══════════════════════════════════════════════════════════════

export const peFlowDefinitions = pgTable(
  "pe_flow_definitions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id, {
      onDelete: "cascade",
    }),
    flowCode: varchar("flow_code", { length: 20 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 30 }), // revenue_cycle | vessel_operations | etc.

    // Trigger config
    triggerEvent: varchar("trigger_event", { length: 100 }),
    entityType: varchar("entity_type", { length: 100 }),

    // Metadata arrays
    participatingModules: jsonb("participating_modules"), // string[]
    aiAgents: jsonb("ai_agents"), // string[]
    handoffPoints: jsonb("handoff_points"), // string[]
    typicalTimeline: varchar("typical_timeline", { length: 200 }),
    kpis: jsonb("kpis"), // string[]
    humanGates: jsonb("human_gates"), // string[]
    conditionalBranches: jsonb("conditional_branches"), // string[]
    childFlows: jsonb("child_flows"), // string[]

    // Template metadata
    source: varchar("source", { length: 10 }).notNull().default("custom"),
    clonedFromId: uuid("cloned_from_id").references(
      (): AnyPgColumn => peFlowDefinitions.id,
      { onDelete: "set null" }
    ),
    version: integer("version").notNull().default(1),
    isPublished: boolean("is_published").notNull().default(true),

    // Visual layout (for Flow Designer canvas)
    visualLayout: jsonb("visual_layout"), // { nodes: Node[], edges: Edge[] }

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
    index("pe_flow_def_tenant_idx").on(table.tenantId),
    index("pe_flow_def_code_idx").on(table.flowCode),
    index("pe_flow_def_category_idx").on(table.category),
    index("pe_flow_def_source_idx").on(table.source),
    index("pe_flow_def_trigger_idx").on(table.triggerEvent),
  ]
);

// ── Flow-Process Links ──
// Ordered processes (or standalone tasks for gates) within a flow.
// Exactly one of process_definition_id or task_definition_id must be set.

export const peFlowProcessLinks = pgTable(
  "pe_flow_process_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id, {
      onDelete: "cascade",
    }),
    flowDefinitionId: uuid("flow_definition_id")
      .notNull()
      .references(() => peFlowDefinitions.id, { onDelete: "cascade" }),

    // Points to EITHER a process OR a standalone task (for gates)
    processDefinitionId: uuid("process_definition_id").references(
      () => peProcessDefinitions.id,
      { onDelete: "cascade" }
    ),
    taskDefinitionId: uuid("task_definition_id").references(
      () => peTaskDefinitions.id,
      { onDelete: "cascade" }
    ),

    stepOrder: integer("step_order").notNull(),
    stepName: varchar("step_name", { length: 200 }), // display override
    phase: varchar("phase", { length: 100 }),
    module: varchar("module", { length: 100 }), // "Sales CRM", "Human Gate"
    moduleUrl: varchar("module_url", { length: 200 }), // deep link into module page
    condition: text("condition"),
    isParallel: boolean("is_parallel").notNull().default(false),
    parallelGroup: varchar("parallel_group", { length: 50 }),
    dependencyRefs: jsonb("dependency_refs"), // [{ref, type, label}]
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
    index("pe_flow_proc_link_tenant_idx").on(table.tenantId),
    index("pe_flow_proc_link_flow_idx").on(table.flowDefinitionId),
    index("pe_flow_proc_link_proc_idx").on(table.processDefinitionId),
    index("pe_flow_proc_link_task_idx").on(table.taskDefinitionId),
    uniqueIndex("pe_flow_proc_link_order_uniq").on(
      table.flowDefinitionId,
      table.stepOrder
    ),
  ]
);

// ══════════════════════════════════════════════════════════════
// TASK INSTANCES
// Runtime tracking when tasks are executed
// ══════════════════════════════════════════════════════════════

export const peTaskInstances = pgTable(
  "pe_task_instances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    taskDefinitionId: uuid("task_definition_id").references(
      () => peTaskDefinitions.id,
      { onDelete: "set null" }
    ),
    processInstanceId: uuid("process_instance_id"), // FK added after pe_process_instances exists
    flowStepInstanceId: uuid("flow_step_instance_id"), // FK to pe_e2e_step_instances

    taskCode: varchar("task_code", { length: 30 }),
    name: varchar("name", { length: 200 }).notNull(),
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending"), // pending | in_progress | completed | failed | blocked | cancelled
    priority: varchar("priority", { length: 10 })
      .notNull()
      .default("normal"), // critical | high | normal | low

    assignedTo: uuid("assigned_to").references(() => users.id, {
      onDelete: "set null",
    }),
    assignedRole: varchar("assigned_role", { length: 100 }),
    dueAt: timestamp("due_at", { withTimezone: true }),

    inputData: jsonb("input_data"),
    outputData: jsonb("output_data"),
    errorMessage: text("error_message"),

    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    durationMs: integer("duration_ms"),

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
    index("pe_task_inst_tenant_idx").on(table.tenantId),
    index("pe_task_inst_def_idx").on(table.taskDefinitionId),
    index("pe_task_inst_status_idx").on(table.status),
    index("pe_task_inst_assigned_idx").on(table.assignedTo),
    index("pe_task_inst_process_idx").on(table.processInstanceId),
    index("pe_task_inst_flow_step_idx").on(table.flowStepInstanceId),
    index("pe_task_inst_due_idx").on(table.dueAt),
    index("pe_task_inst_created_at_idx").on(table.createdAt),
  ]
);

// ── Task Step Instances ──
// Runtime tracking of sub-steps within a task instance.

export const peTaskStepInstances = pgTable(
  "pe_task_step_instances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    taskInstanceId: uuid("task_instance_id")
      .notNull()
      .references(() => peTaskInstances.id, { onDelete: "cascade" }),
    taskStepDefinitionId: uuid("task_step_definition_id").references(
      () => peTaskStepDefinitions.id,
      { onDelete: "set null" }
    ),
    stepOrder: integer("step_order").notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    type: varchar("type", { length: 10 }), // ai | human | system
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending"), // pending | in_progress | completed | failed | skipped

    assignedTo: uuid("assigned_to").references(() => users.id, {
      onDelete: "set null",
    }),
    outputData: jsonb("output_data"),
    notes: text("notes"),

    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),

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
    index("pe_task_step_inst_tenant_idx").on(table.tenantId),
    index("pe_task_step_inst_task_idx").on(table.taskInstanceId),
    index("pe_task_step_inst_status_idx").on(table.status),
    uniqueIndex("pe_task_step_inst_order_uniq").on(
      table.taskInstanceId,
      table.stepOrder
    ),
  ]
);
