import {
  pgTable,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
  index,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// FEAT-017-1-001: Vendor Master & Onboarding Management
// ==========================================

export const apvmVendorMasters = pgTable(
  "apvm_vendor_masters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    vendorCode: varchar("vendor_code", { length: 50 }).notNull(),
    vendorName: varchar("vendor_name", { length: 255 }).notNull(),
    tradingName: varchar("trading_name", { length: 255 }),
    vendorType: varchar("vendor_type", { length: 30 }).notNull(),
    registrationNumber: varchar("registration_number", { length: 100 }),
    taxId: varchar("tax_id", { length: 50 }),
    industry: varchar("industry", { length: 100 }),
    country: varchar("country", { length: 3 }),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    paymentTerms: varchar("payment_terms", { length: 50 }),
    bankName: varchar("bank_name", { length: 255 }),
    bankAccountNumber: varchar("bank_account_number", { length: 50 }),
    bankSwiftCode: varchar("bank_swift_code", { length: 20 }),
    bankIban: varchar("bank_iban", { length: 50 }),
    contactName: varchar("contact_name", { length: 255 }),
    contactEmail: varchar("contact_email", { length: 255 }),
    contactPhone: varchar("contact_phone", { length: 50 }),
    address: text("address"),
    onboardingStatus: varchar("onboarding_status", { length: 20 }).notNull().default("pending"),
    onboardingChecklist: jsonb("onboarding_checklist"),
    approvedBy: uuid("approved_by"),
    approvedByName: varchar("approved_by_name", { length: 255 }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    riskRating: varchar("risk_rating", { length: 20 }),
    performanceScore: integer("performance_score"),
    totalSpend: integer("total_spend").notNull().default(0),
    totalOrders: integer("total_orders").notNull().default(0),
    status: varchar("status", { length: 20 }).notNull().default("active"),
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
    index("apvm_vm_tenant_id_idx").on(table.tenantId),
    uniqueIndex("apvm_vm_tenant_code_idx").on(table.tenantId, table.vendorCode),
    index("apvm_vm_vendor_name_idx").on(table.vendorName),
    index("apvm_vm_vendor_type_idx").on(table.vendorType),
    index("apvm_vm_country_idx").on(table.country),
    index("apvm_vm_onboarding_idx").on(table.onboardingStatus),
    index("apvm_vm_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-017-1-002: Purchase Order Management
// ==========================================

export const apvmPurchaseOrders = pgTable(
  "apvm_purchase_orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    poNumber: varchar("po_number", { length: 50 }).notNull(),
    vendorId: uuid("vendor_id")
      .references(() => apvmVendorMasters.id),
    vendorCode: varchar("vendor_code", { length: 50 }),
    vendorName: varchar("vendor_name", { length: 255 }).notNull(),
    poType: varchar("po_type", { length: 30 }).notNull(),
    description: text("description"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    subtotal: integer("subtotal").notNull().default(0),
    taxAmount: integer("tax_amount").notNull().default(0),
    totalAmount: integer("total_amount").notNull(),
    deliveryDate: timestamp("delivery_date", { withTimezone: true }),
    deliveryAddress: text("delivery_address"),
    lineItems: jsonb("line_items"),
    paymentTerms: varchar("payment_terms", { length: 50 }),
    budgetCode: varchar("budget_code", { length: 50 }),
    costCentre: varchar("cost_centre", { length: 50 }),
    requestedBy: uuid("requested_by"),
    requestedByName: varchar("requested_by_name", { length: 255 }),
    approvedBy: uuid("approved_by"),
    approvedByName: varchar("approved_by_name", { length: 255 }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    receivedAmount: integer("received_amount").notNull().default(0),
    invoicedAmount: integer("invoiced_amount").notNull().default(0),
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
    index("apvm_po_tenant_id_idx").on(table.tenantId),
    uniqueIndex("apvm_po_tenant_number_idx").on(table.tenantId, table.poNumber),
    index("apvm_po_vendor_id_idx").on(table.vendorId),
    index("apvm_po_vendor_name_idx").on(table.vendorName),
    index("apvm_po_type_idx").on(table.poType),
    index("apvm_po_delivery_date_idx").on(table.deliveryDate),
    index("apvm_po_budget_code_idx").on(table.budgetCode),
    index("apvm_po_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-017-1-003: Vendor Invoice Processing & Matching
// ==========================================

export const apvmVendorInvoices = pgTable(
  "apvm_vendor_invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
    vendorInvoiceRef: varchar("vendor_invoice_ref", { length: 100 }),
    vendorId: uuid("vendor_id")
      .references(() => apvmVendorMasters.id),
    vendorCode: varchar("vendor_code", { length: 50 }),
    vendorName: varchar("vendor_name", { length: 255 }).notNull(),
    poId: uuid("po_id")
      .references(() => apvmPurchaseOrders.id),
    poNumber: varchar("po_number", { length: 50 }),
    invoiceDate: timestamp("invoice_date", { withTimezone: true }).notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    subtotal: integer("subtotal").notNull().default(0),
    taxAmount: integer("tax_amount").notNull().default(0),
    totalAmount: integer("total_amount").notNull(),
    paidAmount: integer("paid_amount").notNull().default(0),
    outstandingAmount: integer("outstanding_amount").notNull(),
    lineItems: jsonb("line_items"),
    exchangeRate: integer("exchange_rate"),
    baseCurrencyAmount: integer("base_currency_amount"),
    matchStatus: varchar("match_status", { length: 20 }).notNull().default("unmatched"),
    matchedAt: timestamp("matched_at", { withTimezone: true }),
    approvedBy: uuid("approved_by"),
    approvedByName: varchar("approved_by_name", { length: 255 }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
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
    index("apvm_vi_tenant_id_idx").on(table.tenantId),
    uniqueIndex("apvm_vi_tenant_number_idx").on(table.tenantId, table.invoiceNumber),
    index("apvm_vi_vendor_id_idx").on(table.vendorId),
    index("apvm_vi_vendor_name_idx").on(table.vendorName),
    index("apvm_vi_po_id_idx").on(table.poId),
    index("apvm_vi_due_date_idx").on(table.dueDate),
    index("apvm_vi_match_status_idx").on(table.matchStatus),
    index("apvm_vi_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-017-1-004: 3-Way Match Automation
// ==========================================

export const apvmThreeWayMatches = pgTable(
  "apvm_three_way_matches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    matchRef: varchar("match_ref", { length: 50 }).notNull(),
    invoiceId: uuid("invoice_id")
      .references(() => apvmVendorInvoices.id),
    invoiceNumber: varchar("invoice_number", { length: 50 }),
    poId: uuid("po_id")
      .references(() => apvmPurchaseOrders.id),
    poNumber: varchar("po_number", { length: 50 }),
    vendorName: varchar("vendor_name", { length: 255 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    poAmount: integer("po_amount").notNull(),
    grAmount: integer("gr_amount").notNull(),
    invoiceAmount: integer("invoice_amount").notNull(),
    varianceAmount: integer("variance_amount").notNull().default(0),
    variancePercent: integer("variance_percent").notNull().default(0),
    tolerancePercent: integer("tolerance_percent").notNull().default(5),
    withinTolerance: boolean("within_tolerance").notNull().default(false),
    priceMatch: boolean("price_match").notNull().default(false),
    quantityMatch: boolean("quantity_match").notNull().default(false),
    lineMatchDetails: jsonb("line_match_details"),
    autoMatched: boolean("auto_matched").notNull().default(false),
    matchedBy: uuid("matched_by"),
    matchedByName: varchar("matched_by_name", { length: 255 }),
    matchedAt: timestamp("matched_at", { withTimezone: true }),
    exceptionReason: text("exception_reason"),
    resolvedBy: uuid("resolved_by"),
    resolvedByName: varchar("resolved_by_name", { length: 255 }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
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
    index("apvm_twm_tenant_id_idx").on(table.tenantId),
    uniqueIndex("apvm_twm_tenant_ref_idx").on(table.tenantId, table.matchRef),
    index("apvm_twm_invoice_id_idx").on(table.invoiceId),
    index("apvm_twm_po_id_idx").on(table.poId),
    index("apvm_twm_vendor_name_idx").on(table.vendorName),
    index("apvm_twm_within_tolerance_idx").on(table.withinTolerance),
    index("apvm_twm_auto_matched_idx").on(table.autoMatched),
    index("apvm_twm_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-017-2-001: Payment Processing & Scheduling
// ==========================================

export const apvmPaymentSchedules = pgTable(
  "apvm_payment_schedules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    scheduleRef: varchar("schedule_ref", { length: 50 }).notNull(),
    vendorId: uuid("vendor_id")
      .references(() => apvmVendorMasters.id),
    vendorName: varchar("vendor_name", { length: 255 }).notNull(),
    invoiceId: uuid("invoice_id")
      .references(() => apvmVendorInvoices.id),
    invoiceNumber: varchar("invoice_number", { length: 50 }),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    paymentAmount: integer("payment_amount").notNull(),
    scheduledDate: timestamp("scheduled_date", { withTimezone: true }).notNull(),
    paymentMethod: varchar("payment_method", { length: 30 }).notNull(),
    bankAccount: varchar("bank_account", { length: 50 }),
    beneficiaryAccount: varchar("beneficiary_account", { length: 50 }),
    paymentReference: varchar("payment_reference", { length: 100 }),
    exchangeRate: integer("exchange_rate"),
    baseCurrencyAmount: integer("base_currency_amount"),
    batchId: varchar("batch_id", { length: 50 }),
    priorityLevel: varchar("priority_level", { length: 20 }).notNull().default("normal"),
    approvedBy: uuid("approved_by"),
    approvedByName: varchar("approved_by_name", { length: 255 }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    executedAt: timestamp("executed_at", { withTimezone: true }),
    confirmationRef: varchar("confirmation_ref", { length: 100 }),
    status: varchar("status", { length: 20 }).notNull().default("scheduled"),
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
    index("apvm_ps_tenant_id_idx").on(table.tenantId),
    uniqueIndex("apvm_ps_tenant_ref_idx").on(table.tenantId, table.scheduleRef),
    index("apvm_ps_vendor_id_idx").on(table.vendorId),
    index("apvm_ps_invoice_id_idx").on(table.invoiceId),
    index("apvm_ps_scheduled_date_idx").on(table.scheduledDate),
    index("apvm_ps_payment_method_idx").on(table.paymentMethod),
    index("apvm_ps_batch_id_idx").on(table.batchId),
    index("apvm_ps_priority_idx").on(table.priorityLevel),
    index("apvm_ps_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-017-2-002: Vendor Account Reconciliation
// ==========================================

export const apvmVendorReconciliations = pgTable(
  "apvm_vendor_reconciliations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    reconciliationRef: varchar("reconciliation_ref", { length: 50 }).notNull(),
    vendorId: uuid("vendor_id")
      .references(() => apvmVendorMasters.id),
    vendorName: varchar("vendor_name", { length: 255 }).notNull(),
    reconciliationDate: timestamp("reconciliation_date", { withTimezone: true }).notNull(),
    periodFrom: timestamp("period_from", { withTimezone: true }),
    periodTo: timestamp("period_to", { withTimezone: true }),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    ourBalance: integer("our_balance").notNull(),
    vendorBalance: integer("vendor_balance").notNull(),
    differenceAmount: integer("difference_amount").notNull().default(0),
    reconciledAmount: integer("reconciled_amount").notNull().default(0),
    unreconciledAmount: integer("unreconciled_amount").notNull().default(0),
    unreconciledItems: jsonb("unreconciled_items"),
    adjustmentEntries: jsonb("adjustment_entries"),
    totalInvoices: integer("total_invoices").notNull().default(0),
    totalPayments: integer("total_payments").notNull().default(0),
    matchedItems: integer("matched_items").notNull().default(0),
    unmatchedItems: integer("unmatched_items").notNull().default(0),
    performedBy: uuid("performed_by"),
    performedByName: varchar("performed_by_name", { length: 255 }),
    reviewedBy: uuid("reviewed_by"),
    reviewedByName: varchar("reviewed_by_name", { length: 255 }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
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
    index("apvm_vr_tenant_id_idx").on(table.tenantId),
    uniqueIndex("apvm_vr_tenant_ref_idx").on(table.tenantId, table.reconciliationRef),
    index("apvm_vr_vendor_id_idx").on(table.vendorId),
    index("apvm_vr_vendor_name_idx").on(table.vendorName),
    index("apvm_vr_recon_date_idx").on(table.reconciliationDate),
    index("apvm_vr_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-017-2-003: AI Invoice Data Extraction OCR
// ==========================================

export const apvmOcrExtractions = pgTable(
  "apvm_ocr_extractions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    extractionRef: varchar("extraction_ref", { length: 50 }).notNull(),
    documentId: varchar("document_id", { length: 100 }),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileType: varchar("file_type", { length: 20 }).notNull(),
    fileSize: integer("file_size"),
    vendorName: varchar("vendor_name", { length: 255 }),
    extractedVendorCode: varchar("extracted_vendor_code", { length: 50 }),
    extractedInvoiceNumber: varchar("extracted_invoice_number", { length: 100 }),
    extractedInvoiceDate: timestamp("extracted_invoice_date", { withTimezone: true }),
    extractedDueDate: timestamp("extracted_due_date", { withTimezone: true }),
    extractedCurrency: varchar("extracted_currency", { length: 3 }),
    extractedSubtotal: integer("extracted_subtotal"),
    extractedTaxAmount: integer("extracted_tax_amount"),
    extractedTotalAmount: integer("extracted_total_amount"),
    extractedLineItems: jsonb("extracted_line_items"),
    extractedFields: jsonb("extracted_fields"),
    confidenceScore: integer("confidence_score"),
    aiModelVersion: varchar("ai_model_version", { length: 50 }),
    processingTimeMs: integer("processing_time_ms"),
    validationErrors: jsonb("validation_errors"),
    linkedInvoiceId: uuid("linked_invoice_id")
      .references(() => apvmVendorInvoices.id),
    reviewedBy: uuid("reviewed_by"),
    reviewedByName: varchar("reviewed_by_name", { length: 255 }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("processing"),
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
    index("apvm_ocr_tenant_id_idx").on(table.tenantId),
    uniqueIndex("apvm_ocr_tenant_ref_idx").on(table.tenantId, table.extractionRef),
    index("apvm_ocr_vendor_name_idx").on(table.vendorName),
    index("apvm_ocr_file_type_idx").on(table.fileType),
    index("apvm_ocr_confidence_idx").on(table.confidenceScore),
    index("apvm_ocr_linked_invoice_idx").on(table.linkedInvoiceId),
    index("apvm_ocr_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-017-2-004: Spend Analytics & Reporting
// ==========================================

export const apvmSpendAnalytics = pgTable(
  "apvm_spend_analytics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    reportRef: varchar("report_ref", { length: 50 }).notNull(),
    reportType: varchar("report_type", { length: 30 }).notNull(),
    reportPeriod: varchar("report_period", { length: 10 }).notNull(),
    reportYear: integer("report_year").notNull(),
    reportMonth: integer("report_month").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    totalSpend: integer("total_spend").notNull().default(0),
    totalOrders: integer("total_orders").notNull().default(0),
    totalInvoices: integer("total_invoices").notNull().default(0),
    totalPayments: integer("total_payments").notNull().default(0),
    averagePaymentDays: integer("average_payment_days"),
    onTimePaymentPercent: integer("on_time_payment_percent"),
    topVendors: jsonb("top_vendors"),
    spendByCategory: jsonb("spend_by_category"),
    spendByDepartment: jsonb("spend_by_department"),
    savingsIdentified: integer("savings_identified"),
    contractCompliance: integer("contract_compliance"),
    maverick_spend: integer("maverick_spend"),
    aiInsights: jsonb("ai_insights"),
    aiModelVersion: varchar("ai_model_version", { length: 50 }),
    generatedBy: uuid("generated_by"),
    generatedByName: varchar("generated_by_name", { length: 255 }),
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
    index("apvm_sa_tenant_id_idx").on(table.tenantId),
    uniqueIndex("apvm_sa_tenant_ref_idx").on(table.tenantId, table.reportRef),
    index("apvm_sa_type_idx").on(table.reportType),
    index("apvm_sa_year_month_idx").on(table.reportYear, table.reportMonth),
    index("apvm_sa_status_idx").on(table.status),
  ]
);
