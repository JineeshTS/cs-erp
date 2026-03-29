import {
  pgTable,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { users } from "./users";

// ==========================================
// FEAT-015-1-001: Freight Invoice Generation & Dispatch
// ==========================================

export const firmFreightInvoices = pgTable(
  "firm_freight_invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
    invoiceType: varchar("invoice_type", { length: 30 }).notNull(),
    voyageRef: varchar("voyage_ref", { length: 50 }),
    bookingRef: varchar("booking_ref", { length: 50 }),
    blNumber: varchar("bl_number", { length: 50 }),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerCode: varchar("customer_code", { length: 50 }),
    billingAddress: text("billing_address"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    subtotal: integer("subtotal").notNull().default(0),
    taxAmount: integer("tax_amount").notNull().default(0),
    discountAmount: integer("discount_amount").notNull().default(0),
    totalAmount: integer("total_amount").notNull(),
    paidAmount: integer("paid_amount").notNull().default(0),
    outstandingAmount: integer("outstanding_amount").notNull(),
    exchangeRate: integer("exchange_rate"),
    baseCurrencyAmount: integer("base_currency_amount"),
    paymentTerms: varchar("payment_terms", { length: 50 }),
    dueDate: timestamp("due_date", { withTimezone: true }),
    issuedAt: timestamp("issued_at", { withTimezone: true }),
    dispatchedAt: timestamp("dispatched_at", { withTimezone: true }),
    dispatchMethod: varchar("dispatch_method", { length: 30 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
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
    index("firm_inv_tenant_id_idx").on(table.tenantId),
    uniqueIndex("firm_inv_tenant_number_idx").on(table.tenantId, table.invoiceNumber),
    index("firm_inv_type_idx").on(table.invoiceType),
    index("firm_inv_customer_idx").on(table.customerName),
    index("firm_inv_voyage_idx").on(table.voyageRef),
    index("firm_inv_bl_idx").on(table.blNumber),
    index("firm_inv_status_idx").on(table.status),
    index("firm_inv_due_date_idx").on(table.dueDate),
  ]
);

// ==========================================
// Invoice Line Items
// ==========================================

export const firmInvoiceLineItems = pgTable(
  "firm_invoice_line_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => firmFreightInvoices.id, { onDelete: "cascade" }),
    lineNumber: integer("line_number").notNull(),
    chargeCode: varchar("charge_code", { length: 30 }).notNull(),
    description: text("description").notNull(),
    containerNumber: varchar("container_number", { length: 20 }),
    containerType: varchar("container_type", { length: 30 }),
    quantity: integer("quantity").notNull().default(1),
    unitPrice: integer("unit_price").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    amount: integer("amount").notNull(),
    taxRate: integer("tax_rate").notNull().default(0),
    taxAmount: integer("tax_amount").notNull().default(0),
    totalAmount: integer("total_amount").notNull(),
    tariffRef: varchar("tariff_ref", { length: 50 }),
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
    index("firm_li_tenant_id_idx").on(table.tenantId),
    index("firm_li_invoice_idx").on(table.invoiceId),
    index("firm_li_charge_code_idx").on(table.chargeCode),
    index("firm_li_container_idx").on(table.containerNumber),
  ]
);

// ==========================================
// FEAT-015-1-002: Debit Note & Credit Note Management
// ==========================================

export const firmDebitCreditNotes = pgTable(
  "firm_debit_credit_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    noteNumber: varchar("note_number", { length: 50 }).notNull(),
    noteType: varchar("note_type", { length: 20 }).notNull(),
    invoiceId: uuid("invoice_id")
      .references(() => firmFreightInvoices.id),
    invoiceNumber: varchar("invoice_number", { length: 50 }),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerCode: varchar("customer_code", { length: 50 }),
    reason: varchar("reason", { length: 100 }).notNull(),
    description: text("description"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    amount: integer("amount").notNull(),
    taxAmount: integer("tax_amount").notNull().default(0),
    totalAmount: integer("total_amount").notNull(),
    lineItems: jsonb("line_items"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    issuedAt: timestamp("issued_at", { withTimezone: true }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    approvedBy: uuid("approved_by"),
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
    index("firm_dcn_tenant_id_idx").on(table.tenantId),
    uniqueIndex("firm_dcn_tenant_number_idx").on(table.tenantId, table.noteNumber),
    index("firm_dcn_type_idx").on(table.noteType),
    index("firm_dcn_invoice_idx").on(table.invoiceId),
    index("firm_dcn_customer_idx").on(table.customerName),
    index("firm_dcn_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-015-1-003: Invoice Amendment & Reissue
// ==========================================

export const firmInvoiceAmendments = pgTable(
  "firm_invoice_amendments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    amendmentRef: varchar("amendment_ref", { length: 50 }).notNull(),
    originalInvoiceId: uuid("original_invoice_id")
      .notNull()
      .references(() => firmFreightInvoices.id),
    originalInvoiceNumber: varchar("original_invoice_number", { length: 50 }).notNull(),
    amendmentType: varchar("amendment_type", { length: 30 }).notNull(),
    reason: varchar("reason", { length: 255 }).notNull(),
    description: text("description"),
    previousAmount: integer("previous_amount").notNull(),
    newAmount: integer("new_amount").notNull(),
    adjustmentAmount: integer("adjustment_amount").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    changedFields: jsonb("changed_fields"),
    newInvoiceId: uuid("new_invoice_id")
      .references(() => firmFreightInvoices.id),
    newInvoiceNumber: varchar("new_invoice_number", { length: 50 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    approvedBy: uuid("approved_by"),
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
    index("firm_amend_tenant_id_idx").on(table.tenantId),
    uniqueIndex("firm_amend_tenant_ref_idx").on(table.tenantId, table.amendmentRef),
    index("firm_amend_orig_inv_idx").on(table.originalInvoiceId),
    index("firm_amend_type_idx").on(table.amendmentType),
    index("firm_amend_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-015-1-004: Proforma Invoice Management
// ==========================================

export const firmProformaInvoices = pgTable(
  "firm_proforma_invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    proformaNumber: varchar("proforma_number", { length: 50 }).notNull(),
    voyageRef: varchar("voyage_ref", { length: 50 }),
    bookingRef: varchar("booking_ref", { length: 50 }),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerCode: varchar("customer_code", { length: 50 }),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    subtotal: integer("subtotal").notNull().default(0),
    taxAmount: integer("tax_amount").notNull().default(0),
    totalAmount: integer("total_amount").notNull(),
    lineItems: jsonb("line_items"),
    validUntil: timestamp("valid_until", { withTimezone: true }),
    convertedToInvoiceId: uuid("converted_to_invoice_id")
      .references(() => firmFreightInvoices.id),
    convertedAt: timestamp("converted_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    issuedAt: timestamp("issued_at", { withTimezone: true }),
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
    index("firm_proforma_tenant_id_idx").on(table.tenantId),
    uniqueIndex("firm_proforma_tenant_number_idx").on(table.tenantId, table.proformaNumber),
    index("firm_proforma_customer_idx").on(table.customerName),
    index("firm_proforma_voyage_idx").on(table.voyageRef),
    index("firm_proforma_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-015-2-001: Revenue Accrual & Deferral IFRS
// ==========================================

export const firmRevenueAccruals = pgTable(
  "firm_revenue_accruals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    accrualRef: varchar("accrual_ref", { length: 50 }).notNull(),
    voyageRef: varchar("voyage_ref", { length: 50 }),
    invoiceId: uuid("invoice_id")
      .references(() => firmFreightInvoices.id),
    accrualType: varchar("accrual_type", { length: 30 }).notNull(),
    accountingPeriod: varchar("accounting_period", { length: 20 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    accrualAmount: integer("accrual_amount").notNull(),
    deferralAmount: integer("deferral_amount").notNull().default(0),
    recognizedAmount: integer("recognized_amount").notNull().default(0),
    remainingAmount: integer("remaining_amount").notNull(),
    journalEntryRef: varchar("journal_entry_ref", { length: 50 }),
    glAccountCode: varchar("gl_account_code", { length: 30 }),
    reversalDate: timestamp("reversal_date", { withTimezone: true }),
    reversalRef: varchar("reversal_ref", { length: 50 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    postedAt: timestamp("posted_at", { withTimezone: true }),
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
    index("firm_accr_tenant_id_idx").on(table.tenantId),
    uniqueIndex("firm_accr_tenant_ref_idx").on(table.tenantId, table.accrualRef),
    index("firm_accr_voyage_idx").on(table.voyageRef),
    index("firm_accr_invoice_idx").on(table.invoiceId),
    index("firm_accr_type_idx").on(table.accrualType),
    index("firm_accr_period_idx").on(table.accountingPeriod),
    index("firm_accr_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-015-2-002: Invoice Dispute Resolution Workflow
// ==========================================

export const firmInvoiceDisputes = pgTable(
  "firm_invoice_disputes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    disputeRef: varchar("dispute_ref", { length: 50 }).notNull(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => firmFreightInvoices.id),
    invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    disputeType: varchar("dispute_type", { length: 30 }).notNull(),
    disputedAmount: integer("disputed_amount").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    reason: text("reason").notNull(),
    customerEvidence: jsonb("customer_evidence"),
    assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
    assignedToName: varchar("assigned_to_name", { length: 255 }),
    resolutionType: varchar("resolution_type", { length: 30 }),
    resolvedAmount: integer("resolved_amount"),
    resolutionNotes: text("resolution_notes"),
    status: varchar("status", { length: 20 }).notNull().default("open"),
    escalatedAt: timestamp("escalated_at", { withTimezone: true }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    slaDeadline: timestamp("sla_deadline", { withTimezone: true }),
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
    index("firm_disp_tenant_id_idx").on(table.tenantId),
    uniqueIndex("firm_disp_tenant_ref_idx").on(table.tenantId, table.disputeRef),
    index("firm_disp_invoice_idx").on(table.invoiceId),
    index("firm_disp_customer_idx").on(table.customerName),
    index("firm_disp_type_idx").on(table.disputeType),
    index("firm_disp_status_idx").on(table.status),
    index("firm_disp_assigned_idx").on(table.assignedTo),
  ]
);

// ==========================================
// FEAT-015-2-003: AI Collection Follow-Up & Dunning
// ==========================================

export const firmDunningRuns = pgTable(
  "firm_dunning_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    runRef: varchar("run_ref", { length: 50 }).notNull(),
    runType: varchar("run_type", { length: 30 }).notNull(),
    targetSegment: varchar("target_segment", { length: 50 }),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    totalOutstanding: integer("total_outstanding").notNull().default(0),
    invoicesTargeted: integer("invoices_targeted").notNull().default(0),
    customersTargeted: integer("customers_targeted").notNull().default(0),
    actionsGenerated: integer("actions_generated").notNull().default(0),
    actionsCompleted: integer("actions_completed").notNull().default(0),
    amountCollected: integer("amount_collected").notNull().default(0),
    aiRecommendations: jsonb("ai_recommendations"),
    aiModelVersion: varchar("ai_model_version", { length: 20 }),
    status: varchar("status", { length: 20 }).notNull().default("planned"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
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
    index("firm_dunn_tenant_id_idx").on(table.tenantId),
    uniqueIndex("firm_dunn_tenant_ref_idx").on(table.tenantId, table.runRef),
    index("firm_dunn_type_idx").on(table.runType),
    index("firm_dunn_status_idx").on(table.status),
  ]
);

export const firmDunningActions = pgTable(
  "firm_dunning_actions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    actionRef: varchar("action_ref", { length: 50 }).notNull(),
    runId: uuid("run_id")
      .references(() => firmDunningRuns.id),
    invoiceId: uuid("invoice_id")
      .references(() => firmFreightInvoices.id),
    invoiceNumber: varchar("invoice_number", { length: 50 }),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    actionType: varchar("action_type", { length: 30 }).notNull(),
    dunningLevel: integer("dunning_level").notNull().default(1),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    outstandingAmount: integer("outstanding_amount").notNull(),
    daysPastDue: integer("days_past_due").notNull().default(0),
    contactMethod: varchar("contact_method", { length: 20 }),
    contactDetails: text("contact_details"),
    messageTemplate: varchar("message_template", { length: 100 }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    promisedDate: timestamp("promised_date", { withTimezone: true }),
    promisedAmount: integer("promised_amount"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
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
    index("firm_da_tenant_id_idx").on(table.tenantId),
    uniqueIndex("firm_da_tenant_ref_idx").on(table.tenantId, table.actionRef),
    index("firm_da_run_idx").on(table.runId),
    index("firm_da_invoice_idx").on(table.invoiceId),
    index("firm_da_customer_idx").on(table.customerName),
    index("firm_da_type_idx").on(table.actionType),
    index("firm_da_level_idx").on(table.dunningLevel),
    index("firm_da_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-015-2-004: Revenue Forecasting & Pipeline
// ==========================================

export const firmRevenueForecastEntries = pgTable(
  "firm_revenue_forecast_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    forecastRef: varchar("forecast_ref", { length: 50 }).notNull(),
    forecastPeriod: varchar("forecast_period", { length: 20 }).notNull(),
    forecastYear: integer("forecast_year").notNull(),
    forecastMonth: integer("forecast_month"),
    serviceRoute: varchar("service_route", { length: 100 }),
    customerSegment: varchar("customer_segment", { length: 50 }),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    forecastRevenue: integer("forecast_revenue").notNull(),
    actualRevenue: integer("actual_revenue"),
    variance: integer("variance"),
    variancePercent: integer("variance_percent"),
    pipelineValue: integer("pipeline_value").notNull().default(0),
    confirmedValue: integer("confirmed_value").notNull().default(0),
    probabilityPercent: integer("probability_percent"),
    forecastMethod: varchar("forecast_method", { length: 30 }),
    aiModelVersion: varchar("ai_model_version", { length: 20 }),
    confidenceScore: integer("confidence_score"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
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
    index("firm_fcst_tenant_id_idx").on(table.tenantId),
    uniqueIndex("firm_fcst_tenant_ref_idx").on(table.tenantId, table.forecastRef),
    index("firm_fcst_period_idx").on(table.forecastPeriod),
    index("firm_fcst_year_idx").on(table.forecastYear),
    index("firm_fcst_route_idx").on(table.serviceRoute),
    index("firm_fcst_status_idx").on(table.status),
  ]
);
