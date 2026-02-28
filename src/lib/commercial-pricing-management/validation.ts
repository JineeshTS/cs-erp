import { z } from "zod";

// ==========================================
// Tariff schemas
// ==========================================
export const createTariffSchema = z.object({
  tariffCode: z.string().min(1).max(50),
  tariffName: z.string().min(1).max(255),
  tariffType: z.enum(["standard", "contract", "promotional", "spot"]).optional(),
  tradeLane: z.string().max(100).optional(),
  originPort: z.string().max(10).optional(),
  destinationPort: z.string().max(10).optional(),
  serviceType: z.string().max(30).optional(),
  currency: z.string().max(3).optional(),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional(),
  status: z.enum(["draft", "active", "expired", "suspended"]).optional(),
  notes: z.string().optional(),
});
export const updateTariffSchema = createTariffSchema.partial();

// ==========================================
// Tariff Rate schemas
// ==========================================
export const createTariffRateSchema = z.object({
  tariffId: z.string().uuid(),
  chargeCode: z.string().min(1).max(30),
  chargeName: z.string().min(1).max(255),
  chargeType: z.enum(["ocean_freight", "thc", "documentation", "customs", "inland", "surcharge", "other"]),
  basis: z.enum(["per_container", "per_teu", "per_bl", "per_shipment", "lumpsum"]),
  containerType: z.string().max(20).optional(),
  containerSize: z.string().max(10).optional(),
  unitPrice: z.number().int(),
  minimumCharge: z.number().int().optional(),
  maximumCharge: z.number().int().optional(),
  currency: z.string().max(3).optional(),
  notes: z.string().optional(),
});
export const updateTariffRateSchema = createTariffRateSchema.partial();

// ==========================================
// Special Rate schemas
// ==========================================
export const createSpecialRateSchema = z.object({
  rateCode: z.string().min(1).max(50),
  rateName: z.string().min(1).max(255),
  rateType: z.enum(["contract", "spot", "promotional", "loyalty"]).optional(),
  customerId: z.string().uuid().optional(),
  customerSegment: z.string().max(50).optional(),
  originPort: z.string().max(10).optional(),
  destinationPort: z.string().max(10).optional(),
  tradeLane: z.string().max(100).optional(),
  containerType: z.string().max(20).optional(),
  containerSize: z.string().max(10).optional(),
  baseRate: z.number().int(),
  discountPercent: z.number().int().min(0).max(100).optional(),
  finalRate: z.number().int(),
  currency: z.string().max(3).optional(),
  minimumCommitmentTeu: z.number().int().min(0).optional(),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional(),
  status: z.enum(["draft", "active", "expired", "suspended"]).optional(),
  notes: z.string().optional(),
});
export const updateSpecialRateSchema = createSpecialRateSchema.partial();

// ==========================================
// Surcharge schemas
// ==========================================
export const createSurchargeSchema = z.object({
  surchargeCode: z.string().min(1).max(30),
  surchargeName: z.string().min(1).max(255),
  surchargeType: z.enum(["baf", "caf", "pss", "efs", "war_risk", "piracy", "congestion", "low_sulphur", "other"]),
  calculationBasis: z.enum(["fixed", "percentage", "per_teu", "per_container", "per_bl"]),
  amount: z.number().int().optional(),
  percentage: z.number().int().min(0).max(10000).optional(),
  currency: z.string().max(3).optional(),
  applicableTo: z.enum(["all", "import", "export", "transhipment"]).optional(),
  tradeLane: z.string().max(100).optional(),
  originPort: z.string().max(10).optional(),
  destinationPort: z.string().max(10).optional(),
  containerType: z.string().max(20).optional(),
  containerSize: z.string().max(10).optional(),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional(),
  isMandatory: z.boolean().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
});
export const updateSurchargeSchema = createSurchargeSchema.partial();

// ==========================================
// Detention & Demurrage schemas
// ==========================================
export const createDetentionDemurrageSchema = z.object({
  tariffCode: z.string().min(1).max(50),
  tariffName: z.string().min(1).max(255),
  chargeType: z.enum(["detention", "demurrage", "combined"]),
  portCode: z.string().max(10).optional(),
  containerType: z.string().max(20).optional(),
  containerSize: z.string().max(10).optional(),
  freeTimeDays: z.number().int().min(0),
  dailyRate: z.number().int(),
  escalationRate: z.number().int().optional(),
  escalationAfterDays: z.number().int().optional(),
  maximumDays: z.number().int().optional(),
  currency: z.string().max(3).optional(),
  customerSegment: z.string().max(50).optional(),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional(),
  status: z.enum(["active", "inactive", "expired"]).optional(),
  notes: z.string().optional(),
});
export const updateDetentionDemurrageSchema = createDetentionDemurrageSchema.partial();

// ==========================================
// Yield Target schemas
// ==========================================
export const createYieldTargetSchema = z.object({
  targetName: z.string().min(1).max(255),
  tradeLane: z.string().min(1).max(100),
  serviceType: z.string().max(30).optional(),
  fiscalYear: z.number().int().min(2020).max(2050),
  fiscalQuarter: z.number().int().min(1).max(4).optional(),
  targetRevenuePerTeu: z.number().int().optional(),
  actualRevenuePerTeu: z.number().int().optional(),
  targetUtilizationPercent: z.number().int().min(0).max(100).optional(),
  actualUtilizationPercent: z.number().int().min(0).max(100).optional(),
  targetTeu: z.number().int().min(0).optional(),
  actualTeu: z.number().int().min(0).optional(),
  minimumRateThreshold: z.number().int().optional(),
  currency: z.string().max(3).optional(),
  status: z.enum(["active", "achieved", "missed", "cancelled"]).optional(),
  notes: z.string().optional(),
});
export const updateYieldTargetSchema = createYieldTargetSchema.partial();

// ==========================================
// Rate Benchmark schemas
// ==========================================
export const createRateBenchmarkSchema = z.object({
  benchmarkName: z.string().min(1).max(255),
  tradeLane: z.string().min(1).max(100),
  originPort: z.string().max(10).optional(),
  destinationPort: z.string().max(10).optional(),
  containerType: z.string().max(20).optional(),
  containerSize: z.string().max(10).optional(),
  marketRate: z.number().int(),
  ourRate: z.number().int().optional(),
  competitorRate: z.number().int().optional(),
  competitorName: z.string().max(255).optional(),
  benchmarkSource: z.string().max(100).optional(),
  benchmarkDate: z.string(),
  currency: z.string().max(3).optional(),
  variancePercent: z.number().int().optional(),
  trend: z.enum(["up", "down", "stable"]).optional(),
  notes: z.string().optional(),
});
export const updateRateBenchmarkSchema = createRateBenchmarkSchema.partial();

// ==========================================
// Profitability Analysis schemas
// ==========================================
export const createProfitabilityAnalysisSchema = z.object({
  analysisName: z.string().min(1).max(255),
  analysisType: z.enum(["trade_lane", "customer", "voyage", "service", "overall"]),
  tradeLane: z.string().max(100).optional(),
  customerId: z.string().uuid().optional(),
  voyageId: z.string().uuid().optional(),
  periodFrom: z.string(),
  periodTo: z.string(),
  totalRevenue: z.number().int().optional(),
  totalCost: z.number().int().optional(),
  grossProfit: z.number().int().optional(),
  marginPercent: z.number().int().optional(),
  teuCount: z.number().int().min(0).optional(),
  revenuePerTeu: z.number().int().optional(),
  costPerTeu: z.number().int().optional(),
  currency: z.string().max(3).optional(),
  recommendations: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(["draft", "final", "archived"]).optional(),
  notes: z.string().optional(),
});
export const updateProfitabilityAnalysisSchema = createProfitabilityAnalysisSchema.partial();

// ==========================================
// AI Pricing Model schemas
// ==========================================
export const createAiPricingModelSchema = z.object({
  modelName: z.string().min(1).max(255),
  modelCode: z.string().min(1).max(50),
  modelType: z.enum(["regression", "classification", "time_series", "ensemble", "neural_network"]),
  tradeLane: z.string().max(100).optional(),
  inputFeatures: z.record(z.string(), z.unknown()).optional(),
  outputFormat: z.record(z.string(), z.unknown()).optional(),
  trainingDataFrom: z.string().optional(),
  trainingDataTo: z.string().optional(),
  accuracy: z.number().int().min(0).max(100).optional(),
  confidenceThreshold: z.number().int().min(0).max(100).optional(),
  predictedRate: z.number().int().optional(),
  suggestedRate: z.number().int().optional(),
  currency: z.string().max(3).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
});
export const updateAiPricingModelSchema = createAiPricingModelSchema.partial();

// ==========================================
// VSA Slot Rate schemas
// ==========================================
export const createVsaSlotRateSchema = z.object({
  vsaPartner: z.string().min(1).max(255),
  agreementReference: z.string().min(1).max(50),
  tradeLane: z.string().min(1).max(100),
  serviceName: z.string().max(255).optional(),
  containerType: z.string().max(20).optional(),
  containerSize: z.string().max(10).optional(),
  slotAllocationTeu: z.number().int().min(0).optional(),
  slotCostPerTeu: z.number().int(),
  utilizationPercent: z.number().int().min(0).max(100).optional(),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional(),
  currency: z.string().max(3).optional(),
  status: z.enum(["active", "expired", "suspended"]).optional(),
  notes: z.string().optional(),
});
export const updateVsaSlotRateSchema = createVsaSlotRateSchema.partial();

// ==========================================
// Dead Freight Record schemas
// ==========================================
export const createDeadFreightRecordSchema = z.object({
  recordReference: z.string().min(1).max(50),
  voyageReference: z.string().max(50).optional(),
  bookingReference: z.string().max(50).optional(),
  customerId: z.string().uuid().optional(),
  tradeLane: z.string().max(100).optional(),
  bookedTeu: z.number().int().min(0),
  actualTeu: z.number().int().min(0),
  shortShippedTeu: z.number().int().min(0),
  ratePerTeu: z.number().int(),
  deadFreightAmount: z.number().int(),
  recoveredAmount: z.number().int().min(0).optional(),
  currency: z.string().max(3).optional(),
  waiverReason: z.string().max(255).optional(),
  waivedAmount: z.number().int().min(0).optional(),
  invoiceId: z.string().uuid().optional(),
  status: z.enum(["calculated", "invoiced", "partially_recovered", "recovered", "waived"]).optional(),
  notes: z.string().optional(),
});
export const updateDeadFreightRecordSchema = createDeadFreightRecordSchema.partial();

// ==========================================
// Revenue Leakage schemas
// ==========================================
export const createRevenueLeakageSchema = z.object({
  leakageReference: z.string().min(1).max(50),
  leakageType: z.enum(["rate_deviation", "missing_surcharge", "incorrect_billing", "unapplied_charge", "weight_discrepancy", "other"]),
  detectedDate: z.string(),
  bookingReference: z.string().max(50).optional(),
  invoiceReference: z.string().max(50).optional(),
  customerId: z.string().uuid().optional(),
  tradeLane: z.string().max(100).optional(),
  expectedAmount: z.number().int(),
  actualAmount: z.number().int(),
  leakageAmount: z.number().int(),
  currency: z.string().max(3).optional(),
  rootCause: z.string().max(255).optional(),
  correctionAction: z.string().optional(),
  recoveredAmount: z.number().int().min(0).optional(),
  assignedTo: z.string().uuid().optional(),
  status: z.enum(["detected", "investigating", "confirmed", "recovered", "written_off"]).optional(),
  notes: z.string().optional(),
});
export const updateRevenueLeakageSchema = createRevenueLeakageSchema.partial();

// ==========================================
// Pricing Approval schemas
// ==========================================
export const createPricingApprovalSchema = z.object({
  approvalReference: z.string().min(1).max(50),
  approvalType: z.enum(["rate_deviation", "special_rate", "discount", "waiver", "surcharge_exemption"]),
  entityType: z.enum(["tariff", "special_rate", "surcharge", "dead_freight", "quotation"]),
  entityId: z.string().uuid(),
  requestedBy: z.string().uuid(),
  currentLevel: z.number().int().min(1).optional(),
  maxLevel: z.number().int().min(1).optional(),
  deviationPercent: z.number().int().optional(),
  originalAmount: z.number().int().optional(),
  requestedAmount: z.number().int().optional(),
  currency: z.string().max(3).optional(),
  urgency: z.enum(["low", "normal", "high", "critical"]).optional(),
  status: z.enum(["pending", "approved", "rejected", "escalated"]).optional(),
  notes: z.string().optional(),
});
export const updatePricingApprovalSchema = createPricingApprovalSchema.partial();
