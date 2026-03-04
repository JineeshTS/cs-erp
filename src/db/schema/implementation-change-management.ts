import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// Project Plan & Milestone Tracking
// ==========================================
export const icmProjectPlans = pgTable("icm_project_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  planRef: varchar("plan_ref", { length: 100 }).notNull(),
  planType: varchar("plan_type", { length: 50 }).notNull(), // implementation, upgrade, migration, integration, rollout
  title: varchar("title", { length: 255 }),
  projectManager: varchar("project_manager", { length: 255 }),
  department: varchar("department", { length: 100 }),
  startDate: timestamp("start_date", { withTimezone: true }),
  targetEndDate: timestamp("target_end_date", { withTimezone: true }),
  actualEndDate: timestamp("actual_end_date", { withTimezone: true }),
  totalMilestones: integer("total_milestones"),
  completedMilestones: integer("completed_milestones"),
  progressPct: decimal("progress_pct", { precision: 5, scale: 2 }),
  budget: decimal("budget", { precision: 14, scale: 2 }),
  priority: varchar("priority", { length: 20 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Data Migration Strategy & Tooling
// ==========================================
export const icmDataMigrations = pgTable("icm_data_migrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  migrationRef: varchar("migration_ref", { length: 100 }).notNull(),
  migrationType: varchar("migration_type", { length: 50 }).notNull(), // full_migration, incremental, parallel_run, cutover, rollback
  title: varchar("title", { length: 255 }),
  sourceSystem: varchar("source_system", { length: 100 }),
  targetSystem: varchar("target_system", { length: 100 }),
  dataVolume: varchar("data_volume", { length: 50 }),
  recordCount: integer("record_count"),
  migratedCount: integer("migrated_count"),
  errorCount: integer("error_count"),
  scheduledDate: timestamp("scheduled_date", { withTimezone: true }),
  completedDate: timestamp("completed_date", { withTimezone: true }),
  validationPassed: boolean("validation_passed"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// User Acceptance Testing UAT Management
// ==========================================
export const icmUatManagements = pgTable("icm_uat_managements", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  uatRef: varchar("uat_ref", { length: 100 }).notNull(),
  uatType: varchar("uat_type", { length: 50 }).notNull(), // functional_test, integration_test, regression_test, performance_test, security_test
  title: varchar("title", { length: 255 }),
  module: varchar("module", { length: 100 }),
  testCaseCount: integer("test_case_count"),
  passedCount: integer("passed_count"),
  failedCount: integer("failed_count"),
  blockedCount: integer("blocked_count"),
  testerName: varchar("tester_name", { length: 255 }),
  testStartDate: timestamp("test_start_date", { withTimezone: true }),
  testEndDate: timestamp("test_end_date", { withTimezone: true }),
  signoffDate: timestamp("signoff_date", { withTimezone: true }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Go-Live Readiness Checklist
// ==========================================
export const icmGoLiveChecklists = pgTable("icm_go_live_checklists", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  checklistRef: varchar("checklist_ref", { length: 100 }).notNull(),
  checklistType: varchar("checklist_type", { length: 50 }).notNull(), // technical_readiness, business_readiness, data_readiness, training_readiness, support_readiness
  title: varchar("title", { length: 255 }),
  category: varchar("category", { length: 100 }),
  totalItems: integer("total_items"),
  completedItems: integer("completed_items"),
  blockedItems: integer("blocked_items"),
  goLiveDate: timestamp("go_live_date", { withTimezone: true }),
  approvedBy: varchar("approved_by", { length: 255 }),
  approvedDate: timestamp("approved_date", { withTimezone: true }),
  isReady: boolean("is_ready"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Change Request Management Workflow
// ==========================================
export const icmChangeRequests = pgTable("icm_change_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  changeRef: varchar("change_ref", { length: 100 }).notNull(),
  changeType: varchar("change_type", { length: 50 }).notNull(), // enhancement, bug_fix, configuration, process_change, emergency
  title: varchar("title", { length: 255 }),
  requestedBy: varchar("requested_by", { length: 255 }),
  department: varchar("department", { length: 100 }),
  priority: varchar("priority", { length: 20 }),
  impactLevel: varchar("impact_level", { length: 20 }),
  description: text("description"),
  justification: text("justification"),
  estimatedEffortDays: decimal("estimated_effort_days", { precision: 8, scale: 2 }),
  approvedBy: varchar("approved_by", { length: 255 }),
  approvedDate: timestamp("approved_date", { withTimezone: true }),
  targetDate: timestamp("target_date", { withTimezone: true }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// System Configuration Management
// ==========================================
export const icmSystemConfigs = pgTable("icm_system_configs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  configRef: varchar("config_ref", { length: 100 }).notNull(),
  configType: varchar("config_type", { length: 50 }).notNull(), // parameter_setting, workflow_config, integration_config, security_config, ui_customization
  title: varchar("title", { length: 255 }),
  module: varchar("module", { length: 100 }),
  configKey: varchar("config_key", { length: 255 }),
  configValue: text("config_value"),
  previousValue: text("previous_value"),
  changedBy: varchar("changed_by", { length: 255 }),
  changedDate: timestamp("changed_date", { withTimezone: true }),
  isActive: boolean("is_active"),
  versionNumber: varchar("version_number", { length: 20 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// User Training Completion Tracking
// ==========================================
export const icmTrainingCompletions = pgTable("icm_training_completions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  completionRef: varchar("completion_ref", { length: 100 }).notNull(),
  completionType: varchar("completion_type", { length: 50 }).notNull(), // module_completion, certification, assessment, refresher, remedial
  employeeName: varchar("employee_name", { length: 255 }),
  employeeId: varchar("employee_id", { length: 50 }),
  department: varchar("department", { length: 100 }),
  trainingModule: varchar("training_module", { length: 255 }),
  completionDate: timestamp("completion_date", { withTimezone: true }),
  scorePct: decimal("score_pct", { precision: 5, scale: 2 }),
  passed: boolean("passed"),
  certificateUrl: text("certificate_url"),
  validUntil: timestamp("valid_until", { withTimezone: true }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Post-Go-Live Hypercare Support
// ==========================================
export const icmHypercareSupports = pgTable("icm_hypercare_supports", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  supportRef: varchar("support_ref", { length: 100 }).notNull(),
  supportType: varchar("support_type", { length: 50 }).notNull(), // incident_response, performance_tuning, user_assistance, bug_resolution, data_correction
  title: varchar("title", { length: 255 }),
  reportedBy: varchar("reported_by", { length: 255 }),
  department: varchar("department", { length: 100 }),
  severity: varchar("severity", { length: 20 }),
  module: varchar("module", { length: 100 }),
  description: text("description"),
  resolution: text("resolution"),
  assignedTo: varchar("assigned_to", { length: 255 }),
  reportedDate: timestamp("reported_date", { withTimezone: true }),
  resolvedDate: timestamp("resolved_date", { withTimezone: true }),
  slaBreached: boolean("sla_breached"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
