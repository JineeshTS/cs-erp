import { z } from "zod/v4";
import { metadataSchema } from "@/lib/validation";

// ==========================================
// Voyage Budgets
// ==========================================

export const createVoyageBudgetSchema = z.object({
  voyageRef: z.string().min(1).max(50),
  vesselName: z.string().min(1).max(255),
  vesselImo: z.string().max(20).optional(),
  serviceRoute: z.string().max(100).optional(),
  budgetType: z.enum(["preliminary", "final", "revised", "supplementary"]),
  currency: z.string().max(3).optional(),
  bunkerCost: z.number().int().optional(),
  portCost: z.number().int().optional(),
  canalCost: z.number().int().optional(),
  crewCost: z.number().int().optional(),
  insuranceCost: z.number().int().optional(),
  otherCost: z.number().int().optional(),
  totalBudget: z.number().int(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateVoyageBudgetSchema = createVoyageBudgetSchema.partial();

// ==========================================
// Port Disbursements
// ==========================================

export const createPortDisbursementSchema = z.object({
  voyageRef: z.string().max(50).optional(),
  vesselName: z.string().min(1).max(255),
  port: z.string().min(1).max(50),
  agentName: z.string().max(255).optional(),
  disbursementType: z.enum(["pda", "fda", "supplementary"]),
  currency: z.string().max(3).optional(),
  pdaAmount: z.number().int().optional(),
  fdaAmount: z.number().int().optional(),
  portDues: z.number().int().optional(),
  pilotage: z.number().int().optional(),
  towage: z.number().int().optional(),
  berth: z.number().int().optional(),
  cargoHandling: z.number().int().optional(),
  agencyFee: z.number().int().optional(),
  otherCharges: z.number().int().optional(),
  totalAmount: z.number().int(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updatePortDisbursementSchema = createPortDisbursementSchema.partial();

// ==========================================
// Revenue Recognitions
// ==========================================

export const createRevenueRecognitionSchema = z.object({
  voyageRef: z.string().max(50).optional(),
  bookingRef: z.string().max(50).optional(),
  blNumber: z.string().max(50).optional(),
  customerName: z.string().max(255).optional(),
  revenueType: z.enum(["freight", "demurrage", "detention", "surcharge", "reefer", "documentation", "other"]),
  currency: z.string().max(3).optional(),
  grossRevenue: z.number().int(),
  deductions: z.number().int().optional(),
  netRevenue: z.number().int(),
  recognitionMethod: z.enum(["point_in_time", "over_time", "percentage_of_completion", "completed_voyage"]),
  performanceObligation: z.string().max(100).optional(),
  completionPercent: z.number().int().min(0).max(100).optional(),
  recognizedAmount: z.number().int(),
  deferredAmount: z.number().int().optional(),
  recognitionPeriod: z.string().max(20).optional(),
  journalEntryRef: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateRevenueRecognitionSchema = createRevenueRecognitionSchema.partial();

// ==========================================
// Agency Commissions
// ==========================================

export const createAgencyCommissionSchema = z.object({
  agentName: z.string().min(1).max(255),
  agentCode: z.string().max(50).optional(),
  voyageRef: z.string().max(50).optional(),
  port: z.string().max(50).optional(),
  commissionType: z.enum(["booking", "freight", "port", "documentation", "handling", "other"]),
  currency: z.string().max(3).optional(),
  baseAmount: z.number().int(),
  commissionRate: z.number().int(),
  commissionAmount: z.number().int(),
  taxAmount: z.number().int().optional(),
  netPayable: z.number().int(),
  invoiceRef: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateAgencyCommissionSchema = createAgencyCommissionSchema.partial();

// ==========================================
// Voyage P&L Reports
// ==========================================

export const createVoyagePnlSchema = z.object({
  voyageRef: z.string().min(1).max(50),
  vesselName: z.string().min(1).max(255),
  serviceRoute: z.string().max(100).optional(),
  currency: z.string().max(3).optional(),
  freightRevenue: z.number().int().optional(),
  demurrageRevenue: z.number().int().optional(),
  otherRevenue: z.number().int().optional(),
  totalRevenue: z.number().int(),
  bunkerCost: z.number().int().optional(),
  portCost: z.number().int().optional(),
  commissionCost: z.number().int().optional(),
  charterCost: z.number().int().optional(),
  overheadCost: z.number().int().optional(),
  otherCost: z.number().int().optional(),
  totalCost: z.number().int(),
  grossProfit: z.number().int(),
  netProfit: z.number().int(),
  profitMargin: z.number().int().optional(),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateVoyagePnlSchema = createVoyagePnlSchema.partial();

// ==========================================
// Container Costs
// ==========================================

export const createContainerCostSchema = z.object({
  containerNumber: z.string().min(1).max(20),
  containerType: z.string().max(30).optional(),
  voyageRef: z.string().max(50).optional(),
  bookingRef: z.string().max(50).optional(),
  costCategory: z.enum(["lease", "handling", "repositioning", "maintenance", "insurance", "storage", "other"]),
  currency: z.string().max(3).optional(),
  leaseCost: z.number().int().optional(),
  handlingCost: z.number().int().optional(),
  repositioningCost: z.number().int().optional(),
  maintenanceCost: z.number().int().optional(),
  insuranceCost: z.number().int().optional(),
  otherCost: z.number().int().optional(),
  totalCost: z.number().int(),
  allocationMethod: z.string().max(30).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateContainerCostSchema = createContainerCostSchema.partial();

// ==========================================
// Overhead Allocations
// ==========================================

export const createOverheadAllocationSchema = z.object({
  costCentre: z.string().min(1).max(50),
  allocationPeriod: z.string().min(1).max(20),
  allocationMethod: z.enum(["pro_rata", "direct", "activity_based", "headcount", "revenue_based", "floor_space", "manual"]),
  currency: z.string().max(3).optional(),
  totalOverhead: z.number().int(),
  allocatedAmount: z.number().int(),
  allocationBase: z.string().max(50).optional(),
  allocationFactor: z.number().int().optional(),
  targetEntity: z.string().max(50).optional(),
  targetRef: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateOverheadAllocationSchema = createOverheadAllocationSchema.partial();

// ==========================================
// Variance Analyses
// ==========================================

export const createVarianceAnalysisSchema = z.object({
  voyageRef: z.string().max(50).optional(),
  vesselName: z.string().max(255).optional(),
  costCentre: z.string().max(50).optional(),
  analysisPeriod: z.string().min(1).max(20),
  analysisType: z.enum(["voyage", "cost_centre", "department", "vessel", "service_route", "overall"]),
  currency: z.string().max(3).optional(),
  budgetAmount: z.number().int(),
  actualAmount: z.number().int(),
  varianceAmount: z.number().int(),
  variancePercent: z.number().int().optional(),
  varianceType: z.enum(["favorable", "unfavorable"]).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateVarianceAnalysisSchema = createVarianceAnalysisSchema.partial();

// ==========================================
// Cost Centres
// ==========================================

export const createCostCentreSchema = z.object({
  centreCode: z.string().min(1).max(30),
  centreName: z.string().min(1).max(255),
  parentId: z.string().uuid().optional(),
  centreType: z.enum(["vessel", "department", "project", "region", "service_route", "overhead", "other"]),
  department: z.string().max(100).optional(),
  managerId: z.string().uuid().optional(),
  managerName: z.string().max(255).optional(),
  currency: z.string().max(3).optional(),
  annualBudget: z.number().int().optional(),
  isActive: z.boolean().optional(),
  glAccountCode: z.string().max(30).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateCostCentreSchema = createCostCentreSchema.partial();

// ==========================================
// CAPEX Items
// ==========================================

export const createCapexItemSchema = z.object({
  assetName: z.string().min(1).max(255),
  assetCategory: z.enum(["vessel", "container", "equipment", "it_system", "building", "vehicle", "other"]),
  costCentre: z.string().max(50).optional(),
  currency: z.string().max(3).optional(),
  acquisitionCost: z.number().int(),
  residualValue: z.number().int().optional(),
  usefulLifeMonths: z.number().int().min(1),
  depreciationMethod: z.enum(["straight_line", "declining_balance", "units_of_production", "sum_of_years"]),
  acquisitionDate: z.coerce.date(),
  inServiceDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateCapexItemSchema = createCapexItemSchema.partial();

// ==========================================
// Anomaly Detections
// ==========================================

export const createAnomalyDetectionSchema = z.object({
  detectedEntity: z.string().min(1).max(50),
  entityRef: z.string().max(50).optional(),
  anomalyType: z.enum(["cost_spike", "revenue_drop", "margin_deviation", "budget_overrun", "unusual_pattern", "duplicate_entry", "other"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  currency: z.string().max(3).optional(),
  expectedAmount: z.number().int().optional(),
  actualAmount: z.number().int().optional(),
  deviationPercent: z.number().int().optional(),
  description: z.string().min(1),
  aiConfidence: z.number().int().min(0).max(100).optional(),
  modelVersion: z.string().max(20).optional(),
  suggestedAction: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateAnomalyDetectionSchema = createAnomalyDetectionSchema.partial();

// ==========================================
// KPI Reports
// ==========================================

export const createKpiReportSchema = z.object({
  reportName: z.string().min(1).max(255),
  reportType: z.enum(["monthly", "quarterly", "annual", "voyage", "service_route", "custom"]),
  reportPeriod: z.string().min(1).max(20),
  reportYear: z.number().int().min(2000).max(2100),
  reportMonth: z.number().int().min(1).max(12).optional(),
  currency: z.string().max(3).optional(),
  totalRevenue: z.number().int().optional(),
  totalCost: z.number().int().optional(),
  grossProfit: z.number().int().optional(),
  netProfit: z.number().int().optional(),
  ebitda: z.number().int().optional(),
  operatingRatio: z.number().int().optional(),
  revenuePerTeu: z.number().int().optional(),
  costPerTeu: z.number().int().optional(),
  kpiData: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateKpiReportSchema = createKpiReportSchema.partial();
