import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// Enterprise Risk Register Management
// ==========================================
export const lprRiskRegisters = pgTable("lpr_risk_registers", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  riskRef: varchar("risk_ref", { length: 100 }).notNull(),
  riskType: varchar("risk_type", { length: 50 }).notNull(), // operational, financial, strategic, compliance, reputational, environmental
  title: varchar("title", { length: 255 }),
  description: text("description"),
  riskCategory: varchar("risk_category", { length: 100 }),
  likelihood: integer("likelihood"), // 1-5
  impact: integer("impact"), // 1-5
  riskScore: integer("risk_score"), // likelihood * impact
  riskOwner: varchar("risk_owner", { length: 255 }),
  mitigationStrategy: text("mitigation_strategy"),
  residualLikelihood: integer("residual_likelihood"),
  residualImpact: integer("residual_impact"),
  residualScore: integer("residual_score"),
  reviewDate: timestamp("review_date", { withTimezone: true }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// HSSE Health Safety Security Environment
// ==========================================
export const lprHsseRecords = pgTable("lpr_hsse_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  hsseRef: varchar("hsse_ref", { length: 100 }).notNull(),
  hsseType: varchar("hsse_type", { length: 50 }).notNull(), // safety_audit, health_check, security_drill, environmental_review, toolbox_talk, permit_to_work
  title: varchar("title", { length: 255 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  locationName: varchar("location_name", { length: 255 }),
  conductedBy: varchar("conducted_by", { length: 255 }),
  conductedDate: timestamp("conducted_date", { withTimezone: true }),
  findingsCount: integer("findings_count"),
  criticalFindings: integer("critical_findings"),
  correctiveActions: text("corrective_actions"),
  nextDueDate: timestamp("next_due_date", { withTimezone: true }),
  isCompliant: boolean("is_compliant").default(true),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Near-Miss & Unsafe Act Reporting
// ==========================================
export const lprNearMissReports = pgTable("lpr_near_miss_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  nearMissRef: varchar("near_miss_ref", { length: 100 }).notNull(),
  reportType: varchar("report_type", { length: 50 }).notNull(), // near_miss, unsafe_act, unsafe_condition, good_catch, hazard_observation
  title: varchar("title", { length: 255 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  locationName: varchar("location_name", { length: 255 }),
  reportedBy: varchar("reported_by", { length: 255 }),
  reportedDate: timestamp("reported_date", { withTimezone: true }),
  potentialSeverity: varchar("potential_severity", { length: 20 }), // low, medium, high, critical
  description: text("description"),
  immediateAction: text("immediate_action"),
  rootCause: text("root_cause"),
  preventiveMeasure: text("preventive_measure"),
  isAnonymous: boolean("is_anonymous").default(false),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Incident Investigation & Root Cause Analysis
// ==========================================
export const lprIncidentInvestigations = pgTable("lpr_incident_investigations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  investigationRef: varchar("investigation_ref", { length: 100 }).notNull(),
  investigationType: varchar("investigation_type", { length: 50 }).notNull(), // injury, property_damage, environmental, operational, security, fire
  title: varchar("title", { length: 255 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  locationName: varchar("location_name", { length: 255 }),
  incidentDate: timestamp("incident_date", { withTimezone: true }),
  investigator: varchar("investigator", { length: 255 }),
  severity: varchar("severity", { length: 20 }),
  injuredPersons: integer("injured_persons"),
  rootCauseMethod: varchar("root_cause_method", { length: 50 }), // 5_why, fishbone, fault_tree, tripod_beta
  rootCauseFindings: text("root_cause_findings"),
  correctiveActions: text("corrective_actions"),
  estimatedCost: decimal("estimated_cost", { precision: 14, scale: 2 }),
  closedDate: timestamp("closed_date", { withTimezone: true }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// P&I Club Risk Scoring AI
// ==========================================
export const lprPiClubScorings = pgTable("lpr_pi_club_scorings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  scoringRef: varchar("scoring_ref", { length: 100 }).notNull(),
  scoringType: varchar("scoring_type", { length: 50 }).notNull(), // vessel_assessment, fleet_review, claims_analysis, premium_calculation, benchmark
  title: varchar("title", { length: 255 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  imoNumber: varchar("imo_number", { length: 20 }),
  piClubName: varchar("pi_club_name", { length: 255 }),
  assessmentDate: timestamp("assessment_date", { withTimezone: true }),
  overallScore: decimal("overall_score", { precision: 5, scale: 2 }),
  safetyScore: decimal("safety_score", { precision: 5, scale: 2 }),
  claimsScore: decimal("claims_score", { precision: 5, scale: 2 }),
  complianceScore: decimal("compliance_score", { precision: 5, scale: 2 }),
  riskGrade: varchar("risk_grade", { length: 10 }),
  premiumImpact: decimal("premium_impact", { precision: 14, scale: 2 }),
  recommendations: text("recommendations"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Business Continuity Plan Management
// ==========================================
export const lprContinuityPlans = pgTable("lpr_continuity_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  planRef: varchar("plan_ref", { length: 100 }).notNull(),
  planType: varchar("plan_type", { length: 50 }).notNull(), // bcp, ddr, pandemic, cyber_incident, supply_chain, crisis_communication
  title: varchar("title", { length: 255 }),
  scope: text("scope"),
  rtoHours: integer("rto_hours"), // recovery time objective
  rpoHours: integer("rpo_hours"), // recovery point objective
  criticalProcesses: text("critical_processes"),
  recoverySteps: text("recovery_steps"),
  testDate: timestamp("test_date", { withTimezone: true }),
  testResult: varchar("test_result", { length: 50 }),
  nextReviewDate: timestamp("next_review_date", { withTimezone: true }),
  planOwner: varchar("plan_owner", { length: 255 }),
  approvedBy: varchar("approved_by", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Emergency Response Procedure Library
// ==========================================
export const lprEmergencyProcedures = pgTable("lpr_emergency_procedures", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  procedureRef: varchar("procedure_ref", { length: 100 }).notNull(),
  procedureType: varchar("procedure_type", { length: 50 }).notNull(), // fire, abandon_ship, man_overboard, grounding, collision, piracy, medical, pollution
  title: varchar("title", { length: 255 }),
  vesselType: varchar("vessel_type", { length: 100 }),
  applicableTo: varchar("applicable_to", { length: 255 }),
  responseSteps: text("response_steps"),
  equipmentRequired: text("equipment_required"),
  personnelRoles: text("personnel_roles"),
  drillFrequency: varchar("drill_frequency", { length: 50 }),
  lastDrillDate: timestamp("last_drill_date", { withTimezone: true }),
  nextDrillDate: timestamp("next_drill_date", { withTimezone: true }),
  revisionNumber: integer("revision_number"),
  approvedBy: varchar("approved_by", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Risk KPI Dashboard & Board Reporting
// ==========================================
export const lprRiskKpiDashboards = pgTable("lpr_risk_kpi_dashboards", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  dashboardRef: varchar("dashboard_ref", { length: 100 }).notNull(),
  dashboardType: varchar("dashboard_type", { length: 50 }).notNull(), // monthly_report, quarterly_review, annual_report, board_summary, kpi_scorecard
  title: varchar("title", { length: 255 }),
  reportingPeriod: varchar("reporting_period", { length: 50 }),
  totalRisks: integer("total_risks"),
  highRisks: integer("high_risks"),
  incidentCount: integer("incident_count"),
  nearMissCount: integer("near_miss_count"),
  ltifRate: decimal("ltif_rate", { precision: 8, scale: 4 }), // lost time injury frequency
  trifRate: decimal("trif_rate", { precision: 8, scale: 4 }), // total recordable injury frequency
  insuranceClaims: decimal("insurance_claims", { precision: 14, scale: 2 }),
  complianceRate: decimal("compliance_rate", { precision: 5, scale: 2 }),
  boardPresentedDate: timestamp("board_presented_date", { withTimezone: true }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
