import { z } from "zod/v4";
import { metadataSchema } from "@/lib/validation";

// ==========================================
// Vessel Deployment Decision Matrix
// ==========================================
export const createDeploymentDecisionSchema = z.object({
  decisionType: z.enum(["new_deployment", "redeployment", "withdrawal", "extension", "seasonal_adjustment"]),
  title: z.string().max(255).optional(),
  vesselName: z.string().max(255).optional(),
  currentTrade: z.string().max(255).optional(),
  proposedTrade: z.string().max(255).optional(),
  effectiveDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  expectedTce: z.string().optional(),
  decisionScore: z.string().optional(),
  approvedBy: z.string().max(255).optional(),
  approvedDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateDeploymentDecisionSchema = createDeploymentDecisionSchema.partial();

// ==========================================
// Fleet Utilization & Capacity Planning
// ==========================================
export const createFleetUtilizationSchema = z.object({
  utilizationType: z.enum(["capacity_analysis", "demand_forecast", "gap_analysis", "seasonal_planning", "fleet_overview"]),
  title: z.string().max(255).optional(),
  periodFrom: z.coerce.date().optional(),
  periodTo: z.coerce.date().optional(),
  totalCapacityTeu: z.number().int().optional(),
  utilizedCapacityTeu: z.number().int().optional(),
  utilizationPct: z.string().optional(),
  idleDays: z.string().optional(),
  vesselCount: z.number().int().optional(),
  tradeLane: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateFleetUtilizationSchema = createFleetUtilizationSchema.partial();

// ==========================================
// Service Network Design & Evaluation
// ==========================================
export const createNetworkDesignSchema = z.object({
  networkType: z.enum(["hub_spoke", "direct_service", "pendulum", "round_trip", "relay"]),
  title: z.string().max(255).optional(),
  serviceName: z.string().max(255).optional(),
  portRotation: z.string().optional(),
  roundTripDays: z.number().int().optional(),
  vesselCount: z.number().int().optional(),
  weeklyFrequency: z.string().optional(),
  estimatedRevenue: z.string().optional(),
  estimatedCost: z.string().optional(),
  netContribution: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateNetworkDesignSchema = createNetworkDesignSchema.partial();

// ==========================================
// AI Fleet Deployment Optimizer
// ==========================================
export const createDeploymentOptimizerSchema = z.object({
  optimizerType: z.enum(["profit_maximization", "cost_minimization", "utilization_optimization", "emission_reduction", "balanced"]),
  title: z.string().max(255).optional(),
  scenarioName: z.string().max(255).optional(),
  objectiveFunction: z.string().max(100).optional(),
  constraints: z.string().optional(),
  vesselCount: z.number().int().optional(),
  tradeCount: z.number().int().optional(),
  optimalTce: z.string().optional(),
  improvementPct: z.string().optional(),
  aiRecommendation: z.string().optional(),
  runDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateDeploymentOptimizerSchema = createDeploymentOptimizerSchema.partial();

// ==========================================
// Fleet Size & Mix Financial Analysis
// ==========================================
export const createFleetFinancialSchema = z.object({
  financialType: z.enum(["fleet_valuation", "npv_analysis", "lease_vs_own", "newbuild_assessment", "disposal_analysis"]),
  title: z.string().max(255).optional(),
  vesselName: z.string().max(255).optional(),
  vesselType: z.string().max(100).optional(),
  capacityTeu: z.number().int().optional(),
  acquisitionCost: z.string().optional(),
  currentValue: z.string().optional(),
  annualOpex: z.string().optional(),
  npvResult: z.string().optional(),
  irrPct: z.string().optional(),
  paybackYears: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateFleetFinancialSchema = createFleetFinancialSchema.partial();

// ==========================================
// Vessel Substitution & Swap Management
// ==========================================
export const createVesselSwapSchema = z.object({
  swapType: z.enum(["planned_swap", "emergency_swap", "upgrade", "downsize", "slot_exchange"]),
  title: z.string().max(255).optional(),
  outgoingVessel: z.string().max(255).optional(),
  incomingVessel: z.string().max(255).optional(),
  tradeLane: z.string().max(255).optional(),
  swapDate: z.coerce.date().optional(),
  reason: z.string().optional(),
  costImpact: z.string().optional(),
  capacityChange: z.number().int().optional(),
  isApproved: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateVesselSwapSchema = createVesselSwapSchema.partial();

// ==========================================
// Long-Term Deployment Contract Management
// ==========================================
export const createDeploymentContractSchema = z.object({
  contractType: z.enum(["coa", "vsa", "slot_charter", "time_charter", "bareboat"]),
  title: z.string().max(255).optional(),
  counterparty: z.string().max(255).optional(),
  vesselName: z.string().max(255).optional(),
  tradeLane: z.string().max(255).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  contractValue: z.string().optional(),
  slotCapacity: z.number().int().optional(),
  renewalDate: z.coerce.date().optional(),
  isAutoRenew: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateDeploymentContractSchema = createDeploymentContractSchema.partial();

// ==========================================
// Freight Market Intelligence Integration
// ==========================================
export const createMarketIntelligenceSchema = z.object({
  intelType: z.enum(["rate_index", "market_outlook", "competitor_analysis", "trade_flow", "supply_demand"]),
  title: z.string().max(255).optional(),
  tradeLane: z.string().max(255).optional(),
  source: z.string().max(255).optional(),
  reportDate: z.coerce.date().optional(),
  currentRate: z.string().optional(),
  forecastRate: z.string().optional(),
  changePercent: z.string().optional(),
  marketSentiment: z.string().max(50).optional(),
  summary: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateMarketIntelligenceSchema = createMarketIntelligenceSchema.partial();
