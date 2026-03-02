import { z } from "zod/v4";

// ==========================================
// Service Loops
// ==========================================

export const createServiceLoopSchema = z.object({
  loopName: z.string().min(1).max(255),
  loopCode: z.string().min(1).max(50),
  tradeRoute: z.string().min(1).max(255),
  direction: z.enum(["eastbound", "westbound", "northbound", "southbound", "pendulum", "round_trip"]),
  portRotation: z.array(z.record(z.string(), z.unknown())),
  totalPorts: z.number().int().min(2),
  roundTripDays: z.number().int().optional(),
  frequency: z.enum(["weekly", "biweekly", "monthly", "fortnightly", "ten_day"]),
  vesselCount: z.number().int().optional(),
  vesselNames: z.array(z.string()).optional(),
  deployedCapacityTeu: z.number().int().optional(),
  transitTimeDays: z.record(z.string(), z.unknown()).optional(),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional(),
  alliancePartner: z.string().max(255).optional(),
  operatingCarrier: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateServiceLoopSchema = createServiceLoopSchema.partial();

// ==========================================
// Port Pair Trade Lanes
// ==========================================

export const createPortPairTradeLaneSchema = z.object({
  originPort: z.string().min(1).max(255),
  originCountry: z.string().min(1).max(100),
  originRegion: z.string().max(100).optional(),
  destinationPort: z.string().min(1).max(255),
  destinationCountry: z.string().min(1).max(100),
  destinationRegion: z.string().max(100).optional(),
  tradeDirection: z.enum(["eastbound", "westbound", "northbound", "southbound", "intra_regional"]),
  distanceNm: z.number().int().optional(),
  averageTransitDays: z.number().int().optional(),
  serviceLoopIds: z.array(z.string()).optional(),
  competitorCount: z.number().int().optional(),
  competitorDetails: z.array(z.record(z.string(), z.unknown())).optional(),
  volumeHistoryTeu: z.record(z.string(), z.unknown()).optional(),
  marketSharePercent: z.string().optional(),
  avgFreightRate: z.string().optional(),
  currency: z.string().max(3).optional(),
  seasonalityFactors: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updatePortPairTradeLaneSchema = createPortPairTradeLaneSchema.partial();

// ==========================================
// Trade Lane P&L
// ==========================================

export const createTradeLanePnlSchema = z.object({
  tradeLaneName: z.string().min(1).max(255),
  serviceLoopName: z.string().max(255).optional(),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  periodType: z.enum(["monthly", "quarterly", "semi_annual", "annual"]),
  volumeTeu: z.number().int().optional(),
  revenue: z.string().optional(),
  bunkerCost: z.string().optional(),
  portCost: z.string().optional(),
  canalCost: z.string().optional(),
  equipmentCost: z.string().optional(),
  overheadCost: z.string().optional(),
  totalCost: z.string().optional(),
  grossProfit: z.string().optional(),
  grossMarginPercent: z.string().optional(),
  contributionMargin: z.string().optional(),
  revenuePerTeu: z.string().optional(),
  costPerTeu: z.string().optional(),
  currency: z.string().max(3).optional(),
  costBreakdown: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateTradeLanePnlSchema = createTradeLanePnlSchema.partial();

// ==========================================
// Slot Agreements
// ==========================================

export const createSlotAgreementSchema = z.object({
  agreementType: z.enum(["vsa", "slot_charter", "slot_purchase", "slot_exchange"]),
  partnerName: z.string().min(1).max(255),
  partnerCode: z.string().max(50).optional(),
  serviceLoopName: z.string().max(255).optional(),
  tradeRoute: z.string().max(255).optional(),
  slotAllocationTeu: z.number().int().optional(),
  slotUtilizationPercent: z.string().optional(),
  revenueSharePercent: z.string().optional(),
  costSharePercent: z.string().optional(),
  minimumQuantityCommitment: z.number().int().optional(),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional(),
  contractTerms: z.record(z.string(), z.unknown()).optional(),
  penaltyClause: z.string().optional(),
  settlementFrequency: z.enum(["weekly", "monthly", "quarterly"]).optional(),
  lastSettlementDate: z.coerce.date().optional(),
  currency: z.string().max(3).optional(),
  approvedByName: z.string().max(255).optional(),
  approvedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateSlotAgreementSchema = createSlotAgreementSchema.partial();

// ==========================================
// Alliance Agreements
// ==========================================

export const createAllianceAgreementSchema = z.object({
  allianceName: z.string().min(1).max(255),
  allianceType: z.enum(["global_alliance", "regional_alliance", "bilateral", "consortium"]),
  memberCarriers: z.array(z.record(z.string(), z.unknown())),
  memberCount: z.number().int().min(2),
  coveredTradeRoutes: z.array(z.string()).optional(),
  totalDeployedTeu: z.number().int().optional(),
  vesselSharingArrangement: z.string().optional(),
  slotExchangeTerms: z.record(z.string(), z.unknown()).optional(),
  jointServiceCount: z.number().int().optional(),
  governanceStructure: z.string().optional(),
  meetingSchedule: z.string().max(100).optional(),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional(),
  regulatoryApproval: z.boolean().optional(),
  regulatoryDetails: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateAllianceAgreementSchema = createAllianceAgreementSchema.partial();

// ==========================================
// Port Stay Analyses
// ==========================================

export const createPortStayAnalysisSchema = z.object({
  vesselName: z.string().min(1).max(255),
  portName: z.string().min(1).max(255),
  portCountry: z.string().min(1).max(100),
  terminalName: z.string().max(255).optional(),
  arrivalDate: z.coerce.date(),
  departureDate: z.coerce.date().optional(),
  totalPortStayHours: z.string().optional(),
  waitingTimeHours: z.string().optional(),
  berthingTimeHours: z.string().optional(),
  cargoOpsHours: z.string().optional(),
  containersMoved: z.number().int().optional(),
  movesPerHour: z.string().optional(),
  craneSplit: z.record(z.string(), z.unknown()).optional(),
  delayReasons: z.array(z.record(z.string(), z.unknown())).optional(),
  totalDelayHours: z.string().optional(),
  bunkerConsumed: z.string().optional(),
  portCostEstimate: z.string().optional(),
  currency: z.string().max(3).optional(),
  productivityScore: z.string().optional(),
  benchmarkScore: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updatePortStayAnalysisSchema = createPortStayAnalysisSchema.partial();

// ==========================================
// Route Optimizations
// ==========================================

export const createRouteOptimizationSchema = z.object({
  serviceLoopName: z.string().max(255).optional(),
  tradeRoute: z.string().min(1).max(255),
  optimizationType: z.enum(["speed", "cost", "emissions", "transit_time", "multi_objective"]),
  currentRoute: z.array(z.record(z.string(), z.unknown())),
  proposedRoute: z.array(z.record(z.string(), z.unknown())).optional(),
  objectiveFunction: z.enum(["minimize_cost", "minimize_time", "minimize_emissions", "maximize_utilization", "balanced"]),
  constraints: z.record(z.string(), z.unknown()).optional(),
  inputParameters: z.record(z.string(), z.unknown()).optional(),
  modelVersion: z.string().max(50).optional(),
  estimatedSavings: z.string().optional(),
  savingsBreakdown: z.record(z.string(), z.unknown()).optional(),
  transitTimeImpact: z.number().int().optional(),
  capacityImpact: z.number().int().optional(),
  emissionsImpact: z.string().optional(),
  confidenceScore: z.string().optional(),
  currency: z.string().max(3).optional(),
  approvedByName: z.string().max(255).optional(),
  approvedAt: z.coerce.date().optional(),
  implementedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateRouteOptimizationSchema = createRouteOptimizationSchema.partial();

// ==========================================
// Market Intelligence
// ==========================================

export const createMarketIntelligenceSchema = z.object({
  tradeRoute: z.string().min(1).max(255),
  originPort: z.string().max(255).optional(),
  destinationPort: z.string().max(255).optional(),
  dataSource: z.string().min(1).max(100),
  indexType: z.enum(["scfi", "fbx", "wci", "ccfi", "custom"]),
  indexValue: z.string().optional(),
  indexDate: z.coerce.date(),
  spotRate: z.string().optional(),
  contractRate: z.string().optional(),
  rateUnit: z.enum(["per_teu", "per_feu", "per_cbm", "per_ton"]).optional(),
  currency: z.string().max(3).optional(),
  capacityUtilization: z.string().optional(),
  demandForecast: z.record(z.string(), z.unknown()).optional(),
  supplyForecast: z.record(z.string(), z.unknown()).optional(),
  competitorActivity: z.array(z.record(z.string(), z.unknown())).optional(),
  marketTrend: z.enum(["rising", "falling", "stable", "volatile"]).optional(),
  sentimentScore: z.string().optional(),
  aiInsights: z.string().optional(),
  alerts: z.array(z.record(z.string(), z.unknown())).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateMarketIntelligenceSchema = createMarketIntelligenceSchema.partial();
