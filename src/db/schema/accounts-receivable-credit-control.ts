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
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { users } from "./users";

// ==========================================
// FEAT-016-1-001: Customer Account Maintenance
// ==========================================

export const arccCustomerAccounts = pgTable(
  "arcc_customer_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    accountNumber: varchar("account_number", { length: 50 }).notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerCode: varchar("customer_code", { length: 50 }),
    tradingName: varchar("trading_name", { length: 255 }),
    registrationNumber: varchar("registration_number", { length: 100 }),
    taxId: varchar("tax_id", { length: 50 }),
    industry: varchar("industry", { length: 100 }),
    segment: varchar("segment", { length: 50 }),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    paymentTerms: varchar("payment_terms", { length: 50 }),
    billingAddress: text("billing_address"),
    billingEmail: varchar("billing_email", { length: 255 }),
    billingPhone: varchar("billing_phone", { length: 50 }),
    primaryContact: varchar("primary_contact", { length: 255 }),
    accountManagerId: uuid("account_manager_id"),
    accountManagerName: varchar("account_manager_name", { length: 255 }),
    totalOutstanding: integer("total_outstanding").notNull().default(0),
    totalOverdue: integer("total_overdue").notNull().default(0),
    lastPaymentDate: timestamp("last_payment_date", { withTimezone: true }),
    lastPaymentAmount: integer("last_payment_amount"),
    lastInvoiceDate: timestamp("last_invoice_date", { withTimezone: true }),
    accountStatus: varchar("account_status", { length: 20 }).notNull().default("active"),
    onHold: boolean("on_hold").notNull().default(false),
    holdReason: text("hold_reason"),
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
    index("arcc_ca_tenant_id_idx").on(table.tenantId),
    uniqueIndex("arcc_ca_tenant_account_idx").on(table.tenantId, table.accountNumber),
    index("arcc_ca_customer_name_idx").on(table.customerName),
    index("arcc_ca_customer_code_idx").on(table.customerCode),
    index("arcc_ca_segment_idx").on(table.segment),
    index("arcc_ca_status_idx").on(table.accountStatus),
    index("arcc_ca_on_hold_idx").on(table.onHold),
  ]
);

// ==========================================
// FEAT-016-1-002: Credit Limit & Risk Management
// ==========================================

export const arccCreditLimits = pgTable(
  "arcc_credit_limits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    accountId: uuid("account_id")
      .notNull()
      .references(() => arccCustomerAccounts.id, { onDelete: "cascade" }),
    accountNumber: varchar("account_number", { length: 50 }).notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    creditLimit: integer("credit_limit").notNull(),
    currentExposure: integer("current_exposure").notNull().default(0),
    availableCredit: integer("available_credit").notNull(),
    utilizationPercent: integer("utilization_percent").notNull().default(0),
    riskCategory: varchar("risk_category", { length: 20 }).notNull().default("standard"),
    riskScore: integer("risk_score"),
    riskFactors: jsonb("risk_factors"),
    creditInsured: boolean("credit_insured").notNull().default(false),
    insurerName: varchar("insurer_name", { length: 255 }),
    insuredAmount: integer("insured_amount"),
    insurancePolicyRef: varchar("insurance_policy_ref", { length: 100 }),
    insuranceExpiryDate: timestamp("insurance_expiry_date", { withTimezone: true }),
    lastReviewDate: timestamp("last_review_date", { withTimezone: true }),
    nextReviewDate: timestamp("next_review_date", { withTimezone: true }),
    approvedBy: uuid("approved_by"),
    approvedByName: varchar("approved_by_name", { length: 255 }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
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
    index("arcc_cl_tenant_id_idx").on(table.tenantId),
    index("arcc_cl_account_id_idx").on(table.accountId),
    index("arcc_cl_risk_category_idx").on(table.riskCategory),
    index("arcc_cl_status_idx").on(table.status),
    index("arcc_cl_next_review_idx").on(table.nextReviewDate),
    index("arcc_cl_insured_idx").on(table.creditInsured),
  ]
);

// ==========================================
// FEAT-016-1-003: Aging Analysis & Reporting
// ==========================================

export const arccAgingReports = pgTable(
  "arcc_aging_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    reportRef: varchar("report_ref", { length: 50 }).notNull(),
    reportType: varchar("report_type", { length: 30 }).notNull(),
    reportDate: timestamp("report_date", { withTimezone: true }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    totalReceivables: integer("total_receivables").notNull().default(0),
    currentAmount: integer("current_amount").notNull().default(0),
    days1to30: integer("days_1_to_30").notNull().default(0),
    days31to60: integer("days_31_to_60").notNull().default(0),
    days61to90: integer("days_61_to_90").notNull().default(0),
    days91to120: integer("days_91_to_120").notNull().default(0),
    over120Days: integer("over_120_days").notNull().default(0),
    totalCustomers: integer("total_customers").notNull().default(0),
    overdueCustomers: integer("overdue_customers").notNull().default(0),
    overduePercent: integer("overdue_percent").notNull().default(0),
    weightedAvgDaysSales: integer("weighted_avg_days_sales"),
    agingDetails: jsonb("aging_details"),
    filterCriteria: jsonb("filter_criteria"),
    generatedBy: uuid("generated_by"),
    generatedByName: varchar("generated_by_name", { length: 255 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
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
    index("arcc_ar_tenant_id_idx").on(table.tenantId),
    uniqueIndex("arcc_ar_tenant_ref_idx").on(table.tenantId, table.reportRef),
    index("arcc_ar_type_idx").on(table.reportType),
    index("arcc_ar_date_idx").on(table.reportDate),
    index("arcc_ar_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-016-1-004: Cash Application & Allocation
// ==========================================

export const arccCashApplications = pgTable(
  "arcc_cash_applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    applicationRef: varchar("application_ref", { length: 50 }).notNull(),
    accountId: uuid("account_id")
      .references(() => arccCustomerAccounts.id),
    accountNumber: varchar("account_number", { length: 50 }),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    paymentReference: varchar("payment_reference", { length: 100 }).notNull(),
    paymentMethod: varchar("payment_method", { length: 30 }).notNull(),
    paymentDate: timestamp("payment_date", { withTimezone: true }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    paymentAmount: integer("payment_amount").notNull(),
    appliedAmount: integer("applied_amount").notNull().default(0),
    unappliedAmount: integer("unapplied_amount").notNull(),
    bankReference: varchar("bank_reference", { length: 100 }),
    bankAccount: varchar("bank_account", { length: 50 }),
    exchangeRate: integer("exchange_rate"),
    baseCurrencyAmount: integer("base_currency_amount"),
    allocations: jsonb("allocations"),
    autoMatched: boolean("auto_matched").notNull().default(false),
    matchConfidence: integer("match_confidence"),
    appliedBy: uuid("applied_by"),
    appliedByName: varchar("applied_by_name", { length: 255 }),
    appliedAt: timestamp("applied_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
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
    index("arcc_cash_tenant_id_idx").on(table.tenantId),
    uniqueIndex("arcc_cash_tenant_ref_idx").on(table.tenantId, table.applicationRef),
    index("arcc_cash_account_id_idx").on(table.accountId),
    index("arcc_cash_payment_ref_idx").on(table.paymentReference),
    index("arcc_cash_payment_method_idx").on(table.paymentMethod),
    index("arcc_cash_payment_date_idx").on(table.paymentDate),
    index("arcc_cash_status_idx").on(table.status),
    index("arcc_cash_auto_matched_idx").on(table.autoMatched),
  ]
);

// ==========================================
// FEAT-016-2-001: Collection Workflow & Escalation
// ==========================================

export const arccCollectionWorkflows = pgTable(
  "arcc_collection_workflows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    workflowRef: varchar("workflow_ref", { length: 50 }).notNull(),
    accountId: uuid("account_id")
      .references(() => arccCustomerAccounts.id),
    accountNumber: varchar("account_number", { length: 50 }),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    totalOutstanding: integer("total_outstanding").notNull(),
    totalOverdue: integer("total_overdue").notNull().default(0),
    oldestOverdueDays: integer("oldest_overdue_days").notNull().default(0),
    invoiceCount: integer("invoice_count").notNull().default(0),
    escalationLevel: integer("escalation_level").notNull().default(1),
    escalationType: varchar("escalation_type", { length: 30 }).notNull(),
    assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
    assignedToName: varchar("assigned_to_name", { length: 255 }),
    lastContactDate: timestamp("last_contact_date", { withTimezone: true }),
    lastContactMethod: varchar("last_contact_method", { length: 30 }),
    nextActionDate: timestamp("next_action_date", { withTimezone: true }),
    nextActionType: varchar("next_action_type", { length: 30 }),
    promisedDate: timestamp("promised_date", { withTimezone: true }),
    promisedAmount: integer("promised_amount"),
    collectedAmount: integer("collected_amount").notNull().default(0),
    actionHistory: jsonb("action_history"),
    status: varchar("status", { length: 20 }).notNull().default("open"),
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
    index("arcc_cw_tenant_id_idx").on(table.tenantId),
    uniqueIndex("arcc_cw_tenant_ref_idx").on(table.tenantId, table.workflowRef),
    index("arcc_cw_account_id_idx").on(table.accountId),
    index("arcc_cw_escalation_level_idx").on(table.escalationLevel),
    index("arcc_cw_escalation_type_idx").on(table.escalationType),
    index("arcc_cw_assigned_to_idx").on(table.assignedTo),
    index("arcc_cw_next_action_idx").on(table.nextActionDate),
    index("arcc_cw_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-016-2-002: Bad Debt Provisioning & Write-Off
// ==========================================

export const arccBadDebtProvisions = pgTable(
  "arcc_bad_debt_provisions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    provisionRef: varchar("provision_ref", { length: 50 }).notNull(),
    provisionType: varchar("provision_type", { length: 30 }).notNull(),
    accountId: uuid("account_id")
      .references(() => arccCustomerAccounts.id),
    accountNumber: varchar("account_number", { length: 50 }),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    invoiceRef: varchar("invoice_ref", { length: 50 }),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    originalAmount: integer("original_amount").notNull(),
    provisionAmount: integer("provision_amount").notNull(),
    writeOffAmount: integer("write_off_amount").notNull().default(0),
    recoveredAmount: integer("recovered_amount").notNull().default(0),
    netProvision: integer("net_provision").notNull(),
    provisionPercent: integer("provision_percent").notNull().default(0),
    agingBucket: varchar("aging_bucket", { length: 30 }),
    reason: text("reason"),
    journalEntryRef: varchar("journal_entry_ref", { length: 50 }),
    glAccountCode: varchar("gl_account_code", { length: 20 }),
    accountingPeriod: varchar("accounting_period", { length: 10 }),
    approvedBy: uuid("approved_by"),
    approvedByName: varchar("approved_by_name", { length: 255 }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    writeOffDate: timestamp("write_off_date", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
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
    index("arcc_bdp_tenant_id_idx").on(table.tenantId),
    uniqueIndex("arcc_bdp_tenant_ref_idx").on(table.tenantId, table.provisionRef),
    index("arcc_bdp_type_idx").on(table.provisionType),
    index("arcc_bdp_account_id_idx").on(table.accountId),
    index("arcc_bdp_aging_bucket_idx").on(table.agingBucket),
    index("arcc_bdp_period_idx").on(table.accountingPeriod),
    index("arcc_bdp_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-016-2-003: AI Payment Prediction & Scoring
// ==========================================

export const arccPaymentPredictions = pgTable(
  "arcc_payment_predictions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    predictionRef: varchar("prediction_ref", { length: 50 }).notNull(),
    accountId: uuid("account_id")
      .references(() => arccCustomerAccounts.id),
    accountNumber: varchar("account_number", { length: 50 }),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    invoiceRef: varchar("invoice_ref", { length: 50 }),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    invoiceAmount: integer("invoice_amount").notNull(),
    outstandingAmount: integer("outstanding_amount").notNull(),
    predictedPaymentDate: timestamp("predicted_payment_date", { withTimezone: true }),
    predictedAmount: integer("predicted_amount"),
    paymentProbability: integer("payment_probability"),
    defaultProbability: integer("default_probability"),
    paymentScore: integer("payment_score"),
    riskScore: integer("risk_score"),
    behaviorScore: integer("behavior_score"),
    aiModelVersion: varchar("ai_model_version", { length: 50 }),
    confidenceScore: integer("confidence_score"),
    features: jsonb("features"),
    predictionFactors: jsonb("prediction_factors"),
    actualPaymentDate: timestamp("actual_payment_date", { withTimezone: true }),
    actualAmount: integer("actual_amount"),
    predictionAccuracy: integer("prediction_accuracy"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
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
    index("arcc_pp_tenant_id_idx").on(table.tenantId),
    uniqueIndex("arcc_pp_tenant_ref_idx").on(table.tenantId, table.predictionRef),
    index("arcc_pp_account_id_idx").on(table.accountId),
    index("arcc_pp_predicted_date_idx").on(table.predictedPaymentDate),
    index("arcc_pp_payment_score_idx").on(table.paymentScore),
    index("arcc_pp_risk_score_idx").on(table.riskScore),
    index("arcc_pp_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-016-2-004: Cash Flow Forecasting Dashboard
// ==========================================

export const arccCashFlowForecasts = pgTable(
  "arcc_cash_flow_forecasts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    forecastRef: varchar("forecast_ref", { length: 50 }).notNull(),
    forecastPeriod: varchar("forecast_period", { length: 10 }).notNull(),
    forecastYear: integer("forecast_year").notNull(),
    forecastMonth: integer("forecast_month").notNull(),
    forecastWeek: integer("forecast_week"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    openingBalance: integer("opening_balance").notNull().default(0),
    expectedInflows: integer("expected_inflows").notNull().default(0),
    confirmedInflows: integer("confirmed_inflows").notNull().default(0),
    probableInflows: integer("probable_inflows").notNull().default(0),
    atRiskInflows: integer("at_risk_inflows").notNull().default(0),
    expectedOutflows: integer("expected_outflows").notNull().default(0),
    netCashFlow: integer("net_cash_flow").notNull().default(0),
    closingBalance: integer("closing_balance").notNull().default(0),
    actualInflows: integer("actual_inflows"),
    actualOutflows: integer("actual_outflows"),
    varianceAmount: integer("variance_amount"),
    variancePercent: integer("variance_percent"),
    forecastMethod: varchar("forecast_method", { length: 30 }).notNull(),
    aiModelVersion: varchar("ai_model_version", { length: 50 }),
    confidenceScore: integer("confidence_score"),
    assumptions: jsonb("assumptions"),
    scenarioType: varchar("scenario_type", { length: 20 }).notNull().default("base"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    approvedBy: uuid("approved_by"),
    approvedByName: varchar("approved_by_name", { length: 255 }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
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
    index("arcc_cff_tenant_id_idx").on(table.tenantId),
    uniqueIndex("arcc_cff_tenant_ref_idx").on(table.tenantId, table.forecastRef),
    index("arcc_cff_period_idx").on(table.forecastPeriod),
    index("arcc_cff_year_month_idx").on(table.forecastYear, table.forecastMonth),
    index("arcc_cff_method_idx").on(table.forecastMethod),
    index("arcc_cff_scenario_idx").on(table.scenarioType),
    index("arcc_cff_status_idx").on(table.status),
  ]
);
