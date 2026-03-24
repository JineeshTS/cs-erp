import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// Transshipment Cargo Planning & Coordination
// ==========================================
export const thmCargoPlans = pgTable("thm_cargo_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  planRef: varchar("plan_ref", { length: 100 }).notNull(),
  planType: varchar("plan_type", { length: 50 }).notNull(), // inbound_planning, outbound_planning, cross_dock, consolidation, deconsolidation
  hubPort: varchar("hub_port", { length: 100 }),
  originPort: varchar("origin_port", { length: 100 }),
  destinationPort: varchar("destination_port", { length: 100 }),
  motherVessel: varchar("mother_vessel", { length: 255 }),
  feederVessel: varchar("feeder_vessel", { length: 255 }),
  containerCount: integer("container_count"),
  teuVolume: decimal("teu_volume", { precision: 10, scale: 2 }),
  plannedTransferDate: timestamp("planned_transfer_date", { withTimezone: true }),
  dwellTimeDays: decimal("dwell_time_days", { precision: 8, scale: 2 }),
  priority: varchar("priority", { length: 20 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Feeder Vessel & Connecting Service Coordination
// ==========================================
export const thmFeederCoordinations = pgTable("thm_feeder_coordinations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  coordinationRef: varchar("coordination_ref", { length: 100 }).notNull(),
  coordinationType: varchar("coordination_type", { length: 50 }).notNull(), // feeder_arrival, feeder_departure, relay_connection, barge_transfer, intermodal_link
  feederVessel: varchar("feeder_vessel", { length: 255 }),
  feederService: varchar("feeder_service", { length: 100 }),
  motherVessel: varchar("mother_vessel", { length: 255 }),
  hubPort: varchar("hub_port", { length: 100 }),
  etaFeeder: timestamp("eta_feeder", { withTimezone: true }),
  etdFeeder: timestamp("etd_feeder", { withTimezone: true }),
  connectionWindowHours: decimal("connection_window_hours", { precision: 8, scale: 2 }),
  cargoUnits: integer("cargo_units"),
  bufferHours: decimal("buffer_hours", { precision: 8, scale: 2 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// T/S Cargo Tracking Through Hub
// ==========================================
export const thmCargoTrackings = pgTable("thm_cargo_trackings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  trackingRef: varchar("tracking_ref", { length: 100 }).notNull(),
  trackingType: varchar("tracking_type", { length: 50 }).notNull(), // discharge_tracking, yard_movement, load_tracking, gate_passage, milestone_update
  containerNumber: varchar("container_number", { length: 20 }),
  bookingRef: varchar("booking_ref", { length: 100 }),
  hubPort: varchar("hub_port", { length: 100 }),
  currentLocation: varchar("current_location", { length: 255 }),
  inboundVessel: varchar("inbound_vessel", { length: 255 }),
  outboundVessel: varchar("outbound_vessel", { length: 255 }),
  dischargeTime: timestamp("discharge_time", { withTimezone: true }),
  loadTime: timestamp("load_time", { withTimezone: true }),
  yardPosition: varchar("yard_position", { length: 50 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Missed Connection & Recovery Management
// ==========================================
export const thmMissedConnections = pgTable("thm_missed_connections", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  connectionRef: varchar("connection_ref", { length: 100 }).notNull(),
  connectionType: varchar("connection_type", { length: 50 }).notNull(), // vessel_delay, port_congestion, equipment_failure, weather_disruption, operational_error
  containerNumber: varchar("container_number", { length: 20 }),
  hubPort: varchar("hub_port", { length: 100 }),
  originalVessel: varchar("original_vessel", { length: 255 }),
  recoveryVessel: varchar("recovery_vessel", { length: 255 }),
  missedDate: timestamp("missed_date", { withTimezone: true }),
  recoveryDate: timestamp("recovery_date", { withTimezone: true }),
  delayDays: decimal("delay_days", { precision: 8, scale: 2 }),
  additionalCost: decimal("additional_cost", { precision: 14, scale: 2 }),
  currency: varchar("currency", { length: 3 }),
  recovered: boolean("recovered"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// T/S Revenue Attribution & Profitability
// ==========================================
export const thmRevenueAttributions = pgTable("thm_revenue_attributions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  attributionRef: varchar("attribution_ref", { length: 100 }).notNull(),
  attributionType: varchar("attribution_type", { length: 50 }).notNull(), // leg_allocation, hub_cost_sharing, feeder_revenue, mother_revenue, margin_analysis
  bookingRef: varchar("booking_ref", { length: 100 }),
  hubPort: varchar("hub_port", { length: 100 }),
  legFrom: varchar("leg_from", { length: 100 }),
  legTo: varchar("leg_to", { length: 100 }),
  freightRevenue: decimal("freight_revenue", { precision: 14, scale: 2 }),
  handlingCost: decimal("handling_cost", { precision: 14, scale: 2 }),
  hubCost: decimal("hub_cost", { precision: 14, scale: 2 }),
  netMargin: decimal("net_margin", { precision: 14, scale: 2 }),
  currency: varchar("currency", { length: 3 }),
  marginPct: decimal("margin_pct", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Hub Efficiency & Productivity Analytics
// ==========================================
export const thmHubEfficiencies = pgTable("thm_hub_efficiencies", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  efficiencyRef: varchar("efficiency_ref", { length: 100 }).notNull(),
  efficiencyType: varchar("efficiency_type", { length: 50 }).notNull(), // throughput_analysis, dwell_time_report, crane_productivity, berth_utilization, yard_capacity
  hubPort: varchar("hub_port", { length: 100 }),
  periodStart: timestamp("period_start", { withTimezone: true }),
  periodEnd: timestamp("period_end", { withTimezone: true }),
  throughputTeu: decimal("throughput_teu", { precision: 12, scale: 2 }),
  avgDwellHours: decimal("avg_dwell_hours", { precision: 8, scale: 2 }),
  craneMovesPerHour: decimal("crane_moves_per_hour", { precision: 8, scale: 2 }),
  berthUtilizationPct: decimal("berth_utilization_pct", { precision: 5, scale: 2 }),
  yardOccupancyPct: decimal("yard_occupancy_pct", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// AI Transshipment Optimization Engine
// ==========================================
export const thmOptimizationEngines = pgTable("thm_optimization_engines", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  engineRef: varchar("engine_ref", { length: 100 }).notNull(),
  engineType: varchar("engine_type", { length: 50 }).notNull(), // connection_optimizer, yard_allocation, vessel_pairing, load_sequencing, dwell_minimizer
  hubPort: varchar("hub_port", { length: 100 }),
  scenarioName: varchar("scenario_name", { length: 255 }),
  currentCost: decimal("current_cost", { precision: 14, scale: 2 }),
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
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Long Transshipment Penalty Tracking
// ==========================================
export const thmPenaltyTrackings = pgTable("thm_penalty_trackings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  penaltyRef: varchar("penalty_ref", { length: 100 }).notNull(),
  penaltyType: varchar("penalty_type", { length: 50 }).notNull(), // dwell_penalty, late_delivery, missed_cutoff, storage_charge, demurrage_charge
  containerNumber: varchar("container_number", { length: 20 }),
  bookingRef: varchar("booking_ref", { length: 100 }),
  hubPort: varchar("hub_port", { length: 100 }),
  dwellDays: decimal("dwell_days", { precision: 8, scale: 2 }),
  thresholdDays: decimal("threshold_days", { precision: 8, scale: 2 }),
  penaltyAmount: decimal("penalty_amount", { precision: 14, scale: 2 }),
  currency: varchar("currency", { length: 3 }),
  chargedTo: varchar("charged_to", { length: 255 }),
  waived: boolean("waived"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
