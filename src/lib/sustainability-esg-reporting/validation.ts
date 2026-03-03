import { z } from "zod/v4";

// ==========================================
// Carbon Footprint Calculation per Voyage
// ==========================================
export const createCarbonFootprintSchema = z.object({
  footprintType: z.enum(["voyage_emission", "port_emission", "well_to_wake", "tank_to_wake", "cargo_emission"]),
  voyageRef: z.string().max(100).optional(),
  vesselName: z.string().max(255).optional(),
  vesselImo: z.string().max(20).optional(),
  routeDescription: z.string().optional(),
  distanceNm: z.string().optional(),
  fuelConsumedMt: z.string().optional(),
  fuelType: z.string().max(50).optional(),
  co2EmissionsMt: z.string().optional(),
  ch4EmissionsMt: z.string().optional(),
  n2oEmissionsMt: z.string().optional(),
  co2eEmissionsMt: z.string().optional(),
  emissionIntensity: z.string().optional(),
  cargoCarriedMt: z.string().optional(),
  calculationMethod: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateCarbonFootprintSchema = createCarbonFootprintSchema.partial();

// ==========================================
// GHG Protocol Scope 1 2 3 Reporting
// ==========================================
export const createGhgReportSchema = z.object({
  reportType: z.enum(["scope1_direct", "scope2_indirect", "scope3_value_chain", "combined_report", "verification_statement"]),
  reportingPeriod: z.string().max(20).optional(),
  reportingYear: z.number().int().optional(),
  scope1EmissionsMt: z.string().optional(),
  scope2EmissionsMt: z.string().optional(),
  scope3EmissionsMt: z.string().optional(),
  totalEmissionsMt: z.string().optional(),
  baselineYear: z.number().int().optional(),
  baselineEmissions: z.string().optional(),
  reductionPct: z.string().optional(),
  verificationBody: z.string().max(255).optional(),
  verifiedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateGhgReportSchema = createGhgReportSchema.partial();

// ==========================================
// Sea Cargo Charter Annual Reporting
// ==========================================
export const createSeaCargoCharterSchema = z.object({
  charterType: z.enum(["annual_disclosure", "voyage_alignment", "trajectory_assessment", "portfolio_report", "benchmark_comparison"]),
  reportingYear: z.number().int().optional(),
  totalVoyages: z.number().int().optional(),
  alignedVoyages: z.number().int().optional(),
  alignmentScore: z.string().optional(),
  climateTarget: z.string().max(100).optional(),
  trajectoryYear: z.number().int().optional(),
  requiredIntensity: z.string().optional(),
  actualIntensity: z.string().optional(),
  gapToTarget: z.string().optional(),
  disclosureLevel: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateSeaCargoCharterSchema = createSeaCargoCharterSchema.partial();

// ==========================================
// POSEIDON Principles Alignment
// ==========================================
export const createPoseidonAlignmentSchema = z.object({
  alignmentType: z.enum(["annual_assessment", "vessel_scoring", "portfolio_alignment", "decarbonization_trajectory", "reporting_disclosure"]),
  reportingYear: z.number().int().optional(),
  vesselName: z.string().max(255).optional(),
  vesselImo: z.string().max(20).optional(),
  vesselType: z.string().max(50).optional(),
  aeoi: z.string().optional(),
  requiredAeoi: z.string().optional(),
  alignmentDelta: z.string().optional(),
  climateAligned: z.boolean().optional(),
  portfolioScore: z.string().optional(),
  trajectoryTarget: z.string().max(100).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updatePoseidonAlignmentSchema = createPoseidonAlignmentSchema.partial();

// ==========================================
// Decarbonization Roadmap Tracking
// ==========================================
export const createDecarbRoadmapSchema = z.object({
  roadmapType: z.enum(["fleet_transition", "fuel_switch", "efficiency_improvement", "offset_strategy", "technology_adoption"]),
  milestoneName: z.string().max(255).optional(),
  targetYear: z.number().int().optional(),
  targetReductionPct: z.string().optional(),
  currentReductionPct: z.string().optional(),
  investmentRequired: z.string().optional(),
  investmentCurrency: z.string().max(3).optional(),
  technologyArea: z.string().max(100).optional(),
  implementationStatus: z.string().max(50).optional(),
  riskLevel: z.string().max(20).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateDecarbRoadmapSchema = createDecarbRoadmapSchema.partial();

// ==========================================
// Alternative Fuel & Green Fuel Tracking
// ==========================================
export const createAltFuelTrackingSchema = z.object({
  trackingType: z.enum(["lng_consumption", "methanol_trial", "ammonia_pilot", "hydrogen_test", "biofuel_blend"]),
  fuelName: z.string().max(100).optional(),
  fuelCategory: z.string().max(50).optional(),
  vesselName: z.string().max(255).optional(),
  quantityMt: z.string().optional(),
  costPerMt: z.string().optional(),
  totalCost: z.string().optional(),
  fuelCurrency: z.string().max(3).optional(),
  co2ReductionPct: z.string().optional(),
  supplierName: z.string().max(255).optional(),
  certificationRef: z.string().max(100).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateAltFuelTrackingSchema = createAltFuelTrackingSchema.partial();

// ==========================================
// ESG KPI Dashboard & Benchmarking
// ==========================================
export const createEsgKpiSchema = z.object({
  kpiType: z.enum(["environmental_metric", "social_metric", "governance_metric", "combined_score", "benchmark_index"]),
  kpiName: z.string().max(255).optional(),
  kpiCategory: z.string().max(50).optional(),
  reportingPeriod: z.string().max(20).optional(),
  targetValue: z.string().optional(),
  actualValue: z.string().optional(),
  achievementPct: z.string().optional(),
  benchmarkValue: z.string().optional(),
  benchmarkSource: z.string().max(255).optional(),
  trendDirection: z.string().max(20).optional(),
  rating: z.string().max(10).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateEsgKpiSchema = createEsgKpiSchema.partial();

// ==========================================
// TCFD Sustainability Reporting
// ==========================================
export const createTcfdReportSchema = z.object({
  tcfdType: z.enum(["governance_disclosure", "strategy_assessment", "risk_management", "metrics_targets", "scenario_analysis"]),
  reportingYear: z.number().int().optional(),
  pillarArea: z.string().max(50).optional(),
  disclosureTitle: z.string().max(255).optional(),
  scenarioName: z.string().max(100).optional(),
  temperaturePathway: z.string().max(20).optional(),
  financialImpact: z.string().optional(),
  impactCurrency: z.string().max(3).optional(),
  riskCategory: z.string().max(50).optional(),
  opportunityCategory: z.string().max(50).optional(),
  maturityLevel: z.string().max(20).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateTcfdReportSchema = createTcfdReportSchema.partial();
