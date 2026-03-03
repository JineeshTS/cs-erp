import { z } from "zod/v4";

// ==========================================
// Bank Accounts
// ==========================================
export const createBankAccountSchema = z.object({
  accountType: z.enum(["current", "savings", "fixed_deposit", "nostro", "vostro", "escrow"]),
  bankName: z.string().min(1).max(255),
  accountNumber: z.string().max(50).optional(),
  iban: z.string().max(50).optional(),
  swiftCode: z.string().max(20).optional(),
  branchName: z.string().max(255).optional(),
  branchCode: z.string().max(50).optional(),
  currency: z.string().max(3).optional(),
  currentBalance: z.string().optional(),
  availableBalance: z.string().optional(),
  overdraftLimit: z.string().optional(),
  interestRate: z.string().optional(),
  accountHolder: z.string().max(255).optional(),
  entityId: z.string().max(100).optional(),
  glAccountCode: z.string().max(50).optional(),
  openingDate: z.coerce.date().optional(),
  closingDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateBankAccountSchema = createBankAccountSchema.partial();

// ==========================================
// Cash Positions
// ==========================================
export const createCashPositionSchema = z.object({
  positionType: z.enum(["daily", "weekly", "monthly", "forecast", "actual"]),
  positionDate: z.coerce.date().optional(),
  currency: z.string().max(3).optional(),
  openingBalance: z.string().optional(),
  totalInflows: z.string().optional(),
  totalOutflows: z.string().optional(),
  closingBalance: z.string().optional(),
  netCashFlow: z.string().optional(),
  minimumBalance: z.string().optional(),
  maximumBalance: z.string().optional(),
  bankAccountId: z.string().max(100).optional(),
  entityId: z.string().max(100).optional(),
  variance: z.string().optional(),
  variancePercentage: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateCashPositionSchema = createCashPositionSchema.partial();

// ==========================================
// Bank Reconciliations
// ==========================================
export const createBankReconciliationSchema = z.object({
  reconciliationType: z.enum(["auto", "manual", "hybrid", "ai_assisted"]),
  bankAccountRef: z.string().max(100).optional(),
  bankName: z.string().max(255).optional(),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
  statementBalance: z.string().optional(),
  bookBalance: z.string().optional(),
  reconciledBalance: z.string().optional(),
  unreconciledItems: z.number().int().optional(),
  matchedTransactions: z.number().int().optional(),
  currency: z.string().max(3).optional(),
  difference: z.string().optional(),
  reconciledBy: z.string().max(255).optional(),
  reconciledAt: z.coerce.date().optional(),
  approvedBy: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateBankReconciliationSchema = createBankReconciliationSchema.partial();

// ==========================================
// Cash Pooling & Sweeps
// ==========================================
export const createCashPoolingSweepSchema = z.object({
  sweepType: z.enum(["zero_balance", "target_balance", "threshold", "notional_pooling"]),
  poolName: z.string().max(255).optional(),
  masterAccountRef: z.string().max(100).optional(),
  sweepDirection: z.enum(["to_master", "from_master", "bidirectional"]).optional(),
  triggerBalance: z.string().optional(),
  targetBalance: z.string().optional(),
  sweepAmount: z.string().optional(),
  currency: z.string().max(3).optional(),
  frequency: z.enum(["daily", "weekly", "monthly", "on_demand"]).optional(),
  lastExecutedAt: z.coerce.date().optional(),
  nextScheduledAt: z.coerce.date().optional(),
  interestRate: z.string().optional(),
  totalPoolBalance: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateCashPoolingSweepSchema = createCashPoolingSweepSchema.partial();

// ==========================================
// FX Hedging & Exposures
// ==========================================
export const createFxHedgingExposureSchema = z.object({
  hedgeType: z.enum(["forward", "option", "swap", "natural_hedge", "cross_currency"]),
  baseCurrency: z.string().max(3).optional(),
  quoteCurrency: z.string().max(3).optional(),
  notionalAmount: z.string().optional(),
  hedgedAmount: z.string().optional(),
  spotRate: z.string().optional(),
  forwardRate: z.string().optional(),
  strikeRate: z.string().optional(),
  maturityDate: z.coerce.date().optional(),
  settlementDate: z.coerce.date().optional(),
  counterparty: z.string().max(255).optional(),
  dealReference: z.string().max(100).optional(),
  hedgeEffectiveness: z.string().optional(),
  unrealizedGainLoss: z.string().optional(),
  realizedGainLoss: z.string().optional(),
  exposureType: z.string().max(50).optional(),
  hedgeAccountingMethod: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateFxHedgingExposureSchema = createFxHedgingExposureSchema.partial();

// ==========================================
// Letters of Credit
// ==========================================
export const createLetterOfCreditSchema = z.object({
  lcType: z.enum(["irrevocable", "revocable", "standby", "transferable", "back_to_back", "revolving"]),
  issuingBank: z.string().max(255).optional(),
  advisingBank: z.string().max(255).optional(),
  confirmingBank: z.string().max(255).optional(),
  applicant: z.string().max(255).optional(),
  beneficiary: z.string().max(255).optional(),
  lcAmount: z.string().optional(),
  currency: z.string().max(3).optional(),
  issueDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  shipmentDeadline: z.coerce.date().optional(),
  presentationPeriod: z.number().int().optional(),
  partialShipment: z.boolean().optional(),
  transshipment: z.boolean().optional(),
  termsAndConditions: z.string().optional(),
  utilizationAmount: z.string().optional(),
  availableAmount: z.string().optional(),
  charges: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateLetterOfCreditSchema = createLetterOfCreditSchema.partial();

// ==========================================
// Bank Guarantees
// ==========================================
export const createBankGuaranteeSchema = z.object({
  bgType: z.enum(["performance", "advance_payment", "bid_bond", "financial", "customs", "retention"]),
  issuingBank: z.string().max(255).optional(),
  applicant: z.string().max(255).optional(),
  beneficiary: z.string().max(255).optional(),
  guaranteeAmount: z.string().optional(),
  currency: z.string().max(3).optional(),
  issueDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  claimDeadline: z.coerce.date().optional(),
  marginPercentage: z.string().optional(),
  marginAmount: z.string().optional(),
  commissionRate: z.string().optional(),
  commissionAmount: z.string().optional(),
  linkedContractRef: z.string().max(100).optional(),
  purpose: z.string().optional(),
  termsAndConditions: z.string().optional(),
  autoRenewal: z.boolean().optional(),
  renewalCount: z.number().int().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateBankGuaranteeSchema = createBankGuaranteeSchema.partial();

// ==========================================
// Intercompany Loans
// ==========================================
export const createIntercompanyLoanSchema = z.object({
  loanType: z.enum(["term_loan", "revolving", "demand", "subordinated", "bridge"]),
  lenderEntity: z.string().max(255).optional(),
  borrowerEntity: z.string().max(255).optional(),
  principalAmount: z.string().optional(),
  outstandingBalance: z.string().optional(),
  currency: z.string().max(3).optional(),
  interestRate: z.string().optional(),
  interestType: z.enum(["fixed", "variable", "libor_plus", "sofr_plus"]).optional(),
  disbursementDate: z.coerce.date().optional(),
  maturityDate: z.coerce.date().optional(),
  repaymentFrequency: z.enum(["monthly", "quarterly", "semi_annual", "annual", "bullet"]).optional(),
  nextPaymentDate: z.coerce.date().optional(),
  totalInterestAccrued: z.string().optional(),
  totalRepayments: z.string().optional(),
  transferPricingCompliance: z.boolean().optional(),
  armLengthRate: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateIntercompanyLoanSchema = createIntercompanyLoanSchema.partial();
