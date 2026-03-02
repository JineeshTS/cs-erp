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
// P&I Club Policy & Correspondence Management
// ==========================================
export const icmPiClubPolicies = pgTable(
  "icm_pi_club_policies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    policyRef: varchar("policy_ref", { length: 50 }).notNull(),
    policyType: varchar("policy_type", { length: 30 }).notNull(), // pi_club, freight_demurrage, charterers_liability, war_risk
    clubName: varchar("club_name", { length: 255 }).notNull(),
    clubContactName: varchar("club_contact_name", { length: 255 }),
    clubContactEmail: varchar("club_contact_email", { length: 255 }),
    clubContactPhone: varchar("club_contact_phone", { length: 50 }),
    vesselName: varchar("vessel_name", { length: 255 }),
    imoNumber: varchar("imo_number", { length: 20 }),
    coverageStart: timestamp("coverage_start", { withTimezone: true }),
    coverageEnd: timestamp("coverage_end", { withTimezone: true }),
    premiumAmount: decimal("premium_amount", { precision: 14, scale: 2 }),
    premiumCurrency: varchar("premium_currency", { length: 3 }).default("USD"),
    deductibleAmount: decimal("deductible_amount", { precision: 14, scale: 2 }),
    coverageLimit: decimal("coverage_limit", { precision: 18, scale: 2 }),
    coveredRisks: jsonb("covered_risks"), // array of risk categories
    exclusions: jsonb("exclusions"),
    correspondenceLog: jsonb("correspondence_log"), // array of { date, subject, body, direction }
    renewalDate: timestamp("renewal_date", { withTimezone: true }),
    renewalStatus: varchar("renewal_status", { length: 20 }), // pending, renewed, lapsed
    brokerName: varchar("broker_name", { length: 255 }),
    brokerRef: varchar("broker_ref", { length: 50 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("icm_pi_club_policy_tenant_idx").on(t.tenantId),
    index("icm_pi_club_policy_ref_idx").on(t.policyRef),
    index("icm_pi_club_policy_status_idx").on(t.status),
    index("icm_pi_club_policy_type_idx").on(t.policyType),
    index("icm_pi_club_policy_vessel_idx").on(t.vesselName),
    index("icm_pi_club_policy_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Hull & Machinery Insurance Management
// ==========================================
export const icmHullMachineryInsurances = pgTable(
  "icm_hull_machinery_insurances",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    policyRef: varchar("policy_ref", { length: 50 }).notNull(),
    policyType: varchar("policy_type", { length: 30 }).notNull(), // hull_machinery, increased_value, loss_of_hire, war_risk
    insurerName: varchar("insurer_name", { length: 255 }).notNull(),
    insurerContactName: varchar("insurer_contact_name", { length: 255 }),
    insurerContactEmail: varchar("insurer_contact_email", { length: 255 }),
    vesselName: varchar("vessel_name", { length: 255 }),
    imoNumber: varchar("imo_number", { length: 20 }),
    vesselValue: decimal("vessel_value", { precision: 18, scale: 2 }),
    insuredValue: decimal("insured_value", { precision: 18, scale: 2 }),
    valueCurrency: varchar("value_currency", { length: 3 }).default("USD"),
    coverageStart: timestamp("coverage_start", { withTimezone: true }),
    coverageEnd: timestamp("coverage_end", { withTimezone: true }),
    premiumAmount: decimal("premium_amount", { precision: 14, scale: 2 }),
    premiumCurrency: varchar("premium_currency", { length: 3 }).default("USD"),
    deductibleAmount: decimal("deductible_amount", { precision: 14, scale: 2 }),
    tradingLimits: text("trading_limits"),
    classificationRequired: varchar("classification_required", { length: 255 }),
    conditionSurveyRequired: boolean("condition_survey_required").default(false),
    lastSurveyDate: timestamp("last_survey_date", { withTimezone: true }),
    renewalDate: timestamp("renewal_date", { withTimezone: true }),
    brokerName: varchar("broker_name", { length: 255 }),
    brokerRef: varchar("broker_ref", { length: 50 }),
    coveredPerils: jsonb("covered_perils"),
    exclusions: jsonb("exclusions"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("icm_hull_mach_tenant_idx").on(t.tenantId),
    index("icm_hull_mach_ref_idx").on(t.policyRef),
    index("icm_hull_mach_status_idx").on(t.status),
    index("icm_hull_mach_type_idx").on(t.policyType),
    index("icm_hull_mach_vessel_idx").on(t.vesselName),
    index("icm_hull_mach_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Cargo Insurance Policy Management
// ==========================================
export const icmCargoInsurancePolicies = pgTable(
  "icm_cargo_insurance_policies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    policyRef: varchar("policy_ref", { length: 50 }).notNull(),
    policyType: varchar("policy_type", { length: 30 }).notNull(), // open_cover, specific_voyage, annual, warehouse_to_warehouse
    insurerName: varchar("insurer_name", { length: 255 }).notNull(),
    insuredParty: varchar("insured_party", { length: 255 }),
    coverageType: varchar("coverage_type", { length: 30 }), // all_risk, fpa, wa, icc_a, icc_b, icc_c
    cargoDescription: text("cargo_description"),
    hsCode: varchar("hs_code", { length: 20 }),
    cargoValue: decimal("cargo_value", { precision: 18, scale: 2 }),
    insuredValue: decimal("insured_value", { precision: 18, scale: 2 }),
    valueCurrency: varchar("value_currency", { length: 3 }).default("USD"),
    coverageStart: timestamp("coverage_start", { withTimezone: true }),
    coverageEnd: timestamp("coverage_end", { withTimezone: true }),
    premiumAmount: decimal("premium_amount", { precision: 14, scale: 2 }),
    premiumRate: decimal("premium_rate", { precision: 8, scale: 4 }),
    premiumCurrency: varchar("premium_currency", { length: 3 }).default("USD"),
    deductibleAmount: decimal("deductible_amount", { precision: 14, scale: 2 }),
    originPort: varchar("origin_port", { length: 255 }),
    destinationPort: varchar("destination_port", { length: 255 }),
    vesselName: varchar("vessel_name", { length: 255 }),
    voyageNumber: varchar("voyage_number", { length: 50 }),
    bookingRef: varchar("booking_ref", { length: 50 }),
    blNumber: varchar("bl_number", { length: 50 }),
    certificateNumber: varchar("certificate_number", { length: 50 }),
    brokerName: varchar("broker_name", { length: 255 }),
    specialConditions: text("special_conditions"),
    exclusions: jsonb("exclusions"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("icm_cargo_ins_tenant_idx").on(t.tenantId),
    index("icm_cargo_ins_ref_idx").on(t.policyRef),
    index("icm_cargo_ins_status_idx").on(t.status),
    index("icm_cargo_ins_type_idx").on(t.policyType),
    index("icm_cargo_ins_vessel_idx").on(t.vesselName),
    index("icm_cargo_ins_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Survey Appointment & Coordination
// ==========================================
export const icmSurveyAppointments = pgTable(
  "icm_survey_appointments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    appointmentRef: varchar("appointment_ref", { length: 50 }).notNull(),
    appointmentType: varchar("appointment_type", { length: 30 }).notNull(), // damage_survey, condition_survey, cargo_survey, pni_survey, hull_survey
    claimRef: varchar("claim_ref", { length: 50 }),
    policyRef: varchar("policy_ref", { length: 50 }),
    vesselName: varchar("vessel_name", { length: 255 }),
    imoNumber: varchar("imo_number", { length: 20 }),
    portName: varchar("port_name", { length: 255 }),
    terminalName: varchar("terminal_name", { length: 255 }),
    surveyorName: varchar("surveyor_name", { length: 255 }),
    surveyorCompany: varchar("surveyor_company", { length: 255 }),
    surveyorEmail: varchar("surveyor_email", { length: 255 }),
    surveyorPhone: varchar("surveyor_phone", { length: 50 }),
    appointedBy: varchar("appointed_by", { length: 255 }),
    appointedAt: timestamp("appointed_at", { withTimezone: true }),
    scheduledDate: timestamp("scheduled_date", { withTimezone: true }),
    completedDate: timestamp("completed_date", { withTimezone: true }),
    surveyScope: text("survey_scope"),
    surveyFindings: text("survey_findings"),
    reportUrl: varchar("report_url", { length: 500 }),
    reportDate: timestamp("report_date", { withTimezone: true }),
    estimatedCost: decimal("estimated_cost", { precision: 14, scale: 2 }),
    actualCost: decimal("actual_cost", { precision: 14, scale: 2 }),
    costCurrency: varchar("cost_currency", { length: 3 }).default("USD"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("icm_survey_appt_tenant_idx").on(t.tenantId),
    index("icm_survey_appt_ref_idx").on(t.appointmentRef),
    index("icm_survey_appt_status_idx").on(t.status),
    index("icm_survey_appt_type_idx").on(t.appointmentType),
    index("icm_survey_appt_vessel_idx").on(t.vesselName),
    index("icm_survey_appt_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Claims Registration & Investigation
// ==========================================
export const icmClaimsRegistrations = pgTable(
  "icm_claims_registrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    claimRef: varchar("claim_ref", { length: 50 }).notNull(),
    claimType: varchar("claim_type", { length: 30 }).notNull(), // cargo_damage, collision, pi_liability, hull_damage, crew_injury, pollution, theft, general_average
    policyRef: varchar("policy_ref", { length: 50 }),
    vesselName: varchar("vessel_name", { length: 255 }),
    imoNumber: varchar("imo_number", { length: 20 }),
    voyageNumber: varchar("voyage_number", { length: 50 }),
    incidentDate: timestamp("incident_date", { withTimezone: true }),
    incidentLocation: varchar("incident_location", { length: 255 }),
    incidentDescription: text("incident_description"),
    claimantName: varchar("claimant_name", { length: 255 }),
    claimantContact: varchar("claimant_contact", { length: 255 }),
    claimantType: varchar("claimant_type", { length: 30 }), // owner, charterer, cargo_interest, third_party, crew
    estimatedAmount: decimal("estimated_amount", { precision: 18, scale: 2 }),
    reserveAmount: decimal("reserve_amount", { precision: 18, scale: 2 }),
    settledAmount: decimal("settled_amount", { precision: 18, scale: 2 }),
    claimCurrency: varchar("claim_currency", { length: 3 }).default("USD"),
    investigatorName: varchar("investigator_name", { length: 255 }),
    investigationFindings: text("investigation_findings"),
    supportingDocuments: jsonb("supporting_documents"), // array of { name, url, type }
    timeBarDate: timestamp("time_bar_date", { withTimezone: true }),
    registeredAt: timestamp("registered_at", { withTimezone: true }),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    closureReason: varchar("closure_reason", { length: 50 }), // settled, denied, withdrawn, time_barred
    status: varchar("status", { length: 20 }).notNull().default("open"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("icm_claim_reg_tenant_idx").on(t.tenantId),
    index("icm_claim_reg_ref_idx").on(t.claimRef),
    index("icm_claim_reg_status_idx").on(t.status),
    index("icm_claim_reg_type_idx").on(t.claimType),
    index("icm_claim_reg_vessel_idx").on(t.vesselName),
    index("icm_claim_reg_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Claims Recovery & Subrogation Management
// ==========================================
export const icmClaimsRecoveries = pgTable(
  "icm_claims_recoveries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    recoveryRef: varchar("recovery_ref", { length: 50 }).notNull(),
    recoveryType: varchar("recovery_type", { length: 30 }).notNull(), // subrogation, contribution, salvage, general_average, third_party
    claimRef: varchar("claim_ref", { length: 50 }),
    policyRef: varchar("policy_ref", { length: 50 }),
    vesselName: varchar("vessel_name", { length: 255 }),
    respondentName: varchar("respondent_name", { length: 255 }),
    respondentContact: varchar("respondent_contact", { length: 255 }),
    respondentInsurer: varchar("respondent_insurer", { length: 255 }),
    originalClaimAmount: decimal("original_claim_amount", { precision: 18, scale: 2 }),
    targetRecoveryAmount: decimal("target_recovery_amount", { precision: 18, scale: 2 }),
    recoveredAmount: decimal("recovered_amount", { precision: 18, scale: 2 }),
    recoveryCurrency: varchar("recovery_currency", { length: 3 }).default("USD"),
    recoveryBasis: text("recovery_basis"),
    legalCounsel: varchar("legal_counsel", { length: 255 }),
    legalCosts: decimal("legal_costs", { precision: 14, scale: 2 }),
    filedAt: timestamp("filed_at", { withTimezone: true }),
    settledAt: timestamp("settled_at", { withTimezone: true }),
    limitationDate: timestamp("limitation_date", { withTimezone: true }),
    courtJurisdiction: varchar("court_jurisdiction", { length: 255 }),
    arbitrationClause: text("arbitration_clause"),
    supportingDocuments: jsonb("supporting_documents"),
    status: varchar("status", { length: 20 }).notNull().default("open"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("icm_claim_rec_tenant_idx").on(t.tenantId),
    index("icm_claim_rec_ref_idx").on(t.recoveryRef),
    index("icm_claim_rec_status_idx").on(t.status),
    index("icm_claim_rec_type_idx").on(t.recoveryType),
    index("icm_claim_rec_vessel_idx").on(t.vesselName),
    index("icm_claim_rec_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// AI Claims Prediction & Prevention
// ==========================================
export const icmClaimsPredictions = pgTable(
  "icm_claims_predictions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    predictionRef: varchar("prediction_ref", { length: 50 }).notNull(),
    predictionType: varchar("prediction_type", { length: 30 }).notNull(), // risk_assessment, claim_likelihood, severity_estimate, fraud_detection
    vesselName: varchar("vessel_name", { length: 255 }),
    imoNumber: varchar("imo_number", { length: 20 }),
    voyageNumber: varchar("voyage_number", { length: 50 }),
    tradeRoute: varchar("trade_route", { length: 255 }),
    cargoType: varchar("cargo_type", { length: 100 }),
    riskScore: decimal("risk_score", { precision: 5, scale: 2 }), // 0-100
    riskLevel: varchar("risk_level", { length: 20 }), // low, medium, high, critical
    predictedClaimType: varchar("predicted_claim_type", { length: 30 }),
    predictedAmount: decimal("predicted_amount", { precision: 18, scale: 2 }),
    predictionCurrency: varchar("prediction_currency", { length: 3 }).default("USD"),
    confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }),
    riskFactors: jsonb("risk_factors"), // array of { factor, weight, description }
    mitigationActions: jsonb("mitigation_actions"), // array of { action, priority, status }
    modelVersion: varchar("model_version", { length: 20 }),
    dataInputs: jsonb("data_inputs"),
    actualOutcome: varchar("actual_outcome", { length: 30 }), // no_claim, claim_filed, claim_settled
    actualAmount: decimal("actual_amount", { precision: 18, scale: 2 }),
    predictionAccuracy: decimal("prediction_accuracy", { precision: 5, scale: 2 }),
    generatedAt: timestamp("generated_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("icm_claim_pred_tenant_idx").on(t.tenantId),
    index("icm_claim_pred_ref_idx").on(t.predictionRef),
    index("icm_claim_pred_status_idx").on(t.status),
    index("icm_claim_pred_type_idx").on(t.predictionType),
    index("icm_claim_pred_vessel_idx").on(t.vesselName),
    index("icm_claim_pred_risk_idx").on(t.riskLevel),
    index("icm_claim_pred_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Loss Prevention Analytics & Reporting
// ==========================================
export const icmLossPreventionReports = pgTable(
  "icm_loss_prevention_reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    reportRef: varchar("report_ref", { length: 50 }).notNull(),
    reportType: varchar("report_type", { length: 30 }).notNull(), // quarterly, annual, vessel_specific, incident_analysis, trend_report, audit
    reportTitle: varchar("report_title", { length: 255 }).notNull(),
    periodStart: timestamp("period_start", { withTimezone: true }),
    periodEnd: timestamp("period_end", { withTimezone: true }),
    vesselName: varchar("vessel_name", { length: 255 }),
    fleetScope: varchar("fleet_scope", { length: 30 }), // single_vessel, fleet, all
    totalClaims: integer("total_claims"),
    totalClaimAmount: decimal("total_claim_amount", { precision: 18, scale: 2 }),
    totalRecovered: decimal("total_recovered", { precision: 18, scale: 2 }),
    netLoss: decimal("net_loss", { precision: 18, scale: 2 }),
    reportCurrency: varchar("report_currency", { length: 3 }).default("USD"),
    lossRatio: decimal("loss_ratio", { precision: 8, scale: 4 }),
    claimFrequency: decimal("claim_frequency", { precision: 8, scale: 4 }),
    topRiskCategories: jsonb("top_risk_categories"), // array of { category, count, amount }
    trendAnalysis: jsonb("trend_analysis"),
    recommendations: text("recommendations"),
    preventiveActions: jsonb("preventive_actions"), // array of { action, priority, owner, deadline }
    benchmarkData: jsonb("benchmark_data"),
    documentUrl: varchar("document_url", { length: 500 }),
    documentFormat: varchar("document_format", { length: 10 }),
    approvedBy: varchar("approved_by", { length: 255 }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("icm_loss_prev_tenant_idx").on(t.tenantId),
    index("icm_loss_prev_ref_idx").on(t.reportRef),
    index("icm_loss_prev_status_idx").on(t.status),
    index("icm_loss_prev_type_idx").on(t.reportType),
    index("icm_loss_prev_vessel_idx").on(t.vesselName),
    index("icm_loss_prev_deleted_idx").on(t.deletedAt),
  ]
);
