import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// Cargo Claim Registration & Triage
// ==========================================
export const ccmClaimRegistrations = pgTable("ccm_claim_registrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  claimRef: varchar("claim_ref", { length: 100 }).notNull(),
  claimType: varchar("claim_type", { length: 50 }).notNull(), // cargo_damage, cargo_loss, shortage, contamination, delay, misdelivery
  claimantName: varchar("claimant_name", { length: 255 }),
  claimantEmail: varchar("claimant_email", { length: 255 }),
  claimantPhone: varchar("claimant_phone", { length: 50 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  voyageRef: varchar("voyage_ref", { length: 100 }),
  blNumber: varchar("bl_number", { length: 100 }),
  containerNumbers: text("container_numbers"),
  portOfLoading: varchar("port_of_loading", { length: 255 }),
  portOfDischarge: varchar("port_of_discharge", { length: 255 }),
  cargoDescription: text("cargo_description"),
  claimAmountUsd: decimal("claim_amount_usd", { precision: 14, scale: 2 }),
  claimCurrency: varchar("claim_currency", { length: 3 }),
  claimAmountOriginal: decimal("claim_amount_original", { precision: 14, scale: 2 }),
  dateOfLoss: timestamp("date_of_loss", { withTimezone: true }),
  dateNotified: timestamp("date_notified", { withTimezone: true }),
  triagePriority: varchar("triage_priority", { length: 20 }), // critical, high, medium, low
  assignedHandler: varchar("assigned_handler", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Liability Assessment Hague-Visby Rules
// ==========================================
export const ccmLiabilityAssessments = pgTable("ccm_liability_assessments", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  assessmentRef: varchar("assessment_ref", { length: 100 }).notNull(),
  assessmentType: varchar("assessment_type", { length: 50 }).notNull(), // hague_visby, hamburg_rules, rotterdam_rules, national_law, contractual
  claimId: varchar("claim_id", { length: 100 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  applicableConvention: varchar("applicable_convention", { length: 100 }),
  liabilityBasis: text("liability_basis"),
  limitationApplied: boolean("limitation_applied"),
  limitPerPackage: decimal("limit_per_package", { precision: 14, scale: 2 }),
  limitPerKg: decimal("limit_per_kg", { precision: 14, scale: 4 }),
  totalPackages: integer("total_packages"),
  totalWeightKg: decimal("total_weight_kg", { precision: 14, scale: 3 }),
  calculatedLimit: decimal("calculated_limit", { precision: 14, scale: 2 }),
  defenseApplicable: varchar("defense_applicable", { length: 100 }),
  defenseDescription: text("defense_description"),
  recommendedLiability: decimal("recommended_liability", { precision: 14, scale: 2 }),
  carrierLiabilityPct: decimal("carrier_liability_pct", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Cargo Damage Survey & Documentation
// ==========================================
export const ccmDamageSurveys = pgTable("ccm_damage_surveys", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  surveyRef: varchar("survey_ref", { length: 100 }).notNull(),
  surveyType: varchar("survey_type", { length: 50 }).notNull(), // joint_survey, independent_survey, pre_shipment, discharge_survey, re_survey
  claimId: varchar("claim_id", { length: 100 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  surveyorName: varchar("surveyor_name", { length: 255 }),
  surveyorCompany: varchar("surveyor_company", { length: 255 }),
  surveyDate: timestamp("survey_date", { withTimezone: true }),
  surveyLocation: varchar("survey_location", { length: 255 }),
  damageType: varchar("damage_type", { length: 100 }), // wet_damage, physical_damage, contamination, temperature, pilferage, shortage
  damageExtent: varchar("damage_extent", { length: 50 }), // total_loss, partial_loss, minor, moderate, severe
  estimatedDamageUsd: decimal("estimated_damage_usd", { precision: 14, scale: 2 }),
  containerCondition: varchar("container_condition", { length: 100 }),
  sealCondition: varchar("seal_condition", { length: 100 }),
  photosAttached: boolean("photos_attached"),
  reportReceived: boolean("report_received"),
  reportDate: timestamp("report_date", { withTimezone: true }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Time Bar Tracking & Alerts
// ==========================================
export const ccmTimeBarTrackings = pgTable("ccm_time_bar_trackings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  trackingRef: varchar("tracking_ref", { length: 100 }).notNull(),
  trackingType: varchar("tracking_type", { length: 50 }).notNull(), // suit_time_bar, arbitration_deadline, notice_period, extension, tolling_agreement
  claimId: varchar("claim_id", { length: 100 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  applicableLaw: varchar("applicable_law", { length: 100 }),
  timeBarPeriodMonths: integer("time_bar_period_months"),
  dateOfDelivery: timestamp("date_of_delivery", { withTimezone: true }),
  timeBarDeadline: timestamp("time_bar_deadline", { withTimezone: true }),
  daysRemaining: integer("days_remaining"),
  extensionGranted: boolean("extension_granted"),
  extensionDate: timestamp("extension_date", { withTimezone: true }),
  alertSent30Days: boolean("alert_sent_30_days"),
  alertSent60Days: boolean("alert_sent_60_days"),
  alertSent90Days: boolean("alert_sent_90_days"),
  protectiveAction: varchar("protective_action", { length: 100 }),
  protectiveActionDate: timestamp("protective_action_date", { withTimezone: true }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Claim Settlement & Payment Processing
// ==========================================
export const ccmClaimSettlements = pgTable("ccm_claim_settlements", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  settlementRef: varchar("settlement_ref", { length: 100 }).notNull(),
  settlementType: varchar("settlement_type", { length: 50 }).notNull(), // full_settlement, partial_settlement, compromise, denial, withdrawal, without_prejudice
  claimId: varchar("claim_id", { length: 100 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  originalClaimAmount: decimal("original_claim_amount", { precision: 14, scale: 2 }),
  offeredAmount: decimal("offered_amount", { precision: 14, scale: 2 }),
  settledAmount: decimal("settled_amount", { precision: 14, scale: 2 }),
  settlementCurrency: varchar("settlement_currency", { length: 3 }),
  settlementDate: timestamp("settlement_date", { withTimezone: true }),
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentReference: varchar("payment_reference", { length: 100 }),
  paymentDate: timestamp("payment_date", { withTimezone: true }),
  releaseObtained: boolean("release_obtained"),
  releaseDate: timestamp("release_date", { withTimezone: true }),
  savingsAmount: decimal("savings_amount", { precision: 14, scale: 2 }),
  savingsPercentage: decimal("savings_percentage", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Subrogation & Recovery Management
// ==========================================
export const ccmSubrogationRecoveries = pgTable("ccm_subrogation_recoveries", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  recoveryRef: varchar("recovery_ref", { length: 100 }).notNull(),
  recoveryType: varchar("recovery_type", { length: 50 }).notNull(), // subrogation, contribution, indemnity, recourse, third_party
  claimId: varchar("claim_id", { length: 100 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  respondentName: varchar("respondent_name", { length: 255 }),
  respondentType: varchar("respondent_type", { length: 50 }), // stevedore, terminal, sub_contractor, co_carrier, insurer
  amountClaimed: decimal("amount_claimed", { precision: 14, scale: 2 }),
  amountRecovered: decimal("amount_recovered", { precision: 14, scale: 2 }),
  recoveryCurrency: varchar("recovery_currency", { length: 3 }),
  recoveryBasis: text("recovery_basis"),
  demandLetterDate: timestamp("demand_letter_date", { withTimezone: true }),
  responseDeadline: timestamp("response_deadline", { withTimezone: true }),
  recoveryDate: timestamp("recovery_date", { withTimezone: true }),
  legalActionFiled: boolean("legal_action_filed"),
  recoveryPercentage: decimal("recovery_percentage", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// AI Claim Probability Prediction
// ==========================================
export const ccmClaimPredictions = pgTable("ccm_claim_predictions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  predictionRef: varchar("prediction_ref", { length: 100 }).notNull(),
  predictionType: varchar("prediction_type", { length: 50 }).notNull(), // success_probability, settlement_range, duration_estimate, liability_score, recovery_likelihood
  claimId: varchar("claim_id", { length: 100 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  modelVersion: varchar("model_version", { length: 50 }),
  inputFeatures: jsonb("input_features"),
  successProbability: decimal("success_probability", { precision: 5, scale: 4 }),
  predictedSettlement: decimal("predicted_settlement", { precision: 14, scale: 2 }),
  confidenceInterval: varchar("confidence_interval", { length: 50 }),
  estimatedDurationDays: integer("estimated_duration_days"),
  riskScore: decimal("risk_score", { precision: 5, scale: 2 }),
  recommendedAction: text("recommended_action"),
  similarCasesCount: integer("similar_cases_count"),
  historicalAvgSettlement: decimal("historical_avg_settlement", { precision: 14, scale: 2 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Claims Portfolio Analytics
// ==========================================
export const ccmPortfolioAnalytics = pgTable("ccm_portfolio_analytics", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  analyticsRef: varchar("analytics_ref", { length: 100 }).notNull(),
  analyticsType: varchar("analytics_type", { length: 50 }).notNull(), // quarterly_review, annual_summary, trend_analysis, loss_ratio, reserve_adequacy
  reportingPeriod: varchar("reporting_period", { length: 50 }),
  totalClaimsCount: integer("total_claims_count"),
  openClaimsCount: integer("open_claims_count"),
  closedClaimsCount: integer("closed_claims_count"),
  totalIncurredUsd: decimal("total_incurred_usd", { precision: 14, scale: 2 }),
  totalPaidUsd: decimal("total_paid_usd", { precision: 14, scale: 2 }),
  totalReservedUsd: decimal("total_reserved_usd", { precision: 14, scale: 2 }),
  totalRecoveredUsd: decimal("total_recovered_usd", { precision: 14, scale: 2 }),
  lossRatio: decimal("loss_ratio", { precision: 8, scale: 4 }),
  avgSettlementDays: integer("avg_settlement_days"),
  avgClaimValueUsd: decimal("avg_claim_value_usd", { precision: 14, scale: 2 }),
  topClaimCategory: varchar("top_claim_category", { length: 100 }),
  trendDirection: varchar("trend_direction", { length: 20 }), // improving, stable, deteriorating
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
