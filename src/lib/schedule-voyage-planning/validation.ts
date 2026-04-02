import { z } from "zod/v4";
import { metadataSchema } from "@/lib/validation";

// ==========================================
// Multi-Service Schedule Integration & Publication
// ==========================================
export const createServiceScheduleSchema = z.object({
  scheduleType: z.enum(["liner_service", "feeder_service", "relay_service", "pendulum_route", "round_trip"]),
  serviceName: z.string().max(255).optional(),
  serviceCode: z.string().max(20).optional(),
  tradeRoute: z.string().max(100).optional(),
  vesselName: z.string().max(255).optional(),
  frequencyDays: z.number().int().optional(),
  portCount: z.number().int().optional(),
  transitTimeDays: z.number().int().optional(),
  publishedAt: z.coerce.date().optional(),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateServiceScheduleSchema = createServiceScheduleSchema.partial();

// ==========================================
// Port Sequence & Berth Window Optimization
// ==========================================
export const createPortSequenceSchema = z.object({
  sequenceType: z.enum(["rotation_plan", "berth_allocation", "window_request", "slot_optimization", "congestion_bypass"]),
  portCode: z.string().max(10).optional(),
  portName: z.string().max(255).optional(),
  terminalName: z.string().max(255).optional(),
  berthNumber: z.string().max(20).optional(),
  windowStart: z.coerce.date().optional(),
  windowEnd: z.coerce.date().optional(),
  sequenceOrder: z.number().int().optional(),
  dwellHours: z.string().optional(),
  cargoMovesPlanned: z.number().int().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updatePortSequenceSchema = createPortSequenceSchema.partial();

// ==========================================
// Suez Panama Canal Transit Management
// ==========================================
export const createCanalTransitSchema = z.object({
  transitType: z.enum(["suez_northbound", "suez_southbound", "panama_transit", "kiel_transit", "turkish_straits"]),
  canalName: z.string().max(100).optional(),
  vesselName: z.string().max(255).optional(),
  bookingNumber: z.string().max(50).optional(),
  scheduledDate: z.coerce.date().optional(),
  actualDate: z.coerce.date().optional(),
  transitFee: z.string().optional(),
  currency: z.string().max(3).optional(),
  convoyPosition: z.number().int().optional(),
  pilotRequired: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateCanalTransitSchema = createCanalTransitSchema.partial();

// ==========================================
// ETA ETD Management & Proactive Updates
// ==========================================
export const createEtaManagementSchema = z.object({
  etaType: z.enum(["initial_estimate", "revised_eta", "final_eta", "customer_notification", "port_advisory"]),
  vesselName: z.string().max(255).optional(),
  portCode: z.string().max(10).optional(),
  portName: z.string().max(255).optional(),
  originalEta: z.coerce.date().optional(),
  revisedEta: z.coerce.date().optional(),
  actualArrival: z.coerce.date().optional(),
  delayHours: z.string().optional(),
  delayReason: z.string().max(255).optional(),
  notificationSent: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateEtaManagementSchema = createEtaManagementSchema.partial();

// ==========================================
// AI Voyage Optimization Engine
// ==========================================
export const createVoyageOptimizationSchema = z.object({
  optimizationType: z.enum(["route_optimization", "speed_profile", "port_sequence", "bunker_strategy", "emission_reduction"]),
  voyageRef: z.string().max(100).optional(),
  vesselName: z.string().max(255).optional(),
  originalCost: z.string().optional(),
  optimizedCost: z.string().optional(),
  savingsAmount: z.string().optional(),
  savingsPct: z.string().optional(),
  currency: z.string().max(3).optional(),
  modelVersion: z.string().max(50).optional(),
  confidenceScore: z.string().optional(),
  accepted: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateVoyageOptimizationSchema = createVoyageOptimizationSchema.partial();

// ==========================================
// Speed vs Fuel Trade-Off Analysis
// ==========================================
export const createSpeedFuelAnalysisSchema = z.object({
  analysisType: z.enum(["slow_steaming", "eco_speed", "full_speed", "variable_speed", "weather_adjusted"]),
  vesselName: z.string().max(255).optional(),
  voyageRef: z.string().max(100).optional(),
  speedKnots: z.string().optional(),
  fuelConsumptionMt: z.string().optional(),
  fuelCostPerDay: z.string().optional(),
  timeSavingHours: z.string().optional(),
  co2EmissionsMt: z.string().optional(),
  currency: z.string().max(3).optional(),
  optimalSpeed: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateSpeedFuelAnalysisSchema = createSpeedFuelAnalysisSchema.partial();

// ==========================================
// Weather Routing Integration
// ==========================================
export const createWeatherRoutingSchema = z.object({
  routingType: z.enum(["optimal_route", "storm_avoidance", "current_utilization", "seasonal_planning", "heavy_weather_alert"]),
  vesselName: z.string().max(255).optional(),
  voyageRef: z.string().max(100).optional(),
  departurePort: z.string().max(10).optional(),
  arrivalPort: z.string().max(10).optional(),
  recommendedRoute: z.string().optional(),
  distanceNm: z.string().optional(),
  weatherSeverity: z.string().max(20).optional(),
  waveHeightM: z.string().optional(),
  windSpeedKnots: z.string().optional(),
  routeProvider: z.string().max(100).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateWeatherRoutingSchema = createWeatherRoutingSchema.partial();

// ==========================================
// Long-Term Vessel Deployment Planning
// ==========================================
export const createDeploymentPlanSchema = z.object({
  planType: z.enum(["annual_deployment", "seasonal_adjustment", "fleet_rebalancing", "newbuild_allocation", "charter_strategy"]),
  vesselName: z.string().max(255).optional(),
  tradeRoute: z.string().max(100).optional(),
  deploymentStart: z.coerce.date().optional(),
  deploymentEnd: z.coerce.date().optional(),
  vesselCapacityTeu: z.number().int().optional(),
  expectedUtilizationPct: z.string().optional(),
  dailyCostUsd: z.string().optional(),
  revenueProjection: z.string().optional(),
  currency: z.string().max(3).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateDeploymentPlanSchema = createDeploymentPlanSchema.partial();
