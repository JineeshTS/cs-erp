import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  date,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// FEAT-005-1-001: Customer Master & Segmentation
// ==========================================

export const scmCustomers = pgTable(
  "scm_customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    customerCode: varchar("customer_code", { length: 50 }).notNull(),
    companyName: varchar("company_name", { length: 255 }).notNull(),
    tradeName: varchar("trade_name", { length: 255 }),
    customerType: varchar("customer_type", { length: 30 })
      .notNull()
      .default("shipper"),
    segmentId: uuid("segment_id"),
    tier: varchar("tier", { length: 20 }).default("standard"),
    industry: varchar("industry", { length: 100 }),
    country: varchar("country", { length: 3 }).notNull(),
    city: varchar("city", { length: 100 }),
    address: text("address"),
    postalCode: varchar("postal_code", { length: 20 }),
    phone: varchar("phone", { length: 30 }),
    email: varchar("email", { length: 255 }),
    website: varchar("website", { length: 255 }),
    taxRegistrationNo: varchar("tax_registration_no", { length: 50 }),
    creditLimitAmount: integer("credit_limit_amount"),
    creditCurrency: varchar("credit_currency", { length: 3 }).default("USD"),
    paymentTermsDays: integer("payment_terms_days").default(30),
    annualRevenue: integer("annual_revenue"),
    employeeCount: integer("employee_count"),
    accountManagerId: uuid("account_manager_id"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("scm_customers_tenant_id_idx").on(table.tenantId),
    uniqueIndex("scm_customers_tenant_code_idx").on(
      table.tenantId,
      table.customerCode
    ),
    index("scm_customers_company_name_idx").on(table.companyName),
    index("scm_customers_customer_type_idx").on(table.customerType),
    index("scm_customers_segment_id_idx").on(table.segmentId),
    index("scm_customers_tier_idx").on(table.tier),
    index("scm_customers_country_idx").on(table.country),
    index("scm_customers_status_idx").on(table.status),
    index("scm_customers_account_manager_idx").on(table.accountManagerId),
  ]
);

export const scmCustomerContacts = pgTable(
  "scm_customer_contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => scmCustomers.id),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    jobTitle: varchar("job_title", { length: 100 }),
    department: varchar("department", { length: 100 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 30 }),
    mobile: varchar("mobile", { length: 30 }),
    isPrimary: boolean("is_primary").default(false),
    isDecisionMaker: boolean("is_decision_maker").default(false),
    preferredLanguage: varchar("preferred_language", { length: 5 }).default(
      "en"
    ),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("scm_customer_contacts_tenant_id_idx").on(table.tenantId),
    index("scm_customer_contacts_customer_id_idx").on(table.customerId),
    index("scm_customer_contacts_email_idx").on(table.email),
  ]
);

export const scmCustomerSegments = pgTable(
  "scm_customer_segments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    segmentName: varchar("segment_name", { length: 100 }).notNull(),
    segmentCode: varchar("segment_code", { length: 30 }).notNull(),
    description: text("description"),
    criteria: jsonb("criteria"),
    color: varchar("color", { length: 7 }),
    sortOrder: integer("sort_order").default(0),
    isActive: boolean("is_active").default(true),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("scm_customer_segments_tenant_id_idx").on(table.tenantId),
    uniqueIndex("scm_customer_segments_tenant_code_idx").on(
      table.tenantId,
      table.segmentCode
    ),
  ]
);

// ==========================================
// FEAT-005-1-002: Opportunity & Pipeline Management
// ==========================================

export const scmPipelineStages = pgTable(
  "scm_pipeline_stages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    stageName: varchar("stage_name", { length: 100 }).notNull(),
    stageCode: varchar("stage_code", { length: 30 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    probability: integer("probability").default(0),
    color: varchar("color", { length: 7 }),
    isWon: boolean("is_won").default(false),
    isLost: boolean("is_lost").default(false),
    isActive: boolean("is_active").default(true),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("scm_pipeline_stages_tenant_id_idx").on(table.tenantId),
    uniqueIndex("scm_pipeline_stages_tenant_code_idx").on(
      table.tenantId,
      table.stageCode
    ),
    index("scm_pipeline_stages_sort_order_idx").on(table.sortOrder),
  ]
);

export const scmOpportunities = pgTable(
  "scm_opportunities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    opportunityName: varchar("opportunity_name", { length: 255 }).notNull(),
    opportunityCode: varchar("opportunity_code", { length: 50 }),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => scmCustomers.id),
    contactId: uuid("contact_id"),
    stageId: uuid("stage_id").references(() => scmPipelineStages.id),
    ownerId: uuid("owner_id").notNull(),
    expectedRevenue: integer("expected_revenue"),
    currency: varchar("currency", { length: 3 }).default("USD"),
    probability: integer("probability").default(0),
    expectedTeu: integer("expected_teu"),
    tradeLane: varchar("trade_lane", { length: 100 }),
    originPort: varchar("origin_port", { length: 10 }),
    destinationPort: varchar("destination_port", { length: 10 }),
    serviceType: varchar("service_type", { length: 30 }),
    expectedCloseDate: date("expected_close_date"),
    actualCloseDate: date("actual_close_date"),
    lostReason: varchar("lost_reason", { length: 100 }),
    competitorName: varchar("competitor_name", { length: 255 }),
    source: varchar("source", { length: 50 }),
    status: varchar("status", { length: 20 }).notNull().default("open"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("scm_opportunities_tenant_id_idx").on(table.tenantId),
    index("scm_opportunities_customer_id_idx").on(table.customerId),
    index("scm_opportunities_contact_id_idx").on(table.contactId),
    index("scm_opportunities_stage_id_idx").on(table.stageId),
    index("scm_opportunities_owner_id_idx").on(table.ownerId),
    index("scm_opportunities_status_idx").on(table.status),
    index("scm_opportunities_expected_close_idx").on(table.expectedCloseDate),
    index("scm_opportunities_trade_lane_idx").on(table.tradeLane),
  ]
);

export const scmOpportunityActivities = pgTable(
  "scm_opportunity_activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    opportunityId: uuid("opportunity_id")
      .notNull()
      .references(() => scmOpportunities.id),
    activityType: varchar("activity_type", { length: 30 }).notNull(),
    subject: varchar("subject", { length: 255 }).notNull(),
    description: text("description"),
    activityDate: timestamp("activity_date", { withTimezone: true }).notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    assignedTo: uuid("assigned_to"),
    outcome: varchar("outcome", { length: 50 }),
    status: varchar("status", { length: 20 }).notNull().default("planned"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("scm_opp_activities_tenant_id_idx").on(table.tenantId),
    index("scm_opp_activities_opportunity_id_idx").on(table.opportunityId),
    index("scm_opp_activities_assigned_to_idx").on(table.assignedTo),
    index("scm_opp_activities_status_idx").on(table.status),
    index("scm_opp_activities_activity_date_idx").on(table.activityDate),
  ]
);

// ==========================================
// FEAT-005-1-003: Rate Quotation Management
// ==========================================

export const scmRateQuotations = pgTable(
  "scm_rate_quotations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    quotationNumber: varchar("quotation_number", { length: 50 }).notNull(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => scmCustomers.id),
    contactId: uuid("contact_id"),
    opportunityId: uuid("opportunity_id"),
    salesRepId: uuid("sales_rep_id").notNull(),
    originPort: varchar("origin_port", { length: 10 }).notNull(),
    destinationPort: varchar("destination_port", { length: 10 }).notNull(),
    tradeLane: varchar("trade_lane", { length: 100 }),
    serviceType: varchar("service_type", { length: 30 }),
    containerType: varchar("container_type", { length: 20 }),
    containerSize: varchar("container_size", { length: 10 }),
    estimatedTeu: integer("estimated_teu"),
    estimatedVolume: integer("estimated_volume"),
    totalAmount: integer("total_amount"),
    currency: varchar("currency", { length: 3 }).default("USD"),
    validFrom: timestamp("valid_from", { withTimezone: true }).notNull(),
    validTo: timestamp("valid_to", { withTimezone: true }).notNull(),
    transitTimeDays: integer("transit_time_days"),
    freeTimeDays: integer("free_time_days"),
    incoterm: varchar("incoterm", { length: 10 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    approvedBy: uuid("approved_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("scm_rate_quotations_tenant_id_idx").on(table.tenantId),
    uniqueIndex("scm_rate_quotations_tenant_number_idx").on(
      table.tenantId,
      table.quotationNumber
    ),
    index("scm_rate_quotations_customer_id_idx").on(table.customerId),
    index("scm_rate_quotations_opportunity_id_idx").on(table.opportunityId),
    index("scm_rate_quotations_sales_rep_id_idx").on(table.salesRepId),
    index("scm_rate_quotations_status_idx").on(table.status),
    index("scm_rate_quotations_valid_from_idx").on(table.validFrom),
    index("scm_rate_quotations_trade_lane_idx").on(table.tradeLane),
  ]
);

export const scmQuotationLineItems = pgTable(
  "scm_quotation_line_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    quotationId: uuid("quotation_id")
      .notNull()
      .references(() => scmRateQuotations.id),
    chargeCode: varchar("charge_code", { length: 30 }).notNull(),
    chargeName: varchar("charge_name", { length: 255 }).notNull(),
    chargeType: varchar("charge_type", { length: 30 }).notNull(),
    basis: varchar("basis", { length: 20 }).notNull(),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull().default(1),
    totalPrice: integer("total_price").notNull(),
    currency: varchar("currency", { length: 3 }).default("USD"),
    containerType: varchar("container_type", { length: 20 }),
    containerSize: varchar("container_size", { length: 10 }),
    isMandatory: boolean("is_mandatory").default(true),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("scm_quotation_line_items_tenant_id_idx").on(table.tenantId),
    index("scm_quotation_line_items_quotation_id_idx").on(table.quotationId),
    index("scm_quotation_line_items_charge_code_idx").on(table.chargeCode),
  ]
);

// ==========================================
// FEAT-005-1-004: Contract Management
// ==========================================

export const scmContracts = pgTable(
  "scm_contracts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    contractNumber: varchar("contract_number", { length: 50 }).notNull(),
    contractName: varchar("contract_name", { length: 255 }).notNull(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => scmCustomers.id),
    quotationId: uuid("quotation_id"),
    contractType: varchar("contract_type", { length: 30 })
      .notNull()
      .default("standard"),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    autoRenew: boolean("auto_renew").default(false),
    renewalTermDays: integer("renewal_term_days"),
    minimumCommitmentTeu: integer("minimum_commitment_teu"),
    maximumCommitmentTeu: integer("maximum_commitment_teu"),
    penaltyRate: integer("penalty_rate"),
    totalValue: integer("total_value"),
    currency: varchar("currency", { length: 3 }).default("USD"),
    paymentTermsDays: integer("payment_terms_days").default(30),
    tradeLane: varchar("trade_lane", { length: 100 }),
    salesRepId: uuid("sales_rep_id"),
    approvedBy: uuid("approved_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("scm_contracts_tenant_id_idx").on(table.tenantId),
    uniqueIndex("scm_contracts_tenant_number_idx").on(
      table.tenantId,
      table.contractNumber
    ),
    index("scm_contracts_customer_id_idx").on(table.customerId),
    index("scm_contracts_quotation_id_idx").on(table.quotationId),
    index("scm_contracts_status_idx").on(table.status),
    index("scm_contracts_start_date_idx").on(table.startDate),
    index("scm_contracts_end_date_idx").on(table.endDate),
    index("scm_contracts_sales_rep_id_idx").on(table.salesRepId),
  ]
);

export const scmContractLineItems = pgTable(
  "scm_contract_line_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    contractId: uuid("contract_id")
      .notNull()
      .references(() => scmContracts.id),
    chargeCode: varchar("charge_code", { length: 30 }).notNull(),
    chargeName: varchar("charge_name", { length: 255 }).notNull(),
    chargeType: varchar("charge_type", { length: 30 }).notNull(),
    basis: varchar("basis", { length: 20 }).notNull(),
    unitPrice: integer("unit_price").notNull(),
    currency: varchar("currency", { length: 3 }).default("USD"),
    containerType: varchar("container_type", { length: 20 }),
    containerSize: varchar("container_size", { length: 10 }),
    originPort: varchar("origin_port", { length: 10 }),
    destinationPort: varchar("destination_port", { length: 10 }),
    validFrom: timestamp("valid_from", { withTimezone: true }),
    validTo: timestamp("valid_to", { withTimezone: true }),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("scm_contract_line_items_tenant_id_idx").on(table.tenantId),
    index("scm_contract_line_items_contract_id_idx").on(table.contractId),
    index("scm_contract_line_items_charge_code_idx").on(table.chargeCode),
  ]
);

// ==========================================
// FEAT-005-2-001: Account Management & Retention
// ==========================================

export const scmAccountPlans = pgTable(
  "scm_account_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => scmCustomers.id),
    planName: varchar("plan_name", { length: 255 }).notNull(),
    fiscalYear: integer("fiscal_year").notNull(),
    accountManagerId: uuid("account_manager_id").notNull(),
    revenueTargetAmount: integer("revenue_target_amount"),
    teuTarget: integer("teu_target"),
    retentionStrategy: text("retention_strategy"),
    growthStrategy: text("growth_strategy"),
    riskAssessment: text("risk_assessment"),
    competitiveAnalysis: text("competitive_analysis"),
    keyObjectives: jsonb("key_objectives"),
    swotAnalysis: jsonb("swot_analysis"),
    reviewDate: date("review_date"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("scm_account_plans_tenant_id_idx").on(table.tenantId),
    index("scm_account_plans_customer_id_idx").on(table.customerId),
    index("scm_account_plans_fiscal_year_idx").on(table.fiscalYear),
    index("scm_account_plans_account_manager_idx").on(table.accountManagerId),
    index("scm_account_plans_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-005-2-002: Sales Performance & Incentives
// ==========================================

export const scmSalesTargets = pgTable(
  "scm_sales_targets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    salesRepId: uuid("sales_rep_id").notNull(),
    targetName: varchar("target_name", { length: 255 }).notNull(),
    targetType: varchar("target_type", { length: 30 }).notNull(),
    fiscalYear: integer("fiscal_year").notNull(),
    fiscalQuarter: integer("fiscal_quarter"),
    fiscalMonth: integer("fiscal_month"),
    revenueTarget: integer("revenue_target"),
    teuTarget: integer("teu_target"),
    newCustomerTarget: integer("new_customer_target"),
    revenueActual: integer("revenue_actual").default(0),
    teuActual: integer("teu_actual").default(0),
    newCustomerActual: integer("new_customer_actual").default(0),
    currency: varchar("currency", { length: 3 }).default("USD"),
    tradeLane: varchar("trade_lane", { length: 100 }),
    region: varchar("region", { length: 100 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("scm_sales_targets_tenant_id_idx").on(table.tenantId),
    index("scm_sales_targets_sales_rep_id_idx").on(table.salesRepId),
    index("scm_sales_targets_fiscal_year_idx").on(table.fiscalYear),
    index("scm_sales_targets_target_type_idx").on(table.targetType),
    index("scm_sales_targets_status_idx").on(table.status),
  ]
);

export const scmIncentiveRules = pgTable(
  "scm_incentive_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    ruleName: varchar("rule_name", { length: 255 }).notNull(),
    ruleCode: varchar("rule_code", { length: 50 }).notNull(),
    targetType: varchar("target_type", { length: 30 }).notNull(),
    thresholdPercent: integer("threshold_percent").notNull(),
    commissionRate: integer("commission_rate").notNull(),
    bonusAmount: integer("bonus_amount"),
    currency: varchar("currency", { length: 3 }).default("USD"),
    cappedAt: integer("capped_at"),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    appliesTo: varchar("applies_to", { length: 30 }).default("all"),
    region: varchar("region", { length: 100 }),
    tradeLane: varchar("trade_lane", { length: 100 }),
    isActive: boolean("is_active").default(true),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("scm_incentive_rules_tenant_id_idx").on(table.tenantId),
    uniqueIndex("scm_incentive_rules_tenant_code_idx").on(
      table.tenantId,
      table.ruleCode
    ),
    index("scm_incentive_rules_target_type_idx").on(table.targetType),
    index("scm_incentive_rules_effective_from_idx").on(table.effectiveFrom),
  ]
);

// ==========================================
// FEAT-005-2-003: Customer Onboarding
// ==========================================

export const scmOnboardingChecklists = pgTable(
  "scm_onboarding_checklists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => scmCustomers.id),
    taskName: varchar("task_name", { length: 255 }).notNull(),
    taskCategory: varchar("task_category", { length: 50 }).notNull(),
    description: text("description"),
    assignedTo: uuid("assigned_to"),
    dueDate: timestamp("due_date", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    completedBy: uuid("completed_by"),
    sortOrder: integer("sort_order").default(0),
    isRequired: boolean("is_required").default(true),
    documentRequired: boolean("document_required").default(false),
    documentUrl: varchar("document_url", { length: 500 }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("scm_onboarding_checklists_tenant_id_idx").on(table.tenantId),
    index("scm_onboarding_checklists_customer_id_idx").on(table.customerId),
    index("scm_onboarding_checklists_assigned_to_idx").on(table.assignedTo),
    index("scm_onboarding_checklists_status_idx").on(table.status),
    index("scm_onboarding_checklists_task_category_idx").on(table.taskCategory),
  ]
);

// ==========================================
// FEAT-005-2-004: Lead Management & Marketing
// ==========================================

export const scmLeads = pgTable(
  "scm_leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyName: varchar("company_name", { length: 255 }).notNull(),
    contactName: varchar("contact_name", { length: 255 }).notNull(),
    contactEmail: varchar("contact_email", { length: 255 }),
    contactPhone: varchar("contact_phone", { length: 30 }),
    jobTitle: varchar("job_title", { length: 100 }),
    country: varchar("country", { length: 3 }),
    city: varchar("city", { length: 100 }),
    industry: varchar("industry", { length: 100 }),
    estimatedTeu: integer("estimated_teu"),
    estimatedRevenue: integer("estimated_revenue"),
    tradeLane: varchar("trade_lane", { length: 100 }),
    source: varchar("source", { length: 50 }).notNull(),
    campaignId: uuid("campaign_id"),
    assignedTo: uuid("assigned_to"),
    qualificationScore: integer("qualification_score"),
    convertedToCustomerId: uuid("converted_to_customer_id"),
    convertedAt: timestamp("converted_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("new"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("scm_leads_tenant_id_idx").on(table.tenantId),
    index("scm_leads_company_name_idx").on(table.companyName),
    index("scm_leads_source_idx").on(table.source),
    index("scm_leads_campaign_id_idx").on(table.campaignId),
    index("scm_leads_assigned_to_idx").on(table.assignedTo),
    index("scm_leads_status_idx").on(table.status),
    index("scm_leads_converted_customer_idx").on(table.convertedToCustomerId),
  ]
);

export const scmCampaigns = pgTable(
  "scm_campaigns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    campaignName: varchar("campaign_name", { length: 255 }).notNull(),
    campaignCode: varchar("campaign_code", { length: 50 }).notNull(),
    campaignType: varchar("campaign_type", { length: 30 }).notNull(),
    description: text("description"),
    targetAudience: varchar("target_audience", { length: 100 }),
    channel: varchar("channel", { length: 30 }),
    budgetAmount: integer("budget_amount"),
    spentAmount: integer("spent_amount").default(0),
    currency: varchar("currency", { length: 3 }).default("USD"),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }),
    leadsGenerated: integer("leads_generated").default(0),
    conversions: integer("conversions").default(0),
    roi: integer("roi"),
    region: varchar("region", { length: 100 }),
    tradeLane: varchar("trade_lane", { length: 100 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("scm_campaigns_tenant_id_idx").on(table.tenantId),
    uniqueIndex("scm_campaigns_tenant_code_idx").on(
      table.tenantId,
      table.campaignCode
    ),
    index("scm_campaigns_campaign_type_idx").on(table.campaignType),
    index("scm_campaigns_status_idx").on(table.status),
    index("scm_campaigns_start_date_idx").on(table.startDate),
  ]
);
