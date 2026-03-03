import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// General Agent GA Agreement Management
// ==========================================
export const anmGaAgreements = pgTable("anm_ga_agreements", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  agreementRef: varchar("agreement_ref", { length: 100 }).notNull(),
  agreementType: varchar("agreement_type", { length: 50 }).notNull(), // exclusive_ga, non_exclusive_ga, liner_agency, tramp_agency, port_agency
  agentName: varchar("agent_name", { length: 255 }),
  agentCode: varchar("agent_code", { length: 50 }),
  territory: varchar("territory", { length: 255 }),
  portsCovered: text("ports_covered"),
  commencementDate: timestamp("commencement_date", { withTimezone: true }),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  autoRenewal: boolean("auto_renewal"),
  terminationNoticeDays: integer("termination_notice_days"),
  baseCommissionPct: decimal("base_commission_pct", { precision: 8, scale: 4 }),
  commissionCurrency: varchar("commission_currency", { length: 3 }),
  exclusivityClause: boolean("exclusivity_clause"),
  performanceGuarantee: decimal("performance_guarantee", { precision: 14, scale: 2 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Sub-Agent Configuration & Access
// ==========================================
export const anmSubAgentConfigs = pgTable("anm_sub_agent_configs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  configRef: varchar("config_ref", { length: 100 }).notNull(),
  configType: varchar("config_type", { length: 50 }).notNull(), // sub_agent_appointment, access_grant, territory_assignment, commission_split, reporting_config
  parentAgentName: varchar("parent_agent_name", { length: 255 }),
  parentAgentCode: varchar("parent_agent_code", { length: 50 }),
  subAgentName: varchar("sub_agent_name", { length: 255 }),
  subAgentCode: varchar("sub_agent_code", { length: 50 }),
  territory: varchar("territory", { length: 255 }),
  accessLevel: varchar("access_level", { length: 50 }),
  commissionSplitPct: decimal("commission_split_pct", { precision: 8, scale: 4 }),
  bookingAuthority: boolean("booking_authority"),
  maxBookingValue: decimal("max_booking_value", { precision: 14, scale: 2 }),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }),
  effectiveTo: timestamp("effective_to", { withTimezone: true }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Agent Commission Calculation & Payment
// ==========================================
export const anmAgentCommissions = pgTable("anm_agent_commissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  commissionRef: varchar("commission_ref", { length: 100 }).notNull(),
  commissionType: varchar("commission_type", { length: 50 }).notNull(), // freight_commission, thc_commission, surcharge_commission, bonus_commission, override_commission
  agentName: varchar("agent_name", { length: 255 }),
  agentCode: varchar("agent_code", { length: 50 }),
  bookingRef: varchar("booking_ref", { length: 100 }),
  freightAmount: decimal("freight_amount", { precision: 14, scale: 2 }),
  commissionRate: decimal("commission_rate", { precision: 8, scale: 4 }),
  commissionAmount: decimal("commission_amount", { precision: 14, scale: 2 }),
  commissionCurrency: varchar("commission_currency", { length: 3 }),
  periodFrom: timestamp("period_from", { withTimezone: true }),
  periodTo: timestamp("period_to", { withTimezone: true }),
  paymentDate: timestamp("payment_date", { withTimezone: true }),
  paymentRef: varchar("payment_ref", { length: 100 }),
  invoiceNumber: varchar("invoice_number", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Agency Agreement Document Management
// ==========================================
export const anmAgencyDocuments = pgTable("anm_agency_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  documentRef: varchar("document_ref", { length: 100 }).notNull(),
  documentType: varchar("document_type", { length: 50 }).notNull(), // agency_agreement, amendment, addendum, termination_notice, performance_report
  agentName: varchar("agent_name", { length: 255 }),
  agentCode: varchar("agent_code", { length: 50 }),
  documentTitle: varchar("document_title", { length: 255 }),
  documentVersion: varchar("document_version", { length: 20 }),
  effectiveDate: timestamp("effective_date", { withTimezone: true }),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  signedBy: varchar("signed_by", { length: 255 }),
  signedDate: timestamp("signed_date", { withTimezone: true }),
  fileUrl: text("file_url"),
  fileSizeBytes: integer("file_size_bytes"),
  confidential: boolean("confidential"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Agent Performance KPI Dashboard
// ==========================================
export const anmPerformanceKpis = pgTable("anm_performance_kpis", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  kpiRef: varchar("kpi_ref", { length: 100 }).notNull(),
  kpiType: varchar("kpi_type", { length: 50 }).notNull(), // volume_target, revenue_target, customer_acquisition, service_quality, collection_efficiency
  agentName: varchar("agent_name", { length: 255 }),
  agentCode: varchar("agent_code", { length: 50 }),
  kpiPeriod: varchar("kpi_period", { length: 20 }),
  targetValue: decimal("target_value", { precision: 14, scale: 2 }),
  actualValue: decimal("actual_value", { precision: 14, scale: 2 }),
  achievementPct: decimal("achievement_pct", { precision: 8, scale: 4 }),
  kpiCurrency: varchar("kpi_currency", { length: 3 }),
  ranking: integer("ranking"),
  trendDirection: varchar("trend_direction", { length: 20 }),
  benchmarkValue: decimal("benchmark_value", { precision: 14, scale: 2 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Agent Portal Access & Configuration
// ==========================================
export const anmPortalConfigs = pgTable("anm_portal_configs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  configRef: varchar("config_ref", { length: 100 }).notNull(),
  configType: varchar("config_type", { length: 50 }).notNull(), // portal_access, branding_setup, module_permissions, api_integration, sso_config
  agentName: varchar("agent_name", { length: 255 }),
  agentCode: varchar("agent_code", { length: 50 }),
  portalUrl: varchar("portal_url", { length: 500 }),
  brandingTheme: varchar("branding_theme", { length: 50 }),
  enabledModules: text("enabled_modules"),
  maxUsers: integer("max_users"),
  ssoEnabled: boolean("sso_enabled"),
  apiKeyIssued: boolean("api_key_issued"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  activeSessions: integer("active_sessions"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Booking Authority Matrix Management
// ==========================================
export const anmBookingAuthorities = pgTable("anm_booking_authorities", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  authorityRef: varchar("authority_ref", { length: 100 }).notNull(),
  authorityType: varchar("authority_type", { length: 50 }).notNull(), // full_authority, limited_authority, quote_only, approval_required, emergency_authority
  agentName: varchar("agent_name", { length: 255 }),
  agentCode: varchar("agent_code", { length: 50 }),
  tradeRoute: varchar("trade_route", { length: 100 }),
  maxBookingValue: decimal("max_booking_value", { precision: 14, scale: 2 }),
  maxDiscountPct: decimal("max_discount_pct", { precision: 8, scale: 4 }),
  authorityCurrency: varchar("authority_currency", { length: 3 }),
  containerTypes: text("container_types"),
  approvalThreshold: decimal("approval_threshold", { precision: 14, scale: 2 }),
  escalationContact: varchar("escalation_contact", { length: 255 }),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }),
  effectiveTo: timestamp("effective_to", { withTimezone: true }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Agent Incentive & Bonus Management
// ==========================================
export const anmAgentIncentives = pgTable("anm_agent_incentives", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  incentiveRef: varchar("incentive_ref", { length: 100 }).notNull(),
  incentiveType: varchar("incentive_type", { length: 50 }).notNull(), // volume_bonus, target_achievement, growth_incentive, loyalty_bonus, special_campaign
  agentName: varchar("agent_name", { length: 255 }),
  agentCode: varchar("agent_code", { length: 50 }),
  incentivePeriod: varchar("incentive_period", { length: 20 }),
  targetTeu: decimal("target_teu", { precision: 10, scale: 2 }),
  achievedTeu: decimal("achieved_teu", { precision: 10, scale: 2 }),
  bonusRate: decimal("bonus_rate", { precision: 14, scale: 2 }),
  bonusAmount: decimal("bonus_amount", { precision: 14, scale: 2 }),
  incentiveCurrency: varchar("incentive_currency", { length: 3 }),
  payoutDate: timestamp("payout_date", { withTimezone: true }),
  approvedBy: varchar("approved_by", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
