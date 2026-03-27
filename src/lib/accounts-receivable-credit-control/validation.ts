import { z } from "zod/v4";
import { metadataSchema } from "@/lib/validation";

// ==========================================
// Customer Accounts
// ==========================================

export const createCustomerAccountSchema = z.object({
  customerName: z.string().min(1).max(255),
  customerCode: z.string().max(50).optional(),
  tradingName: z.string().max(255).optional(),
  registrationNumber: z.string().max(100).optional(),
  taxId: z.string().max(50).optional(),
  industry: z.string().max(100).optional(),
  segment: z.enum(["enterprise", "mid_market", "sme", "retail", "government", "other"]).optional(),
  currency: z.string().max(3).optional(),
  paymentTerms: z.string().max(50).optional(),
  billingAddress: z.string().optional(),
  billingEmail: z.string().max(255).optional(),
  billingPhone: z.string().max(50).optional(),
  primaryContact: z.string().max(255).optional(),
  accountManagerId: z.string().uuid().optional(),
  accountManagerName: z.string().max(255).optional(),
  accountStatus: z.enum(["active", "inactive", "suspended", "closed"]).optional(),
  onHold: z.boolean().optional(),
  holdReason: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateCustomerAccountSchema = createCustomerAccountSchema.partial();

// ==========================================
// Credit Limits
// ==========================================

export const createCreditLimitSchema = z.object({
  accountId: z.string().uuid(),
  accountNumber: z.string().min(1).max(50),
  customerName: z.string().min(1).max(255),
  currency: z.string().max(3).optional(),
  creditLimit: z.number().int(),
  riskCategory: z.enum(["low", "standard", "medium", "high", "critical"]).optional(),
  riskScore: z.number().int().optional(),
  riskFactors: z.record(z.string(), z.unknown()).optional(),
  creditInsured: z.boolean().optional(),
  insurerName: z.string().max(255).optional(),
  insuredAmount: z.number().int().optional(),
  insurancePolicyRef: z.string().max(100).optional(),
  insuranceExpiryDate: z.coerce.date().optional(),
  nextReviewDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateCreditLimitSchema = createCreditLimitSchema.partial();

// ==========================================
// Aging Reports
// ==========================================

export const createAgingReportSchema = z.object({
  reportType: z.enum(["summary", "detailed", "customer", "segment", "currency", "custom"]),
  reportDate: z.coerce.date(),
  currency: z.string().max(3).optional(),
  filterCriteria: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateAgingReportSchema = createAgingReportSchema.partial();

// ==========================================
// Cash Applications
// ==========================================

export const createCashApplicationSchema = z.object({
  accountId: z.string().uuid().optional(),
  accountNumber: z.string().max(50).optional(),
  customerName: z.string().min(1).max(255),
  paymentReference: z.string().min(1).max(100),
  paymentMethod: z.enum(["bank_transfer", "cheque", "cash", "credit_card", "direct_debit", "lc", "other"]),
  paymentDate: z.coerce.date(),
  currency: z.string().max(3).optional(),
  paymentAmount: z.number().int(),
  bankReference: z.string().max(100).optional(),
  bankAccount: z.string().max(50).optional(),
  exchangeRate: z.number().int().optional(),
  baseCurrencyAmount: z.number().int().optional(),
  allocations: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateCashApplicationSchema = createCashApplicationSchema.partial();

// ==========================================
// Collection Workflows
// ==========================================

export const createCollectionWorkflowSchema = z.object({
  accountId: z.string().uuid().optional(),
  accountNumber: z.string().max(50).optional(),
  customerName: z.string().min(1).max(255),
  currency: z.string().max(3).optional(),
  totalOutstanding: z.number().int(),
  totalOverdue: z.number().int().optional(),
  oldestOverdueDays: z.number().int().optional(),
  invoiceCount: z.number().int().optional(),
  escalationLevel: z.number().int().min(1).max(5).optional(),
  escalationType: z.enum(["standard", "accelerated", "legal", "external_agency", "write_off_review"]),
  assignedTo: z.string().uuid().optional(),
  assignedToName: z.string().max(255).optional(),
  nextActionDate: z.coerce.date().optional(),
  nextActionType: z.enum(["reminder", "phone_call", "demand_letter", "meeting", "legal_notice", "escalate"]).optional(),
  promisedDate: z.coerce.date().optional(),
  promisedAmount: z.number().int().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateCollectionWorkflowSchema = createCollectionWorkflowSchema.partial();

// ==========================================
// Bad Debt Provisions
// ==========================================

export const createBadDebtProvisionSchema = z.object({
  provisionType: z.enum(["general", "specific", "write_off", "recovery"]),
  accountId: z.string().uuid().optional(),
  accountNumber: z.string().max(50).optional(),
  customerName: z.string().min(1).max(255),
  invoiceRef: z.string().max(50).optional(),
  currency: z.string().max(3).optional(),
  originalAmount: z.number().int(),
  provisionAmount: z.number().int(),
  provisionPercent: z.number().int().optional(),
  agingBucket: z.enum(["current", "1_30", "31_60", "61_90", "91_120", "over_120"]).optional(),
  reason: z.string().optional(),
  glAccountCode: z.string().max(20).optional(),
  accountingPeriod: z.string().max(10).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateBadDebtProvisionSchema = createBadDebtProvisionSchema.partial();

// ==========================================
// Payment Predictions
// ==========================================

export const createPaymentPredictionSchema = z.object({
  accountId: z.string().uuid().optional(),
  accountNumber: z.string().max(50).optional(),
  customerName: z.string().min(1).max(255),
  invoiceRef: z.string().max(50).optional(),
  currency: z.string().max(3).optional(),
  invoiceAmount: z.number().int(),
  outstandingAmount: z.number().int(),
  predictedPaymentDate: z.coerce.date().optional(),
  predictedAmount: z.number().int().optional(),
  paymentProbability: z.number().int().min(0).max(100).optional(),
  defaultProbability: z.number().int().min(0).max(100).optional(),
  paymentScore: z.number().int().optional(),
  riskScore: z.number().int().optional(),
  behaviorScore: z.number().int().optional(),
  aiModelVersion: z.string().max(50).optional(),
  confidenceScore: z.number().int().min(0).max(100).optional(),
  features: z.record(z.string(), z.unknown()).optional(),
  predictionFactors: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updatePaymentPredictionSchema = createPaymentPredictionSchema.partial();

// ==========================================
// Cash Flow Forecasts
// ==========================================

export const createCashFlowForecastSchema = z.object({
  forecastPeriod: z.string().min(1).max(10),
  forecastYear: z.number().int().min(2020).max(2050),
  forecastMonth: z.number().int().min(1).max(12),
  forecastWeek: z.number().int().min(1).max(53).optional(),
  currency: z.string().max(3).optional(),
  openingBalance: z.number().int().optional(),
  expectedInflows: z.number().int().optional(),
  confirmedInflows: z.number().int().optional(),
  probableInflows: z.number().int().optional(),
  atRiskInflows: z.number().int().optional(),
  expectedOutflows: z.number().int().optional(),
  forecastMethod: z.enum(["historical_trend", "ai_model", "manual", "weighted_pipeline", "regression", "hybrid"]),
  aiModelVersion: z.string().max(50).optional(),
  confidenceScore: z.number().int().min(0).max(100).optional(),
  assumptions: z.record(z.string(), z.unknown()).optional(),
  scenarioType: z.enum(["base", "optimistic", "pessimistic", "stress"]).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateCashFlowForecastSchema = createCashFlowForecastSchema.partial();
