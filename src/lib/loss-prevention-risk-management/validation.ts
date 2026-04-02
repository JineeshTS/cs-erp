import { z } from "zod/v4";
import { metadataSchema } from "@/lib/validation";

// ==========================================
// Enterprise Risk Register Management
// ==========================================
export const createRiskRegisterSchema = z.object({
  riskType: z.enum(["operational", "financial", "strategic", "compliance", "reputational", "environmental"]),
  title: z.string().max(255).optional(),
  description: z.string().optional(),
  riskCategory: z.string().max(100).optional(),
  likelihood: z.number().int().min(1).max(5).optional(),
  impact: z.number().int().min(1).max(5).optional(),
  riskScore: z.number().int().optional(),
  riskOwner: z.string().max(255).optional(),
  mitigationStrategy: z.string().optional(),
  residualLikelihood: z.number().int().min(1).max(5).optional(),
  residualImpact: z.number().int().min(1).max(5).optional(),
  residualScore: z.number().int().optional(),
  reviewDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateRiskRegisterSchema = createRiskRegisterSchema.partial();

// ==========================================
// HSSE Health Safety Security Environment
// ==========================================
export const createHsseRecordSchema = z.object({
  hsseType: z.enum(["safety_audit", "health_check", "security_drill", "environmental_review", "toolbox_talk", "permit_to_work"]),
  title: z.string().max(255).optional(),
  vesselName: z.string().max(255).optional(),
  locationName: z.string().max(255).optional(),
  conductedBy: z.string().max(255).optional(),
  conductedDate: z.coerce.date().optional(),
  findingsCount: z.number().int().optional(),
  criticalFindings: z.number().int().optional(),
  correctiveActions: z.string().optional(),
  nextDueDate: z.coerce.date().optional(),
  isCompliant: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateHsseRecordSchema = createHsseRecordSchema.partial();

// ==========================================
// Near-Miss & Unsafe Act Reporting
// ==========================================
export const createNearMissReportSchema = z.object({
  reportType: z.enum(["near_miss", "unsafe_act", "unsafe_condition", "good_catch", "hazard_observation"]),
  title: z.string().max(255).optional(),
  vesselName: z.string().max(255).optional(),
  locationName: z.string().max(255).optional(),
  reportedBy: z.string().max(255).optional(),
  reportedDate: z.coerce.date().optional(),
  potentialSeverity: z.string().max(20).optional(),
  description: z.string().optional(),
  immediateAction: z.string().optional(),
  rootCause: z.string().optional(),
  preventiveMeasure: z.string().optional(),
  isAnonymous: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateNearMissReportSchema = createNearMissReportSchema.partial();

// ==========================================
// Incident Investigation & Root Cause Analysis
// ==========================================
export const createIncidentInvestigationSchema = z.object({
  investigationType: z.enum(["injury", "property_damage", "environmental", "operational", "security", "fire"]),
  title: z.string().max(255).optional(),
  vesselName: z.string().max(255).optional(),
  locationName: z.string().max(255).optional(),
  incidentDate: z.coerce.date().optional(),
  investigator: z.string().max(255).optional(),
  severity: z.string().max(20).optional(),
  injuredPersons: z.number().int().optional(),
  rootCauseMethod: z.string().max(50).optional(),
  rootCauseFindings: z.string().optional(),
  correctiveActions: z.string().optional(),
  estimatedCost: z.string().optional(),
  closedDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateIncidentInvestigationSchema = createIncidentInvestigationSchema.partial();

// ==========================================
// P&I Club Risk Scoring AI
// ==========================================
export const createPiClubScoringSchema = z.object({
  scoringType: z.enum(["vessel_assessment", "fleet_review", "claims_analysis", "premium_calculation", "benchmark"]),
  title: z.string().max(255).optional(),
  vesselName: z.string().max(255).optional(),
  imoNumber: z.string().max(20).optional(),
  piClubName: z.string().max(255).optional(),
  assessmentDate: z.coerce.date().optional(),
  overallScore: z.string().optional(),
  safetyScore: z.string().optional(),
  claimsScore: z.string().optional(),
  complianceScore: z.string().optional(),
  riskGrade: z.string().max(10).optional(),
  premiumImpact: z.string().optional(),
  recommendations: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updatePiClubScoringSchema = createPiClubScoringSchema.partial();

// ==========================================
// Business Continuity Plan Management
// ==========================================
export const createContinuityPlanSchema = z.object({
  planType: z.enum(["bcp", "ddr", "pandemic", "cyber_incident", "supply_chain", "crisis_communication"]),
  title: z.string().max(255).optional(),
  scope: z.string().optional(),
  rtoHours: z.number().int().optional(),
  rpoHours: z.number().int().optional(),
  criticalProcesses: z.string().optional(),
  recoverySteps: z.string().optional(),
  testDate: z.coerce.date().optional(),
  testResult: z.string().max(50).optional(),
  nextReviewDate: z.coerce.date().optional(),
  planOwner: z.string().max(255).optional(),
  approvedBy: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateContinuityPlanSchema = createContinuityPlanSchema.partial();

// ==========================================
// Emergency Response Procedure Library
// ==========================================
export const createEmergencyProcedureSchema = z.object({
  procedureType: z.enum(["fire", "abandon_ship", "man_overboard", "grounding", "collision", "piracy", "medical", "pollution"]),
  title: z.string().max(255).optional(),
  vesselType: z.string().max(100).optional(),
  applicableTo: z.string().max(255).optional(),
  responseSteps: z.string().optional(),
  equipmentRequired: z.string().optional(),
  personnelRoles: z.string().optional(),
  drillFrequency: z.string().max(50).optional(),
  lastDrillDate: z.coerce.date().optional(),
  nextDrillDate: z.coerce.date().optional(),
  revisionNumber: z.number().int().optional(),
  approvedBy: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateEmergencyProcedureSchema = createEmergencyProcedureSchema.partial();

// ==========================================
// Risk KPI Dashboard & Board Reporting
// ==========================================
export const createRiskKpiDashboardSchema = z.object({
  dashboardType: z.enum(["monthly_report", "quarterly_review", "annual_report", "board_summary", "kpi_scorecard"]),
  title: z.string().max(255).optional(),
  reportingPeriod: z.string().max(50).optional(),
  totalRisks: z.number().int().optional(),
  highRisks: z.number().int().optional(),
  incidentCount: z.number().int().optional(),
  nearMissCount: z.number().int().optional(),
  ltifRate: z.string().optional(),
  trifRate: z.string().optional(),
  insuranceClaims: z.string().optional(),
  complianceRate: z.string().optional(),
  boardPresentedDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateRiskKpiDashboardSchema = createRiskKpiDashboardSchema.partial();
