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
import { users } from "./users";

// ==========================================
// FEAT-007-1-001: Tariff Management
// ==========================================

export const cpmTariffs = pgTable(
  "cpm_tariffs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    tariffCode: varchar("tariff_code", { length: 50 }).notNull(),
    tariffName: varchar("tariff_name", { length: 255 }).notNull(),
    tariffType: varchar("tariff_type", { length: 30 })
      .notNull()
      .default("standard"),
    tradeLane: varchar("trade_lane", { length: 100 }),
    originPort: varchar("origin_port", { length: 10 }),
    destinationPort: varchar("destination_port", { length: 10 }),
    serviceType: varchar("service_type", { length: 30 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
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
    index("cpm_tariffs_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cpm_tariffs_tenant_code_idx").on(
      table.tenantId,
      table.tariffCode
    ),
    index("cpm_tariffs_tariff_type_idx").on(table.tariffType),
    index("cpm_tariffs_trade_lane_idx").on(table.tradeLane),
    index("cpm_tariffs_status_idx").on(table.status),
    index("cpm_tariffs_effective_from_idx").on(table.effectiveFrom),
  ]
);

export const cpmTariffRates = pgTable(
  "cpm_tariff_rates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    tariffId: uuid("tariff_id")
      .notNull()
      .references(() => cpmTariffs.id),
    chargeCode: varchar("charge_code", { length: 30 }).notNull(),
    chargeName: varchar("charge_name", { length: 255 }).notNull(),
    chargeType: varchar("charge_type", { length: 30 }).notNull(),
    basis: varchar("basis", { length: 20 }).notNull(),
    containerType: varchar("container_type", { length: 20 }),
    containerSize: varchar("container_size", { length: 10 }),
    unitPrice: integer("unit_price").notNull(),
    minimumCharge: integer("minimum_charge"),
    maximumCharge: integer("maximum_charge"),
    currency: varchar("currency", { length: 3 }).default("USD"),
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
    index("cpm_tariff_rates_tenant_id_idx").on(table.tenantId),
    index("cpm_tariff_rates_tariff_id_idx").on(table.tariffId),
    index("cpm_tariff_rates_charge_code_idx").on(table.chargeCode),
  ]
);

// ==========================================
// FEAT-007-1-002: Special Rates & Rate Agreements
// ==========================================

export const cpmSpecialRates = pgTable(
  "cpm_special_rates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    rateCode: varchar("rate_code", { length: 50 }).notNull(),
    rateName: varchar("rate_name", { length: 255 }).notNull(),
    rateType: varchar("rate_type", { length: 30 })
      .notNull()
      .default("contract"),
    customerId: uuid("customer_id"),
    customerSegment: varchar("customer_segment", { length: 50 }),
    originPort: varchar("origin_port", { length: 10 }),
    destinationPort: varchar("destination_port", { length: 10 }),
    tradeLane: varchar("trade_lane", { length: 100 }),
    containerType: varchar("container_type", { length: 20 }),
    containerSize: varchar("container_size", { length: 10 }),
    baseRate: integer("base_rate").notNull(),
    discountPercent: integer("discount_percent"),
    finalRate: integer("final_rate").notNull(),
    currency: varchar("currency", { length: 3 }).default("USD"),
    minimumCommitmentTeu: integer("minimum_commitment_teu"),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
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
    index("cpm_special_rates_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cpm_special_rates_tenant_code_idx").on(
      table.tenantId,
      table.rateCode
    ),
    index("cpm_special_rates_customer_id_idx").on(table.customerId),
    index("cpm_special_rates_rate_type_idx").on(table.rateType),
    index("cpm_special_rates_trade_lane_idx").on(table.tradeLane),
    index("cpm_special_rates_status_idx").on(table.status),
    index("cpm_special_rates_effective_from_idx").on(table.effectiveFrom),
  ]
);

// ==========================================
// FEAT-007-1-003: Surcharge Management
// ==========================================

export const cpmSurcharges = pgTable(
  "cpm_surcharges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    surchargeCode: varchar("surcharge_code", { length: 30 }).notNull(),
    surchargeName: varchar("surcharge_name", { length: 255 }).notNull(),
    surchargeType: varchar("surcharge_type", { length: 30 }).notNull(),
    calculationBasis: varchar("calculation_basis", { length: 20 }).notNull(),
    amount: integer("amount"),
    percentage: integer("percentage"),
    currency: varchar("currency", { length: 3 }).default("USD"),
    applicableTo: varchar("applicable_to", { length: 30 }).default("all"),
    tradeLane: varchar("trade_lane", { length: 100 }),
    originPort: varchar("origin_port", { length: 10 }),
    destinationPort: varchar("destination_port", { length: 10 }),
    containerType: varchar("container_type", { length: 20 }),
    containerSize: varchar("container_size", { length: 10 }),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    isMandatory: boolean("is_mandatory").default(true),
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
    index("cpm_surcharges_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cpm_surcharges_tenant_code_idx").on(
      table.tenantId,
      table.surchargeCode
    ),
    index("cpm_surcharges_surcharge_type_idx").on(table.surchargeType),
    index("cpm_surcharges_trade_lane_idx").on(table.tradeLane),
    index("cpm_surcharges_effective_from_idx").on(table.effectiveFrom),
  ]
);

// ==========================================
// FEAT-007-1-004: Detention & Demurrage Tariffs
// ==========================================

export const cpmDetentionDemurrage = pgTable(
  "cpm_detention_demurrage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    tariffCode: varchar("tariff_code", { length: 50 }).notNull(),
    tariffName: varchar("tariff_name", { length: 255 }).notNull(),
    chargeType: varchar("charge_type", { length: 20 }).notNull(),
    portCode: varchar("port_code", { length: 10 }),
    containerType: varchar("container_type", { length: 20 }),
    containerSize: varchar("container_size", { length: 10 }),
    freeTimeDays: integer("free_time_days").notNull().default(0),
    dailyRate: integer("daily_rate").notNull(),
    escalationRate: integer("escalation_rate"),
    escalationAfterDays: integer("escalation_after_days"),
    maximumDays: integer("maximum_days"),
    currency: varchar("currency", { length: 3 }).default("USD"),
    customerSegment: varchar("customer_segment", { length: 50 }),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
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
    index("cpm_detention_demurrage_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cpm_detention_demurrage_tenant_code_idx").on(
      table.tenantId,
      table.tariffCode
    ),
    index("cpm_detention_demurrage_charge_type_idx").on(table.chargeType),
    index("cpm_detention_demurrage_port_code_idx").on(table.portCode),
    index("cpm_detention_demurrage_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-007-2-001: Yield Management
// ==========================================

export const cpmYieldTargets = pgTable(
  "cpm_yield_targets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    targetName: varchar("target_name", { length: 255 }).notNull(),
    tradeLane: varchar("trade_lane", { length: 100 }).notNull(),
    serviceType: varchar("service_type", { length: 30 }),
    fiscalYear: integer("fiscal_year").notNull(),
    fiscalQuarter: integer("fiscal_quarter"),
    targetRevenuePerTeu: integer("target_revenue_per_teu"),
    actualRevenuePerTeu: integer("actual_revenue_per_teu"),
    targetUtilizationPercent: integer("target_utilization_percent"),
    actualUtilizationPercent: integer("actual_utilization_percent"),
    targetTeu: integer("target_teu"),
    actualTeu: integer("actual_teu"),
    minimumRateThreshold: integer("minimum_rate_threshold"),
    currency: varchar("currency", { length: 3 }).default("USD"),
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
    index("cpm_yield_targets_tenant_id_idx").on(table.tenantId),
    index("cpm_yield_targets_trade_lane_idx").on(table.tradeLane),
    index("cpm_yield_targets_fiscal_year_idx").on(table.fiscalYear),
    index("cpm_yield_targets_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-007-2-002: Rate Benchmarking
// ==========================================

export const cpmRateBenchmarks = pgTable(
  "cpm_rate_benchmarks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    benchmarkName: varchar("benchmark_name", { length: 255 }).notNull(),
    tradeLane: varchar("trade_lane", { length: 100 }).notNull(),
    originPort: varchar("origin_port", { length: 10 }),
    destinationPort: varchar("destination_port", { length: 10 }),
    containerType: varchar("container_type", { length: 20 }),
    containerSize: varchar("container_size", { length: 10 }),
    marketRate: integer("market_rate").notNull(),
    ourRate: integer("our_rate"),
    competitorRate: integer("competitor_rate"),
    competitorName: varchar("competitor_name", { length: 255 }),
    benchmarkSource: varchar("benchmark_source", { length: 100 }),
    benchmarkDate: date("benchmark_date").notNull(),
    currency: varchar("currency", { length: 3 }).default("USD"),
    variancePercent: integer("variance_percent"),
    trend: varchar("trend", { length: 20 }),
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
    index("cpm_rate_benchmarks_tenant_id_idx").on(table.tenantId),
    index("cpm_rate_benchmarks_trade_lane_idx").on(table.tradeLane),
    index("cpm_rate_benchmarks_benchmark_date_idx").on(table.benchmarkDate),
    index("cpm_rate_benchmarks_container_type_idx").on(table.containerType),
  ]
);

// ==========================================
// FEAT-007-2-003: Profitability Analysis
// ==========================================

export const cpmProfitabilityAnalyses = pgTable(
  "cpm_profitability_analyses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    analysisName: varchar("analysis_name", { length: 255 }).notNull(),
    analysisType: varchar("analysis_type", { length: 30 }).notNull(),
    tradeLane: varchar("trade_lane", { length: 100 }),
    customerId: uuid("customer_id"),
    voyageId: uuid("voyage_id"),
    periodFrom: date("period_from").notNull(),
    periodTo: date("period_to").notNull(),
    totalRevenue: integer("total_revenue"),
    totalCost: integer("total_cost"),
    grossProfit: integer("gross_profit"),
    marginPercent: integer("margin_percent"),
    teuCount: integer("teu_count"),
    revenuePerTeu: integer("revenue_per_teu"),
    costPerTeu: integer("cost_per_teu"),
    currency: varchar("currency", { length: 3 }).default("USD"),
    recommendations: jsonb("recommendations"),
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
    index("cpm_profitability_analyses_tenant_id_idx").on(table.tenantId),
    index("cpm_profitability_analyses_analysis_type_idx").on(table.analysisType),
    index("cpm_profitability_analyses_trade_lane_idx").on(table.tradeLane),
    index("cpm_profitability_analyses_customer_id_idx").on(table.customerId),
    index("cpm_profitability_analyses_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-007-2-004: AI Pricing Engine
// ==========================================

export const cpmAiPricingModels = pgTable(
  "cpm_ai_pricing_models",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    modelName: varchar("model_name", { length: 255 }).notNull(),
    modelCode: varchar("model_code", { length: 50 }).notNull(),
    modelType: varchar("model_type", { length: 30 }).notNull(),
    tradeLane: varchar("trade_lane", { length: 100 }),
    inputFeatures: jsonb("input_features"),
    outputFormat: jsonb("output_format"),
    trainingDataFrom: date("training_data_from"),
    trainingDataTo: date("training_data_to"),
    accuracy: integer("accuracy"),
    confidenceThreshold: integer("confidence_threshold"),
    lastTrainedAt: timestamp("last_trained_at", { withTimezone: true }),
    lastPredictionAt: timestamp("last_prediction_at", { withTimezone: true }),
    predictedRate: integer("predicted_rate"),
    suggestedRate: integer("suggested_rate"),
    currency: varchar("currency", { length: 3 }).default("USD"),
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
    index("cpm_ai_pricing_models_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cpm_ai_pricing_models_tenant_code_idx").on(
      table.tenantId,
      table.modelCode
    ),
    index("cpm_ai_pricing_models_model_type_idx").on(table.modelType),
    index("cpm_ai_pricing_models_trade_lane_idx").on(table.tradeLane),
  ]
);

// ==========================================
// FEAT-007-3-001: VSA Slot Rate Management
// ==========================================

export const cpmVsaSlotRates = pgTable(
  "cpm_vsa_slot_rates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    vsaPartner: varchar("vsa_partner", { length: 255 }).notNull(),
    agreementReference: varchar("agreement_reference", { length: 50 }).notNull(),
    tradeLane: varchar("trade_lane", { length: 100 }).notNull(),
    serviceName: varchar("service_name", { length: 255 }),
    containerType: varchar("container_type", { length: 20 }),
    containerSize: varchar("container_size", { length: 10 }),
    slotAllocationTeu: integer("slot_allocation_teu"),
    slotCostPerTeu: integer("slot_cost_per_teu").notNull(),
    utilizationPercent: integer("utilization_percent"),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    currency: varchar("currency", { length: 3 }).default("USD"),
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
    index("cpm_vsa_slot_rates_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cpm_vsa_slot_rates_tenant_ref_idx").on(
      table.tenantId,
      table.agreementReference
    ),
    index("cpm_vsa_slot_rates_vsa_partner_idx").on(table.vsaPartner),
    index("cpm_vsa_slot_rates_trade_lane_idx").on(table.tradeLane),
    index("cpm_vsa_slot_rates_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-007-3-002: Dead Freight Calculation & Recovery
// ==========================================

export const cpmDeadFreightRecords = pgTable(
  "cpm_dead_freight_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    recordReference: varchar("record_reference", { length: 50 }).notNull(),
    voyageReference: varchar("voyage_reference", { length: 50 }),
    bookingReference: varchar("booking_reference", { length: 50 }),
    customerId: uuid("customer_id"),
    tradeLane: varchar("trade_lane", { length: 100 }),
    bookedTeu: integer("booked_teu").notNull(),
    actualTeu: integer("actual_teu").notNull(),
    shortShippedTeu: integer("short_shipped_teu").notNull(),
    ratePerTeu: integer("rate_per_teu").notNull(),
    deadFreightAmount: integer("dead_freight_amount").notNull(),
    recoveredAmount: integer("recovered_amount").default(0),
    currency: varchar("currency", { length: 3 }).default("USD"),
    waiverReason: varchar("waiver_reason", { length: 255 }),
    waivedAmount: integer("waived_amount").default(0),
    invoiceId: uuid("invoice_id"),
    status: varchar("status", { length: 20 }).notNull().default("calculated"),
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
    index("cpm_dead_freight_records_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cpm_dead_freight_records_tenant_ref_idx").on(
      table.tenantId,
      table.recordReference
    ),
    index("cpm_dead_freight_records_customer_id_idx").on(table.customerId),
    index("cpm_dead_freight_records_voyage_ref_idx").on(table.voyageReference),
    index("cpm_dead_freight_records_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-007-3-003: Revenue Leakage Detection
// ==========================================

export const cpmRevenueLeakages = pgTable(
  "cpm_revenue_leakages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    leakageReference: varchar("leakage_reference", { length: 50 }).notNull(),
    leakageType: varchar("leakage_type", { length: 30 }).notNull(),
    detectedDate: date("detected_date").notNull(),
    bookingReference: varchar("booking_reference", { length: 50 }),
    invoiceReference: varchar("invoice_reference", { length: 50 }),
    customerId: uuid("customer_id"),
    tradeLane: varchar("trade_lane", { length: 100 }),
    expectedAmount: integer("expected_amount").notNull(),
    actualAmount: integer("actual_amount").notNull(),
    leakageAmount: integer("leakage_amount").notNull(),
    currency: varchar("currency", { length: 3 }).default("USD"),
    rootCause: varchar("root_cause", { length: 255 }),
    correctionAction: text("correction_action"),
    recoveredAmount: integer("recovered_amount").default(0),
    assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("detected"),
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
    index("cpm_revenue_leakages_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cpm_revenue_leakages_tenant_ref_idx").on(
      table.tenantId,
      table.leakageReference
    ),
    index("cpm_revenue_leakages_leakage_type_idx").on(table.leakageType),
    index("cpm_revenue_leakages_customer_id_idx").on(table.customerId),
    index("cpm_revenue_leakages_status_idx").on(table.status),
    index("cpm_revenue_leakages_detected_date_idx").on(table.detectedDate),
  ]
);

// ==========================================
// FEAT-007-3-004: Pricing Approval Workflows
// ==========================================

export const cpmPricingApprovals = pgTable(
  "cpm_pricing_approvals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    approvalReference: varchar("approval_reference", { length: 50 }).notNull(),
    approvalType: varchar("approval_type", { length: 30 }).notNull(),
    entityType: varchar("entity_type", { length: 30 }).notNull(),
    entityId: uuid("entity_id").notNull(),
    requestedBy: uuid("requested_by").notNull(),
    requestedAt: timestamp("requested_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    currentLevel: integer("current_level").default(1),
    maxLevel: integer("max_level").default(1),
    approvedBy: uuid("approved_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    rejectedBy: uuid("rejected_by"),
    rejectedAt: timestamp("rejected_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
    deviationPercent: integer("deviation_percent"),
    originalAmount: integer("original_amount"),
    requestedAmount: integer("requested_amount"),
    currency: varchar("currency", { length: 3 }).default("USD"),
    urgency: varchar("urgency", { length: 20 }).default("normal"),
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
    index("cpm_pricing_approvals_tenant_id_idx").on(table.tenantId),
    uniqueIndex("cpm_pricing_approvals_tenant_ref_idx").on(
      table.tenantId,
      table.approvalReference
    ),
    index("cpm_pricing_approvals_approval_type_idx").on(table.approvalType),
    index("cpm_pricing_approvals_entity_id_idx").on(table.entityId),
    index("cpm_pricing_approvals_requested_by_idx").on(table.requestedBy),
    index("cpm_pricing_approvals_status_idx").on(table.status),
  ]
);
