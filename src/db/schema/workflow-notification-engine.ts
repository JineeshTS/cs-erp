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
// FEAT-033-1-001: Approval Workflow Builder & Management
// ==========================================

export const wneWorkflows = pgTable(
  "wne_workflows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    description: text("description"),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    triggerEvent: varchar("trigger_event", { length: 100 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    version: integer("version").notNull().default(1),
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
    index("wne_workflows_tenant_id_idx").on(table.tenantId),
    uniqueIndex("wne_workflows_tenant_slug_idx").on(
      table.tenantId,
      table.slug
    ),
    index("wne_workflows_entity_type_idx").on(table.entityType),
    index("wne_workflows_is_active_idx").on(table.isActive),
  ]
);

export const wneWorkflowSteps = pgTable(
  "wne_workflow_steps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    workflowId: uuid("workflow_id")
      .notNull()
      .references(() => wneWorkflows.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    stepOrder: integer("step_order").notNull(),
    stepType: varchar("step_type", { length: 30 })
      .notNull()
      .default("approval"),
    assigneeType: varchar("assignee_type", { length: 30 })
      .notNull()
      .default("role"),
    assigneeValue: varchar("assignee_value", { length: 255 }).notNull(),
    requiredApprovals: integer("required_approvals").notNull().default(1),
    autoApproveAfterHours: integer("auto_approve_after_hours"),
    conditions: jsonb("conditions"),
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
    index("wne_workflow_steps_tenant_id_idx").on(table.tenantId),
    index("wne_workflow_steps_workflow_id_idx").on(table.workflowId),
    index("wne_workflow_steps_order_idx").on(table.workflowId, table.stepOrder),
  ]
);

export const wneWorkflowInstances = pgTable(
  "wne_workflow_instances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    workflowId: uuid("workflow_id")
      .notNull()
      .references(() => wneWorkflows.id, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: uuid("entity_id").notNull(),
    currentStepId: uuid("current_step_id").references(
      () => wneWorkflowSteps.id
    ),
    status: varchar("status", { length: 30 })
      .notNull()
      .default("pending"),
    initiatedBy: uuid("initiated_by").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
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
    index("wne_workflow_instances_tenant_id_idx").on(table.tenantId),
    index("wne_workflow_instances_workflow_id_idx").on(table.workflowId),
    index("wne_workflow_instances_entity_idx").on(
      table.entityType,
      table.entityId
    ),
    index("wne_workflow_instances_status_idx").on(table.status),
    index("wne_workflow_instances_initiated_by_idx").on(table.initiatedBy),
  ]
);

export const wneWorkflowStepInstances = pgTable(
  "wne_workflow_step_instances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    instanceId: uuid("instance_id")
      .notNull()
      .references(() => wneWorkflowInstances.id, { onDelete: "cascade" }),
    stepId: uuid("step_id")
      .notNull()
      .references(() => wneWorkflowSteps.id, { onDelete: "cascade" }),
    assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
    status: varchar("status", { length: 30 })
      .notNull()
      .default("pending"),
    action: varchar("action", { length: 30 }),
    comment: text("comment"),
    actedAt: timestamp("acted_at", { withTimezone: true }),
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
    index("wne_wf_step_inst_tenant_id_idx").on(table.tenantId),
    index("wne_wf_step_inst_instance_id_idx").on(table.instanceId),
    index("wne_wf_step_inst_step_id_idx").on(table.stepId),
    index("wne_wf_step_inst_assigned_to_idx").on(table.assignedTo),
    index("wne_wf_step_inst_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-033-1-002: SLA Definition & Tracking
// ==========================================

export const wneSlaDefinitions = pgTable(
  "wne_sla_definitions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    triggerEvent: varchar("trigger_event", { length: 100 }).notNull(),
    targetHours: integer("target_hours").notNull(),
    warningHours: integer("warning_hours").notNull(),
    criticalHours: integer("critical_hours").notNull(),
    escalationPolicy: jsonb("escalation_policy"),
    isActive: boolean("is_active").notNull().default(true),
    priority: varchar("priority", { length: 20 })
      .notNull()
      .default("medium"),
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
    index("wne_sla_defs_tenant_id_idx").on(table.tenantId),
    index("wne_sla_defs_entity_type_idx").on(table.entityType),
    index("wne_sla_defs_is_active_idx").on(table.isActive),
  ]
);

export const wneSlaInstances = pgTable(
  "wne_sla_instances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    slaDefinitionId: uuid("sla_definition_id")
      .notNull()
      .references(() => wneSlaDefinitions.id, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: uuid("entity_id").notNull(),
    status: varchar("status", { length: 30 })
      .notNull()
      .default("on_track"),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    warningAt: timestamp("warning_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    breachedAt: timestamp("breached_at", { withTimezone: true }),
    assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
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
    index("wne_sla_inst_tenant_id_idx").on(table.tenantId),
    index("wne_sla_inst_def_id_idx").on(table.slaDefinitionId),
    index("wne_sla_inst_entity_idx").on(table.entityType, table.entityId),
    index("wne_sla_inst_status_idx").on(table.status),
    index("wne_sla_inst_due_at_idx").on(table.dueAt),
    index("wne_sla_inst_assigned_to_idx").on(table.assignedTo),
  ]
);

// ==========================================
// FEAT-033-1-003: Delegation of Authority (DOA) Matrix
// ==========================================

export const wneDoaMatrix = pgTable(
  "wne_doa_matrix",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    actionType: varchar("action_type", { length: 50 }).notNull(),
    roleId: uuid("role_id"),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    minAmount: integer("min_amount"),
    maxAmount: integer("max_amount"),
    currency: varchar("currency", { length: 3 }).default("USD"),
    requiresDualApproval: boolean("requires_dual_approval")
      .notNull()
      .default(false),
    delegatedFrom: uuid("delegated_from"),
    delegatedUntil: timestamp("delegated_until", { withTimezone: true }),
    conditions: jsonb("conditions"),
    isActive: boolean("is_active").notNull().default(true),
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
    index("wne_doa_matrix_tenant_id_idx").on(table.tenantId),
    index("wne_doa_matrix_entity_type_idx").on(table.entityType),
    index("wne_doa_matrix_action_type_idx").on(table.actionType),
    index("wne_doa_matrix_role_id_idx").on(table.roleId),
    index("wne_doa_matrix_user_id_idx").on(table.userId),
    index("wne_doa_matrix_is_active_idx").on(table.isActive),
  ]
);

// ==========================================
// FEAT-033-1-004: Auto-Assignment & Routing Rules
// ==========================================

export const wneRoutingRules = pgTable(
  "wne_routing_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    triggerEvent: varchar("trigger_event", { length: 100 }).notNull(),
    priority: integer("priority").notNull().default(0),
    conditions: jsonb("conditions").notNull(),
    assignmentType: varchar("assignment_type", { length: 30 })
      .notNull()
      .default("user"),
    assignmentValue: varchar("assignment_value", { length: 255 }).notNull(),
    fallbackAssignment: varchar("fallback_assignment", { length: 255 }),
    isActive: boolean("is_active").notNull().default(true),
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
    index("wne_routing_rules_tenant_id_idx").on(table.tenantId),
    index("wne_routing_rules_entity_type_idx").on(table.entityType),
    index("wne_routing_rules_trigger_idx").on(table.triggerEvent),
    index("wne_routing_rules_priority_idx").on(table.priority),
    index("wne_routing_rules_is_active_idx").on(table.isActive),
  ]
);

// ==========================================
// FEAT-033-2-001/002/003: Notification Templates (Email, WhatsApp, SMS)
// ==========================================

export const wneNotificationTemplates = pgTable(
  "wne_notification_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    channel: varchar("channel", { length: 20 }).notNull(),
    subject: varchar("subject", { length: 500 }),
    bodyTemplate: text("body_template").notNull(),
    bodyHtml: text("body_html"),
    variables: jsonb("variables"),
    locale: varchar("locale", { length: 10 }).notNull().default("en"),
    entityType: varchar("entity_type", { length: 50 }),
    triggerEvent: varchar("trigger_event", { length: 100 }),
    isActive: boolean("is_active").notNull().default(true),
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
    index("wne_notif_templates_tenant_id_idx").on(table.tenantId),
    uniqueIndex("wne_notif_templates_tenant_slug_channel_locale_idx").on(
      table.tenantId,
      table.slug,
      table.channel,
      table.locale
    ),
    index("wne_notif_templates_channel_idx").on(table.channel),
    index("wne_notif_templates_entity_type_idx").on(table.entityType),
    index("wne_notif_templates_is_active_idx").on(table.isActive),
  ]
);

// ==========================================
// FEAT-033-2-004: In-App Notification Centre
// ==========================================

export const wneNotifications = pgTable(
  "wne_notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    templateId: uuid("template_id").references(
      () => wneNotificationTemplates.id
    ),
    channel: varchar("channel", { length: 20 }).notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    body: text("body").notNull(),
    entityType: varchar("entity_type", { length: 50 }),
    entityId: uuid("entity_id"),
    actionUrl: varchar("action_url", { length: 500 }),
    priority: varchar("priority", { length: 20 })
      .notNull()
      .default("normal"),
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending"),
    readAt: timestamp("read_at", { withTimezone: true }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    failureReason: text("failure_reason"),
    externalId: varchar("external_id", { length: 255 }),
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
    index("wne_notifications_tenant_id_idx").on(table.tenantId),
    index("wne_notifications_user_id_idx").on(table.userId),
    index("wne_notifications_template_id_idx").on(table.templateId),
    index("wne_notifications_channel_idx").on(table.channel),
    index("wne_notifications_entity_idx").on(table.entityType, table.entityId),
    index("wne_notifications_status_idx").on(table.status),
    index("wne_notifications_read_at_idx").on(table.readAt),
    index("wne_notifications_created_at_idx").on(table.createdAt),
  ]
);

export const wneNotificationPreferences = pgTable(
  "wne_notification_preferences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    channel: varchar("channel", { length: 20 }).notNull(),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    isEnabled: boolean("is_enabled").notNull().default(true),
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
    index("wne_notif_prefs_tenant_id_idx").on(table.tenantId),
    index("wne_notif_prefs_user_id_idx").on(table.userId),
    uniqueIndex("wne_notif_prefs_user_channel_event_idx").on(
      table.userId,
      table.channel,
      table.eventType
    ),
  ]
);
