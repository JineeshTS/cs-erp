import { z } from "zod/v4";
import { metadataSchema } from "@/lib/validation";

// ==========================================
// Terminal Handling Charge THC Management
// ==========================================
export const createTerminalHandlingChargeSchema = z.object({
  chargeType: z.enum(["origin_thc", "destination_thc", "transshipment_thc", "reefer_thc", "hazardous_thc"]),
  portCode: z.string().max(20).optional(),
  portName: z.string().max(255).optional(),
  terminalName: z.string().max(255).optional(),
  terminalCode: z.string().max(50).optional(),
  containerSize: z.string().max(20).optional(),
  containerType: z.string().max(50).optional(),
  cargoCategory: z.string().max(50).optional(),
  chargeAmountBase: z.string().optional(),
  chargeCurrency: z.string().max(3).optional(),
  chargePerUnit: z.string().max(20).optional(),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional(),
  surchargePercentage: z.string().optional(),
  peakSeasonMultiplier: z.string().optional(),
  exemptionApplicable: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateTerminalHandlingChargeSchema = createTerminalHandlingChargeSchema.partial();

// ==========================================
// Port Dues & Wharfage Calculation
// ==========================================
export const createPortDuesWharfageSchema = z.object({
  duesType: z.enum(["port_dues", "wharfage", "anchorage", "berth_hire", "channel_dues"]),
  portCode: z.string().max(20).optional(),
  portName: z.string().max(255).optional(),
  vesselName: z.string().max(255).optional(),
  vesselGrt: z.string().optional(),
  vesselNrt: z.string().optional(),
  vesselLoa: z.string().optional(),
  ratePerGrt: z.string().optional(),
  ratePerNrt: z.string().optional(),
  calculatedAmount: z.string().optional(),
  duesCurrency: z.string().max(3).optional(),
  berthingHours: z.number().int().optional(),
  discountPercentage: z.string().optional(),
  effectiveDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updatePortDuesWharfageSchema = createPortDuesWharfageSchema.partial();

// ==========================================
// Pilotage Towage & Mooring Charges
// ==========================================
export const createPilotageTowageChargeSchema = z.object({
  chargeType: z.enum(["pilotage_inbound", "pilotage_outbound", "towage", "mooring", "unmooring"]),
  portCode: z.string().max(20).optional(),
  portName: z.string().max(255).optional(),
  vesselName: z.string().max(255).optional(),
  vesselGrt: z.string().optional(),
  vesselLoa: z.string().optional(),
  numberOfTugs: z.number().int().optional(),
  tugHours: z.string().optional(),
  pilotageDistance: z.string().optional(),
  ratePerGrt: z.string().optional(),
  baseCharge: z.string().optional(),
  calculatedAmount: z.string().optional(),
  chargeCurrency: z.string().max(3).optional(),
  nightSurcharge: z.boolean().optional(),
  weekendSurcharge: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updatePilotageTowageChargeSchema = createPilotageTowageChargeSchema.partial();

// ==========================================
// Storage & Demurrage Tariff
// ==========================================
export const createStorageDemurrageTariffSchema = z.object({
  tariffType: z.enum(["import_storage", "export_storage", "demurrage", "detention", "combined"]),
  portCode: z.string().max(20).optional(),
  portName: z.string().max(255).optional(),
  terminalName: z.string().max(255).optional(),
  containerSize: z.string().max(20).optional(),
  containerType: z.string().max(50).optional(),
  freeDays: z.number().int().optional(),
  dailyRateTier1: z.string().optional(),
  tier1DaysFrom: z.number().int().optional(),
  tier1DaysTo: z.number().int().optional(),
  dailyRateTier2: z.string().optional(),
  tier2DaysFrom: z.number().int().optional(),
  tier2DaysTo: z.number().int().optional(),
  dailyRateTier3: z.string().optional(),
  tariffCurrency: z.string().max(3).optional(),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateStorageDemurrageTariffSchema = createStorageDemurrageTariffSchema.partial();

// ==========================================
// Port Tariff Comparison & Benchmarking
// ==========================================
export const createTariffComparisonSchema = z.object({
  comparisonType: z.enum(["port_vs_port", "terminal_vs_terminal", "historical_trend", "regional_benchmark", "global_index"]),
  basePortCode: z.string().max(20).optional(),
  basePortName: z.string().max(255).optional(),
  comparePortCode: z.string().max(20).optional(),
  comparePortName: z.string().max(255).optional(),
  chargeCategory: z.string().max(50).optional(),
  basePortCost: z.string().optional(),
  comparePortCost: z.string().optional(),
  differenceAmount: z.string().optional(),
  differencePercentage: z.string().optional(),
  benchmarkCurrency: z.string().max(3).optional(),
  periodFrom: z.coerce.date().optional(),
  periodTo: z.coerce.date().optional(),
  recommendation: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateTariffComparisonSchema = createTariffComparisonSchema.partial();

// ==========================================
// Terminal Invoice Validation & Dispute
// ==========================================
export const createInvoiceValidationSchema = z.object({
  validationType: z.enum(["auto_validation", "manual_review", "dispute_raised", "dispute_resolved", "credit_note"]),
  invoiceNumber: z.string().max(100).optional(),
  terminalName: z.string().max(255).optional(),
  portCode: z.string().max(20).optional(),
  invoiceDate: z.coerce.date().optional(),
  invoiceAmountClaimed: z.string().optional(),
  calculatedAmount: z.string().optional(),
  varianceAmount: z.string().optional(),
  variancePercentage: z.string().optional(),
  invoiceCurrency: z.string().max(3).optional(),
  disputeReason: z.string().optional(),
  resolutionDate: z.coerce.date().optional(),
  resolvedAmount: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateInvoiceValidationSchema = createInvoiceValidationSchema.partial();

// ==========================================
// AI Port Cost Optimization Recommendations
// ==========================================
export const createCostOptimizationSchema = z.object({
  optimizationType: z.enum(["route_optimization", "terminal_switch", "timing_optimization", "volume_discount", "negotiation_leverage"]),
  portCode: z.string().max(20).optional(),
  portName: z.string().max(255).optional(),
  currentCost: z.string().optional(),
  optimizedCost: z.string().optional(),
  projectedSavings: z.string().optional(),
  savingsPercentage: z.string().optional(),
  optimizationCurrency: z.string().max(3).optional(),
  confidenceScore: z.string().optional(),
  implementationDifficulty: z.string().max(20).optional(),
  timelineWeeks: z.number().int().optional(),
  recommendation: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateCostOptimizationSchema = createCostOptimizationSchema.partial();

// ==========================================
// Port Budget Planning & Control
// ==========================================
export const createBudgetPlanningSchema = z.object({
  budgetType: z.enum(["annual_budget", "quarterly_forecast", "monthly_actual", "variance_analysis", "rolling_forecast"]),
  portCode: z.string().max(20).optional(),
  portName: z.string().max(255).optional(),
  fiscalYear: z.number().int().optional(),
  fiscalPeriod: z.string().max(20).optional(),
  budgetedAmount: z.string().optional(),
  actualAmount: z.string().optional(),
  varianceAmount: z.string().optional(),
  variancePercentage: z.string().optional(),
  budgetCurrency: z.string().max(3).optional(),
  costCategory: z.string().max(50).optional(),
  forecastedAmount: z.string().optional(),
  approvedBy: z.string().max(255).optional(),
  approvalDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateBudgetPlanningSchema = createBudgetPlanningSchema.partial();
