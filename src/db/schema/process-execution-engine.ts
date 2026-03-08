import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

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
