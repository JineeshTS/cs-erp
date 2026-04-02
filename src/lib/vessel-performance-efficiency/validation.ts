import { z } from "zod/v4";
import { metadataSchema } from "@/lib/validation";

// ==========================================
// Speed Consumption & Performance Monitoring
// ==========================================
export const createSpeedConsumptionSchema = z.object({
  consumptionType: z.enum(["laden", "ballast", "port", "anchored", "canal_transit"]),
  vesselId: z.string().max(100).optional(),
  vesselName: z.string().max(255).optional(),
  voyageId: z.string().max(100).optional(),
  reportDate: z.coerce.date().optional(),
  speedOrdered: z.string().optional(),
  speedActual: z.string().optional(),
  speedOverGround: z.string().optional(),
  fuelConsumedMt: z.string().optional(),
  fuelType: z.string().max(50).optional(),
  dailyConsumption: z.string().optional(),
  distanceTraveled: z.string().optional(),
  slipPercentage: z.string().optional(),
  windForce: z.number().int().optional(),
  seaState: z.string().max(50).optional(),
  currentFactor: z.string().optional(),
  performanceIndex: z.string().optional(),
  weatherImpact: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateSpeedConsumptionSchema = createSpeedConsumptionSchema.partial();

// ==========================================
// CII Carbon Intensity Rating Calculation
// ==========================================
export const createCiiRatingSchema = z.object({
  ratingType: z.enum(["annual", "quarterly", "voyage", "corrected", "required"]),
  vesselId: z.string().max(100).optional(),
  vesselName: z.string().max(255).optional(),
  imoNumber: z.string().max(20).optional(),
  reportingYear: z.number().int().optional(),
  attainedCii: z.string().optional(),
  requiredCii: z.string().optional(),
  reductionFactor: z.string().optional(),
  rating: z.string().max(1).optional(),
  totalCo2Emissions: z.string().optional(),
  totalDistanceNm: z.string().optional(),
  dwt: z.string().optional(),
  correctionFactors: z.record(z.string(), z.unknown()).optional(),
  complianceStatus: z.string().max(50).optional(),
  correctiveActionPlan: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateCiiRatingSchema = createCiiRatingSchema.partial();

// ==========================================
// EEXI Energy Efficiency Compliance
// ==========================================
export const createEexiComplianceSchema = z.object({
  complianceType: z.enum(["initial", "annual", "interim", "renewal"]),
  vesselId: z.string().max(100).optional(),
  vesselName: z.string().max(255).optional(),
  imoNumber: z.string().max(20).optional(),
  attainedEexi: z.string().optional(),
  requiredEexi: z.string().optional(),
  referenceLine: z.string().optional(),
  reductionPercentage: z.string().optional(),
  enginePowerLimitation: z.boolean().optional(),
  eplPercentage: z.string().optional(),
  shaftPowerLimitation: z.boolean().optional(),
  energySavingDevices: z.record(z.string(), z.unknown()).optional(),
  surveyDate: z.coerce.date().optional(),
  certificateNumber: z.string().max(100).optional(),
  certificateExpiry: z.coerce.date().optional(),
  flagState: z.string().max(100).optional(),
  classificationSociety: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateEexiComplianceSchema = createEexiComplianceSchema.partial();

// ==========================================
// Noon Report Processing & Analysis
// ==========================================
export const createNoonReportSchema = z.object({
  reportType: z.enum(["noon", "departure", "arrival", "event", "bunker"]),
  vesselId: z.string().max(100).optional(),
  vesselName: z.string().max(255).optional(),
  voyageId: z.string().max(100).optional(),
  reportDatetime: z.coerce.date().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  courseHeading: z.string().optional(),
  distanceSinceLastReport: z.string().optional(),
  distanceToGo: z.string().optional(),
  avgSpeed: z.string().optional(),
  windDirection: z.string().max(10).optional(),
  windForce: z.number().int().optional(),
  seaState: z.string().max(50).optional(),
  swellHeight: z.string().optional(),
  robFo: z.string().optional(),
  robDo: z.string().optional(),
  robLo: z.string().optional(),
  meConsumption: z.string().optional(),
  aeConsumption: z.string().optional(),
  boilerConsumption: z.string().optional(),
  eta: z.coerce.date().optional(),
  masterRemarks: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateNoonReportSchema = createNoonReportSchema.partial();

// ==========================================
// Voyage Performance vs Charter Party Analysis
// ==========================================
export const createVoyagePerformanceSchema = z.object({
  performanceType: z.enum(["cp_compliance", "speed_claim", "consumption_claim", "weather_routing"]),
  vesselId: z.string().max(100).optional(),
  vesselName: z.string().max(255).optional(),
  voyageId: z.string().max(100).optional(),
  charterPartyId: z.string().max(100).optional(),
  cpSpeed: z.string().optional(),
  actualSpeed: z.string().optional(),
  speedVariance: z.string().optional(),
  cpConsumption: z.string().optional(),
  actualConsumption: z.string().optional(),
  consumptionVariance: z.string().optional(),
  goodWeatherDays: z.string().optional(),
  badWeatherDays: z.string().optional(),
  claimAmount: z.string().optional(),
  claimCurrency: z.string().max(3).optional(),
  claimDirection: z.string().max(20).optional(),
  analysisReport: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateVoyagePerformanceSchema = createVoyagePerformanceSchema.partial();

// ==========================================
// AI Weather Routing Integration
// ==========================================
export const createWeatherRoutingSchema = z.object({
  routingType: z.enum(["optimized", "standard", "shortest", "safest", "eco"]),
  vesselId: z.string().max(100).optional(),
  vesselName: z.string().max(255).optional(),
  voyageId: z.string().max(100).optional(),
  departurePort: z.string().max(255).optional(),
  arrivalPort: z.string().max(255).optional(),
  departureDate: z.coerce.date().optional(),
  arrivalDate: z.coerce.date().optional(),
  optimizedEta: z.coerce.date().optional(),
  routeWaypoints: z.record(z.string(), z.unknown()).optional(),
  totalDistanceNm: z.string().optional(),
  estimatedFuelMt: z.string().optional(),
  fuelSavingMt: z.string().optional(),
  timeSavingHours: z.string().optional(),
  weatherForecast: z.record(z.string(), z.unknown()).optional(),
  riskAssessment: z.string().max(50).optional(),
  confidenceScore: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateWeatherRoutingSchema = createWeatherRoutingSchema.partial();

// ==========================================
// IMO 2050 Carbon Emissions Tracking
// ==========================================
export const createCarbonEmissionSchema = z.object({
  emissionType: z.enum(["voyage", "annual", "fleet", "well_to_wake", "tank_to_wake"]),
  vesselId: z.string().max(100).optional(),
  vesselName: z.string().max(255).optional(),
  voyageId: z.string().max(100).optional(),
  reportingPeriodStart: z.coerce.date().optional(),
  reportingPeriodEnd: z.coerce.date().optional(),
  totalCo2Mt: z.string().optional(),
  totalCh4Mt: z.string().optional(),
  totalN2oMt: z.string().optional(),
  co2eTotal: z.string().optional(),
  fuelConsumedMt: z.string().optional(),
  emissionFactor: z.string().optional(),
  euMrvCompliance: z.boolean().optional(),
  imoDataCollection: z.boolean().optional(),
  euEtsLiability: z.string().optional(),
  carbonIntensity: z.string().optional(),
  reductionTarget: z.string().optional(),
  reductionAchieved: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateCarbonEmissionSchema = createCarbonEmissionSchema.partial();

// ==========================================
// Fuel Efficiency Benchmarking & Reporting
// ==========================================
export const createFuelBenchmarkSchema = z.object({
  benchmarkType: z.enum(["vessel", "fleet", "class", "industry", "historical"]),
  vesselId: z.string().max(100).optional(),
  vesselName: z.string().max(255).optional(),
  vesselClass: z.string().max(100).optional(),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
  avgDailyConsumption: z.string().optional(),
  benchmarkConsumption: z.string().optional(),
  efficiencyRatio: z.string().optional(),
  fuelCostPerNm: z.string().optional(),
  co2PerNm: z.string().optional(),
  fleetRanking: z.number().int().optional(),
  totalVesselsInClass: z.number().int().optional(),
  percentile: z.string().optional(),
  trendDirection: z.string().max(20).optional(),
  recommendations: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateFuelBenchmarkSchema = createFuelBenchmarkSchema.partial();
