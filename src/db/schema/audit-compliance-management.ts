import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// Internal Audit Planning & Management
// ==========================================
export const acmInternalAudits = pgTable(
  "acm_internal_audits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    auditRef: varchar("audit_ref", { length: 50 }).notNull(),
    auditType: varchar("audit_type", { length: 30 }).notNull(), // financial, operational, compliance, system, special
    title: varchar("title", { length: 255 }).notNull(),
    scope: text("scope"),
    objective: text("objective"),
    leadAuditor: varchar("lead_auditor", { length: 255 }),
    auditTeam: jsonb("audit_team"), // [{ name, role, department }]
    department: varchar("department", { length: 255 }),
    plannedStartDate: timestamp("planned_start_date", { withTimezone: true }),
    plannedEndDate: timestamp("planned_end_date", { withTimezone: true }),
    actualStartDate: timestamp("actual_start_date", { withTimezone: true }),
    actualEndDate: timestamp("actual_end_date", { withTimezone: true }),
    totalFindings: integer("total_findings"),
    criticalFindings: integer("critical_findings"),
    majorFindings: integer("major_findings"),
    minorFindings: integer("minor_findings"),
    riskRating: varchar("risk_rating", { length: 20 }), // low, medium, high, critical
    recommendations: jsonb("recommendations"), // [{ id, title, priority, status }]
    actionItems: jsonb("action_items"), // [{ id, description, assignee, dueDate, status }]
    reportUrl: text("report_url"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("acm_internal_audits_tenant_idx").on(t.tenantId),
    index("acm_internal_audits_ref_idx").on(t.auditRef),
    index("acm_internal_audits_status_idx").on(t.status),
    index("acm_internal_audits_type_idx").on(t.auditType),
  ]
);

// ==========================================
// Regulatory Compliance Calendar
// ==========================================
export const acmRegulatoryComplianceCalendars = pgTable(
  "acm_regulatory_compliance_calendars",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    calendarRef: varchar("calendar_ref", { length: 50 }).notNull(),
    complianceType: varchar("compliance_type", { length: 30 }).notNull(), // regulatory_filing, license_renewal, permit_renewal, inspection, certification, reporting
    title: varchar("title", { length: 255 }).notNull(),
    regulation: varchar("regulation", { length: 255 }),
    authority: varchar("authority", { length: 255 }),
    jurisdiction: varchar("jurisdiction", { length: 100 }),
    frequency: varchar("frequency", { length: 30 }), // daily, weekly, monthly, quarterly, annual, one_time
    dueDate: timestamp("due_date", { withTimezone: true }),
    reminderDays: integer("reminder_days"),
    responsiblePerson: varchar("responsible_person", { length: 255 }),
    responsibleDepartment: varchar("responsible_department", { length: 255 }),
    completionDate: timestamp("completion_date", { withTimezone: true }),
    nextDueDate: timestamp("next_due_date", { withTimezone: true }),
    penaltyAmount: decimal("penalty_amount", { precision: 14, scale: 2 }),
    penaltyCurrency: varchar("penalty_currency", { length: 3 }).default("USD"),
    attachments: jsonb("attachments"), // [{ name, url, type }]
    isRecurring: boolean("is_recurring").default(false),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("acm_reg_compliance_cal_tenant_idx").on(t.tenantId),
    index("acm_reg_compliance_cal_ref_idx").on(t.calendarRef),
    index("acm_reg_compliance_cal_status_idx").on(t.status),
    index("acm_reg_compliance_cal_due_idx").on(t.dueDate),
  ]
);

// ==========================================
// Risk Register & Risk Assessment
// ==========================================
export const acmRiskRegisters = pgTable(
  "acm_risk_registers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    riskRef: varchar("risk_ref", { length: 50 }).notNull(),
    riskType: varchar("risk_type", { length: 30 }).notNull(), // strategic, operational, financial, compliance, reputational, technology
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }),
    likelihoodScore: integer("likelihood_score"), // 1-5
    impactScore: integer("impact_score"), // 1-5
    riskScore: decimal("risk_score", { precision: 6, scale: 2 }), // likelihood * impact
    riskLevel: varchar("risk_level", { length: 20 }), // low, medium, high, critical
    riskOwner: varchar("risk_owner", { length: 255 }),
    mitigationStrategy: text("mitigation_strategy"),
    mitigationActions: jsonb("mitigation_actions"), // [{ action, responsible, dueDate, status }]
    residualLikelihood: integer("residual_likelihood"),
    residualImpact: integer("residual_impact"),
    residualRiskScore: decimal("residual_risk_score", { precision: 6, scale: 2 }),
    controls: jsonb("controls"), // [{ id, name, type, effectiveness }]
    reviewDate: timestamp("review_date", { withTimezone: true }),
    lastAssessedAt: timestamp("last_assessed_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("identified"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("acm_risk_registers_tenant_idx").on(t.tenantId),
    index("acm_risk_registers_ref_idx").on(t.riskRef),
    index("acm_risk_registers_status_idx").on(t.status),
    index("acm_risk_registers_level_idx").on(t.riskLevel),
  ]
);

// ==========================================
// Policy & Procedure Management
// ==========================================
export const acmPolicyProcedures = pgTable(
  "acm_policy_procedures",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    policyRef: varchar("policy_ref", { length: 50 }).notNull(),
    policyType: varchar("policy_type", { length: 30 }).notNull(), // policy, procedure, guideline, standard, manual
    title: varchar("title", { length: 255 }).notNull(),
    version: varchar("version", { length: 20 }),
    category: varchar("category", { length: 100 }),
    department: varchar("department", { length: 255 }),
    author: varchar("author", { length: 255 }),
    approver: varchar("approver", { length: 255 }),
    approvalDate: timestamp("approval_date", { withTimezone: true }),
    effectiveDate: timestamp("effective_date", { withTimezone: true }),
    reviewDate: timestamp("review_date", { withTimezone: true }),
    expiryDate: timestamp("expiry_date", { withTimezone: true }),
    documentUrl: text("document_url"),
    summary: text("summary"),
    distributionList: jsonb("distribution_list"), // [{ name, email, acknowledged }]
    acknowledgmentCount: integer("acknowledgment_count").default(0),
    totalDistributed: integer("total_distributed").default(0),
    relatedPolicies: jsonb("related_policies"), // [{ id, ref, title }]
    changeHistory: jsonb("change_history"), // [{ version, date, author, changes }]
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("acm_policy_procedures_tenant_idx").on(t.tenantId),
    index("acm_policy_procedures_ref_idx").on(t.policyRef),
    index("acm_policy_procedures_status_idx").on(t.status),
    index("acm_policy_procedures_type_idx").on(t.policyType),
  ]
);

// ==========================================
// Regulatory Reporting & Submissions
// ==========================================
export const acmRegulatoryReportingSubmissions = pgTable(
  "acm_regulatory_reporting_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    submissionRef: varchar("submission_ref", { length: 50 }).notNull(),
    submissionType: varchar("submission_type", { length: 30 }).notNull(), // annual_report, quarterly_filing, incident_report, statistical_report, customs_report, tax_filing
    title: varchar("title", { length: 255 }).notNull(),
    regulation: varchar("regulation", { length: 255 }),
    authority: varchar("authority", { length: 255 }),
    jurisdiction: varchar("jurisdiction", { length: 100 }),
    reportingPeriodStart: timestamp("reporting_period_start", { withTimezone: true }),
    reportingPeriodEnd: timestamp("reporting_period_end", { withTimezone: true }),
    dueDate: timestamp("due_date", { withTimezone: true }),
    submissionDate: timestamp("submission_date", { withTimezone: true }),
    submissionFormat: varchar("submission_format", { length: 50 }), // pdf, xml, xbrl, csv, api
    submissionChannel: varchar("submission_channel", { length: 50 }), // portal, email, api, physical
    dataPayload: jsonb("data_payload"), // { sections: [], totals: {} }
    acknowledgmentRef: varchar("acknowledgment_ref", { length: 100 }),
    acknowledgmentDate: timestamp("acknowledgment_date", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
    attachments: jsonb("attachments"), // [{ name, url, type }]
    preparedBy: varchar("prepared_by", { length: 255 }),
    reviewedBy: varchar("reviewed_by", { length: 255 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("acm_reg_report_sub_tenant_idx").on(t.tenantId),
    index("acm_reg_report_sub_ref_idx").on(t.submissionRef),
    index("acm_reg_report_sub_status_idx").on(t.status),
    index("acm_reg_report_sub_due_idx").on(t.dueDate),
  ]
);

// ==========================================
// SOX & Financial Controls Compliance
// ==========================================
export const acmSoxFinancialControls = pgTable(
  "acm_sox_financial_controls",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    controlRef: varchar("control_ref", { length: 50 }).notNull(),
    controlType: varchar("control_type", { length: 30 }).notNull(), // preventive, detective, corrective, compensating
    title: varchar("title", { length: 255 }).notNull(),
    controlObjective: text("control_objective"),
    processArea: varchar("process_area", { length: 255 }),
    controlOwner: varchar("control_owner", { length: 255 }),
    controlFrequency: varchar("control_frequency", { length: 30 }), // daily, weekly, monthly, quarterly, annual
    testProcedure: text("test_procedure"),
    testFrequency: varchar("test_frequency", { length: 30 }),
    lastTestDate: timestamp("last_test_date", { withTimezone: true }),
    nextTestDate: timestamp("next_test_date", { withTimezone: true }),
    testResult: varchar("test_result", { length: 20 }), // effective, ineffective, partially_effective
    deficiencyLevel: varchar("deficiency_level", { length: 30 }), // none, deficiency, significant_deficiency, material_weakness
    remediationPlan: text("remediation_plan"),
    remediationDueDate: timestamp("remediation_due_date", { withTimezone: true }),
    remediationCompletedDate: timestamp("remediation_completed_date", { withTimezone: true }),
    evidenceLinks: jsonb("evidence_links"), // [{ name, url, type, date }]
    riskRating: varchar("risk_rating", { length: 20 }), // low, medium, high
    keyControl: boolean("key_control").default(false),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("acm_sox_controls_tenant_idx").on(t.tenantId),
    index("acm_sox_controls_ref_idx").on(t.controlRef),
    index("acm_sox_controls_status_idx").on(t.status),
    index("acm_sox_controls_type_idx").on(t.controlType),
  ]
);

// ==========================================
// ISO Certification Tracking & Renewal
// ==========================================
export const acmIsoCertificationTrackings = pgTable(
  "acm_iso_certification_trackings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    certificationRef: varchar("certification_ref", { length: 50 }).notNull(),
    certificationType: varchar("certification_type", { length: 30 }).notNull(), // iso_9001, iso_14001, iso_27001, iso_45001, iso_22000, isps_code
    standard: varchar("standard", { length: 100 }).notNull(),
    scope: text("scope"),
    certifyingBody: varchar("certifying_body", { length: 255 }),
    certificateNumber: varchar("certificate_number", { length: 100 }),
    issueDate: timestamp("issue_date", { withTimezone: true }),
    expiryDate: timestamp("expiry_date", { withTimezone: true }),
    renewalDate: timestamp("renewal_date", { withTimezone: true }),
    lastSurveillanceDate: timestamp("last_surveillance_date", { withTimezone: true }),
    nextSurveillanceDate: timestamp("next_surveillance_date", { withTimezone: true }),
    surveillanceSchedule: jsonb("surveillance_schedule"), // [{ date, type, status }]
    auditFindings: jsonb("audit_findings"), // [{ finding, severity, status }]
    correctiveActions: jsonb("corrective_actions"), // [{ action, responsible, dueDate, status }]
    nonConformities: integer("non_conformities").default(0),
    majorNonConformities: integer("major_non_conformities").default(0),
    documentUrl: text("document_url"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("acm_iso_cert_tenant_idx").on(t.tenantId),
    index("acm_iso_cert_ref_idx").on(t.certificationRef),
    index("acm_iso_cert_status_idx").on(t.status),
    index("acm_iso_cert_expiry_idx").on(t.expiryDate),
  ]
);

// ==========================================
// AI Risk Detection & Scoring
// ==========================================
export const acmAiRiskDetections = pgTable(
  "acm_ai_risk_detections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    detectionRef: varchar("detection_ref", { length: 50 }).notNull(),
    detectionType: varchar("detection_type", { length: 30 }).notNull(), // anomaly_detection, pattern_analysis, predictive_risk, fraud_detection, compliance_breach, behavioral_analysis
    title: varchar("title", { length: 255 }).notNull(),
    modelName: varchar("model_name", { length: 255 }),
    modelVersion: varchar("model_version", { length: 50 }),
    entityType: varchar("entity_type", { length: 100 }), // transaction, vessel, booking, customer, vendor
    entityRef: varchar("entity_ref", { length: 100 }),
    riskScore: decimal("risk_score", { precision: 6, scale: 2 }),
    confidenceScore: decimal("confidence_score", { precision: 6, scale: 2 }),
    riskLevel: varchar("risk_level", { length: 20 }), // low, medium, high, critical
    riskFactors: jsonb("risk_factors"), // [{ factor, weight, contribution }]
    alerts: jsonb("alerts"), // [{ type, message, severity, timestamp }]
    threshold: decimal("threshold", { precision: 6, scale: 2 }),
    isAboveThreshold: boolean("is_above_threshold").default(false),
    recommendations: jsonb("recommendations"), // [{ action, priority, description }]
    investigationStatus: varchar("investigation_status", { length: 30 }), // pending, investigating, resolved, dismissed
    investigatedBy: varchar("investigated_by", { length: 255 }),
    resolutionNotes: text("resolution_notes"),
    detectedAt: timestamp("detected_at", { withTimezone: true }).notNull().defaultNow(),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("acm_ai_risk_det_tenant_idx").on(t.tenantId),
    index("acm_ai_risk_det_ref_idx").on(t.detectionRef),
    index("acm_ai_risk_det_status_idx").on(t.status),
    index("acm_ai_risk_det_level_idx").on(t.riskLevel),
    index("acm_ai_risk_det_entity_idx").on(t.entityType, t.entityRef),
  ]
);
