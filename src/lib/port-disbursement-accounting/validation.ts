import { z } from "zod/v4";
import { metadataSchema } from "@/lib/validation";

// ==========================================
// Proforma DA Estimates
// ==========================================

export const createProformaEstimateSchema = z.object({
  voyageRef: z.string().max(50).optional(),
  vesselName: z.string().min(1).max(255),
  portCode: z.string().min(1).max(10),
  portName: z.string().min(1).max(255),
  callPurpose: z.enum(["loading", "discharge", "bunkering", "drydock", "transshipment", "crew_change", "other"]),
  agentName: z.string().max(255).optional(),
  currency: z.string().max(3).optional(),
  portDues: z.number().int().optional(),
  pilotage: z.number().int().optional(),
  towage: z.number().int().optional(),
  berthHire: z.number().int().optional(),
  cargoHandling: z.number().int().optional(),
  agencyFees: z.number().int().optional(),
  customs: z.number().int().optional(),
  miscellaneous: z.number().int().optional(),
  totalEstimate: z.number().int(),
  lineItems: z.record(z.string(), z.unknown()).optional(),
  exchangeRate: z.number().int().optional(),
  baseCurrencyAmount: z.number().int().optional(),
  estimateDate: z.coerce.date(),
  validUntil: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateProformaEstimateSchema = createProformaEstimateSchema.partial();

// ==========================================
// Final DAs
// ==========================================

export const createFinalDaSchema = z.object({
  proformaRef: z.string().max(50).optional(),
  voyageRef: z.string().max(50).optional(),
  vesselName: z.string().min(1).max(255),
  portCode: z.string().min(1).max(10),
  portName: z.string().min(1).max(255),
  agentName: z.string().max(255).optional(),
  currency: z.string().max(3).optional(),
  portDues: z.number().int().optional(),
  pilotage: z.number().int().optional(),
  towage: z.number().int().optional(),
  berthHire: z.number().int().optional(),
  cargoHandling: z.number().int().optional(),
  agencyFees: z.number().int().optional(),
  customs: z.number().int().optional(),
  miscellaneous: z.number().int().optional(),
  totalActual: z.number().int(),
  lineItems: z.record(z.string(), z.unknown()).optional(),
  exchangeRate: z.number().int().optional(),
  baseCurrencyAmount: z.number().int().optional(),
  invoiceRef: z.string().max(100).optional(),
  invoiceDate: z.coerce.date().optional(),
  receivedDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateFinalDaSchema = createFinalDaSchema.partial();

// ==========================================
// Port Costs
// ==========================================

export const createPortCostSchema = z.object({
  portCode: z.string().min(1).max(10),
  portName: z.string().min(1).max(255),
  costCategory: z.enum(["port_dues", "pilotage", "towage", "berth_hire", "cargo_handling", "agency_fees", "customs", "quarantine", "anchorage", "other"]),
  costType: z.enum(["fixed", "variable", "tiered", "percentage"]),
  description: z.string().optional(),
  currency: z.string().max(3).optional(),
  unitRate: z.number().int(),
  unitOfMeasure: z.string().max(30).optional(),
  minimumCharge: z.number().int().optional(),
  maximumCharge: z.number().int().optional(),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional(),
  vesselSizeFrom: z.number().int().optional(),
  vesselSizeTo: z.number().int().optional(),
  cargoTypeApplicable: z.string().max(50).optional(),
  rateSchedule: z.record(z.string(), z.unknown()).optional(),
  sourceDocument: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updatePortCostSchema = createPortCostSchema.partial();

// ==========================================
// Agent Statements
// ==========================================

export const createAgentStatementSchema = z.object({
  agentName: z.string().min(1).max(255),
  agentCode: z.string().max(50).optional(),
  portCode: z.string().max(10).optional(),
  portName: z.string().max(255).optional(),
  statementDate: z.coerce.date(),
  periodFrom: z.coerce.date().optional(),
  periodTo: z.coerce.date().optional(),
  currency: z.string().max(3).optional(),
  openingBalance: z.number().int().optional(),
  totalDebits: z.number().int().optional(),
  totalCredits: z.number().int().optional(),
  closingBalance: z.number().int(),
  transactionCount: z.number().int().optional(),
  lineItems: z.record(z.string(), z.unknown()).optional(),
  advancePaid: z.number().int().optional(),
  balanceDue: z.number().int().optional(),
  dueDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateAgentStatementSchema = createAgentStatementSchema.partial();

// ==========================================
// Expense Allocations
// ==========================================

export const createExpenseAllocationSchema = z.object({
  voyageRef: z.string().max(50).optional(),
  vesselName: z.string().min(1).max(255),
  portCode: z.string().min(1).max(10),
  portName: z.string().min(1).max(255),
  fdaRef: z.string().max(50).optional(),
  currency: z.string().max(3).optional(),
  totalPortCost: z.number().int(),
  allocationMethod: z.enum(["pro_rata", "weight_based", "teu_based", "revenue_based", "equal", "manual"]),
  allocationBasis: z.string().max(30).optional(),
  allocatedToCargo: z.number().int().optional(),
  allocatedToVessel: z.number().int().optional(),
  allocatedToOverhead: z.number().int().optional(),
  allocationDetails: z.record(z.string(), z.unknown()).optional(),
  costCentre: z.string().max(50).optional(),
  glAccountCode: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateExpenseAllocationSchema = createExpenseAllocationSchema.partial();

// ==========================================
// Variance Analyses
// ==========================================

export const createVarianceAnalysisSchema = z.object({
  proformaRef: z.string().max(50).optional(),
  fdaRef: z.string().max(50).optional(),
  vesselName: z.string().min(1).max(255),
  portCode: z.string().min(1).max(10),
  portName: z.string().min(1).max(255),
  currency: z.string().max(3).optional(),
  pdaTotal: z.number().int(),
  fdaTotal: z.number().int(),
  deviationThreshold: z.number().int().min(0).max(100).optional(),
  rootCauseAnalysis: z.string().optional(),
  recommendations: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateVarianceAnalysisSchema = createVarianceAnalysisSchema.partial();

// ==========================================
// Cost Benchmarks
// ==========================================

export const createCostBenchmarkSchema = z.object({
  portCode: z.string().min(1).max(10),
  portName: z.string().min(1).max(255),
  costCategory: z.enum(["port_dues", "pilotage", "towage", "berth_hire", "cargo_handling", "agency_fees", "customs", "quarantine", "anchorage", "total"]),
  benchmarkPeriod: z.string().min(1).max(10),
  benchmarkYear: z.number().int().min(2020).max(2050),
  benchmarkMonth: z.number().int().min(1).max(12),
  currency: z.string().max(3).optional(),
  averageCost: z.number().int(),
  medianCost: z.number().int().optional(),
  minimumCost: z.number().int().optional(),
  maximumCost: z.number().int().optional(),
  sampleSize: z.number().int().optional(),
  aiModelVersion: z.string().max(50).optional(),
  dataSource: z.string().max(100).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateCostBenchmarkSchema = createCostBenchmarkSchema.partial();

// ==========================================
// Consolidated Reports
// ==========================================

export const createConsolidatedReportSchema = z.object({
  reportType: z.enum(["monthly", "quarterly", "annual", "voyage", "port", "agent", "custom"]),
  reportPeriod: z.string().min(1).max(10),
  reportYear: z.number().int().min(2020).max(2050),
  reportMonth: z.number().int().min(1).max(12),
  currency: z.string().max(3).optional(),
  aiModelVersion: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateConsolidatedReportSchema = createConsolidatedReportSchema.partial();
