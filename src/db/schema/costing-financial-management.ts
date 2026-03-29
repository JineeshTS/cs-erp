import {
  pgTable,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  type AnyPgColumn,
  uuid,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// FEAT-014-1-001: Voyage Costing & Budgeting
// ==========================================

export const cfmVoyageBudgets = pgTable(
  "cfm_voyage_budgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    budgetRef: varchar("budget_ref", { length: 50 }).notNull(),
    voyageRef: varchar("voyage_ref", { length: 50 }).notNull(),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    vesselImo: varchar("vessel_imo", { length: 20 }),
    serviceRoute: varchar("service_route", { length: 100 }),
    budgetType: varchar("budget_type", { length: 30 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    bunkerCost: integer("bunker_cost").notNull().default(0),
    portCost: integer("port_cost").notNull().default(0),
    canalCost: integer("canal_cost").notNull().default(0),
    crewCost: integer("crew_cost").notNull().default(0),
    insuranceCost: integer("insurance_cost").notNull().default(0),
    otherCost: integer("other_cost").notNull().default(0),
    totalBudget: integer("total_budget").notNull(),
    totalActual: integer("total_actual"),
    variance: integer("variance"),
    variancePercent: integer("variance_percent"),
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
    index("cfm_budgets_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cfm_budgets_tenant_ref_idx").on(table.tenantId, table.budgetRef),
    index("cfm_budgets_voyage_idx").on(table.voyageRef),
    index("cfm_budgets_vessel_idx").on(table.vesselName),
    index("cfm_budgets_type_idx").on(table.budgetType),
    index("cfm_budgets_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-014-1-002: Port Disbursement Accounting PDA FDA
// ==========================================

export const cfmPortDisbursements = pgTable(
  "cfm_port_disbursements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    disbursementRef: varchar("disbursement_ref", { length: 50 }).notNull(),
    voyageRef: varchar("voyage_ref", { length: 50 }),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    port: varchar("port", { length: 50 }).notNull(),
    agentName: varchar("agent_name", { length: 255 }),
    disbursementType: varchar("disbursement_type", { length: 20 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    pdaAmount: integer("pda_amount"),
    fdaAmount: integer("fda_amount"),
    varianceAmount: integer("variance_amount"),
    lineItems: jsonb("line_items"),
    portDues: integer("port_dues").notNull().default(0),
    pilotage: integer("pilotage").notNull().default(0),
    towage: integer("towage").notNull().default(0),
    berth: integer("berth").notNull().default(0),
    cargoHandling: integer("cargo_handling").notNull().default(0),
    agencyFee: integer("agency_fee").notNull().default(0),
    otherCharges: integer("other_charges").notNull().default(0),
    totalAmount: integer("total_amount").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
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
    index("cfm_disb_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cfm_disb_tenant_ref_idx").on(table.tenantId, table.disbursementRef),
    index("cfm_disb_voyage_idx").on(table.voyageRef),
    index("cfm_disb_vessel_idx").on(table.vesselName),
    index("cfm_disb_port_idx").on(table.port),
    index("cfm_disb_type_idx").on(table.disbursementType),
    index("cfm_disb_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-014-1-003: Freight Revenue Recognition IFRS15
// ==========================================

export const cfmRevenueRecognitions = pgTable(
  "cfm_revenue_recognitions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    recognitionRef: varchar("recognition_ref", { length: 50 }).notNull(),
    voyageRef: varchar("voyage_ref", { length: 50 }),
    bookingRef: varchar("booking_ref", { length: 50 }),
    blNumber: varchar("bl_number", { length: 50 }),
    customerName: varchar("customer_name", { length: 255 }),
    revenueType: varchar("revenue_type", { length: 30 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    grossRevenue: integer("gross_revenue").notNull(),
    deductions: integer("deductions").notNull().default(0),
    netRevenue: integer("net_revenue").notNull(),
    recognitionMethod: varchar("recognition_method", { length: 30 }).notNull(),
    performanceObligation: varchar("performance_obligation", { length: 100 }),
    completionPercent: integer("completion_percent"),
    recognizedAmount: integer("recognized_amount").notNull(),
    deferredAmount: integer("deferred_amount").notNull().default(0),
    recognitionPeriod: varchar("recognition_period", { length: 20 }),
    journalEntryRef: varchar("journal_entry_ref", { length: 50 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    recognizedAt: timestamp("recognized_at", { withTimezone: true }),
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
    index("cfm_rev_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cfm_rev_tenant_ref_idx").on(table.tenantId, table.recognitionRef),
    index("cfm_rev_voyage_idx").on(table.voyageRef),
    index("cfm_rev_booking_idx").on(table.bookingRef),
    index("cfm_rev_type_idx").on(table.revenueType),
    index("cfm_rev_method_idx").on(table.recognitionMethod),
    index("cfm_rev_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-014-1-004: Agency Commission Accounting
// ==========================================

export const cfmAgencyCommissions = pgTable(
  "cfm_agency_commissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    commissionRef: varchar("commission_ref", { length: 50 }).notNull(),
    agentName: varchar("agent_name", { length: 255 }).notNull(),
    agentCode: varchar("agent_code", { length: 50 }),
    voyageRef: varchar("voyage_ref", { length: 50 }),
    port: varchar("port", { length: 50 }),
    commissionType: varchar("commission_type", { length: 30 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    baseAmount: integer("base_amount").notNull(),
    commissionRate: integer("commission_rate").notNull(),
    commissionAmount: integer("commission_amount").notNull(),
    taxAmount: integer("tax_amount").notNull().default(0),
    netPayable: integer("net_payable").notNull(),
    invoiceRef: varchar("invoice_ref", { length: 50 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
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
    index("cfm_comm_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cfm_comm_tenant_ref_idx").on(table.tenantId, table.commissionRef),
    index("cfm_comm_agent_idx").on(table.agentName),
    index("cfm_comm_voyage_idx").on(table.voyageRef),
    index("cfm_comm_type_idx").on(table.commissionType),
    index("cfm_comm_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-014-2-001: Voyage Profit & Loss per Service
// ==========================================

export const cfmVoyagePnlReports = pgTable(
  "cfm_voyage_pnl_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    reportRef: varchar("report_ref", { length: 50 }).notNull(),
    voyageRef: varchar("voyage_ref", { length: 50 }).notNull(),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    serviceRoute: varchar("service_route", { length: 100 }),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    freightRevenue: integer("freight_revenue").notNull().default(0),
    demurrageRevenue: integer("demurrage_revenue").notNull().default(0),
    otherRevenue: integer("other_revenue").notNull().default(0),
    totalRevenue: integer("total_revenue").notNull(),
    bunkerCost: integer("bunker_cost").notNull().default(0),
    portCost: integer("port_cost").notNull().default(0),
    commissionCost: integer("commission_cost").notNull().default(0),
    charterCost: integer("charter_cost").notNull().default(0),
    overheadCost: integer("overhead_cost").notNull().default(0),
    otherCost: integer("other_cost").notNull().default(0),
    totalCost: integer("total_cost").notNull(),
    grossProfit: integer("gross_profit").notNull(),
    netProfit: integer("net_profit").notNull(),
    profitMargin: integer("profit_margin"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    periodStart: timestamp("period_start", { withTimezone: true }),
    periodEnd: timestamp("period_end", { withTimezone: true }),
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
    index("cfm_pnl_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cfm_pnl_tenant_ref_idx").on(table.tenantId, table.reportRef),
    index("cfm_pnl_voyage_idx").on(table.voyageRef),
    index("cfm_pnl_vessel_idx").on(table.vesselName),
    index("cfm_pnl_service_idx").on(table.serviceRoute),
    index("cfm_pnl_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-014-2-002: Container Cost Tracking & Allocation
// ==========================================

export const cfmContainerCosts = pgTable(
  "cfm_container_costs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    costRef: varchar("cost_ref", { length: 50 }).notNull(),
    containerNumber: varchar("container_number", { length: 20 }).notNull(),
    containerType: varchar("container_type", { length: 30 }),
    voyageRef: varchar("voyage_ref", { length: 50 }),
    bookingRef: varchar("booking_ref", { length: 50 }),
    costCategory: varchar("cost_category", { length: 30 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    leaseCost: integer("lease_cost").notNull().default(0),
    handlingCost: integer("handling_cost").notNull().default(0),
    repositioningCost: integer("repositioning_cost").notNull().default(0),
    maintenanceCost: integer("maintenance_cost").notNull().default(0),
    insuranceCost: integer("insurance_cost").notNull().default(0),
    otherCost: integer("other_cost").notNull().default(0),
    totalCost: integer("total_cost").notNull(),
    allocationMethod: varchar("allocation_method", { length: 30 }),
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
    index("cfm_ccost_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cfm_ccost_tenant_ref_idx").on(table.tenantId, table.costRef),
    index("cfm_ccost_container_idx").on(table.containerNumber),
    index("cfm_ccost_voyage_idx").on(table.voyageRef),
    index("cfm_ccost_category_idx").on(table.costCategory),
    index("cfm_ccost_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-014-2-003: Overhead & Shared Cost Allocation
// ==========================================

export const cfmOverheadAllocations = pgTable(
  "cfm_overhead_allocations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    allocationRef: varchar("allocation_ref", { length: 50 }).notNull(),
    costCentre: varchar("cost_centre", { length: 50 }).notNull(),
    allocationPeriod: varchar("allocation_period", { length: 20 }).notNull(),
    allocationMethod: varchar("allocation_method", { length: 30 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    totalOverhead: integer("total_overhead").notNull(),
    allocatedAmount: integer("allocated_amount").notNull(),
    allocationBase: varchar("allocation_base", { length: 50 }),
    allocationFactor: integer("allocation_factor"),
    targetEntity: varchar("target_entity", { length: 50 }),
    targetRef: varchar("target_ref", { length: 50 }),
    breakdownItems: jsonb("breakdown_items"),
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
    index("cfm_ovhd_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cfm_ovhd_tenant_ref_idx").on(table.tenantId, table.allocationRef),
    index("cfm_ovhd_centre_idx").on(table.costCentre),
    index("cfm_ovhd_period_idx").on(table.allocationPeriod),
    index("cfm_ovhd_method_idx").on(table.allocationMethod),
    index("cfm_ovhd_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-014-2-004: Budget vs Actual Variance Analysis
// ==========================================

export const cfmVarianceAnalyses = pgTable(
  "cfm_variance_analyses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    analysisRef: varchar("analysis_ref", { length: 50 }).notNull(),
    voyageRef: varchar("voyage_ref", { length: 50 }),
    vesselName: varchar("vessel_name", { length: 255 }),
    costCentre: varchar("cost_centre", { length: 50 }),
    analysisPeriod: varchar("analysis_period", { length: 20 }).notNull(),
    analysisType: varchar("analysis_type", { length: 30 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    budgetAmount: integer("budget_amount").notNull(),
    actualAmount: integer("actual_amount").notNull(),
    varianceAmount: integer("variance_amount").notNull(),
    variancePercent: integer("variance_percent"),
    varianceType: varchar("variance_type", { length: 20 }),
    rootCauses: jsonb("root_causes"),
    correctiveActions: jsonb("corrective_actions"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedBy: uuid("reviewed_by"),
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
    index("cfm_var_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cfm_var_tenant_ref_idx").on(table.tenantId, table.analysisRef),
    index("cfm_var_voyage_idx").on(table.voyageRef),
    index("cfm_var_centre_idx").on(table.costCentre),
    index("cfm_var_period_idx").on(table.analysisPeriod),
    index("cfm_var_type_idx").on(table.analysisType),
    index("cfm_var_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-014-3-001: Cost Centre Management
// ==========================================

export const cfmCostCentres = pgTable(
  "cfm_cost_centres",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    centreCode: varchar("centre_code", { length: 30 }).notNull(),
    centreName: varchar("centre_name", { length: 255 }).notNull(),
    parentId: uuid("parent_id").references((): AnyPgColumn => cfmCostCentres.id, { onDelete: "set null" }),
    centreType: varchar("centre_type", { length: 30 }).notNull(),
    department: varchar("department", { length: 100 }),
    managerId: uuid("manager_id"),
    managerName: varchar("manager_name", { length: 255 }),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    annualBudget: integer("annual_budget"),
    ytdActual: integer("ytd_actual"),
    ytdBudget: integer("ytd_budget"),
    isActive: boolean("is_active").notNull().default(true),
    glAccountCode: varchar("gl_account_code", { length: 30 }),
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
    index("cfm_cc_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cfm_cc_tenant_code_idx").on(table.tenantId, table.centreCode),
    index("cfm_cc_parent_idx").on(table.parentId),
    index("cfm_cc_type_idx").on(table.centreType),
    index("cfm_cc_dept_idx").on(table.department),
    index("cfm_cc_active_idx").on(table.isActive),
  ]
);

// ==========================================
// FEAT-014-3-002: CAPEX Tracking & Amortization
// ==========================================

export const cfmCapexItems = pgTable(
  "cfm_capex_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    capexRef: varchar("capex_ref", { length: 50 }).notNull(),
    assetName: varchar("asset_name", { length: 255 }).notNull(),
    assetCategory: varchar("asset_category", { length: 50 }).notNull(),
    costCentre: varchar("cost_centre", { length: 50 }),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    acquisitionCost: integer("acquisition_cost").notNull(),
    residualValue: integer("residual_value").notNull().default(0),
    usefulLifeMonths: integer("useful_life_months").notNull(),
    depreciationMethod: varchar("depreciation_method", { length: 30 }).notNull(),
    monthlyDepreciation: integer("monthly_depreciation"),
    accumulatedDepreciation: integer("accumulated_depreciation").notNull().default(0),
    netBookValue: integer("net_book_value").notNull(),
    acquisitionDate: timestamp("acquisition_date", { withTimezone: true }).notNull(),
    inServiceDate: timestamp("in_service_date", { withTimezone: true }),
    disposalDate: timestamp("disposal_date", { withTimezone: true }),
    disposalAmount: integer("disposal_amount"),
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
    index("cfm_capex_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cfm_capex_tenant_ref_idx").on(table.tenantId, table.capexRef),
    index("cfm_capex_category_idx").on(table.assetCategory),
    index("cfm_capex_centre_idx").on(table.costCentre),
    index("cfm_capex_method_idx").on(table.depreciationMethod),
    index("cfm_capex_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-014-3-003: AI Cost Anomaly Detection
// ==========================================

export const cfmAnomalyDetections = pgTable(
  "cfm_anomaly_detections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    anomalyRef: varchar("anomaly_ref", { length: 50 }).notNull(),
    detectedEntity: varchar("detected_entity", { length: 50 }).notNull(),
    entityRef: varchar("entity_ref", { length: 50 }),
    anomalyType: varchar("anomaly_type", { length: 30 }).notNull(),
    severity: varchar("severity", { length: 20 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    expectedAmount: integer("expected_amount"),
    actualAmount: integer("actual_amount"),
    deviationPercent: integer("deviation_percent"),
    description: text("description").notNull(),
    aiConfidence: integer("ai_confidence"),
    modelVersion: varchar("model_version", { length: 20 }),
    suggestedAction: text("suggested_action"),
    status: varchar("status", { length: 20 }).notNull().default("detected"),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
    acknowledgedBy: uuid("acknowledged_by"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolutionNotes: text("resolution_notes"),
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
    index("cfm_anom_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cfm_anom_tenant_ref_idx").on(table.tenantId, table.anomalyRef),
    index("cfm_anom_entity_idx").on(table.detectedEntity),
    index("cfm_anom_type_idx").on(table.anomalyType),
    index("cfm_anom_severity_idx").on(table.severity),
    index("cfm_anom_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-014-3-004: Management Reporting & KPI Dashboard
// ==========================================

export const cfmKpiReports = pgTable(
  "cfm_kpi_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    reportRef: varchar("report_ref", { length: 50 }).notNull(),
    reportName: varchar("report_name", { length: 255 }).notNull(),
    reportType: varchar("report_type", { length: 30 }).notNull(),
    reportPeriod: varchar("report_period", { length: 20 }).notNull(),
    reportYear: integer("report_year").notNull(),
    reportMonth: integer("report_month"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    totalRevenue: integer("total_revenue"),
    totalCost: integer("total_cost"),
    grossProfit: integer("gross_profit"),
    netProfit: integer("net_profit"),
    ebitda: integer("ebitda"),
    operatingRatio: integer("operating_ratio"),
    revenuePerTeu: integer("revenue_per_teu"),
    costPerTeu: integer("cost_per_teu"),
    kpiData: jsonb("kpi_data"),
    charts: jsonb("charts"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
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
    index("cfm_kpi_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cfm_kpi_tenant_ref_idx").on(table.tenantId, table.reportRef),
    index("cfm_kpi_type_idx").on(table.reportType),
    index("cfm_kpi_period_idx").on(table.reportPeriod),
    index("cfm_kpi_year_idx").on(table.reportYear),
    index("cfm_kpi_status_idx").on(table.status),
  ]
);
