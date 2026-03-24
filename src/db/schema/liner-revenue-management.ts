import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// Revenue per TEU Maximization Strategy
// ==========================================
export const lrmTeuMaximizations = pgTable("lrm_teu_maximizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  strategyRef: varchar("strategy_ref", { length: 100 }).notNull(),
  strategyType: varchar("strategy_type", { length: 50 }).notNull(), // rate_optimization, slot_utilization, cargo_prioritization, surcharge_review, yield_management
  tradeLane: varchar("trade_lane", { length: 100 }),
  originPort: varchar("origin_port", { length: 10 }),
  destinationPort: varchar("destination_port", { length: 10 }),
  currentRevenueTeu: decimal("current_revenue_teu", { precision: 14, scale: 2 }),
  targetRevenueTeu: decimal("target_revenue_teu", { precision: 14, scale: 2 }),
  achievedRevenueTeu: decimal("achieved_revenue_teu", { precision: 14, scale: 2 }),
  currency: varchar("currency", { length: 3 }),
  teuVolume: integer("teu_volume"),
  utilizationPct: decimal("utilization_pct", { precision: 5, scale: 2 }),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }),
  effectiveTo: timestamp("effective_to", { withTimezone: true }),
  approvedBy: varchar("approved_by", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Cargo Mix & Portfolio Management
// ==========================================
export const lrmCargoMixes = pgTable("lrm_cargo_mixes", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  mixRef: varchar("mix_ref", { length: 100 }).notNull(),
  mixType: varchar("mix_type", { length: 50 }).notNull(), // commodity_analysis, segment_allocation, weight_class, reefer_ratio, special_cargo
  tradeLane: varchar("trade_lane", { length: 100 }),
  commodityGroup: varchar("commodity_group", { length: 100 }),
  dryCargoTeu: integer("dry_cargo_teu"),
  reeferTeu: integer("reefer_teu"),
  specialCargoTeu: integer("special_cargo_teu"),
  totalTeu: integer("total_teu"),
  revenueContribution: decimal("revenue_contribution", { precision: 14, scale: 2 }),
  marginPct: decimal("margin_pct", { precision: 5, scale: 2 }),
  currency: varchar("currency", { length: 3 }),
  periodStart: timestamp("period_start", { withTimezone: true }),
  periodEnd: timestamp("period_end", { withTimezone: true }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// AI Demand Forecasting per Trade Lane
// ==========================================
export const lrmDemandForecasts = pgTable("lrm_demand_forecasts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  forecastRef: varchar("forecast_ref", { length: 100 }).notNull(),
  forecastType: varchar("forecast_type", { length: 50 }).notNull(), // seasonal_trend, ml_prediction, market_analysis, capacity_planning, booking_projection
  tradeLane: varchar("trade_lane", { length: 100 }),
  originRegion: varchar("origin_region", { length: 100 }),
  destinationRegion: varchar("destination_region", { length: 100 }),
  forecastPeriod: varchar("forecast_period", { length: 20 }),
  predictedTeu: integer("predicted_teu"),
  actualTeu: integer("actual_teu"),
  confidencePct: decimal("confidence_pct", { precision: 5, scale: 2 }),
  accuracyPct: decimal("accuracy_pct", { precision: 5, scale: 2 }),
  modelVersion: varchar("model_version", { length: 50 }),
  forecastDate: timestamp("forecast_date", { withTimezone: true }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Freight Forward Contracts & Futures
// ==========================================
export const lrmFreightContracts = pgTable("lrm_freight_contracts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  contractRef: varchar("contract_ref", { length: 100 }).notNull(),
  contractType: varchar("contract_type", { length: 50 }).notNull(), // spot_rate, long_term, ffa_settlement, index_linked, hybrid_contract
  counterparty: varchar("counterparty", { length: 255 }),
  tradeLane: varchar("trade_lane", { length: 100 }),
  contractedRate: decimal("contracted_rate", { precision: 14, scale: 2 }),
  spotRate: decimal("spot_rate", { precision: 14, scale: 2 }),
  currency: varchar("currency", { length: 3 }),
  volumeTeu: integer("volume_teu"),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  settlementBasis: varchar("settlement_basis", { length: 50 }),
  indexReference: varchar("index_reference", { length: 100 }),
  markToMarketValue: decimal("mark_to_market_value", { precision: 14, scale: 2 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Revenue Leakage Detection & Prevention
// ==========================================
export const lrmLeakageDetections = pgTable("lrm_leakage_detections", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  leakageRef: varchar("leakage_ref", { length: 100 }).notNull(),
  leakageType: varchar("leakage_type", { length: 50 }).notNull(), // unbilled_charge, rate_deviation, weight_discrepancy, surcharge_miss, free_time_abuse
  bookingRef: varchar("booking_ref", { length: 100 }),
  customerName: varchar("customer_name", { length: 255 }),
  expectedAmount: decimal("expected_amount", { precision: 14, scale: 2 }),
  actualAmount: decimal("actual_amount", { precision: 14, scale: 2 }),
  leakageAmount: decimal("leakage_amount", { precision: 14, scale: 2 }),
  currency: varchar("currency", { length: 3 }),
  detectedAt: timestamp("detected_at", { withTimezone: true }),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  rootCause: text("root_cause"),
  recoveryAction: varchar("recovery_action", { length: 100 }),
  recovered: boolean("recovered"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Rate Integrity & Unauthorized Discount Control
// ==========================================
export const lrmRateIntegrities = pgTable("lrm_rate_integrities", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  integrityRef: varchar("integrity_ref", { length: 100 }).notNull(),
  integrityType: varchar("integrity_type", { length: 50 }).notNull(), // rate_audit, discount_review, tariff_compliance, approval_check, deviation_alert
  tradeLane: varchar("trade_lane", { length: 100 }),
  customerName: varchar("customer_name", { length: 255 }),
  publishedRate: decimal("published_rate", { precision: 14, scale: 2 }),
  appliedRate: decimal("applied_rate", { precision: 14, scale: 2 }),
  discountPct: decimal("discount_pct", { precision: 5, scale: 2 }),
  maxAllowedDiscount: decimal("max_allowed_discount", { precision: 5, scale: 2 }),
  currency: varchar("currency", { length: 3 }),
  authorized: boolean("authorized"),
  authorizedBy: varchar("authorized_by", { length: 255 }),
  violationSeverity: varchar("violation_severity", { length: 20 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Revenue Accrual Management
// ==========================================
export const lrmRevenueAccruals = pgTable("lrm_revenue_accruals", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  accrualRef: varchar("accrual_ref", { length: 100 }).notNull(),
  accrualType: varchar("accrual_type", { length: 50 }).notNull(), // freight_accrual, surcharge_accrual, demurrage_accrual, detention_accrual, ancillary_accrual
  voyageRef: varchar("voyage_ref", { length: 100 }),
  customerName: varchar("customer_name", { length: 255 }),
  accrualAmount: decimal("accrual_amount", { precision: 14, scale: 2 }),
  billedAmount: decimal("billed_amount", { precision: 14, scale: 2 }),
  varianceAmount: decimal("variance_amount", { precision: 14, scale: 2 }),
  currency: varchar("currency", { length: 3 }),
  accrualPeriod: varchar("accrual_period", { length: 20 }),
  recognitionDate: timestamp("recognition_date", { withTimezone: true }),
  reversalDate: timestamp("reversal_date", { withTimezone: true }),
  glAccountCode: varchar("gl_account_code", { length: 20 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// AI Revenue Maximization Engine
// ==========================================
export const lrmMaximizationEngines = pgTable("lrm_maximization_engines", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  engineRef: varchar("engine_ref", { length: 100 }).notNull(),
  engineType: varchar("engine_type", { length: 50 }).notNull(), // dynamic_pricing, overbooking_optimization, cargo_allocation, surcharge_optimization, bundle_pricing
  tradeLane: varchar("trade_lane", { length: 100 }),
  modelName: varchar("model_name", { length: 100 }),
  modelVersion: varchar("model_version", { length: 50 }),
  recommendedRate: decimal("recommended_rate", { precision: 14, scale: 2 }),
  currentRate: decimal("current_rate", { precision: 14, scale: 2 }),
  upliftPct: decimal("uplift_pct", { precision: 5, scale: 2 }),
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }),
  currency: varchar("currency", { length: 3 }),
  simulationRunAt: timestamp("simulation_run_at", { withTimezone: true }),
  acceptedRecommendation: boolean("accepted_recommendation"),
  revenueImpact: decimal("revenue_impact", { precision: 14, scale: 2 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
