import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// SOP Library & Process Documentation
// ==========================================
export const kmtSopLibraries = pgTable("kmt_sop_libraries", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  sopRef: varchar("sop_ref", { length: 100 }).notNull(),
  sopType: varchar("sop_type", { length: 50 }).notNull(), // operational_procedure, safety_manual, compliance_guide, work_instruction, policy_document
  title: varchar("title", { length: 255 }),
  department: varchar("department", { length: 100 }),
  category: varchar("category", { length: 100 }),
  versionNumber: varchar("version_number", { length: 20 }),
  effectiveDate: timestamp("effective_date", { withTimezone: true }),
  reviewDate: timestamp("review_date", { withTimezone: true }),
  approvedBy: varchar("approved_by", { length: 255 }),
  documentUrl: text("document_url"),
  isActive: boolean("is_active"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Training Module Creation & Management
// ==========================================
export const kmtTrainingModules = pgTable("kmt_training_modules", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  moduleRef: varchar("module_ref", { length: 100 }).notNull(),
  moduleType: varchar("module_type", { length: 50 }).notNull(), // e_learning, classroom, blended, on_the_job, certification_prep
  title: varchar("title", { length: 255 }),
  description: text("description"),
  department: varchar("department", { length: 100 }),
  durationHours: decimal("duration_hours", { precision: 8, scale: 2 }),
  maxParticipants: integer("max_participants"),
  passingScorePct: decimal("passing_score_pct", { precision: 5, scale: 2 }),
  isMandatory: boolean("is_mandatory"),
  validityMonths: integer("validity_months"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Staff Competency Assessment
// ==========================================
export const kmtCompetencyAssessments = pgTable("kmt_competency_assessments", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  assessmentRef: varchar("assessment_ref", { length: 100 }).notNull(),
  assessmentType: varchar("assessment_type", { length: 50 }).notNull(), // skills_evaluation, knowledge_test, performance_review, certification_exam, gap_analysis
  employeeName: varchar("employee_name", { length: 255 }),
  employeeId: varchar("employee_id", { length: 50 }),
  department: varchar("department", { length: 100 }),
  competencyArea: varchar("competency_area", { length: 100 }),
  currentLevel: integer("current_level"),
  targetLevel: integer("target_level"),
  scorePct: decimal("score_pct", { precision: 5, scale: 2 }),
  assessedDate: timestamp("assessed_date", { withTimezone: true }),
  nextAssessmentDate: timestamp("next_assessment_date", { withTimezone: true }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Employee Onboarding Workflow Automation
// ==========================================
export const kmtOnboardingWorkflows = pgTable("kmt_onboarding_workflows", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  workflowRef: varchar("workflow_ref", { length: 100 }).notNull(),
  workflowType: varchar("workflow_type", { length: 50 }).notNull(), // new_hire, role_transfer, department_change, contractor_onboard, rehire
  employeeName: varchar("employee_name", { length: 255 }),
  employeeId: varchar("employee_id", { length: 50 }),
  department: varchar("department", { length: 100 }),
  position: varchar("position", { length: 100 }),
  startDate: timestamp("start_date", { withTimezone: true }),
  targetCompletionDate: timestamp("target_completion_date", { withTimezone: true }),
  completedSteps: integer("completed_steps"),
  totalSteps: integer("total_steps"),
  progressPct: decimal("progress_pct", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// AI Knowledge Assistant & Search
// ==========================================
export const kmtKnowledgeAssistants = pgTable("kmt_knowledge_assistants", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  assistantRef: varchar("assistant_ref", { length: 100 }).notNull(),
  assistantType: varchar("assistant_type", { length: 50 }).notNull(), // search_query, faq_response, document_summary, process_guide, recommendation
  query: text("query"),
  response: text("response"),
  sourceDocs: text("source_docs"),
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }),
  feedbackRating: integer("feedback_rating"),
  modelVersion: varchar("model_version", { length: 50 }),
  responseTimeMs: integer("response_time_ms"),
  helpful: boolean("helpful"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Regulatory Update Alert Management
// ==========================================
export const kmtRegulatoryAlerts = pgTable("kmt_regulatory_alerts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  alertRef: varchar("alert_ref", { length: 100 }).notNull(),
  alertType: varchar("alert_type", { length: 50 }).notNull(), // imo_update, customs_change, safety_regulation, environmental_rule, trade_compliance
  title: varchar("title", { length: 255 }),
  regulatoryBody: varchar("regulatory_body", { length: 100 }),
  jurisdiction: varchar("jurisdiction", { length: 100 }),
  effectiveDate: timestamp("effective_date", { withTimezone: true }),
  impactLevel: varchar("impact_level", { length: 20 }),
  affectedDepartments: text("affected_departments"),
  complianceDeadline: timestamp("compliance_deadline", { withTimezone: true }),
  acknowledged: boolean("acknowledged"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Lessons Learned Repository
// ==========================================
export const kmtLessonsLearned = pgTable("kmt_lessons_learned", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  lessonRef: varchar("lesson_ref", { length: 100 }).notNull(),
  lessonType: varchar("lesson_type", { length: 50 }).notNull(), // incident_review, project_retrospective, process_improvement, near_miss, best_practice
  title: varchar("title", { length: 255 }),
  department: varchar("department", { length: 100 }),
  incidentDate: timestamp("incident_date", { withTimezone: true }),
  rootCause: text("root_cause"),
  lessonDescription: text("lesson_description"),
  recommendation: text("recommendation"),
  impactLevel: varchar("impact_level", { length: 20 }),
  implemented: boolean("implemented"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Video Training Library Management
// ==========================================
export const kmtVideoLibraries = pgTable("kmt_video_libraries", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  videoRef: varchar("video_ref", { length: 100 }).notNull(),
  videoType: varchar("video_type", { length: 50 }).notNull(), // tutorial, safety_briefing, process_demo, webinar_recording, compliance_training
  title: varchar("title", { length: 255 }),
  description: text("description"),
  department: varchar("department", { length: 100 }),
  durationMinutes: integer("duration_minutes"),
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  language: varchar("language", { length: 20 }),
  viewCount: integer("view_count"),
  isMandatory: boolean("is_mandatory"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
