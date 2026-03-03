import { z } from "zod/v4";

// ==========================================
// Cargo Claim Registration & Triage
// ==========================================
export const createClaimRegistrationSchema = z.object({
  claimType: z.enum(["cargo_damage", "cargo_loss", "shortage", "contamination", "delay", "misdelivery"]),
  claimantName: z.string().max(255).optional(),
  claimantEmail: z.string().max(255).optional(),
  claimantPhone: z.string().max(50).optional(),
  vesselName: z.string().max(255).optional(),
  voyageRef: z.string().max(100).optional(),
  blNumber: z.string().max(100).optional(),
  containerNumbers: z.string().optional(),
  portOfLoading: z.string().max(255).optional(),
  portOfDischarge: z.string().max(255).optional(),
  cargoDescription: z.string().optional(),
  claimAmountUsd: z.string().optional(),
  claimCurrency: z.string().max(3).optional(),
  claimAmountOriginal: z.string().optional(),
  dateOfLoss: z.coerce.date().optional(),
  dateNotified: z.coerce.date().optional(),
  triagePriority: z.string().max(20).optional(),
  assignedHandler: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateClaimRegistrationSchema = createClaimRegistrationSchema.partial();

// ==========================================
// Liability Assessment Hague-Visby Rules
// ==========================================
export const createLiabilityAssessmentSchema = z.object({
  assessmentType: z.enum(["hague_visby", "hamburg_rules", "rotterdam_rules", "national_law", "contractual"]),
  claimId: z.string().max(100).optional(),
  vesselName: z.string().max(255).optional(),
  applicableConvention: z.string().max(100).optional(),
  liabilityBasis: z.string().optional(),
  limitationApplied: z.boolean().optional(),
  limitPerPackage: z.string().optional(),
  limitPerKg: z.string().optional(),
  totalPackages: z.number().int().optional(),
  totalWeightKg: z.string().optional(),
  calculatedLimit: z.string().optional(),
  defenseApplicable: z.string().max(100).optional(),
  defenseDescription: z.string().optional(),
  recommendedLiability: z.string().optional(),
  carrierLiabilityPct: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateLiabilityAssessmentSchema = createLiabilityAssessmentSchema.partial();

// ==========================================
// Cargo Damage Survey & Documentation
// ==========================================
export const createDamageSurveySchema = z.object({
  surveyType: z.enum(["joint_survey", "independent_survey", "pre_shipment", "discharge_survey", "re_survey"]),
  claimId: z.string().max(100).optional(),
  vesselName: z.string().max(255).optional(),
  surveyorName: z.string().max(255).optional(),
  surveyorCompany: z.string().max(255).optional(),
  surveyDate: z.coerce.date().optional(),
  surveyLocation: z.string().max(255).optional(),
  damageType: z.string().max(100).optional(),
  damageExtent: z.string().max(50).optional(),
  estimatedDamageUsd: z.string().optional(),
  containerCondition: z.string().max(100).optional(),
  sealCondition: z.string().max(100).optional(),
  photosAttached: z.boolean().optional(),
  reportReceived: z.boolean().optional(),
  reportDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateDamageSurveySchema = createDamageSurveySchema.partial();

// ==========================================
// Time Bar Tracking & Alerts
// ==========================================
export const createTimeBarTrackingSchema = z.object({
  trackingType: z.enum(["suit_time_bar", "arbitration_deadline", "notice_period", "extension", "tolling_agreement"]),
  claimId: z.string().max(100).optional(),
  vesselName: z.string().max(255).optional(),
  applicableLaw: z.string().max(100).optional(),
  timeBarPeriodMonths: z.number().int().optional(),
  dateOfDelivery: z.coerce.date().optional(),
  timeBarDeadline: z.coerce.date().optional(),
  daysRemaining: z.number().int().optional(),
  extensionGranted: z.boolean().optional(),
  extensionDate: z.coerce.date().optional(),
  alertSent30Days: z.boolean().optional(),
  alertSent60Days: z.boolean().optional(),
  alertSent90Days: z.boolean().optional(),
  protectiveAction: z.string().max(100).optional(),
  protectiveActionDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateTimeBarTrackingSchema = createTimeBarTrackingSchema.partial();

// ==========================================
// Claim Settlement & Payment Processing
// ==========================================
export const createClaimSettlementSchema = z.object({
  settlementType: z.enum(["full_settlement", "partial_settlement", "compromise", "denial", "withdrawal", "without_prejudice"]),
  claimId: z.string().max(100).optional(),
  vesselName: z.string().max(255).optional(),
  originalClaimAmount: z.string().optional(),
  offeredAmount: z.string().optional(),
  settledAmount: z.string().optional(),
  settlementCurrency: z.string().max(3).optional(),
  settlementDate: z.coerce.date().optional(),
  paymentMethod: z.string().max(50).optional(),
  paymentReference: z.string().max(100).optional(),
  paymentDate: z.coerce.date().optional(),
  releaseObtained: z.boolean().optional(),
  releaseDate: z.coerce.date().optional(),
  savingsAmount: z.string().optional(),
  savingsPercentage: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateClaimSettlementSchema = createClaimSettlementSchema.partial();

// ==========================================
// Subrogation & Recovery Management
// ==========================================
export const createSubrogationRecoverySchema = z.object({
  recoveryType: z.enum(["subrogation", "contribution", "indemnity", "recourse", "third_party"]),
  claimId: z.string().max(100).optional(),
  vesselName: z.string().max(255).optional(),
  respondentName: z.string().max(255).optional(),
  respondentType: z.string().max(50).optional(),
  amountClaimed: z.string().optional(),
  amountRecovered: z.string().optional(),
  recoveryCurrency: z.string().max(3).optional(),
  recoveryBasis: z.string().optional(),
  demandLetterDate: z.coerce.date().optional(),
  responseDeadline: z.coerce.date().optional(),
  recoveryDate: z.coerce.date().optional(),
  legalActionFiled: z.boolean().optional(),
  recoveryPercentage: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateSubrogationRecoverySchema = createSubrogationRecoverySchema.partial();

// ==========================================
// AI Claim Probability Prediction
// ==========================================
export const createClaimPredictionSchema = z.object({
  predictionType: z.enum(["success_probability", "settlement_range", "duration_estimate", "liability_score", "recovery_likelihood"]),
  claimId: z.string().max(100).optional(),
  vesselName: z.string().max(255).optional(),
  modelVersion: z.string().max(50).optional(),
  inputFeatures: z.record(z.string(), z.unknown()).optional(),
  successProbability: z.string().optional(),
  predictedSettlement: z.string().optional(),
  confidenceInterval: z.string().max(50).optional(),
  estimatedDurationDays: z.number().int().optional(),
  riskScore: z.string().optional(),
  recommendedAction: z.string().optional(),
  similarCasesCount: z.number().int().optional(),
  historicalAvgSettlement: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateClaimPredictionSchema = createClaimPredictionSchema.partial();

// ==========================================
// Claims Portfolio Analytics
// ==========================================
export const createPortfolioAnalyticSchema = z.object({
  analyticsType: z.enum(["quarterly_review", "annual_summary", "trend_analysis", "loss_ratio", "reserve_adequacy"]),
  reportingPeriod: z.string().max(50).optional(),
  totalClaimsCount: z.number().int().optional(),
  openClaimsCount: z.number().int().optional(),
  closedClaimsCount: z.number().int().optional(),
  totalIncurredUsd: z.string().optional(),
  totalPaidUsd: z.string().optional(),
  totalReservedUsd: z.string().optional(),
  totalRecoveredUsd: z.string().optional(),
  lossRatio: z.string().optional(),
  avgSettlementDays: z.number().int().optional(),
  avgClaimValueUsd: z.string().optional(),
  topClaimCategory: z.string().max(100).optional(),
  trendDirection: z.string().max(20).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updatePortfolioAnalyticSchema = createPortfolioAnalyticSchema.partial();
