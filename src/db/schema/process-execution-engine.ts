import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  index,
  boolean,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { users } from "./users";

// ── Process Instances ──
// Tracks a running process (PRC-xxx instance) end-to-end

export const peProcessInstances = pgTable(
  "pe_process_instances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    processId: varchar("process_id", { length: 20 }).notNull(), // e.g. "PRC-025"
    processName: varchar("process_name", { length: 255 }).notNull(),
    status: varchar("status", { length: 30 })
      .notNull()
      .default("pending"), // pending | in_progress | waiting_approval | completed | failed | cancelled
    currentStep: integer("current_step").notNull().default(0),
    totalSteps: integer("total_steps").notNull().default(0),
    triggerType: varchar("trigger_type", { length: 20 }).notNull(), // event | scheduled | manual | api
    triggeredBy: uuid("triggered_by"), // user who triggered (null for system/scheduled)
    entityType: varchar("entity_type", { length: 50 }), // booking, vessel, invoice, etc.
    entityId: uuid("entity_id"), // FK to the entity being processed
    contextJson: jsonb("context_json"), // arbitrary context (booking_id, vessel_id, etc.)
    slaDeadline: timestamp("sla_deadline", { withTimezone: true }),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    failureReason: text("failure_reason"),
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
    index("pe_proc_inst_tenant_id_idx").on(table.tenantId),
    index("pe_proc_inst_process_id_idx").on(table.processId),
    index("pe_proc_inst_status_idx").on(table.status),
    index("pe_proc_inst_entity_idx").on(table.entityType, table.entityId),
    index("pe_proc_inst_triggered_by_idx").on(table.triggeredBy),
    index("pe_proc_inst_created_at_idx").on(table.createdAt),
  ]
);

// ── Process Step Instances ──
// Tracks each step within a running process

export const peStepInstances = pgTable(
  "pe_step_instances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    processInstanceId: uuid("process_instance_id")
      .notNull()
      .references(() => peProcessInstances.id, { onDelete: "cascade" }),
    stepNumber: integer("step_number").notNull(),
    stepName: varchar("step_name", { length: 255 }).notNull(),
    executorType: varchar("executor_type", { length: 20 }).notNull(), // ai | human | system
    executorId: varchar("executor_id", { length: 255 }), // agent name or user ID
    status: varchar("status", { length: 30 })
      .notNull()
      .default("pending"), // pending | in_progress | completed | failed | skipped
    inputJson: jsonb("input_json"),
    outputJson: jsonb("output_json"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    failureReason: text("failure_reason"),
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
    index("pe_step_inst_tenant_id_idx").on(table.tenantId),
    index("pe_step_inst_proc_inst_id_idx").on(table.processInstanceId),
    index("pe_step_inst_status_idx").on(table.status),
    index("pe_step_inst_step_number_idx").on(table.processInstanceId, table.stepNumber),
  ]
);

// ── Process Approvals ──
// Human approval gates within processes

export const peApprovals = pgTable(
  "pe_approvals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    stepInstanceId: uuid("step_instance_id")
      .notNull()
      .references(() => peStepInstances.id, { onDelete: "cascade" }),
    processInstanceId: uuid("process_instance_id")
      .notNull()
      .references(() => peProcessInstances.id, { onDelete: "cascade" }),
    approverId: uuid("approver_id").notNull(), // user who needs to approve
    decision: varchar("decision", { length: 20 }), // approved | rejected | null (pending)
    comment: text("comment"),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    dueAt: timestamp("due_at", { withTimezone: true }),
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
    index("pe_approvals_tenant_id_idx").on(table.tenantId),
    index("pe_approvals_step_inst_id_idx").on(table.stepInstanceId),
    index("pe_approvals_proc_inst_id_idx").on(table.processInstanceId),
    index("pe_approvals_approver_id_idx").on(table.approverId),
    index("pe_approvals_decision_idx").on(table.decision),
  ]
);

// ── Process Event Log ──
// Immutable log of all events that triggered or were emitted by processes

export const peEventLog = pgTable(
  "pe_event_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: varchar("entity_id", { length: 255 }).notNull(),
    processInstanceId: uuid("process_instance_id"), // null if event didn't trigger a process
    userId: uuid("user_id"),
    payload: jsonb("payload"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("pe_event_log_tenant_id_idx").on(table.tenantId),
    index("pe_event_log_event_type_idx").on(table.eventType),
    index("pe_event_log_entity_idx").on(table.entityType, table.entityId),
    index("pe_event_log_proc_inst_idx").on(table.processInstanceId),
    index("pe_event_log_created_at_idx").on(table.createdAt),
  ]
);

// ══════════════════════════════════════════════════════════════
// E2E FLOW ORCHESTRATION TABLES (D-005)
// These track end-to-end flows that span multiple PRC processes
// ══════════════════════════════════════════════════════════════

// ── E2E Flow Instances ──
// Tracks a running E2E flow (e.g. E2E-01 Booking-to-Cash)

export const peE2eFlowInstances = pgTable(
  "pe_e2e_flow_instances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    e2eFlowId: varchar("e2e_flow_id", { length: 20 }).notNull(), // E2E-01, E2E-02, etc.
    entityType: varchar("entity_type", { length: 50 }).notNull(), // booking, container, vessel, etc.
    entityId: varchar("entity_id", { length: 100 }).notNull(), // BK-00123, CSIU1234567, etc.
    triggerEvent: varchar("trigger_event", { length: 100 }).notNull(), // booking.confirmed, vessel.arrived, etc.
    status: varchar("status", { length: 30 })
      .notNull()
      .default("active"), // active | paused_at_gate | completed | failed | cancelled
    currentStepNumber: integer("current_step_number").notNull().default(1),
    totalSteps: integer("total_steps").notNull(),
    parentFlowInstanceId: uuid("parent_flow_instance_id"), // self-ref for child flows
    metadata: jsonb("metadata").default({}),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
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
    index("pe_e2e_flow_tenant_idx").on(table.tenantId),
    index("pe_e2e_flow_id_idx").on(table.e2eFlowId),
    index("pe_e2e_flow_entity_idx").on(table.entityType, table.entityId),
    index("pe_e2e_flow_status_idx").on(table.status),
    index("pe_e2e_flow_parent_idx").on(table.parentFlowInstanceId),
    index("pe_e2e_flow_created_at_idx").on(table.createdAt),
  ]
);

// ── E2E Step Instances ──
// Tracks each step within a running E2E flow

export const peE2eStepInstances = pgTable(
  "pe_e2e_step_instances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    flowInstanceId: uuid("flow_instance_id")
      .notNull()
      .references(() => peE2eFlowInstances.id, { onDelete: "cascade" }),
    stepNumber: integer("step_number").notNull(),
    processRef: varchar("process_ref", { length: 20 }), // PRC-xxx (null if no mapped process)
    stepName: varchar("step_name", { length: 255 }).notNull(),
    executorType: varchar("executor_type", { length: 20 }).notNull(), // ai_agent | human | system | external
    agentId: varchar("agent_id", { length: 100 }), // AI agent name or null
    status: varchar("status", { length: 30 })
      .notNull()
      .default("pending"), // pending | in_progress | completed | failed | skipped | blocked
    inputData: jsonb("input_data").default({}),
    outputData: jsonb("output_data").default({}),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    durationMs: integer("duration_ms"),
    blockedByStepId: uuid("blocked_by_step_id"), // self-ref: step that must complete first
    parallelGroup: varchar("parallel_group", { length: 50 }), // steps in same group run in parallel
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("pe_e2e_step_tenant_idx").on(table.tenantId),
    index("pe_e2e_step_flow_idx").on(table.flowInstanceId),
    index("pe_e2e_step_status_idx").on(table.status),
    index("pe_e2e_step_process_idx").on(table.processRef),
    index("pe_e2e_step_number_idx").on(table.flowInstanceId, table.stepNumber),
  ]
);

// ── Human Gates ──
// Human intervention points within E2E flows (approval, decision, input, exception)

export const peHumanGates = pgTable(
  "pe_human_gates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    stepInstanceId: uuid("step_instance_id")
      .notNull()
      .references(() => peE2eStepInstances.id, { onDelete: "cascade" }),
    flowInstanceId: uuid("flow_instance_id")
      .notNull()
      .references(() => peE2eFlowInstances.id, { onDelete: "cascade" }),
    gateType: varchar("gate_type", { length: 20 }).notNull(), // approval | decision | input | exception
    assignedToRole: varchar("assigned_to_role", { length: 100 }).notNull(),
    assignedToUserId: uuid("assigned_to_user_id")
      .references(() => users.id),
    aiRecommendation: jsonb("ai_recommendation").default({}),
    presentedInfo: jsonb("presented_info").default({}),
    slaDeadline: timestamp("sla_deadline", { withTimezone: true }).notNull(),
    escalationToRole: varchar("escalation_to_role", { length: 100 }),
    escalationToUserId: uuid("escalation_to_user_id")
      .references(() => users.id),
    priority: varchar("priority", { length: 20 })
      .notNull()
      .default("normal"), // critical | high | normal | low
    decision: varchar("decision", { length: 50 }), // approved | rejected | option_selected | input_provided | null (pending)
    decisionData: jsonb("decision_data"),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    decidedBy: uuid("decided_by")
      .references(() => users.id),
    autoApproved: boolean("auto_approved").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("pe_human_gate_tenant_idx").on(table.tenantId),
    index("pe_human_gate_assigned_idx").on(table.assignedToUserId, table.decision),
    index("pe_human_gate_flow_idx").on(table.flowInstanceId),
    index("pe_human_gate_step_idx").on(table.stepInstanceId),
    index("pe_human_gate_sla_idx").on(table.slaDeadline),
    index("pe_human_gate_type_idx").on(table.gateType),
  ]
);

// ── Flow Events ──
// Immutable log of events within E2E flows

export const peFlowEvents = pgTable(
  "pe_flow_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    flowInstanceId: uuid("flow_instance_id")
      .notNull()
      .references(() => peE2eFlowInstances.id, { onDelete: "cascade" }),
    stepInstanceId: uuid("step_instance_id"), // null for flow-level events
    eventType: varchar("event_type", { length: 50 }).notNull(), // flow_started | step_completed | gate_created | gate_resolved | flow_completed | error | escalation
    metadata: jsonb("metadata").default({}),
    cascadedFlowIds: jsonb("cascaded_flow_ids"), // IDs of child flows spawned by this event
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("pe_flow_event_tenant_idx").on(table.tenantId),
    index("pe_flow_event_flow_idx").on(table.flowInstanceId),
    index("pe_flow_event_type_idx").on(table.eventType),
    index("pe_flow_event_created_at_idx").on(table.createdAt),
  ]
);

// ── Event Triggers ──
// Maps business events (booking.confirmed, vessel.arrived) to E2E flows

export const peEventTriggers = pgTable(
  "pe_event_triggers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    eventType: varchar("event_type", { length: 100 }).notNull(), // booking.confirmed, vessel.eta_24h, etc.
    e2eFlowId: varchar("e2e_flow_id", { length: 20 }).notNull(), // E2E-01, E2E-02, etc.
    conditions: jsonb("conditions").default({}), // conditional trigger (e.g. { "has_reefer": true } → E2E-05)
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    priority: integer("priority").notNull().default(0), // higher = evaluated first
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("pe_event_trigger_tenant_idx").on(table.tenantId),
    index("pe_event_trigger_event_idx").on(table.eventType),
    index("pe_event_trigger_active_idx").on(table.eventType, table.isActive),
    index("pe_event_trigger_flow_idx").on(table.e2eFlowId),
  ]
);
