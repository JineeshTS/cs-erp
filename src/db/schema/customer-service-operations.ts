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
// FEAT-008-1-001: Service Categories
// ==========================================

export const csoServiceCategories = pgTable(
  "cso_service_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    categoryCode: varchar("category_code", { length: 50 }).notNull(),
    categoryName: varchar("category_name", { length: 255 }).notNull(),
    parentCategoryId: uuid("parent_category_id"),
    description: text("description"),
    slaHours: integer("sla_hours"),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").default(0),
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
    index("cso_service_categories_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cso_service_categories_tenant_code_idx").on(
      table.tenantId,
      table.categoryCode
    ),
    index("cso_service_categories_parent_idx").on(table.parentCategoryId),
    index("cso_service_categories_is_active_idx").on(table.isActive),
  ]
);

// ==========================================
// FEAT-008-1-002: Customer Inquiries
// ==========================================

export const csoInquiries = pgTable(
  "cso_inquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    inquiryNumber: varchar("inquiry_number", { length: 50 }).notNull(),
    categoryId: uuid("category_id").references(() => csoServiceCategories.id),
    customerId: uuid("customer_id"),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerEmail: varchar("customer_email", { length: 255 }),
    customerPhone: varchar("customer_phone", { length: 50 }),
    subject: varchar("subject", { length: 500 }).notNull(),
    description: text("description"),
    channel: varchar("channel", { length: 30 }).notNull().default("email"),
    priority: varchar("priority", { length: 20 }).notNull().default("normal"),
    status: varchar("status", { length: 30 }).notNull().default("open"),
    assignedTo: uuid("assigned_to"),
    assignedAt: timestamp("assigned_at", { withTimezone: true }),
    firstResponseAt: timestamp("first_response_at", { withTimezone: true }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    referenceType: varchar("reference_type", { length: 30 }),
    referenceId: uuid("reference_id"),
    tags: jsonb("tags"),
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
    index("cso_inquiries_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cso_inquiries_tenant_number_idx").on(
      table.tenantId,
      table.inquiryNumber
    ),
    index("cso_inquiries_category_id_idx").on(table.categoryId),
    index("cso_inquiries_customer_id_idx").on(table.customerId),
    index("cso_inquiries_status_idx").on(table.status),
    index("cso_inquiries_priority_idx").on(table.priority),
    index("cso_inquiries_assigned_to_idx").on(table.assignedTo),
    index("cso_inquiries_channel_idx").on(table.channel),
  ]
);

// ==========================================
// FEAT-008-1-003: Customer Complaints
// ==========================================

export const csoComplaints = pgTable(
  "cso_complaints",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    complaintNumber: varchar("complaint_number", { length: 50 }).notNull(),
    categoryId: uuid("category_id").references(() => csoServiceCategories.id),
    customerId: uuid("customer_id"),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerEmail: varchar("customer_email", { length: 255 }),
    customerPhone: varchar("customer_phone", { length: 50 }),
    subject: varchar("subject", { length: 500 }).notNull(),
    description: text("description"),
    complaintType: varchar("complaint_type", { length: 30 }).notNull().default("service"),
    severity: varchar("severity", { length: 20 }).notNull().default("medium"),
    status: varchar("status", { length: 30 }).notNull().default("open"),
    assignedTo: uuid("assigned_to"),
    assignedAt: timestamp("assigned_at", { withTimezone: true }),
    rootCause: text("root_cause"),
    correctionAction: text("correction_action"),
    preventiveAction: text("preventive_action"),
    compensationAmount: integer("compensation_amount"),
    compensationCurrency: varchar("compensation_currency", { length: 3 }),
    firstResponseAt: timestamp("first_response_at", { withTimezone: true }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    referenceType: varchar("reference_type", { length: 30 }),
    referenceId: uuid("reference_id"),
    tags: jsonb("tags"),
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
    index("cso_complaints_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cso_complaints_tenant_number_idx").on(
      table.tenantId,
      table.complaintNumber
    ),
    index("cso_complaints_category_id_idx").on(table.categoryId),
    index("cso_complaints_customer_id_idx").on(table.customerId),
    index("cso_complaints_status_idx").on(table.status),
    index("cso_complaints_severity_idx").on(table.severity),
    index("cso_complaints_assigned_to_idx").on(table.assignedTo),
    index("cso_complaints_complaint_type_idx").on(table.complaintType),
  ]
);

// ==========================================
// FEAT-008-1-004: Service Requests
// ==========================================

export const csoServiceRequests = pgTable(
  "cso_service_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    requestNumber: varchar("request_number", { length: 50 }).notNull(),
    categoryId: uuid("category_id").references(() => csoServiceCategories.id),
    customerId: uuid("customer_id"),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    requestType: varchar("request_type", { length: 30 }).notNull().default("general"),
    subject: varchar("subject", { length: 500 }).notNull(),
    description: text("description"),
    priority: varchar("priority", { length: 20 }).notNull().default("normal"),
    status: varchar("status", { length: 30 }).notNull().default("open"),
    assignedTo: uuid("assigned_to"),
    assignedAt: timestamp("assigned_at", { withTimezone: true }),
    dueDate: timestamp("due_date", { withTimezone: true }),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    estimatedHours: integer("estimated_hours"),
    actualHours: integer("actual_hours"),
    referenceType: varchar("reference_type", { length: 30 }),
    referenceId: uuid("reference_id"),
    tags: jsonb("tags"),
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
    index("cso_service_requests_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cso_service_requests_tenant_number_idx").on(
      table.tenantId,
      table.requestNumber
    ),
    index("cso_service_requests_category_id_idx").on(table.categoryId),
    index("cso_service_requests_customer_id_idx").on(table.customerId),
    index("cso_service_requests_status_idx").on(table.status),
    index("cso_service_requests_priority_idx").on(table.priority),
    index("cso_service_requests_assigned_to_idx").on(table.assignedTo),
    index("cso_service_requests_request_type_idx").on(table.requestType),
    index("cso_service_requests_due_date_idx").on(table.dueDate),
  ]
);

// ==========================================
// FEAT-008-1-005: SLA Policies
// ==========================================

export const csoSlaPolicies = pgTable(
  "cso_sla_policies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    policyCode: varchar("policy_code", { length: 50 }).notNull(),
    policyName: varchar("policy_name", { length: 255 }).notNull(),
    entityType: varchar("entity_type", { length: 30 }).notNull(),
    priority: varchar("priority", { length: 20 }).notNull().default("normal"),
    responseTimeHours: integer("response_time_hours").notNull(),
    resolutionTimeHours: integer("resolution_time_hours").notNull(),
    escalationAfterHours: integer("escalation_after_hours"),
    businessHoursOnly: boolean("business_hours_only").notNull().default(true),
    isActive: boolean("is_active").notNull().default(true),
    description: text("description"),
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
    index("cso_sla_policies_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cso_sla_policies_tenant_code_idx").on(
      table.tenantId,
      table.policyCode
    ),
    index("cso_sla_policies_entity_type_idx").on(table.entityType),
    index("cso_sla_policies_is_active_idx").on(table.isActive),
  ]
);

// ==========================================
// FEAT-008-1-006: SLA Breaches
// ==========================================

export const csoSlaBreaches = pgTable(
  "cso_sla_breaches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    slaPolicyId: uuid("sla_policy_id").references(() => csoSlaPolicies.id),
    entityType: varchar("entity_type", { length: 30 }).notNull(),
    entityId: uuid("entity_id").notNull(),
    breachType: varchar("breach_type", { length: 30 }).notNull(),
    expectedAt: timestamp("expected_at", { withTimezone: true }).notNull(),
    breachedAt: timestamp("breached_at", { withTimezone: true }).notNull(),
    overageMinutes: integer("overage_minutes"),
    acknowledged: boolean("acknowledged").notNull().default(false),
    acknowledgedBy: uuid("acknowledged_by"),
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
    index("cso_sla_breaches_tenant_id_idx").on(table.tenantId),
    index("cso_sla_breaches_sla_policy_id_idx").on(table.slaPolicyId),
    index("cso_sla_breaches_entity_type_idx").on(table.entityType),
    index("cso_sla_breaches_entity_id_idx").on(table.entityId),
    index("cso_sla_breaches_breach_type_idx").on(table.breachType),
    index("cso_sla_breaches_acknowledged_idx").on(table.acknowledged),
  ]
);

// ==========================================
// FEAT-008-1-007: Escalations
// ==========================================

export const csoEscalations = pgTable(
  "cso_escalations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 30 }).notNull(),
    entityId: uuid("entity_id").notNull(),
    escalationLevel: integer("escalation_level").notNull().default(1),
    reason: text("reason").notNull(),
    escalatedBy: uuid("escalated_by").notNull(),
    escalatedTo: uuid("escalated_to"),
    status: varchar("status", { length: 30 }).notNull().default("pending"),
    responseNotes: text("response_notes"),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
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
    index("cso_escalations_tenant_id_idx").on(table.tenantId),
    index("cso_escalations_entity_type_idx").on(table.entityType),
    index("cso_escalations_entity_id_idx").on(table.entityId),
    index("cso_escalations_escalated_by_idx").on(table.escalatedBy),
    index("cso_escalations_escalated_to_idx").on(table.escalatedTo),
    index("cso_escalations_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-008-1-008: Communication Logs
// ==========================================

export const csoCommunicationLogs = pgTable(
  "cso_communication_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 30 }).notNull(),
    entityId: uuid("entity_id").notNull(),
    direction: varchar("direction", { length: 10 }).notNull(),
    channel: varchar("channel", { length: 30 }).notNull(),
    fromAddress: varchar("from_address", { length: 255 }),
    toAddress: varchar("to_address", { length: 255 }),
    subject: varchar("subject", { length: 500 }),
    body: text("body"),
    sentBy: uuid("sent_by"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    readAt: timestamp("read_at", { withTimezone: true }),
    attachments: jsonb("attachments"),
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
    index("cso_communication_logs_tenant_id_idx").on(table.tenantId),
    index("cso_communication_logs_entity_type_idx").on(table.entityType),
    index("cso_communication_logs_entity_id_idx").on(table.entityId),
    index("cso_communication_logs_channel_idx").on(table.channel),
    index("cso_communication_logs_direction_idx").on(table.direction),
    index("cso_communication_logs_sent_by_idx").on(table.sentBy),
  ]
);

// ==========================================
// FEAT-008-1-009: Customer Feedback
// ==========================================

export const csoCustomerFeedback = pgTable(
  "cso_customer_feedback",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 30 }).notNull(),
    entityId: uuid("entity_id").notNull(),
    customerId: uuid("customer_id"),
    customerName: varchar("customer_name", { length: 255 }),
    rating: integer("rating"),
    satisfactionScore: integer("satisfaction_score"),
    feedbackText: text("feedback_text"),
    feedbackChannel: varchar("feedback_channel", { length: 30 }),
    respondedBy: uuid("responded_by"),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    responseText: text("response_text"),
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
    index("cso_customer_feedback_tenant_id_idx").on(table.tenantId),
    index("cso_customer_feedback_entity_type_idx").on(table.entityType),
    index("cso_customer_feedback_entity_id_idx").on(table.entityId),
    index("cso_customer_feedback_customer_id_idx").on(table.customerId),
    index("cso_customer_feedback_rating_idx").on(table.rating),
  ]
);

// ==========================================
// FEAT-008-1-010: Knowledge Articles
// ==========================================

export const csoKnowledgeArticles = pgTable(
  "cso_knowledge_articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    articleCode: varchar("article_code", { length: 50 }).notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    categoryId: uuid("category_id").references(() => csoServiceCategories.id),
    content: text("content"),
    summary: text("summary"),
    author: uuid("author"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    viewCount: integer("view_count").notNull().default(0),
    helpfulCount: integer("helpful_count").notNull().default(0),
    isPublic: boolean("is_public").notNull().default(false),
    tags: jsonb("tags"),
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
    index("cso_knowledge_articles_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cso_knowledge_articles_tenant_code_idx").on(
      table.tenantId,
      table.articleCode
    ),
    index("cso_knowledge_articles_category_id_idx").on(table.categoryId),
    index("cso_knowledge_articles_status_idx").on(table.status),
    index("cso_knowledge_articles_is_public_idx").on(table.isPublic),
    index("cso_knowledge_articles_author_idx").on(table.author),
  ]
);

// ==========================================
// FEAT-008-1-011: Agent Assignments
// ==========================================

export const csoAgentAssignments = pgTable(
  "cso_agent_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id").notNull(),
    entityType: varchar("entity_type", { length: 30 }).notNull(),
    entityId: uuid("entity_id").notNull(),
    assignedBy: uuid("assigned_by").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
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
    index("cso_agent_assignments_tenant_id_idx").on(table.tenantId),
    index("cso_agent_assignments_agent_id_idx").on(table.agentId),
    index("cso_agent_assignments_entity_type_idx").on(table.entityType),
    index("cso_agent_assignments_entity_id_idx").on(table.entityId),
    index("cso_agent_assignments_assigned_by_idx").on(table.assignedBy),
    index("cso_agent_assignments_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-008-1-012: Resolution Notes
// ==========================================

export const csoResolutionNotes = pgTable(
  "cso_resolution_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 30 }).notNull(),
    entityId: uuid("entity_id").notNull(),
    noteType: varchar("note_type", { length: 30 }).notNull().default("internal"),
    content: text("content").notNull(),
    createdBy: uuid("created_by").notNull(),
    isInternal: boolean("is_internal").notNull().default(true),
    attachments: jsonb("attachments"),
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
    index("cso_resolution_notes_tenant_id_idx").on(table.tenantId),
    index("cso_resolution_notes_entity_type_idx").on(table.entityType),
    index("cso_resolution_notes_entity_id_idx").on(table.entityId),
    index("cso_resolution_notes_created_by_idx").on(table.createdBy),
    index("cso_resolution_notes_note_type_idx").on(table.noteType),
  ]
);
