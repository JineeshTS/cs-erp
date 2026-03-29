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
  numeric,
  uuid,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// FEAT-021-1-001: Service Loop & String Management
// ==========================================

export const ltrServiceLoops = pgTable(
  "ltr_service_loops",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    loopRef: varchar("loop_ref", { length: 50 }).notNull(),
    loopName: varchar("loop_name", { length: 255 }).notNull(),
    loopCode: varchar("loop_code", { length: 50 }).notNull(),
    tradeRoute: varchar("trade_route", { length: 255 }).notNull(),
    direction: varchar("direction", { length: 30 }).notNull(),
    portRotation: jsonb("port_rotation").notNull(), // Array of port objects
    totalPorts: integer("total_ports").notNull(),
    roundTripDays: integer("round_trip_days"),
    frequency: varchar("frequency", { length: 30 }).notNull(),
    vesselCount: integer("vessel_count"),
    vesselNames: jsonb("vessel_names"), // Array of vessel name strings
    deployedCapacityTeu: integer("deployed_capacity_teu"),
    transitTimeDays: jsonb("transit_time_days"), // Port-to-port transit times
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    alliancePartner: varchar("alliance_partner", { length: 255 }),
    operatingCarrier: varchar("operating_carrier", { length: 255 }),
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
      .defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    index("ltr_service_loops_tenant_idx").on(t.tenantId),
    uniqueIndex("ltr_service_loops_ref_tenant_idx").on(t.tenantId, t.loopRef),
    index("ltr_service_loops_status_idx").on(t.tenantId, t.status),
    index("ltr_service_loops_trade_route_idx").on(t.tenantId, t.tradeRoute),
    index("ltr_service_loops_loop_code_idx").on(t.tenantId, t.loopCode),
    index("ltr_service_loops_created_idx").on(t.createdAt),
    index("ltr_service_loops_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-021-1-002: Port Pair Trade Lane Analysis
// ==========================================

export const ltrPortPairTradeLanes = pgTable(
  "ltr_port_pair_trade_lanes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    tradeLaneRef: varchar("trade_lane_ref", { length: 50 }).notNull(),
    originPort: varchar("origin_port", { length: 255 }).notNull(),
    originCountry: varchar("origin_country", { length: 100 }).notNull(),
    originRegion: varchar("origin_region", { length: 100 }),
    destinationPort: varchar("destination_port", { length: 255 }).notNull(),
    destinationCountry: varchar("destination_country", { length: 100 }).notNull(),
    destinationRegion: varchar("destination_region", { length: 100 }),
    tradeDirection: varchar("trade_direction", { length: 30 }).notNull(),
    distanceNm: integer("distance_nm"),
    averageTransitDays: integer("average_transit_days"),
    serviceLoopIds: jsonb("service_loop_ids"), // Array of service loop UUIDs
    competitorCount: integer("competitor_count"),
    competitorDetails: jsonb("competitor_details"), // Array of competitor objects
    volumeHistoryTeu: jsonb("volume_history_teu"), // Monthly volume data
    marketSharePercent: numeric("market_share_percent", { precision: 5, scale: 2 }),
    avgFreightRate: numeric("avg_freight_rate", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    seasonalityFactors: jsonb("seasonality_factors"),
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
      .defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    index("ltr_port_pair_tl_tenant_idx").on(t.tenantId),
    uniqueIndex("ltr_port_pair_tl_ref_tenant_idx").on(t.tenantId, t.tradeLaneRef),
    index("ltr_port_pair_tl_origin_idx").on(t.tenantId, t.originPort),
    index("ltr_port_pair_tl_dest_idx").on(t.tenantId, t.destinationPort),
    index("ltr_port_pair_tl_direction_idx").on(t.tenantId, t.tradeDirection),
    index("ltr_port_pair_tl_status_idx").on(t.tenantId, t.status),
    index("ltr_port_pair_tl_created_idx").on(t.createdAt),
    index("ltr_port_pair_tl_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-021-1-003: Trade Lane P&L Performance
// ==========================================

export const ltrTradeLanePnl = pgTable(
  "ltr_trade_lane_pnl",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    pnlRef: varchar("pnl_ref", { length: 50 }).notNull(),
    tradeLaneId: uuid("trade_lane_id"),
    tradeLaneName: varchar("trade_lane_name", { length: 255 }).notNull(),
    serviceLoopName: varchar("service_loop_name", { length: 255 }),
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
    periodType: varchar("period_type", { length: 20 }).notNull(),
    volumeTeu: integer("volume_teu"),
    revenue: numeric("revenue", { precision: 15, scale: 2 }),
    bunkerCost: numeric("bunker_cost", { precision: 15, scale: 2 }),
    portCost: numeric("port_cost", { precision: 15, scale: 2 }),
    canalCost: numeric("canal_cost", { precision: 15, scale: 2 }),
    equipmentCost: numeric("equipment_cost", { precision: 15, scale: 2 }),
    overheadCost: numeric("overhead_cost", { precision: 15, scale: 2 }),
    totalCost: numeric("total_cost", { precision: 15, scale: 2 }),
    grossProfit: numeric("gross_profit", { precision: 15, scale: 2 }),
    grossMarginPercent: numeric("gross_margin_percent", { precision: 5, scale: 2 }),
    contributionMargin: numeric("contribution_margin", { precision: 15, scale: 2 }),
    revenuePerTeu: numeric("revenue_per_teu", { precision: 10, scale: 2 }),
    costPerTeu: numeric("cost_per_teu", { precision: 10, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    costBreakdown: jsonb("cost_breakdown"),
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
      .defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    index("ltr_trade_lane_pnl_tenant_idx").on(t.tenantId),
    uniqueIndex("ltr_trade_lane_pnl_ref_tenant_idx").on(t.tenantId, t.pnlRef),
    index("ltr_trade_lane_pnl_tl_idx").on(t.tenantId, t.tradeLaneId),
    index("ltr_trade_lane_pnl_period_idx").on(t.tenantId, t.periodStart),
    index("ltr_trade_lane_pnl_status_idx").on(t.tenantId, t.status),
    index("ltr_trade_lane_pnl_created_idx").on(t.createdAt),
    index("ltr_trade_lane_pnl_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-021-1-004: Slot Agreement VSA Management
// ==========================================

export const ltrSlotAgreements = pgTable(
  "ltr_slot_agreements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    agreementRef: varchar("agreement_ref", { length: 50 }).notNull(),
    agreementType: varchar("agreement_type", { length: 30 }).notNull(),
    partnerName: varchar("partner_name", { length: 255 }).notNull(),
    partnerCode: varchar("partner_code", { length: 50 }),
    serviceLoopName: varchar("service_loop_name", { length: 255 }),
    tradeRoute: varchar("trade_route", { length: 255 }),
    slotAllocationTeu: integer("slot_allocation_teu"),
    slotUtilizationPercent: numeric("slot_utilization_percent", { precision: 5, scale: 2 }),
    revenueSharePercent: numeric("revenue_share_percent", { precision: 5, scale: 2 }),
    costSharePercent: numeric("cost_share_percent", { precision: 5, scale: 2 }),
    minimumQuantityCommitment: integer("minimum_quantity_commitment"),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    contractTerms: jsonb("contract_terms"),
    penaltyClause: text("penalty_clause"),
    settlementFrequency: varchar("settlement_frequency", { length: 30 }),
    lastSettlementDate: timestamp("last_settlement_date", { withTimezone: true }),
    currency: varchar("currency", { length: 3 }).default("USD"),
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
      .defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    index("ltr_slot_agreements_tenant_idx").on(t.tenantId),
    uniqueIndex("ltr_slot_agreements_ref_tenant_idx").on(t.tenantId, t.agreementRef),
    index("ltr_slot_agreements_partner_idx").on(t.tenantId, t.partnerName),
    index("ltr_slot_agreements_type_idx").on(t.tenantId, t.agreementType),
    index("ltr_slot_agreements_status_idx").on(t.tenantId, t.status),
    index("ltr_slot_agreements_effective_idx").on(t.tenantId, t.effectiveFrom),
    index("ltr_slot_agreements_created_idx").on(t.createdAt),
    index("ltr_slot_agreements_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-021-2-001: Alliance Management & Coordination
// ==========================================

export const ltrAllianceAgreements = pgTable(
  "ltr_alliance_agreements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    allianceRef: varchar("alliance_ref", { length: 50 }).notNull(),
    allianceName: varchar("alliance_name", { length: 255 }).notNull(),
    allianceType: varchar("alliance_type", { length: 30 }).notNull(),
    memberCarriers: jsonb("member_carriers").notNull(), // Array of carrier objects
    memberCount: integer("member_count").notNull(),
    coveredTradeRoutes: jsonb("covered_trade_routes"), // Array of trade route strings
    totalDeployedTeu: integer("total_deployed_teu"),
    vesselSharingArrangement: text("vessel_sharing_arrangement"),
    slotExchangeTerms: jsonb("slot_exchange_terms"),
    jointServiceCount: integer("joint_service_count"),
    governanceStructure: text("governance_structure"),
    meetingSchedule: varchar("meeting_schedule", { length: 100 }),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    regulatoryApproval: boolean("regulatory_approval").default(false),
    regulatoryDetails: jsonb("regulatory_details"),
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
      .defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    index("ltr_alliance_agmt_tenant_idx").on(t.tenantId),
    uniqueIndex("ltr_alliance_agmt_ref_tenant_idx").on(t.tenantId, t.allianceRef),
    index("ltr_alliance_agmt_name_idx").on(t.tenantId, t.allianceName),
    index("ltr_alliance_agmt_type_idx").on(t.tenantId, t.allianceType),
    index("ltr_alliance_agmt_status_idx").on(t.tenantId, t.status),
    index("ltr_alliance_agmt_created_idx").on(t.createdAt),
    index("ltr_alliance_agmt_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-021-2-002: Port Stay & Productivity Analysis
// ==========================================

export const ltrPortStayAnalyses = pgTable(
  "ltr_port_stay_analyses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    analysisRef: varchar("analysis_ref", { length: 50 }).notNull(),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    vesselId: uuid("vessel_id"),
    portName: varchar("port_name", { length: 255 }).notNull(),
    portCountry: varchar("port_country", { length: 100 }).notNull(),
    terminalName: varchar("terminal_name", { length: 255 }),
    arrivalDate: timestamp("arrival_date", { withTimezone: true }).notNull(),
    departureDate: timestamp("departure_date", { withTimezone: true }),
    totalPortStayHours: numeric("total_port_stay_hours", { precision: 8, scale: 2 }),
    waitingTimeHours: numeric("waiting_time_hours", { precision: 8, scale: 2 }),
    berthingTimeHours: numeric("berthing_time_hours", { precision: 8, scale: 2 }),
    cargoOpsHours: numeric("cargo_ops_hours", { precision: 8, scale: 2 }),
    containersMoved: integer("containers_moved"),
    movesPerHour: numeric("moves_per_hour", { precision: 6, scale: 2 }),
    craneSplit: jsonb("crane_split"), // Crane allocation details
    delayReasons: jsonb("delay_reasons"), // Array of delay objects
    totalDelayHours: numeric("total_delay_hours", { precision: 8, scale: 2 }),
    bunkerConsumed: numeric("bunker_consumed", { precision: 10, scale: 2 }),
    portCostEstimate: numeric("port_cost_estimate", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    productivityScore: numeric("productivity_score", { precision: 5, scale: 2 }),
    benchmarkScore: numeric("benchmark_score", { precision: 5, scale: 2 }),
    status: varchar("status", { length: 20 }).notNull().default("recorded"),
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
      .defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    index("ltr_port_stay_tenant_idx").on(t.tenantId),
    uniqueIndex("ltr_port_stay_ref_tenant_idx").on(t.tenantId, t.analysisRef),
    index("ltr_port_stay_vessel_idx").on(t.tenantId, t.vesselName),
    index("ltr_port_stay_port_idx").on(t.tenantId, t.portName),
    index("ltr_port_stay_arrival_idx").on(t.tenantId, t.arrivalDate),
    index("ltr_port_stay_status_idx").on(t.tenantId, t.status),
    index("ltr_port_stay_created_idx").on(t.createdAt),
    index("ltr_port_stay_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-021-2-003: AI Route Optimization Engine
// ==========================================

export const ltrRouteOptimizations = pgTable(
  "ltr_route_optimizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    optimizationRef: varchar("optimization_ref", { length: 50 }).notNull(),
    serviceLoopName: varchar("service_loop_name", { length: 255 }),
    tradeRoute: varchar("trade_route", { length: 255 }).notNull(),
    optimizationType: varchar("optimization_type", { length: 30 }).notNull(),
    currentRoute: jsonb("current_route").notNull(), // Current port rotation
    proposedRoute: jsonb("proposed_route"), // AI-suggested port rotation
    objectiveFunction: varchar("objective_function", { length: 50 }).notNull(),
    constraints: jsonb("constraints"), // Optimization constraints
    inputParameters: jsonb("input_parameters"), // Model input data
    modelVersion: varchar("model_version", { length: 50 }),
    estimatedSavings: numeric("estimated_savings", { precision: 15, scale: 2 }),
    savingsBreakdown: jsonb("savings_breakdown"), // By category
    transitTimeImpact: integer("transit_time_impact"), // Days change
    capacityImpact: integer("capacity_impact"), // TEU change
    emissionsImpact: numeric("emissions_impact", { precision: 10, scale: 2 }),
    confidenceScore: numeric("confidence_score", { precision: 5, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    approvedByName: varchar("approved_by_name", { length: 255 }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    implementedAt: timestamp("implemented_at", { withTimezone: true }),
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
      .defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    index("ltr_route_opt_tenant_idx").on(t.tenantId),
    uniqueIndex("ltr_route_opt_ref_tenant_idx").on(t.tenantId, t.optimizationRef),
    index("ltr_route_opt_trade_idx").on(t.tenantId, t.tradeRoute),
    index("ltr_route_opt_type_idx").on(t.tenantId, t.optimizationType),
    index("ltr_route_opt_status_idx").on(t.tenantId, t.status),
    index("ltr_route_opt_created_idx").on(t.createdAt),
    index("ltr_route_opt_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-021-2-004: Market Intelligence & Rate Index Integration
// ==========================================

export const ltrMarketIntelligence = pgTable(
  "ltr_market_intelligence",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    intelligenceRef: varchar("intelligence_ref", { length: 50 }).notNull(),
    tradeRoute: varchar("trade_route", { length: 255 }).notNull(),
    originPort: varchar("origin_port", { length: 255 }),
    destinationPort: varchar("destination_port", { length: 255 }),
    dataSource: varchar("data_source", { length: 100 }).notNull(),
    indexType: varchar("index_type", { length: 50 }).notNull(),
    indexValue: numeric("index_value", { precision: 12, scale: 2 }),
    indexDate: timestamp("index_date", { withTimezone: true }).notNull(),
    spotRate: numeric("spot_rate", { precision: 12, scale: 2 }),
    contractRate: numeric("contract_rate", { precision: 12, scale: 2 }),
    rateUnit: varchar("rate_unit", { length: 20 }).default("per_teu"),
    currency: varchar("currency", { length: 3 }).default("USD"),
    capacityUtilization: numeric("capacity_utilization", { precision: 5, scale: 2 }),
    demandForecast: jsonb("demand_forecast"), // Forecast data
    supplyForecast: jsonb("supply_forecast"), // Supply data
    competitorActivity: jsonb("competitor_activity"), // Competitor updates
    marketTrend: varchar("market_trend", { length: 20 }),
    sentimentScore: numeric("sentiment_score", { precision: 5, scale: 2 }),
    aiInsights: text("ai_insights"),
    alerts: jsonb("alerts"),
    status: varchar("status", { length: 20 }).notNull().default("current"),
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
      .defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    index("ltr_market_intel_tenant_idx").on(t.tenantId),
    uniqueIndex("ltr_market_intel_ref_tenant_idx").on(t.tenantId, t.intelligenceRef),
    index("ltr_market_intel_route_idx").on(t.tenantId, t.tradeRoute),
    index("ltr_market_intel_source_idx").on(t.tenantId, t.dataSource),
    index("ltr_market_intel_index_type_idx").on(t.tenantId, t.indexType),
    index("ltr_market_intel_date_idx").on(t.tenantId, t.indexDate),
    index("ltr_market_intel_status_idx").on(t.tenantId, t.status),
    index("ltr_market_intel_created_idx").on(t.createdAt),
    index("ltr_market_intel_deleted_idx").on(t.deletedAt),
  ]
);
