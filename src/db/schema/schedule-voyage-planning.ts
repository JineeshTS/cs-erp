import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// Multi-Service Schedule Integration & Publication
// ==========================================
export const svpServiceSchedules = pgTable("svp_service_schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  scheduleRef: varchar("schedule_ref", { length: 100 }).notNull(),
  scheduleType: varchar("schedule_type", { length: 50 }).notNull(), // liner_service, feeder_service, relay_service, pendulum_route, round_trip
  serviceName: varchar("service_name", { length: 255 }),
  serviceCode: varchar("service_code", { length: 20 }),
  tradeRoute: varchar("trade_route", { length: 100 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  frequencyDays: integer("frequency_days"),
  portCount: integer("port_count"),
  transitTimeDays: integer("transit_time_days"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }),
  effectiveTo: timestamp("effective_to", { withTimezone: true }),
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
// Port Sequence & Berth Window Optimization
// ==========================================
export const svpPortSequences = pgTable("svp_port_sequences", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  sequenceRef: varchar("sequence_ref", { length: 100 }).notNull(),
  sequenceType: varchar("sequence_type", { length: 50 }).notNull(), // rotation_plan, berth_allocation, window_request, slot_optimization, congestion_bypass
  portCode: varchar("port_code", { length: 10 }),
  portName: varchar("port_name", { length: 255 }),
  terminalName: varchar("terminal_name", { length: 255 }),
  berthNumber: varchar("berth_number", { length: 20 }),
  windowStart: timestamp("window_start", { withTimezone: true }),
  windowEnd: timestamp("window_end", { withTimezone: true }),
  sequenceOrder: integer("sequence_order"),
  dwellHours: decimal("dwell_hours", { precision: 8, scale: 2 }),
  cargoMovesPlanned: integer("cargo_moves_planned"),
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
// Suez Panama Canal Transit Management
// ==========================================
export const svpCanalTransits = pgTable("svp_canal_transits", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  transitRef: varchar("transit_ref", { length: 100 }).notNull(),
  transitType: varchar("transit_type", { length: 50 }).notNull(), // suez_northbound, suez_southbound, panama_transit, kiel_transit, turkish_straits
  canalName: varchar("canal_name", { length: 100 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  bookingNumber: varchar("booking_number", { length: 50 }),
  scheduledDate: timestamp("scheduled_date", { withTimezone: true }),
  actualDate: timestamp("actual_date", { withTimezone: true }),
  transitFee: decimal("transit_fee", { precision: 14, scale: 2 }),
  currency: varchar("currency", { length: 3 }),
  convoyPosition: integer("convoy_position"),
  pilotRequired: boolean("pilot_required"),
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
// ETA ETD Management & Proactive Updates
// ==========================================
export const svpEtaManagements = pgTable("svp_eta_managements", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  etaRef: varchar("eta_ref", { length: 100 }).notNull(),
  etaType: varchar("eta_type", { length: 50 }).notNull(), // initial_estimate, revised_eta, final_eta, customer_notification, port_advisory
  vesselName: varchar("vessel_name", { length: 255 }),
  portCode: varchar("port_code", { length: 10 }),
  portName: varchar("port_name", { length: 255 }),
  originalEta: timestamp("original_eta", { withTimezone: true }),
  revisedEta: timestamp("revised_eta", { withTimezone: true }),
  actualArrival: timestamp("actual_arrival", { withTimezone: true }),
  delayHours: decimal("delay_hours", { precision: 8, scale: 2 }),
  delayReason: varchar("delay_reason", { length: 255 }),
  notificationSent: boolean("notification_sent"),
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
// AI Voyage Optimization Engine
// ==========================================
export const svpVoyageOptimizations = pgTable("svp_voyage_optimizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  optimizationRef: varchar("optimization_ref", { length: 100 }).notNull(),
  optimizationType: varchar("optimization_type", { length: 50 }).notNull(), // route_optimization, speed_profile, port_sequence, bunker_strategy, emission_reduction
  voyageRef: varchar("voyage_ref", { length: 100 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  originalCost: decimal("original_cost", { precision: 14, scale: 2 }),
  optimizedCost: decimal("optimized_cost", { precision: 14, scale: 2 }),
  savingsAmount: decimal("savings_amount", { precision: 14, scale: 2 }),
  savingsPct: decimal("savings_pct", { precision: 5, scale: 2 }),
  currency: varchar("currency", { length: 3 }),
  modelVersion: varchar("model_version", { length: 50 }),
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }),
  accepted: boolean("accepted"),
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
// Speed vs Fuel Trade-Off Analysis
// ==========================================
export const svpSpeedFuelAnalyses = pgTable("svp_speed_fuel_analyses", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  analysisRef: varchar("analysis_ref", { length: 100 }).notNull(),
  analysisType: varchar("analysis_type", { length: 50 }).notNull(), // slow_steaming, eco_speed, full_speed, variable_speed, weather_adjusted
  vesselName: varchar("vessel_name", { length: 255 }),
  voyageRef: varchar("voyage_ref", { length: 100 }),
  speedKnots: decimal("speed_knots", { precision: 6, scale: 2 }),
  fuelConsumptionMt: decimal("fuel_consumption_mt", { precision: 10, scale: 2 }),
  fuelCostPerDay: decimal("fuel_cost_per_day", { precision: 14, scale: 2 }),
  timeSavingHours: decimal("time_saving_hours", { precision: 8, scale: 2 }),
  co2EmissionsMt: decimal("co2_emissions_mt", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }),
  optimalSpeed: decimal("optimal_speed", { precision: 6, scale: 2 }),
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
// Weather Routing Integration
// ==========================================
export const svpWeatherRoutings = pgTable("svp_weather_routings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  routingRef: varchar("routing_ref", { length: 100 }).notNull(),
  routingType: varchar("routing_type", { length: 50 }).notNull(), // optimal_route, storm_avoidance, current_utilization, seasonal_planning, heavy_weather_alert
  vesselName: varchar("vessel_name", { length: 255 }),
  voyageRef: varchar("voyage_ref", { length: 100 }),
  departurePort: varchar("departure_port", { length: 10 }),
  arrivalPort: varchar("arrival_port", { length: 10 }),
  recommendedRoute: text("recommended_route"),
  distanceNm: decimal("distance_nm", { precision: 10, scale: 2 }),
  weatherSeverity: varchar("weather_severity", { length: 20 }),
  waveHeightM: decimal("wave_height_m", { precision: 5, scale: 2 }),
  windSpeedKnots: decimal("wind_speed_knots", { precision: 6, scale: 2 }),
  routeProvider: varchar("route_provider", { length: 100 }),
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
// Long-Term Vessel Deployment Planning
// ==========================================
export const svpDeploymentPlans = pgTable("svp_deployment_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  planRef: varchar("plan_ref", { length: 100 }).notNull(),
  planType: varchar("plan_type", { length: 50 }).notNull(), // annual_deployment, seasonal_adjustment, fleet_rebalancing, newbuild_allocation, charter_strategy
  vesselName: varchar("vessel_name", { length: 255 }),
  tradeRoute: varchar("trade_route", { length: 100 }),
  deploymentStart: timestamp("deployment_start", { withTimezone: true }),
  deploymentEnd: timestamp("deployment_end", { withTimezone: true }),
  vesselCapacityTeu: integer("vessel_capacity_teu"),
  expectedUtilizationPct: decimal("expected_utilization_pct", { precision: 5, scale: 2 }),
  dailyCostUsd: decimal("daily_cost_usd", { precision: 14, scale: 2 }),
  revenueProjection: decimal("revenue_projection", { precision: 14, scale: 2 }),
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
