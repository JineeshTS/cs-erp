import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  numeric,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// FEAT-011-1-001: Vessel Schedule Management
// ==========================================

export const capVesselSchedules = pgTable(
  "cap_vessel_schedules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    vesselImo: varchar("vessel_imo", { length: 10 }),
    serviceName: varchar("service_name", { length: 255 }).notNull(),
    tradeLane: varchar("trade_lane", { length: 100 }),
    scheduleType: varchar("schedule_type", { length: 30 })
      .notNull()
      .default("regular"),
    validityFrom: timestamp("validity_from", { withTimezone: true }).notNull(),
    validityTo: timestamp("validity_to", { withTimezone: true }),
    frequency: varchar("frequency", { length: 20 }).default("weekly"),
    totalCapacityTeu: integer("total_capacity_teu"),
    totalWeightMt: integer("total_weight_mt"),
    operatorName: varchar("operator_name", { length: 255 }),
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
    index("cap_vessel_schedules_tenant_id_idx").on(table.tenantId),
    index("cap_vessel_schedules_service_idx").on(table.serviceName),
    index("cap_vessel_schedules_trade_lane_idx").on(table.tradeLane),
    index("cap_vessel_schedules_status_idx").on(table.status),
    index("cap_vessel_schedules_vessel_imo_idx").on(table.vesselImo),
    index("cap_vessel_schedules_validity_idx").on(
      table.validityFrom,
      table.validityTo
    ),
  ]
);

// ==========================================
// FEAT-011-1-002: Port Rotation & Call Management
// ==========================================

export const capPortRotations = pgTable(
  "cap_port_rotations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    vesselScheduleId: uuid("vessel_schedule_id")
      .notNull()
      .references(() => capVesselSchedules.id),
    portCode: varchar("port_code", { length: 10 }).notNull(),
    portName: varchar("port_name", { length: 255 }).notNull(),
    sequenceNumber: integer("sequence_number").notNull(),
    arrivalEta: timestamp("arrival_eta", { withTimezone: true }),
    departureEtd: timestamp("departure_etd", { withTimezone: true }),
    actualArrival: timestamp("actual_arrival", { withTimezone: true }),
    actualDeparture: timestamp("actual_departure", { withTimezone: true }),
    terminalName: varchar("terminal_name", { length: 255 }),
    berthName: varchar("berth_name", { length: 100 }),
    callPurpose: varchar("call_purpose", { length: 30 })
      .notNull()
      .default("both"),
    timeZone: varchar("time_zone", { length: 50 }),
    status: varchar("status", { length: 20 }).notNull().default("scheduled"),
    notes: text("notes"),
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
    index("cap_port_rotations_tenant_id_idx").on(table.tenantId),
    index("cap_port_rotations_schedule_idx").on(table.vesselScheduleId),
    index("cap_port_rotations_port_code_idx").on(table.portCode),
    index("cap_port_rotations_status_idx").on(table.status),
    index("cap_port_rotations_sequence_idx").on(
      table.vesselScheduleId,
      table.sequenceNumber
    ),
  ]
);

// ==========================================
// FEAT-011-1-003: Capacity Allocation by Trade
// ==========================================

export const capTradeAllocations = pgTable(
  "cap_trade_allocations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    vesselScheduleId: uuid("vessel_schedule_id")
      .references(() => capVesselSchedules.id),
    tradeLane: varchar("trade_lane", { length: 100 }).notNull(),
    originRegion: varchar("origin_region", { length: 100 }),
    destinationRegion: varchar("destination_region", { length: 100 }),
    allocatedTeu: integer("allocated_teu").notNull(),
    allocatedWeightMt: integer("allocated_weight_mt"),
    utilizedTeu: integer("utilized_teu").default(0),
    utilizedWeightMt: integer("utilized_weight_mt").default(0),
    allocationType: varchar("allocation_type", { length: 20 })
      .notNull()
      .default("contract"),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    priority: integer("priority").default(0),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
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
    index("cap_trade_allocations_tenant_id_idx").on(table.tenantId),
    index("cap_trade_allocations_schedule_idx").on(table.vesselScheduleId),
    index("cap_trade_allocations_trade_lane_idx").on(table.tradeLane),
    index("cap_trade_allocations_type_idx").on(table.allocationType),
    index("cap_trade_allocations_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-011-1-004: Space Management & Booking Control
// ==========================================

export const capSpaceControls = pgTable(
  "cap_space_controls",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    vesselScheduleId: uuid("vessel_schedule_id")
      .references(() => capVesselSchedules.id),
    portRotationId: uuid("port_rotation_id")
      .references(() => capPortRotations.id),
    bookingReference: varchar("booking_reference", { length: 50 }).notNull(),
    containerType: varchar("container_type", { length: 20 }).notNull(),
    containerSize: varchar("container_size", { length: 10 }).notNull(),
    quantityTeu: integer("quantity_teu").notNull(),
    weightMt: integer("weight_mt"),
    shipperName: varchar("shipper_name", { length: 255 }),
    consigneeName: varchar("consignee_name", { length: 255 }),
    commodity: varchar("commodity", { length: 255 }),
    hazmatClass: varchar("hazmat_class", { length: 10 }),
    reeferTemp: numeric("reefer_temp", { precision: 5, scale: 1 }),
    oogDimensions: jsonb("oog_dimensions"),
    bookingDate: timestamp("booking_date", { withTimezone: true }),
    cutOffDate: timestamp("cut_off_date", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    notes: text("notes"),
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
    index("cap_space_controls_tenant_id_idx").on(table.tenantId),
    index("cap_space_controls_schedule_idx").on(table.vesselScheduleId),
    index("cap_space_controls_port_idx").on(table.portRotationId),
    index("cap_space_controls_booking_ref_idx").on(table.bookingReference),
    index("cap_space_controls_status_idx").on(table.status),
    index("cap_space_controls_container_type_idx").on(table.containerType),
  ]
);

// ==========================================
// FEAT-011-2-001: Transshipment Planning & Coordination
// ==========================================

export const capTransshipmentPlans = pgTable(
  "cap_transshipment_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    bookingReference: varchar("booking_reference", { length: 50 }),
    containerNumber: varchar("container_number", { length: 20 }),
    originPort: varchar("origin_port", { length: 255 }).notNull(),
    transshipmentPort: varchar("transshipment_port", { length: 255 }).notNull(),
    destinationPort: varchar("destination_port", { length: 255 }).notNull(),
    firstVesselScheduleId: uuid("first_vessel_schedule_id")
      .references(() => capVesselSchedules.id),
    secondVesselScheduleId: uuid("second_vessel_schedule_id")
      .references(() => capVesselSchedules.id),
    expectedArrival: timestamp("expected_arrival", { withTimezone: true }),
    expectedConnection: timestamp("expected_connection", { withTimezone: true }),
    dwellDays: integer("dwell_days"),
    connectionType: varchar("connection_type", { length: 20 }).default("direct"),
    status: varchar("status", { length: 20 }).notNull().default("planned"),
    coordinationNotes: text("coordination_notes"),
    notes: text("notes"),
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
    index("cap_transshipment_plans_tenant_id_idx").on(table.tenantId),
    index("cap_transshipment_plans_first_vessel_idx").on(
      table.firstVesselScheduleId
    ),
    index("cap_transshipment_plans_second_vessel_idx").on(
      table.secondVesselScheduleId
    ),
    index("cap_transshipment_plans_ts_port_idx").on(table.transshipmentPort),
    index("cap_transshipment_plans_status_idx").on(table.status),
    index("cap_transshipment_plans_container_idx").on(table.containerNumber),
  ]
);

// ==========================================
// FEAT-011-2-002: Loading List & Cut-Off Management
// ==========================================

export const capLoadingLists = pgTable(
  "cap_loading_lists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    vesselScheduleId: uuid("vessel_schedule_id")
      .notNull()
      .references(() => capVesselSchedules.id),
    portRotationId: uuid("port_rotation_id")
      .references(() => capPortRotations.id),
    listReference: varchar("list_reference", { length: 50 }).notNull(),
    listType: varchar("list_type", { length: 20 }).notNull().default("preliminary"),
    totalContainers: integer("total_containers").default(0),
    totalTeu: integer("total_teu").default(0),
    totalWeightMt: integer("total_weight_mt").default(0),
    hazmatCount: integer("hazmat_count").default(0),
    reeferCount: integer("reefer_count").default(0),
    oogCount: integer("oog_count").default(0),
    cutOffCargo: timestamp("cut_off_cargo", { withTimezone: true }),
    cutOffDocumentation: timestamp("cut_off_documentation", {
      withTimezone: true,
    }),
    cutOffVgm: timestamp("cut_off_vgm", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    containers: jsonb("containers"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
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
    index("cap_loading_lists_tenant_id_idx").on(table.tenantId),
    index("cap_loading_lists_schedule_idx").on(table.vesselScheduleId),
    index("cap_loading_lists_port_idx").on(table.portRotationId),
    index("cap_loading_lists_ref_idx").on(table.listReference),
    index("cap_loading_lists_status_idx").on(table.status),
    index("cap_loading_lists_type_idx").on(table.listType),
  ]
);

// ==========================================
// FEAT-011-2-003: BAPLIE Bay Plan Management
// ==========================================

export const capBayPlans = pgTable(
  "cap_bay_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    vesselScheduleId: uuid("vessel_schedule_id")
      .notNull()
      .references(() => capVesselSchedules.id),
    portRotationId: uuid("port_rotation_id")
      .references(() => capPortRotations.id),
    baplieVersion: varchar("baplie_version", { length: 20 }).default("2.2"),
    planType: varchar("plan_type", { length: 20 }).notNull().default("pre_stow"),
    totalSlots: integer("total_slots").default(0),
    occupiedSlots: integer("occupied_slots").default(0),
    utilizationPercent: numeric("utilization_percent", {
      precision: 5,
      scale: 2,
    }),
    fileReference: varchar("file_reference", { length: 255 }),
    baplieData: jsonb("baplie_data"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    validatedAt: timestamp("validated_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
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
    index("cap_bay_plans_tenant_id_idx").on(table.tenantId),
    index("cap_bay_plans_schedule_idx").on(table.vesselScheduleId),
    index("cap_bay_plans_port_idx").on(table.portRotationId),
    index("cap_bay_plans_status_idx").on(table.status),
    index("cap_bay_plans_type_idx").on(table.planType),
  ]
);

// ==========================================
// FEAT-011-2-004: Stowage Planning & Optimization
// ==========================================

export const capStowagePlans = pgTable(
  "cap_stowage_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    vesselScheduleId: uuid("vessel_schedule_id")
      .references(() => capVesselSchedules.id),
    bayPlanId: uuid("bay_plan_id")
      .references(() => capBayPlans.id),
    containerNumber: varchar("container_number", { length: 20 }).notNull(),
    containerType: varchar("container_type", { length: 20 }),
    containerSize: varchar("container_size", { length: 10 }),
    isoCode: varchar("iso_code", { length: 10 }),
    weightKg: integer("weight_kg"),
    bayNumber: integer("bay_number"),
    rowNumber: integer("row_number"),
    tierNumber: integer("tier_number"),
    isHazmat: boolean("is_hazmat").default(false),
    hazmatClass: varchar("hazmat_class", { length: 10 }),
    isReefer: boolean("is_reefer").default(false),
    reeferTemp: numeric("reefer_temp", { precision: 5, scale: 1 }),
    isOog: boolean("is_oog").default(false),
    oogHeightCm: integer("oog_height_cm"),
    oogWidthCm: integer("oog_width_cm"),
    pol: varchar("pol", { length: 10 }),
    pod: varchar("pod", { length: 10 }),
    stackingOrder: integer("stacking_order"),
    status: varchar("status", { length: 20 }).notNull().default("planned"),
    notes: text("notes"),
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
    index("cap_stowage_plans_tenant_id_idx").on(table.tenantId),
    index("cap_stowage_plans_schedule_idx").on(table.vesselScheduleId),
    index("cap_stowage_plans_bay_plan_idx").on(table.bayPlanId),
    index("cap_stowage_plans_container_idx").on(table.containerNumber),
    index("cap_stowage_plans_status_idx").on(table.status),
    index("cap_stowage_plans_position_idx").on(
      table.bayNumber,
      table.rowNumber,
      table.tierNumber
    ),
  ]
);

// ==========================================
// FEAT-011-3-001: AI Load Optimization Engine
// ==========================================

export const capLoadOptimizations = pgTable(
  "cap_load_optimizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    vesselScheduleId: uuid("vessel_schedule_id")
      .references(() => capVesselSchedules.id),
    optimizationRunId: varchar("optimization_run_id", { length: 50 }),
    algorithm: varchar("algorithm", { length: 50 }).default("genetic"),
    objective: varchar("objective", { length: 30 })
      .notNull()
      .default("maximize_teu"),
    inputParameters: jsonb("input_parameters"),
    results: jsonb("results"),
    totalTeuBefore: integer("total_teu_before"),
    totalTeuAfter: integer("total_teu_after"),
    improvementPercent: numeric("improvement_percent", {
      precision: 5,
      scale: 2,
    }),
    revenueImpact: integer("revenue_impact"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    aiModel: varchar("ai_model", { length: 100 }),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    notes: text("notes"),
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
    index("cap_load_optimizations_tenant_id_idx").on(table.tenantId),
    index("cap_load_optimizations_schedule_idx").on(table.vesselScheduleId),
    index("cap_load_optimizations_status_idx").on(table.status),
    index("cap_load_optimizations_objective_idx").on(table.objective),
    index("cap_load_optimizations_run_idx").on(table.optimizationRunId),
  ]
);

// ==========================================
// FEAT-011-3-002: Revenue per TEU Analytics
// ==========================================

export const capRevenueAnalytics = pgTable(
  "cap_revenue_analytics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    vesselScheduleId: uuid("vessel_schedule_id")
      .references(() => capVesselSchedules.id),
    tradeLane: varchar("trade_lane", { length: 100 }),
    originPort: varchar("origin_port", { length: 255 }),
    destinationPort: varchar("destination_port", { length: 255 }),
    periodFrom: timestamp("period_from", { withTimezone: true }).notNull(),
    periodTo: timestamp("period_to", { withTimezone: true }).notNull(),
    totalTeu: integer("total_teu"),
    totalRevenue: integer("total_revenue"),
    revenuePerTeu: integer("revenue_per_teu"),
    averageRate: integer("average_rate"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    containerTypeBreakdown: jsonb("container_type_breakdown"),
    commodityBreakdown: jsonb("commodity_breakdown"),
    comparisonPreviousPeriod: jsonb("comparison_previous_period"),
    calculatedAt: timestamp("calculated_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
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
    index("cap_revenue_analytics_tenant_id_idx").on(table.tenantId),
    index("cap_revenue_analytics_schedule_idx").on(table.vesselScheduleId),
    index("cap_revenue_analytics_trade_lane_idx").on(table.tradeLane),
    index("cap_revenue_analytics_period_idx").on(
      table.periodFrom,
      table.periodTo
    ),
    index("cap_revenue_analytics_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-011-3-003: Capacity Forecasting & Demand Planning
// ==========================================

export const capDemandForecasts = pgTable(
  "cap_demand_forecasts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    tradeLane: varchar("trade_lane", { length: 100 }).notNull(),
    originRegion: varchar("origin_region", { length: 100 }),
    destinationRegion: varchar("destination_region", { length: 100 }),
    forecastPeriodStart: timestamp("forecast_period_start", {
      withTimezone: true,
    }).notNull(),
    forecastPeriodEnd: timestamp("forecast_period_end", {
      withTimezone: true,
    }).notNull(),
    forecastedDemandTeu: integer("forecasted_demand_teu"),
    actualDemandTeu: integer("actual_demand_teu"),
    availableCapacityTeu: integer("available_capacity_teu"),
    utilizationForecastPercent: numeric("utilization_forecast_percent", {
      precision: 5,
      scale: 2,
    }),
    confidenceLevel: numeric("confidence_level", { precision: 5, scale: 2 }),
    methodology: varchar("methodology", { length: 20 })
      .notNull()
      .default("historical"),
    seasonFactor: numeric("season_factor", { precision: 5, scale: 2 }),
    marketConditions: jsonb("market_conditions"),
    recommendations: jsonb("recommendations"),
    aiModel: varchar("ai_model", { length: 100 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
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
    index("cap_demand_forecasts_tenant_id_idx").on(table.tenantId),
    index("cap_demand_forecasts_trade_lane_idx").on(table.tradeLane),
    index("cap_demand_forecasts_period_idx").on(
      table.forecastPeriodStart,
      table.forecastPeriodEnd
    ),
    index("cap_demand_forecasts_methodology_idx").on(table.methodology),
    index("cap_demand_forecasts_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-011-3-004: Schedule Reliability & Performance Tracking
// ==========================================

export const capSchedulePerformances = pgTable(
  "cap_schedule_performances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    vesselScheduleId: uuid("vessel_schedule_id")
      .references(() => capVesselSchedules.id),
    portRotationId: uuid("port_rotation_id")
      .references(() => capPortRotations.id),
    portName: varchar("port_name", { length: 255 }),
    scheduledArrival: timestamp("scheduled_arrival", { withTimezone: true }),
    actualArrival: timestamp("actual_arrival", { withTimezone: true }),
    scheduledDeparture: timestamp("scheduled_departure", {
      withTimezone: true,
    }),
    actualDeparture: timestamp("actual_departure", { withTimezone: true }),
    arrivalDelayHours: numeric("arrival_delay_hours", {
      precision: 8,
      scale: 2,
    }),
    departureDelayHours: numeric("departure_delay_hours", {
      precision: 8,
      scale: 2,
    }),
    delayReason: varchar("delay_reason", { length: 255 }),
    onTimeArrival: boolean("on_time_arrival"),
    onTimeDeparture: boolean("on_time_departure"),
    bunkerConsumptionMt: numeric("bunker_consumption_mt", {
      precision: 10,
      scale: 2,
    }),
    speedKnots: numeric("speed_knots", { precision: 5, scale: 1 }),
    distanceNm: numeric("distance_nm", { precision: 10, scale: 1 }),
    weatherConditions: varchar("weather_conditions", { length: 50 }),
    seaState: varchar("sea_state", { length: 20 }),
    reliabilityScore: numeric("reliability_score", { precision: 5, scale: 2 }),
    periodFrom: timestamp("period_from", { withTimezone: true }),
    periodTo: timestamp("period_to", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("recorded"),
    notes: text("notes"),
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
    index("cap_schedule_performances_tenant_id_idx").on(table.tenantId),
    index("cap_schedule_performances_schedule_idx").on(table.vesselScheduleId),
    index("cap_schedule_performances_port_idx").on(table.portRotationId),
    index("cap_schedule_performances_status_idx").on(table.status),
    index("cap_schedule_performances_period_idx").on(
      table.periodFrom,
      table.periodTo
    ),
  ]
);
