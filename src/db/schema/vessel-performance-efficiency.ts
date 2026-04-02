import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// Speed Consumption & Performance Monitoring
// ==========================================
export const vpeSpeedConsumptions = pgTable("vpe_speed_consumptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  consumptionRef: varchar("consumption_ref", { length: 100 }).notNull(),
  consumptionType: varchar("consumption_type", { length: 50 }).notNull(), // laden, ballast, port, anchored, canal_transit
  vesselId: varchar("vessel_id", { length: 100 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  voyageId: varchar("voyage_id", { length: 100 }),
  reportDate: timestamp("report_date", { withTimezone: true }),
  speedOrdered: decimal("speed_ordered", { precision: 10, scale: 2 }),
  speedActual: decimal("speed_actual", { precision: 10, scale: 2 }),
  speedOverGround: decimal("speed_over_ground", { precision: 10, scale: 2 }),
  fuelConsumedMt: decimal("fuel_consumed_mt", { precision: 12, scale: 3 }),
  fuelType: varchar("fuel_type", { length: 50 }),
  dailyConsumption: decimal("daily_consumption", { precision: 12, scale: 3 }),
  distanceTraveled: decimal("distance_traveled", { precision: 12, scale: 2 }),
  slipPercentage: decimal("slip_percentage", { precision: 8, scale: 2 }),
  windForce: integer("wind_force"),
  seaState: varchar("sea_state", { length: 50 }),
  currentFactor: decimal("current_factor", { precision: 8, scale: 3 }),
  performanceIndex: decimal("performance_index", { precision: 8, scale: 4 }),
  weatherImpact: varchar("weather_impact", { length: 50 }),
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
// CII Carbon Intensity Rating Calculation
// ==========================================
export const vpeCiiRatings = pgTable("vpe_cii_ratings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  ratingRef: varchar("rating_ref", { length: 100 }).notNull(),
  ratingType: varchar("rating_type", { length: 50 }).notNull(), // annual, quarterly, voyage, corrected, required
  vesselId: varchar("vessel_id", { length: 100 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  imoNumber: varchar("imo_number", { length: 20 }),
  reportingYear: integer("reporting_year"),
  attainedCii: decimal("attained_cii", { precision: 12, scale: 6 }),
  requiredCii: decimal("required_cii", { precision: 12, scale: 6 }),
  reductionFactor: decimal("reduction_factor", { precision: 8, scale: 4 }),
  rating: varchar("rating", { length: 1 }), // A, B, C, D, E
  totalCo2Emissions: decimal("total_co2_emissions", { precision: 14, scale: 3 }),
  totalDistanceNm: decimal("total_distance_nm", { precision: 14, scale: 2 }),
  dwt: decimal("dwt", { precision: 12, scale: 2 }),
  correctionFactors: jsonb("correction_factors"),
  complianceStatus: varchar("compliance_status", { length: 50 }),
  correctiveActionPlan: text("corrective_action_plan"),
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
// EEXI Energy Efficiency Compliance
// ==========================================
export const vpeEexiCompliances = pgTable("vpe_eexi_compliances", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  complianceRef: varchar("compliance_ref", { length: 100 }).notNull(),
  complianceType: varchar("compliance_type", { length: 50 }).notNull(), // initial, annual, interim, renewal
  vesselId: varchar("vessel_id", { length: 100 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  imoNumber: varchar("imo_number", { length: 20 }),
  attainedEexi: decimal("attained_eexi", { precision: 12, scale: 6 }),
  requiredEexi: decimal("required_eexi", { precision: 12, scale: 6 }),
  referenceLine: decimal("reference_line", { precision: 12, scale: 6 }),
  reductionPercentage: decimal("reduction_percentage", { precision: 8, scale: 2 }),
  enginePowerLimitation: boolean("engine_power_limitation"),
  eplPercentage: decimal("epl_percentage", { precision: 8, scale: 2 }),
  shaftPowerLimitation: boolean("shaft_power_limitation"),
  energySavingDevices: jsonb("energy_saving_devices"),
  surveyDate: timestamp("survey_date", { withTimezone: true }),
  certificateNumber: varchar("certificate_number", { length: 100 }),
  certificateExpiry: timestamp("certificate_expiry", { withTimezone: true }),
  flagState: varchar("flag_state", { length: 100 }),
  classificationSociety: varchar("classification_society", { length: 255 }),
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
// Noon Report Processing & Analysis
// ==========================================
export const vpeNoonReports = pgTable("vpe_noon_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  reportRef: varchar("report_ref", { length: 100 }).notNull(),
  reportType: varchar("report_type", { length: 50 }).notNull(), // noon, departure, arrival, event, bunker
  vesselId: varchar("vessel_id", { length: 100 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  voyageId: varchar("voyage_id", { length: 100 }),
  reportDatetime: timestamp("report_datetime", { withTimezone: true }),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  courseHeading: decimal("course_heading", { precision: 6, scale: 2 }),
  distanceSinceLastReport: decimal("distance_since_last_report", { precision: 10, scale: 2 }),
  distanceToGo: decimal("distance_to_go", { precision: 10, scale: 2 }),
  avgSpeed: decimal("avg_speed", { precision: 8, scale: 2 }),
  windDirection: varchar("wind_direction", { length: 10 }),
  windForce: integer("wind_force"),
  seaState: varchar("sea_state", { length: 50 }),
  swellHeight: decimal("swell_height", { precision: 6, scale: 2 }),
  robFo: decimal("rob_fo", { precision: 12, scale: 3 }),
  robDo: decimal("rob_do", { precision: 12, scale: 3 }),
  robLo: decimal("rob_lo", { precision: 12, scale: 3 }),
  meConsumption: decimal("me_consumption", { precision: 10, scale: 3 }),
  aeConsumption: decimal("ae_consumption", { precision: 10, scale: 3 }),
  boilerConsumption: decimal("boiler_consumption", { precision: 10, scale: 3 }),
  eta: timestamp("eta", { withTimezone: true }),
  masterRemarks: text("master_remarks"),
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
// Voyage Performance vs Charter Party Analysis
// ==========================================
export const vpeVoyagePerformances = pgTable("vpe_voyage_performances", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  performanceRef: varchar("performance_ref", { length: 100 }).notNull(),
  performanceType: varchar("performance_type", { length: 50 }).notNull(), // cp_compliance, speed_claim, consumption_claim, weather_routing
  vesselId: varchar("vessel_id", { length: 100 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  voyageId: varchar("voyage_id", { length: 100 }),
  charterPartyId: varchar("charter_party_id", { length: 100 }),
  cpSpeed: decimal("cp_speed", { precision: 8, scale: 2 }),
  actualSpeed: decimal("actual_speed", { precision: 8, scale: 2 }),
  speedVariance: decimal("speed_variance", { precision: 8, scale: 2 }),
  cpConsumption: decimal("cp_consumption", { precision: 12, scale: 3 }),
  actualConsumption: decimal("actual_consumption", { precision: 12, scale: 3 }),
  consumptionVariance: decimal("consumption_variance", { precision: 12, scale: 3 }),
  goodWeatherDays: decimal("good_weather_days", { precision: 8, scale: 2 }),
  badWeatherDays: decimal("bad_weather_days", { precision: 8, scale: 2 }),
  claimAmount: decimal("claim_amount", { precision: 14, scale: 2 }),
  claimCurrency: varchar("claim_currency", { length: 3 }),
  claimDirection: varchar("claim_direction", { length: 20 }), // owner_claim, charterer_claim
  analysisReport: jsonb("analysis_report"),
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
// AI Weather Routing Integration
// ==========================================
export const vpeWeatherRoutings = pgTable("vpe_weather_routings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  routingRef: varchar("routing_ref", { length: 100 }).notNull(),
  routingType: varchar("routing_type", { length: 50 }).notNull(), // optimized, standard, shortest, safest, eco
  vesselId: varchar("vessel_id", { length: 100 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  voyageId: varchar("voyage_id", { length: 100 }),
  departurePort: varchar("departure_port", { length: 255 }),
  arrivalPort: varchar("arrival_port", { length: 255 }),
  departureDate: timestamp("departure_date", { withTimezone: true }),
  arrivalDate: timestamp("arrival_date", { withTimezone: true }),
  optimizedEta: timestamp("optimized_eta", { withTimezone: true }),
  routeWaypoints: jsonb("route_waypoints"),
  totalDistanceNm: decimal("total_distance_nm", { precision: 12, scale: 2 }),
  estimatedFuelMt: decimal("estimated_fuel_mt", { precision: 12, scale: 3 }),
  fuelSavingMt: decimal("fuel_saving_mt", { precision: 12, scale: 3 }),
  timeSavingHours: decimal("time_saving_hours", { precision: 10, scale: 2 }),
  weatherForecast: jsonb("weather_forecast"),
  riskAssessment: varchar("risk_assessment", { length: 50 }),
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }),
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
// IMO 2050 Carbon Emissions Tracking
// ==========================================
export const vpeCarbonEmissions = pgTable("vpe_carbon_emissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  emissionRef: varchar("emission_ref", { length: 100 }).notNull(),
  emissionType: varchar("emission_type", { length: 50 }).notNull(), // voyage, annual, fleet, well_to_wake, tank_to_wake
  vesselId: varchar("vessel_id", { length: 100 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  voyageId: varchar("voyage_id", { length: 100 }),
  reportingPeriodStart: timestamp("reporting_period_start", { withTimezone: true }),
  reportingPeriodEnd: timestamp("reporting_period_end", { withTimezone: true }),
  totalCo2Mt: decimal("total_co2_mt", { precision: 14, scale: 3 }),
  totalCh4Mt: decimal("total_ch4_mt", { precision: 14, scale: 6 }),
  totalN2oMt: decimal("total_n2o_mt", { precision: 14, scale: 6 }),
  co2eTotal: decimal("co2e_total", { precision: 14, scale: 3 }),
  fuelConsumedMt: decimal("fuel_consumed_mt", { precision: 14, scale: 3 }),
  emissionFactor: decimal("emission_factor", { precision: 10, scale: 6 }),
  euMrvCompliance: boolean("eu_mrv_compliance"),
  imoDataCollection: boolean("imo_data_collection"),
  euEtsLiability: decimal("eu_ets_liability", { precision: 14, scale: 2 }),
  carbonIntensity: decimal("carbon_intensity", { precision: 12, scale: 6 }),
  reductionTarget: decimal("reduction_target", { precision: 8, scale: 2 }),
  reductionAchieved: decimal("reduction_achieved", { precision: 8, scale: 2 }),
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
// Fuel Efficiency Benchmarking & Reporting
// ==========================================
export const vpeFuelBenchmarks = pgTable("vpe_fuel_benchmarks", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  benchmarkRef: varchar("benchmark_ref", { length: 100 }).notNull(),
  benchmarkType: varchar("benchmark_type", { length: 50 }).notNull(), // vessel, fleet, class, industry, historical
  vesselId: varchar("vessel_id", { length: 100 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  vesselClass: varchar("vessel_class", { length: 100 }),
  periodStart: timestamp("period_start", { withTimezone: true }),
  periodEnd: timestamp("period_end", { withTimezone: true }),
  avgDailyConsumption: decimal("avg_daily_consumption", { precision: 12, scale: 3 }),
  benchmarkConsumption: decimal("benchmark_consumption", { precision: 12, scale: 3 }),
  efficiencyRatio: decimal("efficiency_ratio", { precision: 8, scale: 4 }),
  fuelCostPerNm: decimal("fuel_cost_per_nm", { precision: 10, scale: 4 }),
  co2PerNm: decimal("co2_per_nm", { precision: 10, scale: 6 }),
  fleetRanking: integer("fleet_ranking"),
  totalVesselsInClass: integer("total_vessels_in_class"),
  percentile: decimal("percentile", { precision: 5, scale: 2 }),
  trendDirection: varchar("trend_direction", { length: 20 }),
  recommendations: jsonb("recommendations"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
