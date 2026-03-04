import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// Vessel Deployment Decision Matrix
// ==========================================
export const fdpDeploymentDecisions = pgTable("fdp_deployment_decisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  decisionRef: varchar("decision_ref", { length: 100 }).notNull(),
  decisionType: varchar("decision_type", { length: 50 }).notNull(), // new_deployment, redeployment, withdrawal, extension, seasonal_adjustment
  title: varchar("title", { length: 255 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  currentTrade: varchar("current_trade", { length: 255 }),
  proposedTrade: varchar("proposed_trade", { length: 255 }),
  effectiveDate: timestamp("effective_date", { withTimezone: true }),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  expectedTce: decimal("expected_tce", { precision: 14, scale: 2 }),
  decisionScore: decimal("decision_score", { precision: 5, scale: 2 }),
  approvedBy: varchar("approved_by", { length: 255 }),
  approvedDate: timestamp("approved_date", { withTimezone: true }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Fleet Utilization & Capacity Planning
// ==========================================
export const fdpFleetUtilizations = pgTable("fdp_fleet_utilizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  utilizationRef: varchar("utilization_ref", { length: 100 }).notNull(),
  utilizationType: varchar("utilization_type", { length: 50 }).notNull(), // capacity_analysis, demand_forecast, gap_analysis, seasonal_planning, fleet_overview
  title: varchar("title", { length: 255 }),
  periodFrom: timestamp("period_from", { withTimezone: true }),
  periodTo: timestamp("period_to", { withTimezone: true }),
  totalCapacityTeu: integer("total_capacity_teu"),
  utilizedCapacityTeu: integer("utilized_capacity_teu"),
  utilizationPct: decimal("utilization_pct", { precision: 5, scale: 2 }),
  idleDays: decimal("idle_days", { precision: 8, scale: 2 }),
  vesselCount: integer("vessel_count"),
  tradeLane: varchar("trade_lane", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Service Network Design & Evaluation
// ==========================================
export const fdpNetworkDesigns = pgTable("fdp_network_designs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  networkRef: varchar("network_ref", { length: 100 }).notNull(),
  networkType: varchar("network_type", { length: 50 }).notNull(), // hub_spoke, direct_service, pendulum, round_trip, relay
  title: varchar("title", { length: 255 }),
  serviceName: varchar("service_name", { length: 255 }),
  portRotation: text("port_rotation"),
  roundTripDays: integer("round_trip_days"),
  vesselCount: integer("vessel_count"),
  weeklyFrequency: decimal("weekly_frequency", { precision: 5, scale: 2 }),
  estimatedRevenue: decimal("estimated_revenue", { precision: 14, scale: 2 }),
  estimatedCost: decimal("estimated_cost", { precision: 14, scale: 2 }),
  netContribution: decimal("net_contribution", { precision: 14, scale: 2 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// AI Fleet Deployment Optimizer
// ==========================================
export const fdpDeploymentOptimizers = pgTable("fdp_deployment_optimizers", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  optimizerRef: varchar("optimizer_ref", { length: 100 }).notNull(),
  optimizerType: varchar("optimizer_type", { length: 50 }).notNull(), // profit_maximization, cost_minimization, utilization_optimization, emission_reduction, balanced
  title: varchar("title", { length: 255 }),
  scenarioName: varchar("scenario_name", { length: 255 }),
  objectiveFunction: varchar("objective_function", { length: 100 }),
  constraints: text("constraints"),
  vesselCount: integer("vessel_count"),
  tradeCount: integer("trade_count"),
  optimalTce: decimal("optimal_tce", { precision: 14, scale: 2 }),
  improvementPct: decimal("improvement_pct", { precision: 5, scale: 2 }),
  aiRecommendation: text("ai_recommendation"),
  runDate: timestamp("run_date", { withTimezone: true }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Fleet Size & Mix Financial Analysis
// ==========================================
export const fdpFleetFinancials = pgTable("fdp_fleet_financials", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  financialRef: varchar("financial_ref", { length: 100 }).notNull(),
  financialType: varchar("financial_type", { length: 50 }).notNull(), // fleet_valuation, npv_analysis, lease_vs_own, newbuild_assessment, disposal_analysis
  title: varchar("title", { length: 255 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  vesselType: varchar("vessel_type", { length: 100 }),
  capacityTeu: integer("capacity_teu"),
  acquisitionCost: decimal("acquisition_cost", { precision: 14, scale: 2 }),
  currentValue: decimal("current_value", { precision: 14, scale: 2 }),
  annualOpex: decimal("annual_opex", { precision: 14, scale: 2 }),
  npvResult: decimal("npv_result", { precision: 14, scale: 2 }),
  irrPct: decimal("irr_pct", { precision: 5, scale: 2 }),
  paybackYears: decimal("payback_years", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Vessel Substitution & Swap Management
// ==========================================
export const fdpVesselSwaps = pgTable("fdp_vessel_swaps", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  swapRef: varchar("swap_ref", { length: 100 }).notNull(),
  swapType: varchar("swap_type", { length: 50 }).notNull(), // planned_swap, emergency_swap, upgrade, downsize, slot_exchange
  title: varchar("title", { length: 255 }),
  outgoingVessel: varchar("outgoing_vessel", { length: 255 }),
  incomingVessel: varchar("incoming_vessel", { length: 255 }),
  tradeLane: varchar("trade_lane", { length: 255 }),
  swapDate: timestamp("swap_date", { withTimezone: true }),
  reason: text("reason"),
  costImpact: decimal("cost_impact", { precision: 14, scale: 2 }),
  capacityChange: integer("capacity_change"),
  isApproved: boolean("is_approved").default(false),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Long-Term Deployment Contract Management
// ==========================================
export const fdpDeploymentContracts = pgTable("fdp_deployment_contracts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  contractRef: varchar("contract_ref", { length: 100 }).notNull(),
  contractType: varchar("contract_type", { length: 50 }).notNull(), // coa, vsa, slot_charter, time_charter, bareboat
  title: varchar("title", { length: 255 }),
  counterparty: varchar("counterparty", { length: 255 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  tradeLane: varchar("trade_lane", { length: 255 }),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  contractValue: decimal("contract_value", { precision: 14, scale: 2 }),
  slotCapacity: integer("slot_capacity"),
  renewalDate: timestamp("renewal_date", { withTimezone: true }),
  isAutoRenew: boolean("is_auto_renew").default(false),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Freight Market Intelligence Integration
// ==========================================
export const fdpMarketIntelligence = pgTable("fdp_market_intelligence", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  intelRef: varchar("intel_ref", { length: 100 }).notNull(),
  intelType: varchar("intel_type", { length: 50 }).notNull(), // rate_index, market_outlook, competitor_analysis, trade_flow, supply_demand
  title: varchar("title", { length: 255 }),
  tradeLane: varchar("trade_lane", { length: 255 }),
  source: varchar("source", { length: 255 }),
  reportDate: timestamp("report_date", { withTimezone: true }),
  currentRate: decimal("current_rate", { precision: 14, scale: 2 }),
  forecastRate: decimal("forecast_rate", { precision: 14, scale: 2 }),
  changePercent: decimal("change_percent", { precision: 5, scale: 2 }),
  marketSentiment: varchar("market_sentiment", { length: 50 }),
  summary: text("summary"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
