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
// FEAT-012-1-001: Charter Party Management
// ==========================================

export const cvmCharterParties = pgTable(
  "cvm_charter_parties",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    cpReference: varchar("cp_reference", { length: 50 }).notNull(),
    charterType: varchar("charter_type", { length: 30 })
      .notNull()
      .default("time_charter"),
    vesselName: varchar("vessel_name", { length: 255 }),
    vesselImo: varchar("vessel_imo", { length: 10 }),
    chartererName: varchar("charterer_name", { length: 255 }).notNull(),
    ownerName: varchar("owner_name", { length: 255 }),
    brokerName: varchar("broker_name", { length: 255 }),
    hireRate: integer("hire_rate"),
    hireCurrency: varchar("hire_currency", { length: 3 }).notNull().default("USD"),
    hirePeriodUnit: varchar("hire_period_unit", { length: 10 }).notNull().default("day"),
    deliveryPort: varchar("delivery_port", { length: 255 }),
    redeliveryPort: varchar("redelivery_port", { length: 255 }),
    laycanFrom: timestamp("laycan_from", { withTimezone: true }),
    laycanTo: timestamp("laycan_to", { withTimezone: true }),
    commencedAt: timestamp("commenced_at", { withTimezone: true }),
    terminatedAt: timestamp("terminated_at", { withTimezone: true }),
    durationDays: integer("duration_days"),
    commissionPercent: numeric("commission_percent", { precision: 5, scale: 2 }),
    cpTerms: text("cp_terms"),
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
    index("cvm_charter_parties_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cvm_charter_parties_tenant_ref_idx").on(table.tenantId, table.cpReference),
    index("cvm_charter_parties_type_idx").on(table.charterType),
    index("cvm_charter_parties_status_idx").on(table.status),
    index("cvm_charter_parties_charterer_idx").on(table.chartererName),
  ]
);

// ==========================================
// FEAT-012-1-002: Voyage Estimation & Proforma
// ==========================================

export const cvmVoyageEstimates = pgTable(
  "cvm_voyage_estimates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    charterPartyId: uuid("charter_party_id")
      .references(() => cvmCharterParties.id),
    voyageNumber: varchar("voyage_number", { length: 30 }).notNull(),
    vesselName: varchar("vessel_name", { length: 255 }),
    originPort: varchar("origin_port", { length: 255 }),
    destinationPort: varchar("destination_port", { length: 255 }),
    cargoType: varchar("cargo_type", { length: 100 }),
    cargoQuantity: integer("cargo_quantity"),
    cargoUnit: varchar("cargo_unit", { length: 20 }).default("MT"),
    estimatedRevenue: integer("estimated_revenue"),
    bunkerCost: integer("bunker_cost"),
    portCost: integer("port_cost"),
    canalCost: integer("canal_cost"),
    otherCosts: integer("other_costs"),
    totalCost: integer("total_cost"),
    netResult: integer("net_result"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    voyageDays: integer("voyage_days"),
    seaDays: integer("sea_days"),
    portDays: integer("port_days"),
    distanceNm: numeric("distance_nm", { precision: 10, scale: 1 }),
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
    index("cvm_voyage_estimates_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cvm_voyage_estimates_tenant_voyage_idx").on(table.tenantId, table.voyageNumber),
    index("cvm_voyage_estimates_cp_id_idx").on(table.charterPartyId),
    index("cvm_voyage_estimates_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-012-1-003: Hire Statement Calculation
// ==========================================

export const cvmHireStatements = pgTable(
  "cvm_hire_statements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    charterPartyId: uuid("charter_party_id")
      .notNull()
      .references(() => cvmCharterParties.id),
    statementNumber: varchar("statement_number", { length: 30 }).notNull(),
    periodFrom: timestamp("period_from", { withTimezone: true }).notNull(),
    periodTo: timestamp("period_to", { withTimezone: true }).notNull(),
    hireDays: numeric("hire_days", { precision: 8, scale: 4 }).notNull(),
    hireRate: integer("hire_rate").notNull(),
    grossHire: integer("gross_hire").notNull(),
    offHireDeductions: integer("off_hire_deductions").default(0),
    bunkerAdjustments: integer("bunker_adjustments").default(0),
    otherDeductions: integer("other_deductions").default(0),
    netHire: integer("net_hire").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
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
    index("cvm_hire_statements_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cvm_hire_statements_tenant_num_idx").on(table.tenantId, table.statementNumber),
    index("cvm_hire_statements_cp_id_idx").on(table.charterPartyId),
    index("cvm_hire_statements_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-012-1-004: Laytime & Despatch/Demurrage
// ==========================================

export const cvmLaytimeCalculations = pgTable(
  "cvm_laytime_calculations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    charterPartyId: uuid("charter_party_id")
      .references(() => cvmCharterParties.id),
    voyageEstimateId: uuid("voyage_estimate_id")
      .references(() => cvmVoyageEstimates.id),
    portName: varchar("port_name", { length: 255 }).notNull(),
    operationType: varchar("operation_type", { length: 20 }).notNull().default("loading"),
    allowedHours: numeric("allowed_hours", { precision: 10, scale: 2 }).notNull(),
    usedHours: numeric("used_hours", { precision: 10, scale: 2 }).notNull(),
    excessHours: numeric("excess_hours", { precision: 10, scale: 2 }),
    demurrageRate: integer("demurrage_rate"),
    despatchRate: integer("despatch_rate"),
    demurrageAmount: integer("demurrage_amount"),
    despatchAmount: integer("despatch_amount"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    commencedAt: timestamp("commenced_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("calculating"),
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
    index("cvm_laytime_calculations_tenant_id_idx").on(table.tenantId),
    index("cvm_laytime_calculations_cp_id_idx").on(table.charterPartyId),
    index("cvm_laytime_calculations_voyage_id_idx").on(table.voyageEstimateId),
    index("cvm_laytime_calculations_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-012-2-001: Vessel Performance Monitoring
// ==========================================

export const cvmVesselPerformances = pgTable(
  "cvm_vessel_performances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    voyageEstimateId: uuid("voyage_estimate_id")
      .references(() => cvmVoyageEstimates.id),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    reportDate: timestamp("report_date", { withTimezone: true }).notNull(),
    reportType: varchar("report_type", { length: 20 }).notNull().default("noon"),
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),
    speedKnots: numeric("speed_knots", { precision: 6, scale: 2 }),
    consumptionMt: numeric("consumption_mt", { precision: 8, scale: 2 }),
    fuelType: varchar("fuel_type", { length: 30 }),
    windForce: integer("wind_force"),
    seaState: integer("sea_state"),
    weatherConditions: varchar("weather_conditions", { length: 100 }),
    distanceNm: numeric("distance_nm", { precision: 10, scale: 1 }),
    slipPercent: numeric("slip_percent", { precision: 5, scale: 2 }),
    remarks: text("remarks"),
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
    index("cvm_vessel_performances_tenant_id_idx").on(table.tenantId),
    index("cvm_vessel_performances_voyage_id_idx").on(table.voyageEstimateId),
    index("cvm_vessel_performances_report_date_idx").on(table.reportDate),
    index("cvm_vessel_performances_report_type_idx").on(table.reportType),
  ]
);

// ==========================================
// FEAT-012-2-002: Off-Hire Management & Claims
// ==========================================

export const cvmOffHireEvents = pgTable(
  "cvm_off_hire_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    charterPartyId: uuid("charter_party_id")
      .notNull()
      .references(() => cvmCharterParties.id),
    vesselName: varchar("vessel_name", { length: 255 }),
    eventType: varchar("event_type", { length: 30 })
      .notNull()
      .default("breakdown"),
    reason: text("reason").notNull(),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }),
    offHireDays: numeric("off_hire_days", { precision: 8, scale: 4 }),
    hireRate: integer("hire_rate"),
    offHireAmount: integer("off_hire_amount"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    claimStatus: varchar("claim_status", { length: 20 }).notNull().default("pending"),
    claimReference: varchar("claim_reference", { length: 50 }),
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
    index("cvm_off_hire_events_tenant_id_idx").on(table.tenantId),
    index("cvm_off_hire_events_cp_id_idx").on(table.charterPartyId),
    index("cvm_off_hire_events_claim_status_idx").on(table.claimStatus),
    index("cvm_off_hire_events_event_type_idx").on(table.eventType),
  ]
);

// ==========================================
// FEAT-012-2-003: TDR Preparation & Distribution
// ==========================================

export const cvmDeliveryReports = pgTable(
  "cvm_delivery_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    charterPartyId: uuid("charter_party_id")
      .notNull()
      .references(() => cvmCharterParties.id),
    vesselName: varchar("vessel_name", { length: 255 }),
    reportType: varchar("report_type", { length: 20 }).notNull().default("delivery"),
    portName: varchar("port_name", { length: 255 }),
    reportDate: timestamp("report_date", { withTimezone: true }).notNull(),
    bunkerRob: jsonb("bunker_rob"),
    vesselCondition: text("vessel_condition"),
    surveyReference: varchar("survey_reference", { length: 100 }),
    remarks: text("remarks"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
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
    index("cvm_delivery_reports_tenant_id_idx").on(table.tenantId),
    index("cvm_delivery_reports_cp_id_idx").on(table.charterPartyId),
    index("cvm_delivery_reports_type_idx").on(table.reportType),
    index("cvm_delivery_reports_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-012-2-004: Voyage Profit & Loss
// ==========================================

export const cvmVoyagePnl = pgTable(
  "cvm_voyage_pnl",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    voyageEstimateId: uuid("voyage_estimate_id")
      .references(() => cvmVoyageEstimates.id),
    voyageNumber: varchar("voyage_number", { length: 30 }).notNull(),
    vesselName: varchar("vessel_name", { length: 255 }),
    revenue: integer("revenue").notNull().default(0),
    hireCost: integer("hire_cost").default(0),
    bunkerCost: integer("bunker_cost").default(0),
    portCost: integer("port_cost").default(0),
    canalCost: integer("canal_cost").default(0),
    agencyCost: integer("agency_cost").default(0),
    insuranceCost: integer("insurance_cost").default(0),
    otherCosts: integer("other_costs").default(0),
    totalCosts: integer("total_costs").default(0),
    netResult: integer("net_result").default(0),
    tceRate: integer("tce_rate"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    periodFrom: timestamp("period_from", { withTimezone: true }),
    periodTo: timestamp("period_to", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("provisional"),
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
    index("cvm_voyage_pnl_tenant_id_idx").on(table.tenantId),
    index("cvm_voyage_pnl_voyage_est_id_idx").on(table.voyageEstimateId),
    uniqueIndex("cvm_voyage_pnl_tenant_voyage_idx").on(table.tenantId, table.voyageNumber),
    index("cvm_voyage_pnl_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-012-3-001: COA Contract Management
// ==========================================

export const cvmCoaContracts = pgTable(
  "cvm_coa_contracts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    contractReference: varchar("contract_reference", { length: 50 }).notNull(),
    chartererName: varchar("charterer_name", { length: 255 }).notNull(),
    cargoType: varchar("cargo_type", { length: 100 }).notNull(),
    cargoDescription: text("cargo_description"),
    quantityMin: integer("quantity_min"),
    quantityMax: integer("quantity_max"),
    quantityUnit: varchar("quantity_unit", { length: 10 }).notNull().default("MT"),
    liftingsPerPeriod: integer("liftings_per_period"),
    periodFrom: timestamp("period_from", { withTimezone: true }).notNull(),
    periodTo: timestamp("period_to", { withTimezone: true }).notNull(),
    rate: integer("rate").notNull(),
    rateBasis: varchar("rate_basis", { length: 20 }).notNull().default("per_mt"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    originPort: varchar("origin_port", { length: 255 }),
    destinationPort: varchar("destination_port", { length: 255 }),
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
    index("cvm_coa_contracts_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cvm_coa_contracts_tenant_ref_idx").on(table.tenantId, table.contractReference),
    index("cvm_coa_contracts_charterer_idx").on(table.chartererName),
    index("cvm_coa_contracts_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-012-3-002: TC-In & TC-Out Management
// ==========================================

export const cvmTcContracts = pgTable(
  "cvm_tc_contracts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    direction: varchar("direction", { length: 10 }).notNull(),
    contractReference: varchar("contract_reference", { length: 50 }).notNull(),
    vesselName: varchar("vessel_name", { length: 255 }),
    counterpartyName: varchar("counterparty_name", { length: 255 }).notNull(),
    brokerName: varchar("broker_name", { length: 255 }),
    hireRate: integer("hire_rate").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    hirePeriodUnit: varchar("hire_period_unit", { length: 10 }).notNull().default("day"),
    deliveryPort: varchar("delivery_port", { length: 255 }),
    redeliveryPort: varchar("redelivery_port", { length: 255 }),
    deliveryDate: timestamp("delivery_date", { withTimezone: true }),
    redeliveryDate: timestamp("redelivery_date", { withTimezone: true }),
    minDuration: integer("min_duration"),
    maxDuration: integer("max_duration"),
    durationUnit: varchar("duration_unit", { length: 10 }).default("days"),
    commissionPercent: numeric("commission_percent", { precision: 5, scale: 2 }),
    status: varchar("status", { length: 20 }).notNull().default("negotiating"),
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
    index("cvm_tc_contracts_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cvm_tc_contracts_tenant_ref_idx").on(table.tenantId, table.contractReference),
    index("cvm_tc_contracts_direction_idx").on(table.direction),
    index("cvm_tc_contracts_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-012-3-003: Vessel Fixture & Negotiation
// ==========================================

export const cvmFixtures = pgTable(
  "cvm_fixtures",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    fixtureReference: varchar("fixture_reference", { length: 50 }).notNull(),
    vesselName: varchar("vessel_name", { length: 255 }),
    fixtureType: varchar("fixture_type", { length: 30 }).notNull().default("voyage"),
    counterpartyName: varchar("counterparty_name", { length: 255 }).notNull(),
    brokerName: varchar("broker_name", { length: 255 }),
    cargoType: varchar("cargo_type", { length: 100 }),
    cargoQuantity: integer("cargo_quantity"),
    laycanFrom: timestamp("laycan_from", { withTimezone: true }),
    laycanTo: timestamp("laycan_to", { withTimezone: true }),
    originPort: varchar("origin_port", { length: 255 }),
    destinationPort: varchar("destination_port", { length: 255 }),
    freightRate: integer("freight_rate"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    commissionPercent: numeric("commission_percent", { precision: 5, scale: 2 }),
    status: varchar("status", { length: 20 }).notNull().default("open"),
    subjectDetails: text("subject_details"),
    terms: text("terms"),
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
    index("cvm_fixtures_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cvm_fixtures_tenant_ref_idx").on(table.tenantId, table.fixtureReference),
    index("cvm_fixtures_type_idx").on(table.fixtureType),
    index("cvm_fixtures_status_idx").on(table.status),
    index("cvm_fixtures_counterparty_idx").on(table.counterpartyName),
  ]
);

// ==========================================
// FEAT-012-3-004: AI Vessel Utilization Optimizer
// ==========================================

export const cvmUtilizationAnalyses = pgTable(
  "cvm_utilization_analyses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    analysisDate: timestamp("analysis_date", { withTimezone: true }).notNull(),
    periodFrom: timestamp("period_from", { withTimezone: true }),
    periodTo: timestamp("period_to", { withTimezone: true }),
    currentUtilizationPercent: numeric("current_utilization_percent", { precision: 5, scale: 2 }),
    projectedUtilizationPercent: numeric("projected_utilization_percent", { precision: 5, scale: 2 }),
    recommendedAction: text("recommended_action"),
    recommendedRoute: varchar("recommended_route", { length: 255 }),
    projectedRevenueImpact: integer("projected_revenue_impact"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    aiModel: varchar("ai_model", { length: 100 }),
    parameters: jsonb("parameters"),
    results: jsonb("results"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
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
    index("cvm_utilization_analyses_tenant_id_idx").on(table.tenantId),
    index("cvm_utilization_analyses_vessel_idx").on(table.vesselName),
    index("cvm_utilization_analyses_date_idx").on(table.analysisDate),
    index("cvm_utilization_analyses_status_idx").on(table.status),
  ]
);
