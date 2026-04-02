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
// FEAT-018-1-001: Proforma DA Estimation
// ==========================================

export const pdaProformaEstimates = pgTable(
  "pda_proforma_estimates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    estimateRef: varchar("estimate_ref", { length: 50 }).notNull(),
    voyageId: uuid("voyage_id"),
    voyageRef: varchar("voyage_ref", { length: 50 }),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    portCode: varchar("port_code", { length: 10 }).notNull(),
    portName: varchar("port_name", { length: 255 }).notNull(),
    callPurpose: varchar("call_purpose", { length: 30 }).notNull(),
    agentId: uuid("agent_id"),
    agentName: varchar("agent_name", { length: 255 }),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    portDues: integer("port_dues").notNull().default(0),
    pilotage: integer("pilotage").notNull().default(0),
    towage: integer("towage").notNull().default(0),
    berthHire: integer("berth_hire").notNull().default(0),
    cargoHandling: integer("cargo_handling").notNull().default(0),
    agencyFees: integer("agency_fees").notNull().default(0),
    customs: integer("customs").notNull().default(0),
    miscellaneous: integer("miscellaneous").notNull().default(0),
    totalEstimate: integer("total_estimate").notNull(),
    lineItems: jsonb("line_items"),
    exchangeRate: integer("exchange_rate"),
    baseCurrencyAmount: integer("base_currency_amount"),
    estimateDate: timestamp("estimate_date", { withTimezone: true }).notNull(),
    validUntil: timestamp("valid_until", { withTimezone: true }),
    requestedBy: uuid("requested_by"),
    requestedByName: varchar("requested_by_name", { length: 255 }),
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
    index("pda_pe_tenant_id_idx").on(table.tenantId),
    uniqueIndex("pda_pe_tenant_ref_idx").on(table.tenantId, table.estimateRef),
    index("pda_pe_voyage_id_idx").on(table.voyageId),
    index("pda_pe_vessel_name_idx").on(table.vesselName),
    index("pda_pe_port_code_idx").on(table.portCode),
    index("pda_pe_agent_id_idx").on(table.agentId),
    index("pda_pe_estimate_date_idx").on(table.estimateDate),
    index("pda_pe_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-018-1-002: Final DA Reconciliation & Approval
// ==========================================

export const pdaFinalDas = pgTable(
  "pda_final_das",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    fdaRef: varchar("fda_ref", { length: 50 }).notNull(),
    proformaId: uuid("proforma_id")
      .references(() => pdaProformaEstimates.id),
    proformaRef: varchar("proforma_ref", { length: 50 }),
    voyageId: uuid("voyage_id"),
    voyageRef: varchar("voyage_ref", { length: 50 }),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    portCode: varchar("port_code", { length: 10 }).notNull(),
    portName: varchar("port_name", { length: 255 }).notNull(),
    agentId: uuid("agent_id"),
    agentName: varchar("agent_name", { length: 255 }),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    portDues: integer("port_dues").notNull().default(0),
    pilotage: integer("pilotage").notNull().default(0),
    towage: integer("towage").notNull().default(0),
    berthHire: integer("berth_hire").notNull().default(0),
    cargoHandling: integer("cargo_handling").notNull().default(0),
    agencyFees: integer("agency_fees").notNull().default(0),
    customs: integer("customs").notNull().default(0),
    miscellaneous: integer("miscellaneous").notNull().default(0),
    totalActual: integer("total_actual").notNull(),
    totalEstimate: integer("total_estimate").notNull().default(0),
    varianceAmount: integer("variance_amount").notNull().default(0),
    variancePercent: integer("variance_percent").notNull().default(0),
    lineItems: jsonb("line_items"),
    exchangeRate: integer("exchange_rate"),
    baseCurrencyAmount: integer("base_currency_amount"),
    invoiceRef: varchar("invoice_ref", { length: 100 }),
    invoiceDate: timestamp("invoice_date", { withTimezone: true }),
    receivedDate: timestamp("received_date", { withTimezone: true }),
    approvedBy: uuid("approved_by"),
    approvedByName: varchar("approved_by_name", { length: 255 }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
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
    index("pda_fd_tenant_id_idx").on(table.tenantId),
    uniqueIndex("pda_fd_tenant_ref_idx").on(table.tenantId, table.fdaRef),
    index("pda_fd_proforma_id_idx").on(table.proformaId),
    index("pda_fd_voyage_id_idx").on(table.voyageId),
    index("pda_fd_vessel_name_idx").on(table.vesselName),
    index("pda_fd_port_code_idx").on(table.portCode),
    index("pda_fd_agent_id_idx").on(table.agentId),
    index("pda_fd_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-018-1-003: Port Cost Management & Tracking
// ==========================================

export const pdaPortCosts = pgTable(
  "pda_port_costs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    costRef: varchar("cost_ref", { length: 50 }).notNull(),
    portCode: varchar("port_code", { length: 10 }).notNull(),
    portName: varchar("port_name", { length: 255 }).notNull(),
    costCategory: varchar("cost_category", { length: 50 }).notNull(),
    costType: varchar("cost_type", { length: 30 }).notNull(),
    description: text("description"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    unitRate: integer("unit_rate").notNull(),
    unitOfMeasure: varchar("unit_of_measure", { length: 30 }),
    minimumCharge: integer("minimum_charge"),
    maximumCharge: integer("maximum_charge"),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    vesselSizeFrom: integer("vessel_size_from"),
    vesselSizeTo: integer("vessel_size_to"),
    cargoTypeApplicable: varchar("cargo_type_applicable", { length: 50 }),
    rateSchedule: jsonb("rate_schedule"),
    sourceDocument: varchar("source_document", { length: 255 }),
    lastVerifiedDate: timestamp("last_verified_date", { withTimezone: true }),
    lastVerifiedBy: varchar("last_verified_by", { length: 255 }),
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
    index("pda_pc_tenant_id_idx").on(table.tenantId),
    uniqueIndex("pda_pc_tenant_ref_idx").on(table.tenantId, table.costRef),
    index("pda_pc_port_code_idx").on(table.portCode),
    index("pda_pc_category_idx").on(table.costCategory),
    index("pda_pc_cost_type_idx").on(table.costType),
    index("pda_pc_effective_from_idx").on(table.effectiveFrom),
    index("pda_pc_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-018-1-004: Port Agent Statement of Account
// ==========================================

export const pdaAgentStatements = pgTable(
  "pda_agent_statements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    statementRef: varchar("statement_ref", { length: 50 }).notNull(),
    agentId: uuid("agent_id"),
    agentName: varchar("agent_name", { length: 255 }).notNull(),
    agentCode: varchar("agent_code", { length: 50 }),
    portCode: varchar("port_code", { length: 10 }),
    portName: varchar("port_name", { length: 255 }),
    statementDate: timestamp("statement_date", { withTimezone: true }).notNull(),
    periodFrom: timestamp("period_from", { withTimezone: true }),
    periodTo: timestamp("period_to", { withTimezone: true }),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    openingBalance: integer("opening_balance").notNull().default(0),
    totalDebits: integer("total_debits").notNull().default(0),
    totalCredits: integer("total_credits").notNull().default(0),
    closingBalance: integer("closing_balance").notNull(),
    transactionCount: integer("transaction_count").notNull().default(0),
    lineItems: jsonb("line_items"),
    advancePaid: integer("advance_paid").notNull().default(0),
    balanceDue: integer("balance_due").notNull().default(0),
    dueDate: timestamp("due_date", { withTimezone: true }),
    reconciledBy: uuid("reconciled_by"),
    reconciledByName: varchar("reconciled_by_name", { length: 255 }),
    reconciledAt: timestamp("reconciled_at", { withTimezone: true }),
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
    index("pda_as_tenant_id_idx").on(table.tenantId),
    uniqueIndex("pda_as_tenant_ref_idx").on(table.tenantId, table.statementRef),
    index("pda_as_agent_id_idx").on(table.agentId),
    index("pda_as_agent_name_idx").on(table.agentName),
    index("pda_as_port_code_idx").on(table.portCode),
    index("pda_as_statement_date_idx").on(table.statementDate),
    index("pda_as_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-018-2-001: Port Expense Allocation per Voyage
// ==========================================

export const pdaExpenseAllocations = pgTable(
  "pda_expense_allocations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    allocationRef: varchar("allocation_ref", { length: 50 }).notNull(),
    voyageId: uuid("voyage_id"),
    voyageRef: varchar("voyage_ref", { length: 50 }),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    portCode: varchar("port_code", { length: 10 }).notNull(),
    portName: varchar("port_name", { length: 255 }).notNull(),
    fdaId: uuid("fda_id")
      .references(() => pdaFinalDas.id),
    fdaRef: varchar("fda_ref", { length: 50 }),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    totalPortCost: integer("total_port_cost").notNull(),
    allocationMethod: varchar("allocation_method", { length: 30 }).notNull(),
    allocationBasis: varchar("allocation_basis", { length: 30 }),
    allocatedToCargo: integer("allocated_to_cargo").notNull().default(0),
    allocatedToVessel: integer("allocated_to_vessel").notNull().default(0),
    allocatedToOverhead: integer("allocated_to_overhead").notNull().default(0),
    allocationDetails: jsonb("allocation_details"),
    costCentre: varchar("cost_centre", { length: 50 }),
    glAccountCode: varchar("gl_account_code", { length: 50 }),
    journalEntryRef: varchar("journal_entry_ref", { length: 100 }),
    postedAt: timestamp("posted_at", { withTimezone: true }),
    allocatedBy: uuid("allocated_by"),
    allocatedByName: varchar("allocated_by_name", { length: 255 }),
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
    index("pda_ea_tenant_id_idx").on(table.tenantId),
    uniqueIndex("pda_ea_tenant_ref_idx").on(table.tenantId, table.allocationRef),
    index("pda_ea_voyage_id_idx").on(table.voyageId),
    index("pda_ea_vessel_name_idx").on(table.vesselName),
    index("pda_ea_port_code_idx").on(table.portCode),
    index("pda_ea_fda_id_idx").on(table.fdaId),
    index("pda_ea_cost_centre_idx").on(table.costCentre),
    index("pda_ea_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-018-2-002: PDA vs FDA Variance Analysis
// ==========================================

export const pdaVarianceAnalyses = pgTable(
  "pda_variance_analyses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    analysisRef: varchar("analysis_ref", { length: 50 }).notNull(),
    proformaId: uuid("proforma_id")
      .references(() => pdaProformaEstimates.id),
    proformaRef: varchar("proforma_ref", { length: 50 }),
    fdaId: uuid("fda_id")
      .references(() => pdaFinalDas.id),
    fdaRef: varchar("fda_ref", { length: 50 }),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    portCode: varchar("port_code", { length: 10 }).notNull(),
    portName: varchar("port_name", { length: 255 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    pdaTotal: integer("pda_total").notNull(),
    fdaTotal: integer("fda_total").notNull(),
    totalVariance: integer("total_variance").notNull().default(0),
    variancePercent: integer("variance_percent").notNull().default(0),
    lineVariances: jsonb("line_variances"),
    majorDeviations: jsonb("major_deviations"),
    deviationThreshold: integer("deviation_threshold").notNull().default(10),
    withinThreshold: boolean("within_threshold").notNull().default(true),
    rootCauseAnalysis: text("root_cause_analysis"),
    recommendations: text("recommendations"),
    analysedBy: uuid("analysed_by"),
    analysedByName: varchar("analysed_by_name", { length: 255 }),
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
    index("pda_va_tenant_id_idx").on(table.tenantId),
    uniqueIndex("pda_va_tenant_ref_idx").on(table.tenantId, table.analysisRef),
    index("pda_va_proforma_id_idx").on(table.proformaId),
    index("pda_va_fda_id_idx").on(table.fdaId),
    index("pda_va_vessel_name_idx").on(table.vesselName),
    index("pda_va_port_code_idx").on(table.portCode),
    index("pda_va_within_threshold_idx").on(table.withinThreshold),
    index("pda_va_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-018-2-003: AI Port Cost Benchmarking
// ==========================================

export const pdaCostBenchmarks = pgTable(
  "pda_cost_benchmarks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    benchmarkRef: varchar("benchmark_ref", { length: 50 }).notNull(),
    portCode: varchar("port_code", { length: 10 }).notNull(),
    portName: varchar("port_name", { length: 255 }).notNull(),
    costCategory: varchar("cost_category", { length: 50 }).notNull(),
    benchmarkPeriod: varchar("benchmark_period", { length: 10 }).notNull(),
    benchmarkYear: integer("benchmark_year").notNull(),
    benchmarkMonth: integer("benchmark_month").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    averageCost: integer("average_cost").notNull(),
    medianCost: integer("median_cost"),
    minimumCost: integer("minimum_cost"),
    maximumCost: integer("maximum_cost"),
    standardDeviation: integer("standard_deviation"),
    sampleSize: integer("sample_size").notNull().default(0),
    percentile25: integer("percentile_25"),
    percentile75: integer("percentile_75"),
    industryAverage: integer("industry_average"),
    ourAverage: integer("our_average"),
    costPosition: varchar("cost_position", { length: 20 }),
    trendDirection: varchar("trend_direction", { length: 20 }),
    trendPercent: integer("trend_percent"),
    aiInsights: jsonb("ai_insights"),
    aiModelVersion: varchar("ai_model_version", { length: 50 }),
    confidenceScore: integer("confidence_score"),
    dataSource: varchar("data_source", { length: 100 }),
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
    index("pda_cb_tenant_id_idx").on(table.tenantId),
    uniqueIndex("pda_cb_tenant_ref_idx").on(table.tenantId, table.benchmarkRef),
    index("pda_cb_port_code_idx").on(table.portCode),
    index("pda_cb_category_idx").on(table.costCategory),
    index("pda_cb_year_month_idx").on(table.benchmarkYear, table.benchmarkMonth),
    index("pda_cb_cost_position_idx").on(table.costPosition),
    index("pda_cb_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-018-2-004: Multi-Port Consolidated Reporting
// ==========================================

export const pdaConsolidatedReports = pgTable(
  "pda_consolidated_reports",
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
    totalPorts: integer("total_ports").notNull().default(0),
    totalVoyages: integer("total_voyages").notNull().default(0),
    totalProformas: integer("total_proformas").notNull().default(0),
    totalFinals: integer("total_finals").notNull().default(0),
    totalEstimatedCost: integer("total_estimated_cost").notNull().default(0),
    totalActualCost: integer("total_actual_cost").notNull().default(0),
    totalVariance: integer("total_variance").notNull().default(0),
    averageVariancePercent: integer("average_variance_percent"),
    portBreakdown: jsonb("port_breakdown"),
    categoryBreakdown: jsonb("category_breakdown"),
    voyageBreakdown: jsonb("voyage_breakdown"),
    topExpensePorts: jsonb("top_expense_ports"),
    savingsOpportunities: jsonb("savings_opportunities"),
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
    index("pda_cr_tenant_id_idx").on(table.tenantId),
    uniqueIndex("pda_cr_tenant_ref_idx").on(table.tenantId, table.reportRef),
    index("pda_cr_type_idx").on(table.reportType),
    index("pda_cr_year_month_idx").on(table.reportYear, table.reportMonth),
    index("pda_cr_status_idx").on(table.status),
  ]
);
