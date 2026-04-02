import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// Voyage Close Procedure & Sign-Off
// ==========================================
export const vrsVoyageCloses = pgTable("vrs_voyage_closes", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  closeRef: varchar("close_ref", { length: 100 }).notNull(),
  closeType: varchar("close_type", { length: 50 }).notNull(), // preliminary, final, interim, reopened, cancelled
  title: varchar("title", { length: 255 }),
  voyageNumber: varchar("voyage_number", { length: 100 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  voyageStartDate: timestamp("voyage_start_date", { withTimezone: true }),
  voyageEndDate: timestamp("voyage_end_date", { withTimezone: true }),
  signOffBy: varchar("sign_off_by", { length: 255 }),
  signOffDate: timestamp("sign_off_date", { withTimezone: true }),
  totalRevenue: decimal("total_revenue", { precision: 14, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 14, scale: 2 }),
  netResult: decimal("net_result", { precision: 14, scale: 2 }),
  isSignedOff: boolean("is_signed_off").default(false),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Time Charter TA Settlement
// ==========================================
export const vrsTcSettlements = pgTable("vrs_tc_settlements", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  settlementRef: varchar("settlement_ref", { length: 100 }).notNull(),
  settlementType: varchar("settlement_type", { length: 50 }).notNull(), // hire_payment, ballast_bonus, redelivery, bunker_adjustment, off_hire_deduction
  title: varchar("title", { length: 255 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  charterParty: varchar("charter_party", { length: 100 }),
  periodFrom: timestamp("period_from", { withTimezone: true }),
  periodTo: timestamp("period_to", { withTimezone: true }),
  hireRate: decimal("hire_rate", { precision: 14, scale: 2 }),
  totalHireDays: decimal("total_hire_days", { precision: 8, scale: 2 }),
  offHireDays: decimal("off_hire_days", { precision: 8, scale: 2 }),
  grossHire: decimal("gross_hire", { precision: 14, scale: 2 }),
  deductions: decimal("deductions", { precision: 14, scale: 2 }),
  netPayable: decimal("net_payable", { precision: 14, scale: 2 }),
  currency: varchar("currency", { length: 3 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Voyage P&L Finalization & Approval
// ==========================================
export const vrsVoyagePnls = pgTable("vrs_voyage_pnls", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  pnlRef: varchar("pnl_ref", { length: 100 }).notNull(),
  pnlType: varchar("pnl_type", { length: 50 }).notNull(), // preliminary, final, restated, audited, management
  title: varchar("title", { length: 255 }),
  voyageNumber: varchar("voyage_number", { length: 100 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  freightRevenue: decimal("freight_revenue", { precision: 14, scale: 2 }),
  demurrageRevenue: decimal("demurrage_revenue", { precision: 14, scale: 2 }),
  otherRevenue: decimal("other_revenue", { precision: 14, scale: 2 }),
  portCosts: decimal("port_costs", { precision: 14, scale: 2 }),
  bunkerCosts: decimal("bunker_costs", { precision: 14, scale: 2 }),
  canalCosts: decimal("canal_costs", { precision: 14, scale: 2 }),
  otherCosts: decimal("other_costs", { precision: 14, scale: 2 }),
  totalRevenue: decimal("total_revenue", { precision: 14, scale: 2 }),
  totalCosts: decimal("total_costs", { precision: 14, scale: 2 }),
  netPnl: decimal("net_pnl", { precision: 14, scale: 2 }),
  marginPct: decimal("margin_pct", { precision: 5, scale: 2 }),
  approvedBy: varchar("approved_by", { length: 255 }),
  approvedDate: timestamp("approved_date", { withTimezone: true }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Hire Statement Reconciliation & Dispute
// ==========================================
export const vrsHireReconciliations = pgTable("vrs_hire_reconciliations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  reconciliationRef: varchar("reconciliation_ref", { length: 100 }).notNull(),
  reconciliationType: varchar("reconciliation_type", { length: 50 }).notNull(), // owner_statement, charterer_statement, dispute_resolution, final_settlement, interim_reconciliation
  title: varchar("title", { length: 255 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  charterParty: varchar("charter_party", { length: 100 }),
  ownerAmount: decimal("owner_amount", { precision: 14, scale: 2 }),
  chartererAmount: decimal("charterer_amount", { precision: 14, scale: 2 }),
  differenceAmount: decimal("difference_amount", { precision: 14, scale: 2 }),
  resolvedAmount: decimal("resolved_amount", { precision: 14, scale: 2 }),
  disputeItems: integer("dispute_items"),
  resolvedItems: integer("resolved_items"),
  isReconciled: boolean("is_reconciled").default(false),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Voyage Result Workflow & Audit
// ==========================================
export const vrsResultWorkflows = pgTable("vrs_result_workflows", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  workflowRef: varchar("workflow_ref", { length: 100 }).notNull(),
  workflowType: varchar("workflow_type", { length: 50 }).notNull(), // approval_chain, audit_review, variance_review, exception_handling, escalation
  title: varchar("title", { length: 255 }),
  voyageNumber: varchar("voyage_number", { length: 100 }),
  currentStep: varchar("current_step", { length: 100 }),
  totalSteps: integer("total_steps"),
  completedSteps: integer("completed_steps"),
  assignedTo: varchar("assigned_to", { length: 255 }),
  dueDate: timestamp("due_date", { withTimezone: true }),
  completedDate: timestamp("completed_date", { withTimezone: true }),
  varianceAmount: decimal("variance_amount", { precision: 14, scale: 2 }),
  variancePct: decimal("variance_pct", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Intercompany Voyage Cost Settlement
// ==========================================
export const vrsIntercoSettlements = pgTable("vrs_interco_settlements", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  intercoRef: varchar("interco_ref", { length: 100 }).notNull(),
  intercoType: varchar("interco_type", { length: 50 }).notNull(), // cost_sharing, revenue_sharing, management_fee, bunker_allocation, overhead_allocation
  title: varchar("title", { length: 255 }),
  voyageNumber: varchar("voyage_number", { length: 100 }),
  fromEntity: varchar("from_entity", { length: 255 }),
  toEntity: varchar("to_entity", { length: 255 }),
  settlementAmount: decimal("settlement_amount", { precision: 14, scale: 2 }),
  currency: varchar("currency", { length: 3 }),
  allocationBasis: varchar("allocation_basis", { length: 100 }),
  allocationPct: decimal("allocation_pct", { precision: 5, scale: 2 }),
  invoiceRef: varchar("invoice_ref", { length: 100 }),
  settledDate: timestamp("settled_date", { withTimezone: true }),
  isSettled: boolean("is_settled").default(false),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// AI Voyage Profitability Benchmarking
// ==========================================
export const vrsProfitBenchmarks = pgTable("vrs_profit_benchmarks", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  benchmarkRef: varchar("benchmark_ref", { length: 100 }).notNull(),
  benchmarkType: varchar("benchmark_type", { length: 50 }).notNull(), // vessel_comparison, route_comparison, period_comparison, peer_comparison, ai_recommendation
  title: varchar("title", { length: 255 }),
  voyageNumber: varchar("voyage_number", { length: 100 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  tradeLane: varchar("trade_lane", { length: 255 }),
  actualTce: decimal("actual_tce", { precision: 14, scale: 2 }),
  benchmarkTce: decimal("benchmark_tce", { precision: 14, scale: 2 }),
  varianceTce: decimal("variance_tce", { precision: 14, scale: 2 }),
  actualMargin: decimal("actual_margin", { precision: 5, scale: 2 }),
  benchmarkMargin: decimal("benchmark_margin", { precision: 5, scale: 2 }),
  performanceScore: decimal("performance_score", { precision: 5, scale: 2 }),
  aiInsights: text("ai_insights"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Historical Voyage Analytics Dashboard
// ==========================================
export const vrsVoyageAnalytics = pgTable("vrs_voyage_analytics", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  analyticsRef: varchar("analytics_ref", { length: 100 }).notNull(),
  analyticsType: varchar("analytics_type", { length: 50 }).notNull(), // trend_analysis, seasonal_analysis, kpi_dashboard, fleet_summary, route_analysis
  title: varchar("title", { length: 255 }),
  periodFrom: timestamp("period_from", { withTimezone: true }),
  periodTo: timestamp("period_to", { withTimezone: true }),
  totalVoyages: integer("total_voyages"),
  avgTce: decimal("avg_tce", { precision: 14, scale: 2 }),
  avgMargin: decimal("avg_margin", { precision: 5, scale: 2 }),
  totalRevenue: decimal("total_revenue", { precision: 14, scale: 2 }),
  totalCosts: decimal("total_costs", { precision: 14, scale: 2 }),
  topPerformer: varchar("top_performer", { length: 255 }),
  reportUrl: text("report_url"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
