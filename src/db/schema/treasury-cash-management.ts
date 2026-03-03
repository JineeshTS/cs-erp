import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// Bank Account Portfolio Management
// ==========================================
export const tcmBankAccounts = pgTable(
  "tcm_bank_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    accountRef: varchar("account_ref", { length: 50 }).notNull(),
    accountType: varchar("account_type", { length: 30 }).notNull(), // current, savings, fixed_deposit, nostro, vostro, escrow
    bankName: varchar("bank_name", { length: 255 }).notNull(),
    accountNumber: varchar("account_number", { length: 50 }),
    iban: varchar("iban", { length: 50 }),
    swiftCode: varchar("swift_code", { length: 20 }),
    branchName: varchar("branch_name", { length: 255 }),
    branchCode: varchar("branch_code", { length: 50 }),
    currency: varchar("currency", { length: 3 }).default("QAR"),
    currentBalance: decimal("current_balance", { precision: 18, scale: 2 }),
    availableBalance: decimal("available_balance", { precision: 18, scale: 2 }),
    overdraftLimit: decimal("overdraft_limit", { precision: 18, scale: 2 }),
    interestRate: decimal("interest_rate", { precision: 8, scale: 4 }),
    accountHolder: varchar("account_holder", { length: 255 }),
    authorizedSignatories: jsonb("authorized_signatories"),
    entityId: varchar("entity_id", { length: 100 }),
    glAccountCode: varchar("gl_account_code", { length: 50 }),
    openingDate: timestamp("opening_date", { withTimezone: true }),
    closingDate: timestamp("closing_date", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("tcm_bank_acct_tenant_idx").on(t.tenantId),
    index("tcm_bank_acct_ref_idx").on(t.accountRef),
    index("tcm_bank_acct_status_idx").on(t.status),
    index("tcm_bank_acct_type_idx").on(t.accountType),
    index("tcm_bank_acct_currency_idx").on(t.currency),
  ]
);

// ==========================================
// Daily Cash Position Dashboard
// ==========================================
export const tcmCashPositions = pgTable(
  "tcm_cash_positions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    positionRef: varchar("position_ref", { length: 50 }).notNull(),
    positionType: varchar("position_type", { length: 30 }).notNull(), // daily, weekly, monthly, forecast, actual
    positionDate: timestamp("position_date", { withTimezone: true }),
    currency: varchar("currency", { length: 3 }).default("QAR"),
    openingBalance: decimal("opening_balance", { precision: 18, scale: 2 }),
    totalInflows: decimal("total_inflows", { precision: 18, scale: 2 }),
    totalOutflows: decimal("total_outflows", { precision: 18, scale: 2 }),
    closingBalance: decimal("closing_balance", { precision: 18, scale: 2 }),
    netCashFlow: decimal("net_cash_flow", { precision: 18, scale: 2 }),
    minimumBalance: decimal("minimum_balance", { precision: 18, scale: 2 }),
    maximumBalance: decimal("maximum_balance", { precision: 18, scale: 2 }),
    inflowBreakdown: jsonb("inflow_breakdown"),
    outflowBreakdown: jsonb("outflow_breakdown"),
    bankAccountId: varchar("bank_account_id", { length: 100 }),
    entityId: varchar("entity_id", { length: 100 }),
    variance: decimal("variance", { precision: 18, scale: 2 }),
    variancePercentage: decimal("variance_percentage", { precision: 8, scale: 2 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("tcm_cash_pos_tenant_idx").on(t.tenantId),
    index("tcm_cash_pos_ref_idx").on(t.positionRef),
    index("tcm_cash_pos_status_idx").on(t.status),
    index("tcm_cash_pos_date_idx").on(t.positionDate),
  ]
);

// ==========================================
// Bank Reconciliation Automation
// ==========================================
export const tcmBankReconciliations = pgTable(
  "tcm_bank_reconciliations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    reconciliationRef: varchar("reconciliation_ref", { length: 50 }).notNull(),
    reconciliationType: varchar("reconciliation_type", { length: 30 }).notNull(), // auto, manual, hybrid, ai_assisted
    bankAccountRef: varchar("bank_account_ref", { length: 100 }),
    bankName: varchar("bank_name", { length: 255 }),
    periodStart: timestamp("period_start", { withTimezone: true }),
    periodEnd: timestamp("period_end", { withTimezone: true }),
    statementBalance: decimal("statement_balance", { precision: 18, scale: 2 }),
    bookBalance: decimal("book_balance", { precision: 18, scale: 2 }),
    reconciledBalance: decimal("reconciled_balance", { precision: 18, scale: 2 }),
    unreconciledItems: integer("unreconciled_items"),
    matchedTransactions: integer("matched_transactions"),
    currency: varchar("currency", { length: 3 }).default("QAR"),
    difference: decimal("difference", { precision: 18, scale: 2 }),
    adjustments: jsonb("adjustments"),
    outstandingChecks: jsonb("outstanding_checks"),
    depositsInTransit: jsonb("deposits_in_transit"),
    reconciledBy: varchar("reconciled_by", { length: 255 }),
    reconciledAt: timestamp("reconciled_at", { withTimezone: true }),
    approvedBy: varchar("approved_by", { length: 255 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("tcm_bank_recon_tenant_idx").on(t.tenantId),
    index("tcm_bank_recon_ref_idx").on(t.reconciliationRef),
    index("tcm_bank_recon_status_idx").on(t.status),
    index("tcm_bank_recon_period_idx").on(t.periodStart),
  ]
);

// ==========================================
// Cash Pooling & Sweeping
// ==========================================
export const tcmCashPoolingSweeps = pgTable(
  "tcm_cash_pooling_sweeps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    sweepRef: varchar("sweep_ref", { length: 50 }).notNull(),
    sweepType: varchar("sweep_type", { length: 30 }).notNull(), // zero_balance, target_balance, threshold, notional_pooling
    poolName: varchar("pool_name", { length: 255 }),
    masterAccountRef: varchar("master_account_ref", { length: 100 }),
    participatingAccounts: jsonb("participating_accounts"),
    sweepDirection: varchar("sweep_direction", { length: 20 }), // to_master, from_master, bidirectional
    triggerBalance: decimal("trigger_balance", { precision: 18, scale: 2 }),
    targetBalance: decimal("target_balance", { precision: 18, scale: 2 }),
    sweepAmount: decimal("sweep_amount", { precision: 18, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("QAR"),
    frequency: varchar("frequency", { length: 20 }), // daily, weekly, monthly, on_demand
    lastExecutedAt: timestamp("last_executed_at", { withTimezone: true }),
    nextScheduledAt: timestamp("next_scheduled_at", { withTimezone: true }),
    interestRate: decimal("interest_rate", { precision: 8, scale: 4 }),
    totalPoolBalance: decimal("total_pool_balance", { precision: 18, scale: 2 }),
    executionLog: jsonb("execution_log"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("tcm_pool_sweep_tenant_idx").on(t.tenantId),
    index("tcm_pool_sweep_ref_idx").on(t.sweepRef),
    index("tcm_pool_sweep_status_idx").on(t.status),
    index("tcm_pool_sweep_type_idx").on(t.sweepType),
  ]
);

// ==========================================
// FX Hedging & Exposure Management
// ==========================================
export const tcmFxHedgingExposures = pgTable(
  "tcm_fx_hedging_exposures",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    hedgeRef: varchar("hedge_ref", { length: 50 }).notNull(),
    hedgeType: varchar("hedge_type", { length: 30 }).notNull(), // forward, option, swap, natural_hedge, cross_currency
    baseCurrency: varchar("base_currency", { length: 3 }),
    quoteCurrency: varchar("quote_currency", { length: 3 }),
    notionalAmount: decimal("notional_amount", { precision: 18, scale: 2 }),
    hedgedAmount: decimal("hedged_amount", { precision: 18, scale: 2 }),
    spotRate: decimal("spot_rate", { precision: 12, scale: 6 }),
    forwardRate: decimal("forward_rate", { precision: 12, scale: 6 }),
    strikeRate: decimal("strike_rate", { precision: 12, scale: 6 }),
    maturityDate: timestamp("maturity_date", { withTimezone: true }),
    settlementDate: timestamp("settlement_date", { withTimezone: true }),
    counterparty: varchar("counterparty", { length: 255 }),
    dealReference: varchar("deal_reference", { length: 100 }),
    hedgeEffectiveness: decimal("hedge_effectiveness", { precision: 8, scale: 4 }),
    unrealizedGainLoss: decimal("unrealized_gain_loss", { precision: 18, scale: 2 }),
    realizedGainLoss: decimal("realized_gain_loss", { precision: 18, scale: 2 }),
    exposureType: varchar("exposure_type", { length: 50 }), // transaction, translation, economic
    hedgeAccountingMethod: varchar("hedge_accounting_method", { length: 50 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("tcm_fx_hedge_tenant_idx").on(t.tenantId),
    index("tcm_fx_hedge_ref_idx").on(t.hedgeRef),
    index("tcm_fx_hedge_status_idx").on(t.status),
    index("tcm_fx_hedge_type_idx").on(t.hedgeType),
  ]
);

// ==========================================
// Letter of Credit (LC) Management
// ==========================================
export const tcmLettersOfCredit = pgTable(
  "tcm_letters_of_credit",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    lcRef: varchar("lc_ref", { length: 50 }).notNull(),
    lcType: varchar("lc_type", { length: 30 }).notNull(), // irrevocable, revocable, standby, transferable, back_to_back, revolving
    issuingBank: varchar("issuing_bank", { length: 255 }),
    advisingBank: varchar("advising_bank", { length: 255 }),
    confirmingBank: varchar("confirming_bank", { length: 255 }),
    applicant: varchar("applicant", { length: 255 }),
    beneficiary: varchar("beneficiary", { length: 255 }),
    lcAmount: decimal("lc_amount", { precision: 18, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    issueDate: timestamp("issue_date", { withTimezone: true }),
    expiryDate: timestamp("expiry_date", { withTimezone: true }),
    shipmentDeadline: timestamp("shipment_deadline", { withTimezone: true }),
    presentationPeriod: integer("presentation_period"),
    partialShipment: boolean("partial_shipment"),
    transshipment: boolean("transshipment"),
    termsAndConditions: text("terms_and_conditions"),
    requiredDocuments: jsonb("required_documents"),
    amendments: jsonb("amendments"),
    utilizationAmount: decimal("utilization_amount", { precision: 18, scale: 2 }),
    availableAmount: decimal("available_amount", { precision: 18, scale: 2 }),
    charges: decimal("charges", { precision: 14, scale: 2 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("tcm_lc_tenant_idx").on(t.tenantId),
    index("tcm_lc_ref_idx").on(t.lcRef),
    index("tcm_lc_status_idx").on(t.status),
    index("tcm_lc_type_idx").on(t.lcType),
  ]
);

// ==========================================
// Bank Guarantee (BG) Management
// ==========================================
export const tcmBankGuarantees = pgTable(
  "tcm_bank_guarantees",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    bgRef: varchar("bg_ref", { length: 50 }).notNull(),
    bgType: varchar("bg_type", { length: 30 }).notNull(), // performance, advance_payment, bid_bond, financial, customs, retention
    issuingBank: varchar("issuing_bank", { length: 255 }),
    applicant: varchar("applicant", { length: 255 }),
    beneficiary: varchar("beneficiary", { length: 255 }),
    guaranteeAmount: decimal("guarantee_amount", { precision: 18, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("QAR"),
    issueDate: timestamp("issue_date", { withTimezone: true }),
    expiryDate: timestamp("expiry_date", { withTimezone: true }),
    claimDeadline: timestamp("claim_deadline", { withTimezone: true }),
    marginPercentage: decimal("margin_percentage", { precision: 8, scale: 4 }),
    marginAmount: decimal("margin_amount", { precision: 18, scale: 2 }),
    commissionRate: decimal("commission_rate", { precision: 8, scale: 4 }),
    commissionAmount: decimal("commission_amount", { precision: 14, scale: 2 }),
    linkedContractRef: varchar("linked_contract_ref", { length: 100 }),
    purpose: text("purpose"),
    termsAndConditions: text("terms_and_conditions"),
    claimHistory: jsonb("claim_history"),
    autoRenewal: boolean("auto_renewal"),
    renewalCount: integer("renewal_count"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("tcm_bg_tenant_idx").on(t.tenantId),
    index("tcm_bg_ref_idx").on(t.bgRef),
    index("tcm_bg_status_idx").on(t.status),
    index("tcm_bg_type_idx").on(t.bgType),
  ]
);

// ==========================================
// Intercompany Loan Management
// ==========================================
export const tcmIntercompanyLoans = pgTable(
  "tcm_intercompany_loans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    loanRef: varchar("loan_ref", { length: 50 }).notNull(),
    loanType: varchar("loan_type", { length: 30 }).notNull(), // term_loan, revolving, demand, subordinated, bridge
    lenderEntity: varchar("lender_entity", { length: 255 }),
    borrowerEntity: varchar("borrower_entity", { length: 255 }),
    principalAmount: decimal("principal_amount", { precision: 18, scale: 2 }),
    outstandingBalance: decimal("outstanding_balance", { precision: 18, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("QAR"),
    interestRate: decimal("interest_rate", { precision: 8, scale: 4 }),
    interestType: varchar("interest_type", { length: 30 }), // fixed, variable, libor_plus, sofr_plus
    disbursementDate: timestamp("disbursement_date", { withTimezone: true }),
    maturityDate: timestamp("maturity_date", { withTimezone: true }),
    repaymentFrequency: varchar("repayment_frequency", { length: 20 }), // monthly, quarterly, semi_annual, annual, bullet
    nextPaymentDate: timestamp("next_payment_date", { withTimezone: true }),
    totalInterestAccrued: decimal("total_interest_accrued", { precision: 18, scale: 2 }),
    totalRepayments: decimal("total_repayments", { precision: 18, scale: 2 }),
    repaymentSchedule: jsonb("repayment_schedule"),
    covenants: jsonb("covenants"),
    transferPricingCompliance: boolean("transfer_pricing_compliance"),
    armLengthRate: decimal("arm_length_rate", { precision: 8, scale: 4 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("tcm_ic_loan_tenant_idx").on(t.tenantId),
    index("tcm_ic_loan_ref_idx").on(t.loanRef),
    index("tcm_ic_loan_status_idx").on(t.status),
    index("tcm_ic_loan_type_idx").on(t.loanType),
  ]
);
