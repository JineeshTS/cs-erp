import { z } from "zod/v4";

// ==========================================
// SOP Library & Process Documentation
// ==========================================
export const createSopLibrarySchema = z.object({
  sopType: z.enum(["operational_procedure", "safety_manual", "compliance_guide", "work_instruction", "policy_document"]),
  title: z.string().max(255).optional(),
  department: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  versionNumber: z.string().max(20).optional(),
  effectiveDate: z.coerce.date().optional(),
  reviewDate: z.coerce.date().optional(),
  approvedBy: z.string().max(255).optional(),
  documentUrl: z.string().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateSopLibrarySchema = createSopLibrarySchema.partial();

// ==========================================
// Training Module Creation & Management
// ==========================================
export const createTrainingModuleSchema = z.object({
  moduleType: z.enum(["e_learning", "classroom", "blended", "on_the_job", "certification_prep"]),
  title: z.string().max(255).optional(),
  description: z.string().optional(),
  department: z.string().max(100).optional(),
  durationHours: z.string().optional(),
  maxParticipants: z.number().int().optional(),
  passingScorePct: z.string().optional(),
  isMandatory: z.boolean().optional(),
  validityMonths: z.number().int().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateTrainingModuleSchema = createTrainingModuleSchema.partial();

// ==========================================
// Staff Competency Assessment
// ==========================================
export const createCompetencyAssessmentSchema = z.object({
  assessmentType: z.enum(["skills_evaluation", "knowledge_test", "performance_review", "certification_exam", "gap_analysis"]),
  employeeName: z.string().max(255).optional(),
  employeeId: z.string().max(50).optional(),
  department: z.string().max(100).optional(),
  competencyArea: z.string().max(100).optional(),
  currentLevel: z.number().int().optional(),
  targetLevel: z.number().int().optional(),
  scorePct: z.string().optional(),
  assessedDate: z.coerce.date().optional(),
  nextAssessmentDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateCompetencyAssessmentSchema = createCompetencyAssessmentSchema.partial();

// ==========================================
// Employee Onboarding Workflow Automation
// ==========================================
export const createOnboardingWorkflowSchema = z.object({
  workflowType: z.enum(["new_hire", "role_transfer", "department_change", "contractor_onboard", "rehire"]),
  employeeName: z.string().max(255).optional(),
  employeeId: z.string().max(50).optional(),
  department: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
  startDate: z.coerce.date().optional(),
  targetCompletionDate: z.coerce.date().optional(),
  completedSteps: z.number().int().optional(),
  totalSteps: z.number().int().optional(),
  progressPct: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateOnboardingWorkflowSchema = createOnboardingWorkflowSchema.partial();

// ==========================================
// AI Knowledge Assistant & Search
// ==========================================
export const createKnowledgeAssistantSchema = z.object({
  assistantType: z.enum(["search_query", "faq_response", "document_summary", "process_guide", "recommendation"]),
  query: z.string().optional(),
  response: z.string().optional(),
  sourceDocs: z.string().optional(),
  confidenceScore: z.string().optional(),
  feedbackRating: z.number().int().optional(),
  modelVersion: z.string().max(50).optional(),
  responseTimeMs: z.number().int().optional(),
  helpful: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateKnowledgeAssistantSchema = createKnowledgeAssistantSchema.partial();

// ==========================================
// Regulatory Update Alert Management
// ==========================================
export const createRegulatoryAlertSchema = z.object({
  alertType: z.enum(["imo_update", "customs_change", "safety_regulation", "environmental_rule", "trade_compliance"]),
  title: z.string().max(255).optional(),
  regulatoryBody: z.string().max(100).optional(),
  jurisdiction: z.string().max(100).optional(),
  effectiveDate: z.coerce.date().optional(),
  impactLevel: z.string().max(20).optional(),
  affectedDepartments: z.string().optional(),
  complianceDeadline: z.coerce.date().optional(),
  acknowledged: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateRegulatoryAlertSchema = createRegulatoryAlertSchema.partial();

// ==========================================
// Lessons Learned Repository
// ==========================================
export const createLessonLearnedSchema = z.object({
  lessonType: z.enum(["incident_review", "project_retrospective", "process_improvement", "near_miss", "best_practice"]),
  title: z.string().max(255).optional(),
  department: z.string().max(100).optional(),
  incidentDate: z.coerce.date().optional(),
  rootCause: z.string().optional(),
  lessonDescription: z.string().optional(),
  recommendation: z.string().optional(),
  impactLevel: z.string().max(20).optional(),
  implemented: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateLessonLearnedSchema = createLessonLearnedSchema.partial();

// ==========================================
// Video Training Library Management
// ==========================================
export const createVideoLibrarySchema = z.object({
  videoType: z.enum(["tutorial", "safety_briefing", "process_demo", "webinar_recording", "compliance_training"]),
  title: z.string().max(255).optional(),
  description: z.string().optional(),
  department: z.string().max(100).optional(),
  durationMinutes: z.number().int().optional(),
  videoUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  language: z.string().max(20).optional(),
  viewCount: z.number().int().optional(),
  isMandatory: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateVideoLibrarySchema = createVideoLibrarySchema.partial();
