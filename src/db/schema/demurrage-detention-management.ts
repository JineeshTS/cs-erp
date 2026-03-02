import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
  index,
  uniqueIndex,
  numeric,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// FEAT-022-1-001: Demurrage Calculation Engine
// ==========================================

export const ddmDemurrageCalculations = pgTable(
  "ddm_demurrage_calculations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    calculationRef: varchar("calculation_ref", { length: 50 }).notNull(),
    containerNumber: varchar("container_number", { length: 20 }).notNull(),
    containerSize: varchar("container_size", { length: 10 }).notNull(),
    containerType: varchar("container_type", { length: 30 }).notNull(),
    bookingRef: varchar("booking_ref", { length: 50 }),
    blNumber: varchar("bl_number", { length: 50 }),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    portName: varchar("port_name", { length: 255 }).notNull(),
    portCountry: varchar("port_country", { length: 100 }),
    terminalName: varchar("terminal_name", { length: 255 }),
    dischargeDate: timestamp("discharge_date", { withTimezone: true }).notNull(),
    gateOutDate: timestamp("gate_out_date", { withTimezone: true }),
    freeTimeDays: integer("free_time_days").notNull(),
    freeTimeExpiry: timestamp("free_time_expiry", { withTimezone: true }).notNull(),
    demurrageDays: integer("demurrage_days"),
    dailyRate: numeric("daily_rate", { precision: 10, scale: 2 }).notNull(),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    tariffId: uuid("tariff_id"),
    tariffName: varchar("tariff_name", { length: 255 }),
    calculationBreakdown: jsonb("calculation_breakdown"),
    autoCalculated: boolean("auto_calculated").default(true),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("ddm_demurrage_calc_tenant_idx").on(t.tenantId),
    uniqueIndex("ddm_demurrage_calc_ref_tenant_idx").on(t.tenantId, t.calculationRef),
    index("ddm_demurrage_calc_container_idx").on(t.tenantId, t.containerNumber),
    index("ddm_demurrage_calc_customer_idx").on(t.tenantId, t.customerName),
    index("ddm_demurrage_calc_port_idx").on(t.tenantId, t.portName),
    index("ddm_demurrage_calc_status_idx").on(t.tenantId, t.status),
    index("ddm_demurrage_calc_discharge_idx").on(t.tenantId, t.dischargeDate),
    index("ddm_demurrage_calc_created_idx").on(t.createdAt),
    index("ddm_demurrage_calc_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-022-1-002: Free Time & Grace Period Management
// ==========================================

export const ddmFreeTimeRules = pgTable(
  "ddm_free_time_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    ruleRef: varchar("rule_ref", { length: 50 }).notNull(),
    ruleName: varchar("rule_name", { length: 255 }).notNull(),
    ruleType: varchar("rule_type", { length: 30 }).notNull(),
    applicableTo: varchar("applicable_to", { length: 30 }).notNull(),
    portName: varchar("port_name", { length: 255 }),
    portCountry: varchar("port_country", { length: 100 }),
    containerSize: varchar("container_size", { length: 10 }),
    containerType: varchar("container_type", { length: 30 }),
    customerName: varchar("customer_name", { length: 255 }),
    freeTimeDays: integer("free_time_days").notNull(),
    gracePeriodDays: integer("grace_period_days").default(0),
    weekendsExcluded: boolean("weekends_excluded").default(false),
    holidaysExcluded: boolean("holidays_excluded").default(false),
    holidayCalendar: jsonb("holiday_calendar"),
    tierStructure: jsonb("tier_structure"),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    priority: integer("priority").default(0),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("ddm_free_time_rules_tenant_idx").on(t.tenantId),
    uniqueIndex("ddm_free_time_rules_ref_tenant_idx").on(t.tenantId, t.ruleRef),
    index("ddm_free_time_rules_type_idx").on(t.tenantId, t.ruleType),
    index("ddm_free_time_rules_port_idx").on(t.tenantId, t.portName),
    index("ddm_free_time_rules_status_idx").on(t.tenantId, t.status),
    index("ddm_free_time_rules_created_idx").on(t.createdAt),
    index("ddm_free_time_rules_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-022-1-003: Detention Tracking per Container
// ==========================================

export const ddmDetentionTrackings = pgTable(
  "ddm_detention_trackings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    trackingRef: varchar("tracking_ref", { length: 50 }).notNull(),
    containerNumber: varchar("container_number", { length: 20 }).notNull(),
    containerSize: varchar("container_size", { length: 10 }).notNull(),
    containerType: varchar("container_type", { length: 30 }).notNull(),
    bookingRef: varchar("booking_ref", { length: 50 }),
    blNumber: varchar("bl_number", { length: 50 }),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    gateOutDate: timestamp("gate_out_date", { withTimezone: true }).notNull(),
    gateInDate: timestamp("gate_in_date", { withTimezone: true }),
    freeTimeDays: integer("free_time_days").notNull(),
    freeTimeExpiry: timestamp("free_time_expiry", { withTimezone: true }).notNull(),
    detentionDays: integer("detention_days"),
    dailyRate: numeric("daily_rate", { precision: 10, scale: 2 }).notNull(),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    depotName: varchar("depot_name", { length: 255 }),
    depotLocation: varchar("depot_location", { length: 255 }),
    containerCondition: varchar("container_condition", { length: 30 }),
    damageNotes: text("damage_notes"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("ddm_detention_track_tenant_idx").on(t.tenantId),
    uniqueIndex("ddm_detention_track_ref_tenant_idx").on(t.tenantId, t.trackingRef),
    index("ddm_detention_track_container_idx").on(t.tenantId, t.containerNumber),
    index("ddm_detention_track_customer_idx").on(t.tenantId, t.customerName),
    index("ddm_detention_track_status_idx").on(t.tenantId, t.status),
    index("ddm_detention_track_gate_out_idx").on(t.tenantId, t.gateOutDate),
    index("ddm_detention_track_created_idx").on(t.createdAt),
    index("ddm_detention_track_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-022-1-004: D&D Invoice Generation & Dispatch
// ==========================================

export const ddmInvoices = pgTable(
  "ddm_invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    invoiceRef: varchar("invoice_ref", { length: 50 }).notNull(),
    invoiceType: varchar("invoice_type", { length: 30 }).notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerCode: varchar("customer_code", { length: 50 }),
    containerNumber: varchar("container_number", { length: 20 }),
    bookingRef: varchar("booking_ref", { length: 50 }),
    blNumber: varchar("bl_number", { length: 50 }),
    demurrageAmount: numeric("demurrage_amount", { precision: 12, scale: 2 }),
    detentionAmount: numeric("detention_amount", { precision: 12, scale: 2 }),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }),
    taxRate: numeric("tax_rate", { precision: 5, scale: 2 }),
    taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD"),
    invoiceDate: timestamp("invoice_date", { withTimezone: true }).notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
    paidDate: timestamp("paid_date", { withTimezone: true }),
    paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }),
    lineItems: jsonb("line_items"),
    dispatchMethod: varchar("dispatch_method", { length: 30 }),
    dispatchedAt: timestamp("dispatched_at", { withTimezone: true }),
    customerEmail: varchar("customer_email", { length: 255 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("ddm_invoices_tenant_idx").on(t.tenantId),
    uniqueIndex("ddm_invoices_ref_tenant_idx").on(t.tenantId, t.invoiceRef),
    index("ddm_invoices_customer_idx").on(t.tenantId, t.customerName),
    index("ddm_invoices_type_idx").on(t.tenantId, t.invoiceType),
    index("ddm_invoices_status_idx").on(t.tenantId, t.status),
    index("ddm_invoices_date_idx").on(t.tenantId, t.invoiceDate),
    index("ddm_invoices_due_idx").on(t.tenantId, t.dueDate),
    index("ddm_invoices_created_idx").on(t.createdAt),
    index("ddm_invoices_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-022-2-001: D&D Dispute Resolution Workflow
// ==========================================

export const ddmDisputes = pgTable(
  "ddm_disputes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    disputeRef: varchar("dispute_ref", { length: 50 }).notNull(),
    invoiceRef: varchar("invoice_ref", { length: 50 }),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    containerNumber: varchar("container_number", { length: 20 }),
    disputeType: varchar("dispute_type", { length: 30 }).notNull(),
    disputeReason: text("dispute_reason").notNull(),
    disputedAmount: numeric("disputed_amount", { precision: 12, scale: 2 }).notNull(),
    originalAmount: numeric("original_amount", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    filedDate: timestamp("filed_date", { withTimezone: true }).notNull(),
    filedByName: varchar("filed_by_name", { length: 255 }),
    assignedToName: varchar("assigned_to_name", { length: 255 }),
    supportingDocuments: jsonb("supporting_documents"),
    resolutionNotes: text("resolution_notes"),
    resolvedAmount: numeric("resolved_amount", { precision: 12, scale: 2 }),
    resolvedDate: timestamp("resolved_date", { withTimezone: true }),
    resolvedByName: varchar("resolved_by_name", { length: 255 }),
    escalationLevel: integer("escalation_level").default(0),
    slaDeadline: timestamp("sla_deadline", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("open"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("ddm_disputes_tenant_idx").on(t.tenantId),
    uniqueIndex("ddm_disputes_ref_tenant_idx").on(t.tenantId, t.disputeRef),
    index("ddm_disputes_customer_idx").on(t.tenantId, t.customerName),
    index("ddm_disputes_type_idx").on(t.tenantId, t.disputeType),
    index("ddm_disputes_status_idx").on(t.tenantId, t.status),
    index("ddm_disputes_filed_idx").on(t.tenantId, t.filedDate),
    index("ddm_disputes_created_idx").on(t.createdAt),
    index("ddm_disputes_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-022-2-002: Waiver & Concession Management
// ==========================================

export const ddmWaivers = pgTable(
  "ddm_waivers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    waiverRef: varchar("waiver_ref", { length: 50 }).notNull(),
    waiverType: varchar("waiver_type", { length: 30 }).notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    containerNumber: varchar("container_number", { length: 20 }),
    invoiceRef: varchar("invoice_ref", { length: 50 }),
    originalAmount: numeric("original_amount", { precision: 12, scale: 2 }).notNull(),
    waivedAmount: numeric("waived_amount", { precision: 12, scale: 2 }).notNull(),
    waiverPercent: numeric("waiver_percent", { precision: 5, scale: 2 }),
    remainingAmount: numeric("remaining_amount", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    reason: text("reason").notNull(),
    justification: text("justification"),
    requestedByName: varchar("requested_by_name", { length: 255 }),
    requestedDate: timestamp("requested_date", { withTimezone: true }).notNull(),
    approvedByName: varchar("approved_by_name", { length: 255 }),
    approvedDate: timestamp("approved_date", { withTimezone: true }),
    approvalLevel: integer("approval_level"),
    conditions: text("conditions"),
    expiryDate: timestamp("expiry_date", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("ddm_waivers_tenant_idx").on(t.tenantId),
    uniqueIndex("ddm_waivers_ref_tenant_idx").on(t.tenantId, t.waiverRef),
    index("ddm_waivers_customer_idx").on(t.tenantId, t.customerName),
    index("ddm_waivers_type_idx").on(t.tenantId, t.waiverType),
    index("ddm_waivers_status_idx").on(t.tenantId, t.status),
    index("ddm_waivers_created_idx").on(t.createdAt),
    index("ddm_waivers_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-022-2-003: AI D&D Early Warning & Prediction
// ==========================================

export const ddmPredictions = pgTable(
  "ddm_predictions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    predictionRef: varchar("prediction_ref", { length: 50 }).notNull(),
    containerNumber: varchar("container_number", { length: 20 }).notNull(),
    bookingRef: varchar("booking_ref", { length: 50 }),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    portName: varchar("port_name", { length: 255 }),
    predictionType: varchar("prediction_type", { length: 30 }).notNull(),
    riskLevel: varchar("risk_level", { length: 20 }).notNull(),
    predictedDemurrageDays: integer("predicted_demurrage_days"),
    predictedDetentionDays: integer("predicted_detention_days"),
    predictedAmount: numeric("predicted_amount", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    confidenceScore: numeric("confidence_score", { precision: 5, scale: 2 }),
    modelVersion: varchar("model_version", { length: 50 }),
    inputFeatures: jsonb("input_features"),
    triggerFactors: jsonb("trigger_factors"),
    recommendations: jsonb("recommendations"),
    aiInsights: text("ai_insights"),
    alertSent: boolean("alert_sent").default(false),
    alertSentAt: timestamp("alert_sent_at", { withTimezone: true }),
    actualOutcome: text("actual_outcome"),
    accuracy: numeric("accuracy", { precision: 5, scale: 2 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("ddm_predictions_tenant_idx").on(t.tenantId),
    uniqueIndex("ddm_predictions_ref_tenant_idx").on(t.tenantId, t.predictionRef),
    index("ddm_predictions_container_idx").on(t.tenantId, t.containerNumber),
    index("ddm_predictions_customer_idx").on(t.tenantId, t.customerName),
    index("ddm_predictions_risk_idx").on(t.tenantId, t.riskLevel),
    index("ddm_predictions_status_idx").on(t.tenantId, t.status),
    index("ddm_predictions_created_idx").on(t.createdAt),
    index("ddm_predictions_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-022-2-004: Customer Automated Notifications
// ==========================================

export const ddmNotifications = pgTable(
  "ddm_notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    notificationRef: varchar("notification_ref", { length: 50 }).notNull(),
    notificationType: varchar("notification_type", { length: 30 }).notNull(),
    channel: varchar("channel", { length: 20 }).notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerEmail: varchar("customer_email", { length: 255 }),
    customerPhone: varchar("customer_phone", { length: 50 }),
    containerNumber: varchar("container_number", { length: 20 }),
    bookingRef: varchar("booking_ref", { length: 50 }),
    subject: varchar("subject", { length: 500 }).notNull(),
    body: text("body").notNull(),
    templateName: varchar("template_name", { length: 255 }),
    templateVariables: jsonb("template_variables"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    failureReason: text("failure_reason"),
    retryCount: integer("retry_count").default(0),
    relatedEntityType: varchar("related_entity_type", { length: 50 }),
    relatedEntityId: uuid("related_entity_id"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("ddm_notifications_tenant_idx").on(t.tenantId),
    uniqueIndex("ddm_notifications_ref_tenant_idx").on(t.tenantId, t.notificationRef),
    index("ddm_notifications_customer_idx").on(t.tenantId, t.customerName),
    index("ddm_notifications_type_idx").on(t.tenantId, t.notificationType),
    index("ddm_notifications_channel_idx").on(t.tenantId, t.channel),
    index("ddm_notifications_status_idx").on(t.tenantId, t.status),
    index("ddm_notifications_scheduled_idx").on(t.tenantId, t.scheduledAt),
    index("ddm_notifications_created_idx").on(t.createdAt),
    index("ddm_notifications_deleted_idx").on(t.deletedAt),
  ]
);
