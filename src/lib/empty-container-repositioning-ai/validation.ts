import { z } from "zod/v4";

// ==========================================
// Empty Container Inventory Visibility
// ==========================================
export const createInventorySnapshotSchema = z.object({
  snapshotType: z.enum(["daily_count", "weekly_summary", "location_audit", "aging_report", "type_breakdown"]),
  title: z.string().max(255).optional(),
  locationCode: z.string().max(100).optional(),
  locationName: z.string().max(255).optional(),
  containerType: z.string().max(50).optional(),
  availableCount: z.number().int().optional(),
  damagedCount: z.number().int().optional(),
  totalCount: z.number().int().optional(),
  avgDwellDays: z.string().optional(),
  surplusDeficit: z.number().int().optional(),
  snapshotDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateInventorySnapshotSchema = createInventorySnapshotSchema.partial();

// ==========================================
// Cross-Trade Repositioning Planning
// ==========================================
export const createRepositioningPlanSchema = z.object({
  planType: z.enum(["cross_trade", "backhaul", "street_turn", "triangulation", "seasonal_pre_position"]),
  title: z.string().max(255).optional(),
  originPort: z.string().max(255).optional(),
  destinationPort: z.string().max(255).optional(),
  containerType: z.string().max(50).optional(),
  quantity: z.number().int().optional(),
  etd: z.coerce.date().optional(),
  eta: z.coerce.date().optional(),
  vesselName: z.string().max(255).optional(),
  voyageRef: z.string().max(100).optional(),
  estimatedCost: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateRepositioningPlanSchema = createRepositioningPlanSchema.partial();

// ==========================================
// Repositioning Cost Tracking & Approval
// ==========================================
export const createCostTrackingSchema = z.object({
  costType: z.enum(["inland_transport", "ocean_freight", "handling", "storage", "repair", "repositioning_fee"]),
  title: z.string().max(255).optional(),
  planRef: z.string().max(100).optional(),
  containerType: z.string().max(50).optional(),
  quantity: z.number().int().optional(),
  unitCost: z.string().optional(),
  totalCost: z.string().optional(),
  currency: z.string().max(3).optional(),
  approvedBy: z.string().max(255).optional(),
  approvedDate: z.coerce.date().optional(),
  isApproved: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateCostTrackingSchema = createCostTrackingSchema.partial();

// ==========================================
// AI Repositioning Route Optimizer
// ==========================================
export const createRouteOptimizerSchema = z.object({
  optimizerType: z.enum(["cost_minimization", "time_minimization", "multi_objective", "carbon_optimal", "network_flow"]),
  title: z.string().max(255).optional(),
  scenarioName: z.string().max(255).optional(),
  originPorts: z.string().optional(),
  destinationPorts: z.string().optional(),
  containerTypes: z.string().optional(),
  objectiveFunction: z.string().max(100).optional(),
  totalSavings: z.string().optional(),
  routeCount: z.number().int().optional(),
  aiRecommendation: z.string().optional(),
  runDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateRouteOptimizerSchema = createRouteOptimizerSchema.partial();

// ==========================================
// AI Demand Forecast by Trade Lane
// ==========================================
export const createDemandForecastSchema = z.object({
  forecastType: z.enum(["short_term", "medium_term", "long_term", "seasonal", "event_driven"]),
  title: z.string().max(255).optional(),
  tradeLane: z.string().max(255).optional(),
  containerType: z.string().max(50).optional(),
  periodFrom: z.coerce.date().optional(),
  periodTo: z.coerce.date().optional(),
  forecastedDemand: z.number().int().optional(),
  actualDemand: z.number().int().optional(),
  accuracyPct: z.string().optional(),
  confidenceLevel: z.string().optional(),
  aiModelVersion: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateDemandForecastSchema = createDemandForecastSchema.partial();

// ==========================================
// Leasing vs Repositioning Decision Engine
// ==========================================
export const createLeasingDecisionSchema = z.object({
  decisionType: z.enum(["lease_in", "lease_out", "reposition", "buy", "sell"]),
  title: z.string().max(255).optional(),
  locationCode: z.string().max(100).optional(),
  containerType: z.string().max(50).optional(),
  quantity: z.number().int().optional(),
  repositionCost: z.string().optional(),
  leasingCost: z.string().optional(),
  breakEvenDays: z.number().int().optional(),
  recommendedAction: z.string().max(50).optional(),
  savingsAmount: z.string().optional(),
  aiRecommendation: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateLeasingDecisionSchema = createLeasingDecisionSchema.partial();

// ==========================================
// Empty Return Incentive Management
// ==========================================
export const createReturnIncentiveSchema = z.object({
  incentiveType: z.enum(["flat_discount", "percentage_rebate", "free_storage", "priority_booking", "loyalty_bonus"]),
  title: z.string().max(255).optional(),
  customerName: z.string().max(255).optional(),
  tradeLane: z.string().max(255).optional(),
  containerType: z.string().max(50).optional(),
  targetLocation: z.string().max(255).optional(),
  incentiveValue: z.string().optional(),
  currency: z.string().max(3).optional(),
  validFrom: z.coerce.date().optional(),
  validTo: z.coerce.date().optional(),
  utilizationCount: z.number().int().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateReturnIncentiveSchema = createReturnIncentiveSchema.partial();

// ==========================================
// Repositioning P&L Attribution
// ==========================================
export const createPnlAttributionSchema = z.object({
  attributionType: z.enum(["voyage_level", "trade_lane", "region", "container_type", "monthly_summary"]),
  title: z.string().max(255).optional(),
  periodFrom: z.coerce.date().optional(),
  periodTo: z.coerce.date().optional(),
  tradeLane: z.string().max(255).optional(),
  repositioningRevenue: z.string().optional(),
  repositioningCost: z.string().optional(),
  netPnl: z.string().optional(),
  totalMoves: z.number().int().optional(),
  costPerMove: z.string().optional(),
  revenuePerMove: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updatePnlAttributionSchema = createPnlAttributionSchema.partial();
