import { z } from "zod/v4";
import { metadataSchema } from "@/lib/validation";

// ==========================================
// Project Plan & Milestone Tracking
// ==========================================
export const createProjectPlanSchema = z.object({
  planType: z.enum(["implementation", "upgrade", "migration", "integration", "rollout"]),
  title: z.string().max(255).optional(),
  projectManager: z.string().max(255).optional(),
  department: z.string().max(100).optional(),
  startDate: z.coerce.date().optional(),
  targetEndDate: z.coerce.date().optional(),
  actualEndDate: z.coerce.date().optional(),
  totalMilestones: z.number().int().optional(),
  completedMilestones: z.number().int().optional(),
  progressPct: z.string().optional(),
  budget: z.string().optional(),
  priority: z.string().max(20).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateProjectPlanSchema = createProjectPlanSchema.partial();

// ==========================================
// Data Migration Strategy & Tooling
// ==========================================
export const createDataMigrationSchema = z.object({
  migrationType: z.enum(["full_migration", "incremental", "parallel_run", "cutover", "rollback"]),
  title: z.string().max(255).optional(),
  sourceSystem: z.string().max(100).optional(),
  targetSystem: z.string().max(100).optional(),
  dataVolume: z.string().max(50).optional(),
  recordCount: z.number().int().optional(),
  migratedCount: z.number().int().optional(),
  errorCount: z.number().int().optional(),
  scheduledDate: z.coerce.date().optional(),
  completedDate: z.coerce.date().optional(),
  validationPassed: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateDataMigrationSchema = createDataMigrationSchema.partial();

// ==========================================
// User Acceptance Testing UAT Management
// ==========================================
export const createUatManagementSchema = z.object({
  uatType: z.enum(["functional_test", "integration_test", "regression_test", "performance_test", "security_test"]),
  title: z.string().max(255).optional(),
  module: z.string().max(100).optional(),
  testCaseCount: z.number().int().optional(),
  passedCount: z.number().int().optional(),
  failedCount: z.number().int().optional(),
  blockedCount: z.number().int().optional(),
  testerName: z.string().max(255).optional(),
  testStartDate: z.coerce.date().optional(),
  testEndDate: z.coerce.date().optional(),
  signoffDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateUatManagementSchema = createUatManagementSchema.partial();

// ==========================================
// Go-Live Readiness Checklist
// ==========================================
export const createGoLiveChecklistSchema = z.object({
  checklistType: z.enum(["technical_readiness", "business_readiness", "data_readiness", "training_readiness", "support_readiness"]),
  title: z.string().max(255).optional(),
  category: z.string().max(100).optional(),
  totalItems: z.number().int().optional(),
  completedItems: z.number().int().optional(),
  blockedItems: z.number().int().optional(),
  goLiveDate: z.coerce.date().optional(),
  approvedBy: z.string().max(255).optional(),
  approvedDate: z.coerce.date().optional(),
  isReady: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateGoLiveChecklistSchema = createGoLiveChecklistSchema.partial();

// ==========================================
// Change Request Management Workflow
// ==========================================
export const createChangeRequestSchema = z.object({
  changeType: z.enum(["enhancement", "bug_fix", "configuration", "process_change", "emergency"]),
  title: z.string().max(255).optional(),
  requestedBy: z.string().max(255).optional(),
  department: z.string().max(100).optional(),
  priority: z.string().max(20).optional(),
  impactLevel: z.string().max(20).optional(),
  description: z.string().optional(),
  justification: z.string().optional(),
  estimatedEffortDays: z.string().optional(),
  approvedBy: z.string().max(255).optional(),
  approvedDate: z.coerce.date().optional(),
  targetDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateChangeRequestSchema = createChangeRequestSchema.partial();

// ==========================================
// System Configuration Management
// ==========================================
export const createSystemConfigSchema = z.object({
  configType: z.enum(["parameter_setting", "workflow_config", "integration_config", "security_config", "ui_customization"]),
  title: z.string().max(255).optional(),
  module: z.string().max(100).optional(),
  configKey: z.string().max(255).optional(),
  configValue: z.string().optional(),
  previousValue: z.string().optional(),
  changedBy: z.string().max(255).optional(),
  changedDate: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
  versionNumber: z.string().max(20).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateSystemConfigSchema = createSystemConfigSchema.partial();

// ==========================================
// User Training Completion Tracking
// ==========================================
export const createTrainingCompletionSchema = z.object({
  completionType: z.enum(["module_completion", "certification", "assessment", "refresher", "remedial"]),
  employeeName: z.string().max(255).optional(),
  employeeId: z.string().max(50).optional(),
  department: z.string().max(100).optional(),
  trainingModule: z.string().max(255).optional(),
  completionDate: z.coerce.date().optional(),
  scorePct: z.string().optional(),
  passed: z.boolean().optional(),
  certificateUrl: z.string().optional(),
  validUntil: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateTrainingCompletionSchema = createTrainingCompletionSchema.partial();

// ==========================================
// Post-Go-Live Hypercare Support
// ==========================================
export const createHypercareSupportSchema = z.object({
  supportType: z.enum(["incident_response", "performance_tuning", "user_assistance", "bug_resolution", "data_correction"]),
  title: z.string().max(255).optional(),
  reportedBy: z.string().max(255).optional(),
  department: z.string().max(100).optional(),
  severity: z.string().max(20).optional(),
  module: z.string().max(100).optional(),
  description: z.string().optional(),
  resolution: z.string().optional(),
  assignedTo: z.string().max(255).optional(),
  reportedDate: z.coerce.date().optional(),
  resolvedDate: z.coerce.date().optional(),
  slaBreached: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateHypercareSupportSchema = createHypercareSupportSchema.partial();
