import { z } from "zod";

// ==========================================
// Vessel Schedule schemas
// ==========================================
export const createVesselScheduleSchema = z.object({
  vesselName: z.string().min(1).max(255),
  vesselImo: z.string().max(10).optional(),
  serviceName: z.string().min(1).max(255),
  tradeLane: z.string().max(100).optional(),
  scheduleType: z.enum(["regular", "ad_hoc", "extra_loader"]).optional(),
  validityFrom: z.string().datetime(),
  validityTo: z.string().datetime().optional(),
  frequency: z.enum(["weekly", "biweekly", "monthly", "irregular"]).optional(),
  totalCapacityTeu: z.number().int().min(0).optional(),
  totalWeightMt: z.number().int().min(0).optional(),
  operatorName: z.string().max(255).optional(),
  status: z.enum(["draft", "active", "suspended", "completed"]).optional(),
  notes: z.string().optional(),
});
export const updateVesselScheduleSchema = createVesselScheduleSchema.partial();

// ==========================================
// Port Rotation schemas
// ==========================================
export const createPortRotationSchema = z.object({
  vesselScheduleId: z.string().uuid(),
  portCode: z.string().min(1).max(10),
  portName: z.string().min(1).max(255),
  sequenceNumber: z.number().int().min(0),
  arrivalEta: z.string().datetime().optional(),
  departureEtd: z.string().datetime().optional(),
  actualArrival: z.string().datetime().optional(),
  actualDeparture: z.string().datetime().optional(),
  terminalName: z.string().max(255).optional(),
  berthName: z.string().max(100).optional(),
  callPurpose: z
    .enum(["loading", "discharging", "both", "bunker", "transit"])
    .optional(),
  timeZone: z.string().max(50).optional(),
  status: z
    .enum(["scheduled", "arrived", "berthed", "departed", "cancelled", "skipped"])
    .optional(),
  notes: z.string().optional(),
});
export const updatePortRotationSchema = createPortRotationSchema.partial();

// ==========================================
// Trade Allocation schemas
// ==========================================
export const createTradeAllocationSchema = z.object({
  vesselScheduleId: z.string().uuid().optional(),
  tradeLane: z.string().min(1).max(100),
  originRegion: z.string().max(100).optional(),
  destinationRegion: z.string().max(100).optional(),
  allocatedTeu: z.number().int().min(0),
  allocatedWeightMt: z.number().int().min(0).optional(),
  utilizedTeu: z.number().int().min(0).optional(),
  utilizedWeightMt: z.number().int().min(0).optional(),
  allocationType: z.enum(["contract", "spot", "reserve"]).optional(),
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().optional(),
  priority: z.number().int().min(0).optional(),
  status: z.enum(["active", "suspended", "expired"]).optional(),
  notes: z.string().optional(),
});
export const updateTradeAllocationSchema = createTradeAllocationSchema.partial();

// ==========================================
// Space Control schemas
// ==========================================
export const createSpaceControlSchema = z.object({
  vesselScheduleId: z.string().uuid().optional(),
  portRotationId: z.string().uuid().optional(),
  bookingReference: z.string().min(1).max(50),
  containerType: z.string().min(1).max(20),
  containerSize: z.string().min(1).max(10),
  quantityTeu: z.number().int().min(1),
  weightMt: z.number().int().min(0).optional(),
  shipperName: z.string().max(255).optional(),
  consigneeName: z.string().max(255).optional(),
  commodity: z.string().max(255).optional(),
  hazmatClass: z.string().max(10).optional(),
  reeferTemp: z.number().optional(),
  oogDimensions: z.record(z.string(), z.unknown()).optional(),
  bookingDate: z.string().datetime().optional(),
  cutOffDate: z.string().datetime().optional(),
  status: z
    .enum(["pending", "confirmed", "waitlisted", "rejected", "cancelled"])
    .optional(),
  notes: z.string().optional(),
});
export const updateSpaceControlSchema = createSpaceControlSchema.partial();

// ==========================================
// Transshipment Plan schemas
// ==========================================
export const createTransshipmentPlanSchema = z.object({
  bookingReference: z.string().max(50).optional(),
  containerNumber: z.string().max(20).optional(),
  originPort: z.string().min(1).max(255),
  transshipmentPort: z.string().min(1).max(255),
  destinationPort: z.string().min(1).max(255),
  firstVesselScheduleId: z.string().uuid().optional(),
  secondVesselScheduleId: z.string().uuid().optional(),
  expectedArrival: z.string().datetime().optional(),
  expectedConnection: z.string().datetime().optional(),
  dwellDays: z.number().int().min(0).optional(),
  connectionType: z.enum(["direct", "indirect", "relay"]).optional(),
  status: z
    .enum(["planned", "in_transit", "at_hub", "connected", "completed", "failed"])
    .optional(),
  coordinationNotes: z.string().optional(),
  notes: z.string().optional(),
});
export const updateTransshipmentPlanSchema =
  createTransshipmentPlanSchema.partial();

// ==========================================
// Loading List schemas
// ==========================================
export const createLoadingListSchema = z.object({
  vesselScheduleId: z.string().uuid(),
  portRotationId: z.string().uuid().optional(),
  listReference: z.string().min(1).max(50),
  listType: z.enum(["preliminary", "final", "amended"]).optional(),
  totalContainers: z.number().int().min(0).optional(),
  totalTeu: z.number().int().min(0).optional(),
  totalWeightMt: z.number().int().min(0).optional(),
  hazmatCount: z.number().int().min(0).optional(),
  reeferCount: z.number().int().min(0).optional(),
  oogCount: z.number().int().min(0).optional(),
  cutOffCargo: z.string().datetime().optional(),
  cutOffDocumentation: z.string().datetime().optional(),
  cutOffVgm: z.string().datetime().optional(),
  containers: z.array(z.record(z.string(), z.unknown())).optional(),
  status: z.enum(["draft", "preliminary", "final", "closed"]).optional(),
  notes: z.string().optional(),
});
export const updateLoadingListSchema = createLoadingListSchema.partial();

// ==========================================
// Bay Plan schemas
// ==========================================
export const createBayPlanSchema = z.object({
  vesselScheduleId: z.string().uuid(),
  portRotationId: z.string().uuid().optional(),
  baplieVersion: z.string().max(20).optional(),
  planType: z.enum(["pre_stow", "actual", "discharge"]).optional(),
  totalSlots: z.number().int().min(0).optional(),
  occupiedSlots: z.number().int().min(0).optional(),
  utilizationPercent: z.number().min(0).max(100).optional(),
  fileReference: z.string().max(255).optional(),
  baplieData: z.record(z.string(), z.unknown()).optional(),
  submittedAt: z.string().datetime().optional(),
  validatedAt: z.string().datetime().optional(),
  status: z
    .enum(["draft", "validated", "submitted", "accepted", "rejected"])
    .optional(),
  notes: z.string().optional(),
});
export const updateBayPlanSchema = createBayPlanSchema.partial();

// ==========================================
// Stowage Plan schemas
// ==========================================
export const createStowagePlanSchema = z.object({
  vesselScheduleId: z.string().uuid().optional(),
  bayPlanId: z.string().uuid().optional(),
  containerNumber: z.string().min(1).max(20),
  containerType: z.string().max(20).optional(),
  containerSize: z.string().max(10).optional(),
  isoCode: z.string().max(10).optional(),
  weightKg: z.number().int().min(0).optional(),
  bayNumber: z.number().int().min(0).optional(),
  rowNumber: z.number().int().min(0).optional(),
  tierNumber: z.number().int().min(0).optional(),
  isHazmat: z.boolean().optional(),
  hazmatClass: z.string().max(10).optional(),
  isReefer: z.boolean().optional(),
  reeferTemp: z.number().optional(),
  isOog: z.boolean().optional(),
  oogHeightCm: z.number().int().min(0).optional(),
  oogWidthCm: z.number().int().min(0).optional(),
  pol: z.string().max(10).optional(),
  pod: z.string().max(10).optional(),
  stackingOrder: z.number().int().min(0).optional(),
  status: z.enum(["planned", "loaded", "discharged", "shifted"]).optional(),
  notes: z.string().optional(),
});
export const updateStowagePlanSchema = createStowagePlanSchema.partial();

// ==========================================
// Load Optimization schemas
// ==========================================
export const createLoadOptimizationSchema = z.object({
  vesselScheduleId: z.string().uuid().optional(),
  optimizationRunId: z.string().max(50).optional(),
  algorithm: z.string().max(50).optional(),
  objective: z
    .enum([
      "maximize_teu",
      "maximize_revenue",
      "minimize_shifts",
      "balance_weight",
    ])
    .optional(),
  inputParameters: z.record(z.string(), z.unknown()).optional(),
  results: z.record(z.string(), z.unknown()).optional(),
  totalTeuBefore: z.number().int().min(0).optional(),
  totalTeuAfter: z.number().int().min(0).optional(),
  improvementPercent: z.number().min(0).optional(),
  revenueImpact: z.number().int().optional(),
  currency: z.string().length(3).optional(),
  aiModel: z.string().max(100).optional(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  status: z.enum(["pending", "running", "completed", "failed"]).optional(),
  notes: z.string().optional(),
});
export const updateLoadOptimizationSchema =
  createLoadOptimizationSchema.partial();

// ==========================================
// Revenue Analytics schemas
// ==========================================
export const createRevenueAnalyticSchema = z.object({
  vesselScheduleId: z.string().uuid().optional(),
  tradeLane: z.string().max(100).optional(),
  originPort: z.string().max(255).optional(),
  destinationPort: z.string().max(255).optional(),
  periodFrom: z.string().datetime(),
  periodTo: z.string().datetime(),
  totalTeu: z.number().int().min(0).optional(),
  totalRevenue: z.number().int().min(0).optional(),
  revenuePerTeu: z.number().int().min(0).optional(),
  averageRate: z.number().int().min(0).optional(),
  currency: z.string().length(3).optional(),
  containerTypeBreakdown: z.record(z.string(), z.unknown()).optional(),
  commodityBreakdown: z.record(z.string(), z.unknown()).optional(),
  comparisonPreviousPeriod: z.record(z.string(), z.unknown()).optional(),
  calculatedAt: z.string().datetime().optional(),
  status: z.enum(["draft", "calculated", "published"]).optional(),
  notes: z.string().optional(),
});
export const updateRevenueAnalyticSchema =
  createRevenueAnalyticSchema.partial();

// ==========================================
// Demand Forecast schemas
// ==========================================
export const createDemandForecastSchema = z.object({
  tradeLane: z.string().min(1).max(100),
  originRegion: z.string().max(100).optional(),
  destinationRegion: z.string().max(100).optional(),
  forecastPeriodStart: z.string().datetime(),
  forecastPeriodEnd: z.string().datetime(),
  forecastedDemandTeu: z.number().int().min(0).optional(),
  actualDemandTeu: z.number().int().min(0).optional(),
  availableCapacityTeu: z.number().int().min(0).optional(),
  utilizationForecastPercent: z.number().min(0).max(100).optional(),
  confidenceLevel: z.number().min(0).max(100).optional(),
  methodology: z.enum(["historical", "ai", "manual", "hybrid"]).optional(),
  seasonFactor: z.number().optional(),
  marketConditions: z.record(z.string(), z.unknown()).optional(),
  recommendations: z.record(z.string(), z.unknown()).optional(),
  aiModel: z.string().max(100).optional(),
  status: z.enum(["draft", "preliminary", "final", "expired"]).optional(),
  notes: z.string().optional(),
});
export const updateDemandForecastSchema = createDemandForecastSchema.partial();

// ==========================================
// Schedule Performance schemas
// ==========================================
export const createSchedulePerformanceSchema = z.object({
  vesselScheduleId: z.string().uuid().optional(),
  portRotationId: z.string().uuid().optional(),
  portName: z.string().max(255).optional(),
  scheduledArrival: z.string().datetime().optional(),
  actualArrival: z.string().datetime().optional(),
  scheduledDeparture: z.string().datetime().optional(),
  actualDeparture: z.string().datetime().optional(),
  arrivalDelayHours: z.number().optional(),
  departureDelayHours: z.number().optional(),
  delayReason: z.string().max(255).optional(),
  onTimeArrival: z.boolean().optional(),
  onTimeDeparture: z.boolean().optional(),
  bunkerConsumptionMt: z.number().min(0).optional(),
  speedKnots: z.number().min(0).optional(),
  distanceNm: z.number().min(0).optional(),
  weatherConditions: z.string().max(50).optional(),
  seaState: z.string().max(20).optional(),
  reliabilityScore: z.number().min(0).max(100).optional(),
  periodFrom: z.string().datetime().optional(),
  periodTo: z.string().datetime().optional(),
  status: z.enum(["recorded", "verified", "published"]).optional(),
  notes: z.string().optional(),
});
export const updateSchedulePerformanceSchema =
  createSchedulePerformanceSchema.partial();
