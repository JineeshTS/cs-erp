import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// Empty Container Inventory Visibility
// ==========================================
export const ecrInventorySnapshots = pgTable("ecr_inventory_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  snapshotRef: varchar("snapshot_ref", { length: 100 }).notNull(),
  snapshotType: varchar("snapshot_type", { length: 50 }).notNull(), // daily_count, weekly_summary, location_audit, aging_report, type_breakdown
  title: varchar("title", { length: 255 }),
  locationCode: varchar("location_code", { length: 100 }),
  locationName: varchar("location_name", { length: 255 }),
  containerType: varchar("container_type", { length: 50 }),
  availableCount: integer("available_count"),
  damagedCount: integer("damaged_count"),
  totalCount: integer("total_count"),
  avgDwellDays: decimal("avg_dwell_days", { precision: 8, scale: 2 }),
  surplusDeficit: integer("surplus_deficit"),
  snapshotDate: timestamp("snapshot_date", { withTimezone: true }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Cross-Trade Repositioning Planning
// ==========================================
export const ecrRepositioningPlans = pgTable("ecr_repositioning_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  planRef: varchar("plan_ref", { length: 100 }).notNull(),
  planType: varchar("plan_type", { length: 50 }).notNull(), // cross_trade, backhaul, street_turn, triangulation, seasonal_pre_position
  title: varchar("title", { length: 255 }),
  originPort: varchar("origin_port", { length: 255 }),
  destinationPort: varchar("destination_port", { length: 255 }),
  containerType: varchar("container_type", { length: 50 }),
  quantity: integer("quantity"),
  etd: timestamp("etd", { withTimezone: true }),
  eta: timestamp("eta", { withTimezone: true }),
  vesselName: varchar("vessel_name", { length: 255 }),
  voyageRef: varchar("voyage_ref", { length: 100 }),
  estimatedCost: decimal("estimated_cost", { precision: 14, scale: 2 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Repositioning Cost Tracking & Approval
// ==========================================
export const ecrCostTrackings = pgTable("ecr_cost_trackings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  costRef: varchar("cost_ref", { length: 100 }).notNull(),
  costType: varchar("cost_type", { length: 50 }).notNull(), // inland_transport, ocean_freight, handling, storage, repair, repositioning_fee
  title: varchar("title", { length: 255 }),
  planRef: varchar("plan_ref", { length: 100 }),
  containerType: varchar("container_type", { length: 50 }),
  quantity: integer("quantity"),
  unitCost: decimal("unit_cost", { precision: 14, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 14, scale: 2 }),
  currency: varchar("currency", { length: 3 }),
  approvedBy: varchar("approved_by", { length: 255 }),
  approvedDate: timestamp("approved_date", { withTimezone: true }),
  isApproved: boolean("is_approved").default(false),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// AI Repositioning Route Optimizer
// ==========================================
export const ecrRouteOptimizers = pgTable("ecr_route_optimizers", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  optimizerRef: varchar("optimizer_ref", { length: 100 }).notNull(),
  optimizerType: varchar("optimizer_type", { length: 50 }).notNull(), // cost_minimization, time_minimization, multi_objective, carbon_optimal, network_flow
  title: varchar("title", { length: 255 }),
  scenarioName: varchar("scenario_name", { length: 255 }),
  originPorts: text("origin_ports"),
  destinationPorts: text("destination_ports"),
  containerTypes: text("container_types"),
  objectiveFunction: varchar("objective_function", { length: 100 }),
  totalSavings: decimal("total_savings", { precision: 14, scale: 2 }),
  routeCount: integer("route_count"),
  aiRecommendation: text("ai_recommendation"),
  runDate: timestamp("run_date", { withTimezone: true }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// AI Demand Forecast by Trade Lane
// ==========================================
export const ecrDemandForecasts = pgTable("ecr_demand_forecasts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  forecastRef: varchar("forecast_ref", { length: 100 }).notNull(),
  forecastType: varchar("forecast_type", { length: 50 }).notNull(), // short_term, medium_term, long_term, seasonal, event_driven
  title: varchar("title", { length: 255 }),
  tradeLane: varchar("trade_lane", { length: 255 }),
  containerType: varchar("container_type", { length: 50 }),
  periodFrom: timestamp("period_from", { withTimezone: true }),
  periodTo: timestamp("period_to", { withTimezone: true }),
  forecastedDemand: integer("forecasted_demand"),
  actualDemand: integer("actual_demand"),
  accuracyPct: decimal("accuracy_pct", { precision: 5, scale: 2 }),
  confidenceLevel: decimal("confidence_level", { precision: 5, scale: 2 }),
  aiModelVersion: varchar("ai_model_version", { length: 50 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Leasing vs Repositioning Decision Engine
// ==========================================
export const ecrLeasingDecisions = pgTable("ecr_leasing_decisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  decisionRef: varchar("decision_ref", { length: 100 }).notNull(),
  decisionType: varchar("decision_type", { length: 50 }).notNull(), // lease_in, lease_out, reposition, buy, sell
  title: varchar("title", { length: 255 }),
  locationCode: varchar("location_code", { length: 100 }),
  containerType: varchar("container_type", { length: 50 }),
  quantity: integer("quantity"),
  repositionCost: decimal("reposition_cost", { precision: 14, scale: 2 }),
  leasingCost: decimal("leasing_cost", { precision: 14, scale: 2 }),
  breakEvenDays: integer("break_even_days"),
  recommendedAction: varchar("recommended_action", { length: 50 }),
  savingsAmount: decimal("savings_amount", { precision: 14, scale: 2 }),
  aiRecommendation: text("ai_recommendation"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Empty Return Incentive Management
// ==========================================
export const ecrReturnIncentives = pgTable("ecr_return_incentives", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  incentiveRef: varchar("incentive_ref", { length: 100 }).notNull(),
  incentiveType: varchar("incentive_type", { length: 50 }).notNull(), // flat_discount, percentage_rebate, free_storage, priority_booking, loyalty_bonus
  title: varchar("title", { length: 255 }),
  customerName: varchar("customer_name", { length: 255 }),
  tradeLane: varchar("trade_lane", { length: 255 }),
  containerType: varchar("container_type", { length: 50 }),
  targetLocation: varchar("target_location", { length: 255 }),
  incentiveValue: decimal("incentive_value", { precision: 14, scale: 2 }),
  currency: varchar("currency", { length: 3 }),
  validFrom: timestamp("valid_from", { withTimezone: true }),
  validTo: timestamp("valid_to", { withTimezone: true }),
  utilizationCount: integer("utilization_count"),
  isActive: boolean("is_active").default(true),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Repositioning P&L Attribution
// ==========================================
export const ecrPnlAttributions = pgTable("ecr_pnl_attributions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  attributionRef: varchar("attribution_ref", { length: 100 }).notNull(),
  attributionType: varchar("attribution_type", { length: 50 }).notNull(), // voyage_level, trade_lane, region, container_type, monthly_summary
  title: varchar("title", { length: 255 }),
  periodFrom: timestamp("period_from", { withTimezone: true }),
  periodTo: timestamp("period_to", { withTimezone: true }),
  tradeLane: varchar("trade_lane", { length: 255 }),
  repositioningRevenue: decimal("repositioning_revenue", { precision: 14, scale: 2 }),
  repositioningCost: decimal("repositioning_cost", { precision: 14, scale: 2 }),
  netPnl: decimal("net_pnl", { precision: 14, scale: 2 }),
  totalMoves: integer("total_moves"),
  costPerMove: decimal("cost_per_move", { precision: 14, scale: 2 }),
  revenuePerMove: decimal("revenue_per_move", { precision: 14, scale: 2 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
