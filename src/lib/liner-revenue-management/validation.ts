import { z } from "zod/v4";
import { metadataSchema } from "@/lib/validation";

// ==========================================
// Revenue per TEU Maximization Strategy
// ==========================================
export const createTeuMaximizationSchema = z.object({
  strategyType: z.enum(["rate_optimization", "slot_utilization", "cargo_prioritization", "surcharge_review", "yield_management"]),
  tradeLane: z.string().max(100).optional(),
  originPort: z.string().max(10).optional(),
  destinationPort: z.string().max(10).optional(),
  currentRevenueTeu: z.string().optional(),
  targetRevenueTeu: z.string().optional(),
  achievedRevenueTeu: z.string().optional(),
  currency: z.string().max(3).optional(),
  teuVolume: z.number().int().optional(),
  utilizationPct: z.string().optional(),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional(),
  approvedBy: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateTeuMaximizationSchema = createTeuMaximizationSchema.partial();

// ==========================================
// Cargo Mix & Portfolio Management
// ==========================================
export const createCargoMixSchema = z.object({
  mixType: z.enum(["commodity_analysis", "segment_allocation", "weight_class", "reefer_ratio", "special_cargo"]),
  tradeLane: z.string().max(100).optional(),
  commodityGroup: z.string().max(100).optional(),
  dryCargoTeu: z.number().int().optional(),
  reeferTeu: z.number().int().optional(),
  specialCargoTeu: z.number().int().optional(),
  totalTeu: z.number().int().optional(),
  revenueContribution: z.string().optional(),
  marginPct: z.string().optional(),
  currency: z.string().max(3).optional(),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateCargoMixSchema = createCargoMixSchema.partial();

// ==========================================
// AI Demand Forecasting per Trade Lane
// ==========================================
export const createDemandForecastSchema = z.object({
  forecastType: z.enum(["seasonal_trend", "ml_prediction", "market_analysis", "capacity_planning", "booking_projection"]),
  tradeLane: z.string().max(100).optional(),
  originRegion: z.string().max(100).optional(),
  destinationRegion: z.string().max(100).optional(),
  forecastPeriod: z.string().max(20).optional(),
  predictedTeu: z.number().int().optional(),
  actualTeu: z.number().int().optional(),
  confidencePct: z.string().optional(),
  accuracyPct: z.string().optional(),
  modelVersion: z.string().max(50).optional(),
  forecastDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateDemandForecastSchema = createDemandForecastSchema.partial();

// ==========================================
// Freight Forward Contracts & Futures
// ==========================================
export const createFreightContractSchema = z.object({
  contractType: z.enum(["spot_rate", "long_term", "ffa_settlement", "index_linked", "hybrid_contract"]),
  counterparty: z.string().max(255).optional(),
  tradeLane: z.string().max(100).optional(),
  contractedRate: z.string().optional(),
  spotRate: z.string().optional(),
  currency: z.string().max(3).optional(),
  volumeTeu: z.number().int().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  settlementBasis: z.string().max(50).optional(),
  indexReference: z.string().max(100).optional(),
  markToMarketValue: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateFreightContractSchema = createFreightContractSchema.partial();

// ==========================================
// Revenue Leakage Detection & Prevention
// ==========================================
export const createLeakageDetectionSchema = z.object({
  leakageType: z.enum(["unbilled_charge", "rate_deviation", "weight_discrepancy", "surcharge_miss", "free_time_abuse"]),
  bookingRef: z.string().max(100).optional(),
  customerName: z.string().max(255).optional(),
  expectedAmount: z.string().optional(),
  actualAmount: z.string().optional(),
  leakageAmount: z.string().optional(),
  currency: z.string().max(3).optional(),
  detectedAt: z.coerce.date().optional(),
  resolvedAt: z.coerce.date().optional(),
  rootCause: z.string().optional(),
  recoveryAction: z.string().max(100).optional(),
  recovered: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateLeakageDetectionSchema = createLeakageDetectionSchema.partial();

// ==========================================
// Rate Integrity & Unauthorized Discount Control
// ==========================================
export const createRateIntegritySchema = z.object({
  integrityType: z.enum(["rate_audit", "discount_review", "tariff_compliance", "approval_check", "deviation_alert"]),
  tradeLane: z.string().max(100).optional(),
  customerName: z.string().max(255).optional(),
  publishedRate: z.string().optional(),
  appliedRate: z.string().optional(),
  discountPct: z.string().optional(),
  maxAllowedDiscount: z.string().optional(),
  currency: z.string().max(3).optional(),
  authorized: z.boolean().optional(),
  authorizedBy: z.string().max(255).optional(),
  violationSeverity: z.string().max(20).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateRateIntegritySchema = createRateIntegritySchema.partial();

// ==========================================
// Revenue Accrual Management
// ==========================================
export const createRevenueAccrualSchema = z.object({
  accrualType: z.enum(["freight_accrual", "surcharge_accrual", "demurrage_accrual", "detention_accrual", "ancillary_accrual"]),
  voyageRef: z.string().max(100).optional(),
  customerName: z.string().max(255).optional(),
  accrualAmount: z.string().optional(),
  billedAmount: z.string().optional(),
  varianceAmount: z.string().optional(),
  currency: z.string().max(3).optional(),
  accrualPeriod: z.string().max(20).optional(),
  recognitionDate: z.coerce.date().optional(),
  reversalDate: z.coerce.date().optional(),
  glAccountCode: z.string().max(20).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateRevenueAccrualSchema = createRevenueAccrualSchema.partial();

// ==========================================
// AI Revenue Maximization Engine
// ==========================================
export const createMaximizationEngineSchema = z.object({
  engineType: z.enum(["dynamic_pricing", "overbooking_optimization", "cargo_allocation", "surcharge_optimization", "bundle_pricing"]),
  tradeLane: z.string().max(100).optional(),
  modelName: z.string().max(100).optional(),
  modelVersion: z.string().max(50).optional(),
  recommendedRate: z.string().optional(),
  currentRate: z.string().optional(),
  upliftPct: z.string().optional(),
  confidenceScore: z.string().optional(),
  currency: z.string().max(3).optional(),
  simulationRunAt: z.coerce.date().optional(),
  acceptedRecommendation: z.boolean().optional(),
  revenueImpact: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateMaximizationEngineSchema = createMaximizationEngineSchema.partial();
