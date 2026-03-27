import { z } from "zod/v4";
import { metadataSchema } from "@/lib/validation";

// ==========================================
// Internal Audit Planning & Management
// ==========================================
export const createInternalAuditSchema = z.object({
  auditType: z.enum(["financial", "operational", "compliance", "system", "special"]),
  title: z.string().min(1).max(255),
  scope: z.string().optional(),
  objective: z.string().optional(),
  leadAuditor: z.string().max(255).optional(),
  auditTeam: z.array(z.record(z.string(), z.unknown())).optional(),
  department: z.string().max(255).optional(),
  plannedStartDate: z.coerce.date().optional(),
  plannedEndDate: z.coerce.date().optional(),
  actualStartDate: z.coerce.date().optional(),
  actualEndDate: z.coerce.date().optional(),
  totalFindings: z.number().int().optional(),
  criticalFindings: z.number().int().optional(),
  majorFindings: z.number().int().optional(),
  minorFindings: z.number().int().optional(),
  riskRating: z.enum(["low", "medium", "high", "critical"]).optional(),
  recommendations: z.array(z.record(z.string(), z.unknown())).optional(),
  actionItems: z.array(z.record(z.string(), z.unknown())).optional(),
  reportUrl: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateInternalAuditSchema = createInternalAuditSchema.partial();

// ==========================================
// Regulatory Compliance Calendar
// ==========================================
export const createRegulatoryComplianceCalendarSchema = z.object({
  complianceType: z.enum(["regulatory_filing", "license_renewal", "permit_renewal", "inspection", "certification", "reporting"]),
  title: z.string().min(1).max(255),
  regulation: z.string().max(255).optional(),
  authority: z.string().max(255).optional(),
  jurisdiction: z.string().max(100).optional(),
  frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "annual", "one_time"]).optional(),
  dueDate: z.coerce.date().optional(),
  reminderDays: z.number().int().optional(),
  responsiblePerson: z.string().max(255).optional(),
  responsibleDepartment: z.string().max(255).optional(),
  completionDate: z.coerce.date().optional(),
  nextDueDate: z.coerce.date().optional(),
  penaltyAmount: z.string().optional(),
  penaltyCurrency: z.string().max(3).optional(),
  attachments: z.array(z.record(z.string(), z.unknown())).optional(),
  isRecurring: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateRegulatoryComplianceCalendarSchema = createRegulatoryComplianceCalendarSchema.partial();

// ==========================================
// Risk Register & Risk Assessment
// ==========================================
export const createRiskRegisterSchema = z.object({
  riskType: z.enum(["strategic", "operational", "financial", "compliance", "reputational", "technology"]),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().max(100).optional(),
  likelihoodScore: z.number().int().min(1).max(5).optional(),
  impactScore: z.number().int().min(1).max(5).optional(),
  riskScore: z.string().optional(),
  riskLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
  riskOwner: z.string().max(255).optional(),
  mitigationStrategy: z.string().optional(),
  mitigationActions: z.array(z.record(z.string(), z.unknown())).optional(),
  residualLikelihood: z.number().int().min(1).max(5).optional(),
  residualImpact: z.number().int().min(1).max(5).optional(),
  residualRiskScore: z.string().optional(),
  controls: z.array(z.record(z.string(), z.unknown())).optional(),
  reviewDate: z.coerce.date().optional(),
  lastAssessedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateRiskRegisterSchema = createRiskRegisterSchema.partial();

// ==========================================
// Policy & Procedure Management
// ==========================================
export const createPolicyProcedureSchema = z.object({
  policyType: z.enum(["policy", "procedure", "guideline", "standard", "manual"]),
  title: z.string().min(1).max(255),
  version: z.string().max(20).optional(),
  category: z.string().max(100).optional(),
  department: z.string().max(255).optional(),
  author: z.string().max(255).optional(),
  approver: z.string().max(255).optional(),
  approvalDate: z.coerce.date().optional(),
  effectiveDate: z.coerce.date().optional(),
  reviewDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  documentUrl: z.string().optional(),
  summary: z.string().optional(),
  distributionList: z.array(z.record(z.string(), z.unknown())).optional(),
  acknowledgmentCount: z.number().int().optional(),
  totalDistributed: z.number().int().optional(),
  relatedPolicies: z.array(z.record(z.string(), z.unknown())).optional(),
  changeHistory: z.array(z.record(z.string(), z.unknown())).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updatePolicyProcedureSchema = createPolicyProcedureSchema.partial();

// ==========================================
// Regulatory Reporting & Submissions
// ==========================================
export const createRegulatoryReportingSubmissionSchema = z.object({
  submissionType: z.enum(["annual_report", "quarterly_filing", "incident_report", "statistical_report", "customs_report", "tax_filing"]),
  title: z.string().min(1).max(255),
  regulation: z.string().max(255).optional(),
  authority: z.string().max(255).optional(),
  jurisdiction: z.string().max(100).optional(),
  reportingPeriodStart: z.coerce.date().optional(),
  reportingPeriodEnd: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  submissionDate: z.coerce.date().optional(),
  submissionFormat: z.string().max(50).optional(),
  submissionChannel: z.string().max(50).optional(),
  dataPayload: z.record(z.string(), z.unknown()).optional(),
  acknowledgmentRef: z.string().max(100).optional(),
  acknowledgmentDate: z.coerce.date().optional(),
  rejectionReason: z.string().optional(),
  attachments: z.array(z.record(z.string(), z.unknown())).optional(),
  preparedBy: z.string().max(255).optional(),
  reviewedBy: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateRegulatoryReportingSubmissionSchema = createRegulatoryReportingSubmissionSchema.partial();

// ==========================================
// SOX & Financial Controls Compliance
// ==========================================
export const createSoxFinancialControlSchema = z.object({
  controlType: z.enum(["preventive", "detective", "corrective", "compensating"]),
  title: z.string().min(1).max(255),
  controlObjective: z.string().optional(),
  processArea: z.string().max(255).optional(),
  controlOwner: z.string().max(255).optional(),
  controlFrequency: z.enum(["daily", "weekly", "monthly", "quarterly", "annual"]).optional(),
  testProcedure: z.string().optional(),
  testFrequency: z.string().max(30).optional(),
  lastTestDate: z.coerce.date().optional(),
  nextTestDate: z.coerce.date().optional(),
  testResult: z.enum(["effective", "ineffective", "partially_effective"]).optional(),
  deficiencyLevel: z.enum(["none", "deficiency", "significant_deficiency", "material_weakness"]).optional(),
  remediationPlan: z.string().optional(),
  remediationDueDate: z.coerce.date().optional(),
  remediationCompletedDate: z.coerce.date().optional(),
  evidenceLinks: z.array(z.record(z.string(), z.unknown())).optional(),
  riskRating: z.enum(["low", "medium", "high"]).optional(),
  keyControl: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateSoxFinancialControlSchema = createSoxFinancialControlSchema.partial();

// ==========================================
// ISO Certification Tracking & Renewal
// ==========================================
export const createIsoCertificationTrackingSchema = z.object({
  certificationType: z.enum(["iso_9001", "iso_14001", "iso_27001", "iso_45001", "iso_22000", "isps_code"]),
  standard: z.string().min(1).max(100),
  scope: z.string().optional(),
  certifyingBody: z.string().max(255).optional(),
  certificateNumber: z.string().max(100).optional(),
  issueDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  renewalDate: z.coerce.date().optional(),
  lastSurveillanceDate: z.coerce.date().optional(),
  nextSurveillanceDate: z.coerce.date().optional(),
  surveillanceSchedule: z.array(z.record(z.string(), z.unknown())).optional(),
  auditFindings: z.array(z.record(z.string(), z.unknown())).optional(),
  correctiveActions: z.array(z.record(z.string(), z.unknown())).optional(),
  nonConformities: z.number().int().optional(),
  majorNonConformities: z.number().int().optional(),
  documentUrl: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateIsoCertificationTrackingSchema = createIsoCertificationTrackingSchema.partial();

// ==========================================
// AI Risk Detection & Scoring
// ==========================================
export const createAiRiskDetectionSchema = z.object({
  detectionType: z.enum(["anomaly_detection", "pattern_analysis", "predictive_risk", "fraud_detection", "compliance_breach", "behavioral_analysis"]),
  title: z.string().min(1).max(255),
  modelName: z.string().max(255).optional(),
  modelVersion: z.string().max(50).optional(),
  entityType: z.string().max(100).optional(),
  entityRef: z.string().max(100).optional(),
  riskScore: z.string().optional(),
  confidenceScore: z.string().optional(),
  riskLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
  riskFactors: z.array(z.record(z.string(), z.unknown())).optional(),
  alerts: z.array(z.record(z.string(), z.unknown())).optional(),
  threshold: z.string().optional(),
  isAboveThreshold: z.boolean().optional(),
  recommendations: z.array(z.record(z.string(), z.unknown())).optional(),
  investigationStatus: z.enum(["pending", "investigating", "resolved", "dismissed"]).optional(),
  investigatedBy: z.string().max(255).optional(),
  resolutionNotes: z.string().optional(),
  detectedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateAiRiskDetectionSchema = createAiRiskDetectionSchema.partial();
