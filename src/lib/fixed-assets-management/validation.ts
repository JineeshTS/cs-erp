import { z } from "zod/v4";
import { metadataSchema } from "@/lib/validation";

// ==========================================
// Asset Registry
// ==========================================
export const createAssetRegistrySchema = z.object({
  assetType: z.enum(["vessel", "container", "equipment", "vehicle", "building", "land", "furniture", "it_equipment"]),
  assetName: z.string().min(1).max(255),
  description: z.string().optional(),
  serialNumber: z.string().max(100).optional(),
  barcode: z.string().max(100).optional(),
  category: z.string().max(255).optional(),
  subCategory: z.string().max(255).optional(),
  location: z.string().max(255).optional(),
  department: z.string().max(255).optional(),
  custodian: z.string().max(255).optional(),
  acquisitionDate: z.coerce.date().optional(),
  acquisitionCost: z.string().optional(),
  residualValue: z.string().optional(),
  usefulLifeMonths: z.number().int().optional(),
  currentBookValue: z.string().optional(),
  currency: z.string().max(3).optional(),
  depreciationMethod: z.enum(["straight_line", "declining_balance", "units_of_production", "sum_of_years"]).optional(),
  warrantyExpiry: z.coerce.date().optional(),
  condition: z.enum(["new", "good", "fair", "poor", "decommissioned"]).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateAssetRegistrySchema = createAssetRegistrySchema.partial();

// ==========================================
// Depreciation Schedules
// ==========================================
export const createDepreciationScheduleSchema = z.object({
  scheduleType: z.enum(["straight_line", "declining_balance", "units_of_production", "sum_of_years", "custom"]),
  assetRef: z.string().max(50).optional(),
  assetName: z.string().max(255).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  originalCost: z.string().optional(),
  residualValue: z.string().optional(),
  depreciableAmount: z.string().optional(),
  usefulLifeMonths: z.number().int().optional(),
  monthlyDepreciation: z.string().optional(),
  annualDepreciation: z.string().optional(),
  accumulatedDepreciation: z.string().optional(),
  currentBookValue: z.string().optional(),
  currency: z.string().max(3).optional(),
  depreciationRate: z.string().optional(),
  lastCalculatedDate: z.coerce.date().optional(),
  entries: z.array(z.record(z.string(), z.unknown())).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateDepreciationScheduleSchema = createDepreciationScheduleSchema.partial();

// ==========================================
// Asset Disposals
// ==========================================
export const createAssetDisposalSchema = z.object({
  disposalType: z.enum(["sale", "scrap", "donation", "trade_in", "write_off", "theft_loss"]),
  assetRef: z.string().max(50).optional(),
  assetName: z.string().max(255).optional(),
  disposalDate: z.coerce.date().optional(),
  bookValueAtDisposal: z.string().optional(),
  saleProceeds: z.string().optional(),
  gainLoss: z.string().optional(),
  currency: z.string().max(3).optional(),
  buyerName: z.string().max(255).optional(),
  buyerContact: z.string().max(255).optional(),
  disposalReason: z.string().optional(),
  approvedBy: z.string().max(255).optional(),
  approvalDate: z.coerce.date().optional(),
  certificateRef: z.string().max(100).optional(),
  environmentalCompliance: z.boolean().optional(),
  journalEntryRef: z.string().max(100).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateAssetDisposalSchema = createAssetDisposalSchema.partial();

// ==========================================
// Insurance & Valuation
// ==========================================
export const createInsuranceValuationSchema = z.object({
  recordType: z.enum(["insurance_policy", "revaluation", "appraisal", "market_value", "replacement_cost"]),
  assetRef: z.string().max(50).optional(),
  assetName: z.string().max(255).optional(),
  insurer: z.string().max(255).optional(),
  policyNumber: z.string().max(100).optional(),
  coverageType: z.string().max(100).optional(),
  coverageAmount: z.string().optional(),
  premiumAmount: z.string().optional(),
  deductible: z.string().optional(),
  currency: z.string().max(3).optional(),
  policyStartDate: z.coerce.date().optional(),
  policyEndDate: z.coerce.date().optional(),
  valuationDate: z.coerce.date().optional(),
  valuationAmount: z.string().optional(),
  valuedBy: z.string().max(255).optional(),
  valuationMethod: z.string().max(100).optional(),
  nextReviewDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateInsuranceValuationSchema = createInsuranceValuationSchema.partial();

// ==========================================
// Maintenance Schedules
// ==========================================
export const createMaintenanceScheduleSchema = z.object({
  maintenanceType: z.enum(["preventive", "corrective", "predictive", "condition_based", "overhaul"]),
  assetRef: z.string().max(50).optional(),
  assetName: z.string().max(255).optional(),
  scheduledDate: z.coerce.date().optional(),
  completedDate: z.coerce.date().optional(),
  frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "annually", "ad_hoc"]).optional(),
  assignedTo: z.string().max(255).optional(),
  vendor: z.string().max(255).optional(),
  estimatedCost: z.string().optional(),
  actualCost: z.string().optional(),
  currency: z.string().max(3).optional(),
  workDescription: z.string().optional(),
  partsUsed: z.array(z.record(z.string(), z.unknown())).optional(),
  downtime: z.string().optional(),
  nextScheduledDate: z.coerce.date().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateMaintenanceScheduleSchema = createMaintenanceScheduleSchema.partial();

// ==========================================
// CAPEX vs OPEX Classification
// ==========================================
export const createCapexOpexClassificationSchema = z.object({
  classificationType: z.enum(["capex", "opex", "mixed", "reclassification"]),
  title: z.string().min(1).max(255),
  expenditureDate: z.coerce.date().optional(),
  amount: z.string().optional(),
  currency: z.string().max(3).optional(),
  assetRef: z.string().max(50).optional(),
  assetName: z.string().max(255).optional(),
  costCenter: z.string().max(100).optional(),
  glAccountCode: z.string().max(50).optional(),
  justification: z.string().optional(),
  capitalizationThreshold: z.string().optional(),
  usefulLifeExtension: z.number().int().optional(),
  improvementValue: z.string().optional(),
  classifiedBy: z.string().max(255).optional(),
  approvedBy: z.string().max(255).optional(),
  approvalDate: z.coerce.date().optional(),
  journalEntryRef: z.string().max(100).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateCapexOpexClassificationSchema = createCapexOpexClassificationSchema.partial();

// ==========================================
// Impairment Tests
// ==========================================
export const createImpairmentTestSchema = z.object({
  testType: z.enum(["annual", "triggered", "interim", "goodwill", "cgu"]),
  assetRef: z.string().max(50).optional(),
  assetName: z.string().max(255).optional(),
  testDate: z.coerce.date().optional(),
  carryingAmount: z.string().optional(),
  recoverableAmount: z.string().optional(),
  fairValueLessCosts: z.string().optional(),
  valueInUse: z.string().optional(),
  impairmentLoss: z.string().optional(),
  currency: z.string().max(3).optional(),
  discountRate: z.string().optional(),
  cashFlowProjections: z.array(z.record(z.string(), z.unknown())).optional(),
  triggerIndicators: z.array(z.record(z.string(), z.unknown())).optional(),
  reversalAmount: z.string().optional(),
  testedBy: z.string().max(255).optional(),
  reviewedBy: z.string().max(255).optional(),
  journalEntryRef: z.string().max(100).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateImpairmentTestSchema = createImpairmentTestSchema.partial();

// ==========================================
// Lease Accounting (IFRS16)
// ==========================================
export const createLeaseAccountingSchema = z.object({
  leaseType: z.enum(["finance_lease", "operating_lease", "short_term", "low_value", "sublease"]),
  assetRef: z.string().max(50).optional(),
  assetName: z.string().max(255).optional(),
  lessorName: z.string().max(255).optional(),
  leaseStartDate: z.coerce.date().optional(),
  leaseEndDate: z.coerce.date().optional(),
  leaseTermMonths: z.number().int().optional(),
  monthlyPayment: z.string().optional(),
  annualPayment: z.string().optional(),
  totalLeasePayments: z.string().optional(),
  discountRate: z.string().optional(),
  rouAssetValue: z.string().optional(),
  leaseLiability: z.string().optional(),
  accumulatedDepreciation: z.string().optional(),
  interestExpense: z.string().optional(),
  currency: z.string().max(3).optional(),
  renewalOption: z.boolean().optional(),
  purchaseOption: z.boolean().optional(),
  terminationOption: z.boolean().optional(),
  paymentSchedule: z.array(z.record(z.string(), z.unknown())).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateLeaseAccountingSchema = createLeaseAccountingSchema.partial();
