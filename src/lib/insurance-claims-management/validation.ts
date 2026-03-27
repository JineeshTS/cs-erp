import { z } from "zod/v4";
import { metadataSchema } from "@/lib/validation";

// ==========================================
// P&I Club Policy & Correspondence
// ==========================================
export const createPiClubPolicySchema = z.object({
  policyType: z.enum(["pi_club", "freight_demurrage", "charterers_liability", "war_risk"]),
  clubName: z.string().min(1).max(255),
  clubContactName: z.string().max(255).optional(),
  clubContactEmail: z.string().max(255).optional(),
  clubContactPhone: z.string().max(50).optional(),
  vesselName: z.string().max(255).optional(),
  imoNumber: z.string().max(20).optional(),
  coverageStart: z.coerce.date().optional(),
  coverageEnd: z.coerce.date().optional(),
  premiumAmount: z.string().optional(),
  premiumCurrency: z.string().max(3).optional(),
  deductibleAmount: z.string().optional(),
  coverageLimit: z.string().optional(),
  renewalDate: z.coerce.date().optional(),
  renewalStatus: z.enum(["pending", "renewed", "lapsed"]).optional(),
  brokerName: z.string().max(255).optional(),
  brokerRef: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updatePiClubPolicySchema = createPiClubPolicySchema.partial();

// ==========================================
// Hull & Machinery Insurance
// ==========================================
export const createHullMachineryInsuranceSchema = z.object({
  policyType: z.enum(["hull_machinery", "increased_value", "loss_of_hire", "war_risk"]),
  insurerName: z.string().min(1).max(255),
  insurerContactName: z.string().max(255).optional(),
  insurerContactEmail: z.string().max(255).optional(),
  vesselName: z.string().max(255).optional(),
  imoNumber: z.string().max(20).optional(),
  vesselValue: z.string().optional(),
  insuredValue: z.string().optional(),
  valueCurrency: z.string().max(3).optional(),
  coverageStart: z.coerce.date().optional(),
  coverageEnd: z.coerce.date().optional(),
  premiumAmount: z.string().optional(),
  premiumCurrency: z.string().max(3).optional(),
  deductibleAmount: z.string().optional(),
  tradingLimits: z.string().optional(),
  classificationRequired: z.string().max(255).optional(),
  conditionSurveyRequired: z.boolean().optional(),
  lastSurveyDate: z.coerce.date().optional(),
  renewalDate: z.coerce.date().optional(),
  brokerName: z.string().max(255).optional(),
  brokerRef: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateHullMachineryInsuranceSchema = createHullMachineryInsuranceSchema.partial();

// ==========================================
// Cargo Insurance Policy
// ==========================================
export const createCargoInsurancePolicySchema = z.object({
  policyType: z.enum(["open_cover", "specific_voyage", "annual", "warehouse_to_warehouse"]),
  insurerName: z.string().min(1).max(255),
  insuredParty: z.string().max(255).optional(),
  coverageType: z.enum(["all_risk", "fpa", "wa", "icc_a", "icc_b", "icc_c"]).optional(),
  cargoDescription: z.string().optional(),
  hsCode: z.string().max(20).optional(),
  cargoValue: z.string().optional(),
  insuredValue: z.string().optional(),
  valueCurrency: z.string().max(3).optional(),
  coverageStart: z.coerce.date().optional(),
  coverageEnd: z.coerce.date().optional(),
  premiumAmount: z.string().optional(),
  premiumRate: z.string().optional(),
  premiumCurrency: z.string().max(3).optional(),
  deductibleAmount: z.string().optional(),
  originPort: z.string().max(255).optional(),
  destinationPort: z.string().max(255).optional(),
  vesselName: z.string().max(255).optional(),
  voyageNumber: z.string().max(50).optional(),
  bookingRef: z.string().max(50).optional(),
  blNumber: z.string().max(50).optional(),
  certificateNumber: z.string().max(50).optional(),
  brokerName: z.string().max(255).optional(),
  specialConditions: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateCargoInsurancePolicySchema = createCargoInsurancePolicySchema.partial();

// ==========================================
// Survey Appointment & Coordination
// ==========================================
export const createSurveyAppointmentSchema = z.object({
  appointmentType: z.enum(["damage_survey", "condition_survey", "cargo_survey", "pni_survey", "hull_survey"]),
  claimRef: z.string().max(50).optional(),
  policyRef: z.string().max(50).optional(),
  vesselName: z.string().max(255).optional(),
  imoNumber: z.string().max(20).optional(),
  portName: z.string().max(255).optional(),
  terminalName: z.string().max(255).optional(),
  surveyorName: z.string().max(255).optional(),
  surveyorCompany: z.string().max(255).optional(),
  surveyorEmail: z.string().max(255).optional(),
  surveyorPhone: z.string().max(50).optional(),
  appointedBy: z.string().max(255).optional(),
  appointedAt: z.coerce.date().optional(),
  scheduledDate: z.coerce.date().optional(),
  completedDate: z.coerce.date().optional(),
  surveyScope: z.string().optional(),
  surveyFindings: z.string().optional(),
  reportUrl: z.string().max(500).optional(),
  reportDate: z.coerce.date().optional(),
  estimatedCost: z.string().optional(),
  actualCost: z.string().optional(),
  costCurrency: z.string().max(3).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateSurveyAppointmentSchema = createSurveyAppointmentSchema.partial();

// ==========================================
// Claims Registration & Investigation
// ==========================================
export const createClaimsRegistrationSchema = z.object({
  claimType: z.enum(["cargo_damage", "collision", "pi_liability", "hull_damage", "crew_injury", "pollution", "theft", "general_average"]),
  policyRef: z.string().max(50).optional(),
  vesselName: z.string().max(255).optional(),
  imoNumber: z.string().max(20).optional(),
  voyageNumber: z.string().max(50).optional(),
  incidentDate: z.coerce.date().optional(),
  incidentLocation: z.string().max(255).optional(),
  incidentDescription: z.string().optional(),
  claimantName: z.string().max(255).optional(),
  claimantContact: z.string().max(255).optional(),
  claimantType: z.enum(["owner", "charterer", "cargo_interest", "third_party", "crew"]).optional(),
  estimatedAmount: z.string().optional(),
  reserveAmount: z.string().optional(),
  settledAmount: z.string().optional(),
  claimCurrency: z.string().max(3).optional(),
  investigatorName: z.string().max(255).optional(),
  investigationFindings: z.string().optional(),
  timeBarDate: z.coerce.date().optional(),
  registeredAt: z.coerce.date().optional(),
  closedAt: z.coerce.date().optional(),
  closureReason: z.enum(["settled", "denied", "withdrawn", "time_barred"]).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateClaimsRegistrationSchema = createClaimsRegistrationSchema.partial();

// ==========================================
// Claims Recovery & Subrogation
// ==========================================
export const createClaimsRecoverySchema = z.object({
  recoveryType: z.enum(["subrogation", "contribution", "salvage", "general_average", "third_party"]),
  claimRef: z.string().max(50).optional(),
  policyRef: z.string().max(50).optional(),
  vesselName: z.string().max(255).optional(),
  respondentName: z.string().max(255).optional(),
  respondentContact: z.string().max(255).optional(),
  respondentInsurer: z.string().max(255).optional(),
  originalClaimAmount: z.string().optional(),
  targetRecoveryAmount: z.string().optional(),
  recoveredAmount: z.string().optional(),
  recoveryCurrency: z.string().max(3).optional(),
  recoveryBasis: z.string().optional(),
  legalCounsel: z.string().max(255).optional(),
  legalCosts: z.string().optional(),
  filedAt: z.coerce.date().optional(),
  settledAt: z.coerce.date().optional(),
  limitationDate: z.coerce.date().optional(),
  courtJurisdiction: z.string().max(255).optional(),
  arbitrationClause: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateClaimsRecoverySchema = createClaimsRecoverySchema.partial();

// ==========================================
// AI Claims Prediction & Prevention
// ==========================================
export const createClaimsPredictionSchema = z.object({
  predictionType: z.enum(["risk_assessment", "claim_likelihood", "severity_estimate", "fraud_detection"]),
  vesselName: z.string().max(255).optional(),
  imoNumber: z.string().max(20).optional(),
  voyageNumber: z.string().max(50).optional(),
  tradeRoute: z.string().max(255).optional(),
  cargoType: z.string().max(100).optional(),
  riskScore: z.string().optional(),
  riskLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
  predictedClaimType: z.string().max(30).optional(),
  predictedAmount: z.string().optional(),
  predictionCurrency: z.string().max(3).optional(),
  confidenceScore: z.string().optional(),
  modelVersion: z.string().max(20).optional(),
  actualOutcome: z.enum(["no_claim", "claim_filed", "claim_settled"]).optional(),
  actualAmount: z.string().optional(),
  predictionAccuracy: z.string().optional(),
  generatedAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateClaimsPredictionSchema = createClaimsPredictionSchema.partial();

// ==========================================
// Loss Prevention Analytics & Reporting
// ==========================================
export const createLossPreventionReportSchema = z.object({
  reportType: z.enum(["quarterly", "annual", "vessel_specific", "incident_analysis", "trend_report", "audit"]),
  reportTitle: z.string().min(1).max(255),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
  vesselName: z.string().max(255).optional(),
  fleetScope: z.enum(["single_vessel", "fleet", "all"]).optional(),
  totalClaims: z.number().int().optional(),
  totalClaimAmount: z.string().optional(),
  totalRecovered: z.string().optional(),
  netLoss: z.string().optional(),
  reportCurrency: z.string().max(3).optional(),
  lossRatio: z.string().optional(),
  claimFrequency: z.string().optional(),
  recommendations: z.string().optional(),
  documentUrl: z.string().max(500).optional(),
  documentFormat: z.string().max(10).optional(),
  approvedBy: z.string().max(255).optional(),
  approvedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateLossPreventionReportSchema = createLossPreventionReportSchema.partial();
