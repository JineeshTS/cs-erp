import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// Carbon Footprint Calculation per Voyage
// ==========================================
export const serCarbonFootprints = pgTable("ser_carbon_footprints", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  footprintRef: varchar("footprint_ref", { length: 100 }).notNull(),
  footprintType: varchar("footprint_type", { length: 50 }).notNull(), // voyage_emission, port_emission, well_to_wake, tank_to_wake, cargo_emission
  voyageRef: varchar("voyage_ref", { length: 100 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  vesselImo: varchar("vessel_imo", { length: 20 }),
  routeDescription: text("route_description"),
  distanceNm: decimal("distance_nm", { precision: 10, scale: 2 }),
  fuelConsumedMt: decimal("fuel_consumed_mt", { precision: 10, scale: 3 }),
  fuelType: varchar("fuel_type", { length: 50 }),
  co2EmissionsMt: decimal("co2_emissions_mt", { precision: 12, scale: 4 }),
  ch4EmissionsMt: decimal("ch4_emissions_mt", { precision: 12, scale: 6 }),
  n2oEmissionsMt: decimal("n2o_emissions_mt", { precision: 12, scale: 6 }),
  co2eEmissionsMt: decimal("co2e_emissions_mt", { precision: 12, scale: 4 }),
  emissionIntensity: decimal("emission_intensity", { precision: 10, scale: 4 }),
  cargoCarriedMt: decimal("cargo_carried_mt", { precision: 12, scale: 2 }),
  calculationMethod: varchar("calculation_method", { length: 50 }),
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
// GHG Protocol Scope 1 2 3 Reporting
// ==========================================
export const serGhgReports = pgTable("ser_ghg_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  reportRef: varchar("report_ref", { length: 100 }).notNull(),
  reportType: varchar("report_type", { length: 50 }).notNull(), // scope1_direct, scope2_indirect, scope3_value_chain, combined_report, verification_statement
  reportingPeriod: varchar("reporting_period", { length: 20 }),
  reportingYear: integer("reporting_year"),
  scope1EmissionsMt: decimal("scope1_emissions_mt", { precision: 14, scale: 4 }),
  scope2EmissionsMt: decimal("scope2_emissions_mt", { precision: 14, scale: 4 }),
  scope3EmissionsMt: decimal("scope3_emissions_mt", { precision: 14, scale: 4 }),
  totalEmissionsMt: decimal("total_emissions_mt", { precision: 14, scale: 4 }),
  baselineYear: integer("baseline_year"),
  baselineEmissions: decimal("baseline_emissions", { precision: 14, scale: 4 }),
  reductionPct: decimal("reduction_pct", { precision: 8, scale: 4 }),
  verificationBody: varchar("verification_body", { length: 255 }),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
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
// Sea Cargo Charter Annual Reporting
// ==========================================
export const serSeaCargoCharters = pgTable("ser_sea_cargo_charters", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  charterRef: varchar("charter_ref", { length: 100 }).notNull(),
  charterType: varchar("charter_type", { length: 50 }).notNull(), // annual_disclosure, voyage_alignment, trajectory_assessment, portfolio_report, benchmark_comparison
  reportingYear: integer("reporting_year"),
  totalVoyages: integer("total_voyages"),
  alignedVoyages: integer("aligned_voyages"),
  alignmentScore: decimal("alignment_score", { precision: 8, scale: 4 }),
  climateTarget: varchar("climate_target", { length: 100 }),
  trajectoryYear: integer("trajectory_year"),
  requiredIntensity: decimal("required_intensity", { precision: 10, scale: 4 }),
  actualIntensity: decimal("actual_intensity", { precision: 10, scale: 4 }),
  gapToTarget: decimal("gap_to_target", { precision: 10, scale: 4 }),
  disclosureLevel: varchar("disclosure_level", { length: 50 }),
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
// POSEIDON Principles Alignment
// ==========================================
export const serPoseidonAlignments = pgTable("ser_poseidon_alignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  alignmentRef: varchar("alignment_ref", { length: 100 }).notNull(),
  alignmentType: varchar("alignment_type", { length: 50 }).notNull(), // annual_assessment, vessel_scoring, portfolio_alignment, decarbonization_trajectory, reporting_disclosure
  reportingYear: integer("reporting_year"),
  vesselName: varchar("vessel_name", { length: 255 }),
  vesselImo: varchar("vessel_imo", { length: 20 }),
  vesselType: varchar("vessel_type", { length: 50 }),
  aeoi: decimal("aeoi", { precision: 10, scale: 4 }),
  requiredAeoi: decimal("required_aeoi", { precision: 10, scale: 4 }),
  alignmentDelta: decimal("alignment_delta", { precision: 10, scale: 4 }),
  climateAligned: boolean("climate_aligned"),
  portfolioScore: decimal("portfolio_score", { precision: 8, scale: 4 }),
  trajectoryTarget: varchar("trajectory_target", { length: 100 }),
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
// Decarbonization Roadmap Tracking
// ==========================================
export const serDecarbRoadmaps = pgTable("ser_decarb_roadmaps", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  roadmapRef: varchar("roadmap_ref", { length: 100 }).notNull(),
  roadmapType: varchar("roadmap_type", { length: 50 }).notNull(), // fleet_transition, fuel_switch, efficiency_improvement, offset_strategy, technology_adoption
  milestoneName: varchar("milestone_name", { length: 255 }),
  targetYear: integer("target_year"),
  targetReductionPct: decimal("target_reduction_pct", { precision: 8, scale: 4 }),
  currentReductionPct: decimal("current_reduction_pct", { precision: 8, scale: 4 }),
  investmentRequired: decimal("investment_required", { precision: 14, scale: 2 }),
  investmentCurrency: varchar("investment_currency", { length: 3 }),
  technologyArea: varchar("technology_area", { length: 100 }),
  implementationStatus: varchar("implementation_status", { length: 50 }),
  riskLevel: varchar("risk_level", { length: 20 }),
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
// Alternative Fuel & Green Fuel Tracking
// ==========================================
export const serAltFuelTrackings = pgTable("ser_alt_fuel_trackings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  trackingRef: varchar("tracking_ref", { length: 100 }).notNull(),
  trackingType: varchar("tracking_type", { length: 50 }).notNull(), // lng_consumption, methanol_trial, ammonia_pilot, hydrogen_test, biofuel_blend
  fuelName: varchar("fuel_name", { length: 100 }),
  fuelCategory: varchar("fuel_category", { length: 50 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  quantityMt: decimal("quantity_mt", { precision: 10, scale: 3 }),
  costPerMt: decimal("cost_per_mt", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 14, scale: 2 }),
  fuelCurrency: varchar("fuel_currency", { length: 3 }),
  co2ReductionPct: decimal("co2_reduction_pct", { precision: 8, scale: 4 }),
  supplierName: varchar("supplier_name", { length: 255 }),
  certificationRef: varchar("certification_ref", { length: 100 }),
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
// ESG KPI Dashboard & Benchmarking
// ==========================================
export const serEsgKpis = pgTable("ser_esg_kpis", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  kpiRef: varchar("kpi_ref", { length: 100 }).notNull(),
  kpiType: varchar("kpi_type", { length: 50 }).notNull(), // environmental_metric, social_metric, governance_metric, combined_score, benchmark_index
  kpiName: varchar("kpi_name", { length: 255 }),
  kpiCategory: varchar("kpi_category", { length: 50 }),
  reportingPeriod: varchar("reporting_period", { length: 20 }),
  targetValue: decimal("target_value", { precision: 14, scale: 4 }),
  actualValue: decimal("actual_value", { precision: 14, scale: 4 }),
  achievementPct: decimal("achievement_pct", { precision: 8, scale: 4 }),
  benchmarkValue: decimal("benchmark_value", { precision: 14, scale: 4 }),
  benchmarkSource: varchar("benchmark_source", { length: 255 }),
  trendDirection: varchar("trend_direction", { length: 20 }),
  rating: varchar("rating", { length: 10 }),
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
// TCFD Sustainability Reporting
// ==========================================
export const serTcfdReports = pgTable("ser_tcfd_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  tcfdRef: varchar("tcfd_ref", { length: 100 }).notNull(),
  tcfdType: varchar("tcfd_type", { length: 50 }).notNull(), // governance_disclosure, strategy_assessment, risk_management, metrics_targets, scenario_analysis
  reportingYear: integer("reporting_year"),
  pillarArea: varchar("pillar_area", { length: 50 }),
  disclosureTitle: varchar("disclosure_title", { length: 255 }),
  scenarioName: varchar("scenario_name", { length: 100 }),
  temperaturePathway: varchar("temperature_pathway", { length: 20 }),
  financialImpact: decimal("financial_impact", { precision: 14, scale: 2 }),
  impactCurrency: varchar("impact_currency", { length: 3 }),
  riskCategory: varchar("risk_category", { length: 50 }),
  opportunityCategory: varchar("opportunity_category", { length: 50 }),
  maturityLevel: varchar("maturity_level", { length: 20 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
