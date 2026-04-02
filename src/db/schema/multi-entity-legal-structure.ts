import {
  pgTable,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// FEAT-003-1-001: Legal Entity Management
// ==========================================

export const melsLegalEntities = pgTable(
  "mels_legal_entities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    parentEntityId: uuid("parent_entity_id"),
    name: varchar("name", { length: 255 }).notNull(),
    shortName: varchar("short_name", { length: 50 }),
    slug: varchar("slug", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 50 })
      .notNull()
      .default("subsidiary"),
    legalName: varchar("legal_name", { length: 500 }).notNull(),
    registrationNumber: varchar("registration_number", { length: 100 }),
    taxId: varchar("tax_id", { length: 100 }),
    vatNumber: varchar("vat_number", { length: 100 }),
    country: varchar("country", { length: 2 }).notNull(),
    region: varchar("region", { length: 50 }),
    baseCurrency: varchar("base_currency", { length: 3 }).notNull().default("QAR"),
    timezone: varchar("timezone", { length: 50 }).notNull().default("Asia/Qatar"),
    fiscalYearStart: varchar("fiscal_year_start", { length: 5 }).notNull().default("01-01"),
    address: jsonb("address"),
    contactInfo: jsonb("contact_info"),
    isActive: boolean("is_active").notNull().default(true),
    isHeadquarters: boolean("is_headquarters").notNull().default(false),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("mels_legal_entities_tenant_id_idx").on(table.tenantId),
    uniqueIndex("mels_legal_entities_tenant_slug_idx").on(
      table.tenantId,
      table.slug
    ),
    index("mels_legal_entities_parent_entity_id_idx").on(table.parentEntityId),
    index("mels_legal_entities_country_idx").on(table.country),
    index("mels_legal_entities_entity_type_idx").on(table.entityType),
    index("mels_legal_entities_is_active_idx").on(table.isActive),
  ]
);

// ==========================================
// FEAT-003-1-002: Multi-Currency & FX Management
// ==========================================

export const melsCurrencyConfigs = pgTable(
  "mels_currency_configs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    legalEntityId: uuid("legal_entity_id")
      .notNull()
      .references(() => melsLegalEntities.id, { onDelete: "cascade" }),
    currencyCode: varchar("currency_code", { length: 3 }).notNull(),
    currencyName: varchar("currency_name", { length: 100 }).notNull(),
    symbol: varchar("symbol", { length: 10 }),
    decimalPlaces: integer("decimal_places").notNull().default(2),
    smallestUnit: integer("smallest_unit").notNull().default(100),
    isBaseCurrency: boolean("is_base_currency").notNull().default(false),
    isEnabled: boolean("is_enabled").notNull().default(true),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("mels_currency_configs_tenant_id_idx").on(table.tenantId),
    index("mels_currency_configs_legal_entity_id_idx").on(table.legalEntityId),
    uniqueIndex("mels_currency_configs_entity_currency_idx").on(
      table.tenantId,
      table.legalEntityId,
      table.currencyCode
    ),
    index("mels_currency_configs_currency_code_idx").on(table.currencyCode),
  ]
);

export const melsFxRates = pgTable(
  "mels_fx_rates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    sourceCurrency: varchar("source_currency", { length: 3 }).notNull(),
    targetCurrency: varchar("target_currency", { length: 3 }).notNull(),
    rate: integer("rate").notNull(),
    rateMultiplier: integer("rate_multiplier").notNull().default(1000000),
    rateType: varchar("rate_type", { length: 30 }).notNull().default("spot"),
    provider: varchar("provider", { length: 100 }),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("mels_fx_rates_tenant_id_idx").on(table.tenantId),
    index("mels_fx_rates_source_currency_idx").on(table.sourceCurrency),
    index("mels_fx_rates_target_currency_idx").on(table.targetCurrency),
    index("mels_fx_rates_rate_type_idx").on(table.rateType),
    index("mels_fx_rates_effective_from_idx").on(table.effectiveFrom),
    index("mels_fx_rates_is_active_idx").on(table.isActive),
  ]
);

// ==========================================
// FEAT-003-1-003: Regional Tax Compliance
// ==========================================

export const melsTaxConfigs = pgTable(
  "mels_tax_configs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    legalEntityId: uuid("legal_entity_id")
      .references(() => melsLegalEntities.id, { onDelete: "cascade" }),
    taxName: varchar("tax_name", { length: 255 }).notNull(),
    taxCode: varchar("tax_code", { length: 50 }).notNull(),
    taxType: varchar("tax_type", { length: 50 }).notNull().default("vat"),
    country: varchar("country", { length: 2 }).notNull(),
    region: varchar("region", { length: 50 }),
    description: text("description"),
    isCompound: boolean("is_compound").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("mels_tax_configs_tenant_id_idx").on(table.tenantId),
    index("mels_tax_configs_legal_entity_id_idx").on(table.legalEntityId),
    uniqueIndex("mels_tax_configs_tenant_code_idx").on(
      table.tenantId,
      table.taxCode
    ),
    index("mels_tax_configs_country_idx").on(table.country),
    index("mels_tax_configs_tax_type_idx").on(table.taxType),
    index("mels_tax_configs_is_active_idx").on(table.isActive),
  ]
);

export const melsTaxRates = pgTable(
  "mels_tax_rates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    taxConfigId: uuid("tax_config_id")
      .notNull()
      .references(() => melsTaxConfigs.id, { onDelete: "cascade" }),
    rateBps: integer("rate_bps").notNull(),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("mels_tax_rates_tenant_id_idx").on(table.tenantId),
    index("mels_tax_rates_tax_config_id_idx").on(table.taxConfigId),
    index("mels_tax_rates_effective_from_idx").on(table.effectiveFrom),
    index("mels_tax_rates_is_active_idx").on(table.isActive),
  ]
);

// ==========================================
// FEAT-003-1-004: Intercompany Transaction Management
// ==========================================

export const melsIntercompanyTransactions = pgTable(
  "mels_intercompany_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    transactionNumber: varchar("transaction_number", { length: 100 }).notNull(),
    sourceEntityId: uuid("source_entity_id")
      .notNull()
      .references(() => melsLegalEntities.id),
    targetEntityId: uuid("target_entity_id")
      .notNull()
      .references(() => melsLegalEntities.id),
    transactionType: varchar("transaction_type", { length: 50 }).notNull(),
    description: text("description"),
    currency: varchar("currency", { length: 3 }).notNull(),
    amount: integer("amount").notNull(),
    fxRate: integer("fx_rate"),
    fxRateMultiplier: integer("fx_rate_multiplier").default(1000000),
    baseAmount: integer("base_amount"),
    status: varchar("status", { length: 30 }).notNull().default("draft"),
    approvedBy: uuid("approved_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    postedAt: timestamp("posted_at", { withTimezone: true }),
    referenceType: varchar("reference_type", { length: 50 }),
    referenceId: uuid("reference_id"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("mels_ic_transactions_tenant_id_idx").on(table.tenantId),
    uniqueIndex("mels_ic_transactions_number_idx").on(
      table.tenantId,
      table.transactionNumber
    ),
    index("mels_ic_transactions_source_entity_idx").on(table.sourceEntityId),
    index("mels_ic_transactions_target_entity_idx").on(table.targetEntityId),
    index("mels_ic_transactions_status_idx").on(table.status),
    index("mels_ic_transactions_type_idx").on(table.transactionType),
    index("mels_ic_transactions_created_at_idx").on(table.createdAt),
  ]
);

// ==========================================
// FEAT-003-2-001: Intercompany Settlement & Netting Engine
// ==========================================

export const melsSettlementBatches = pgTable(
  "mels_settlement_batches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    batchNumber: varchar("batch_number", { length: 100 }).notNull(),
    description: text("description"),
    settlementDate: timestamp("settlement_date", { withTimezone: true }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    totalAmount: integer("total_amount").notNull().default(0),
    netAmount: integer("net_amount").notNull().default(0),
    status: varchar("status", { length: 30 }).notNull().default("draft"),
    approvedBy: uuid("approved_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    settledAt: timestamp("settled_at", { withTimezone: true }),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("mels_settlement_batches_tenant_id_idx").on(table.tenantId),
    uniqueIndex("mels_settlement_batches_number_idx").on(
      table.tenantId,
      table.batchNumber
    ),
    index("mels_settlement_batches_status_idx").on(table.status),
    index("mels_settlement_batches_settlement_date_idx").on(
      table.settlementDate
    ),
  ]
);

export const melsSettlementItems = pgTable(
  "mels_settlement_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    batchId: uuid("batch_id")
      .notNull()
      .references(() => melsSettlementBatches.id, { onDelete: "cascade" }),
    transactionId: uuid("transaction_id")
      .notNull()
      .references(() => melsIntercompanyTransactions.id),
    amount: integer("amount").notNull(),
    netDirection: varchar("net_direction", { length: 10 }).notNull(),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("mels_settlement_items_tenant_id_idx").on(table.tenantId),
    index("mels_settlement_items_batch_id_idx").on(table.batchId),
    index("mels_settlement_items_transaction_id_idx").on(table.transactionId),
  ]
);

// ==========================================
// FEAT-003-2-002: Oracle Fusion Integration for Consolidation
// ==========================================

export const melsOracleIntegrationConfigs = pgTable(
  "mels_oracle_integration_configs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    description: text("description"),
    endpointUrl: varchar("endpoint_url", { length: 1000 }).notNull(),
    authConfig: jsonb("auth_config"),
    mappingConfig: jsonb("mapping_config"),
    syncSchedule: varchar("sync_schedule", { length: 100 }),
    lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
    lastSyncStatus: varchar("last_sync_status", { length: 30 }),
    isActive: boolean("is_active").notNull().default(true),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("mels_oracle_configs_tenant_id_idx").on(table.tenantId),
    uniqueIndex("mels_oracle_configs_tenant_slug_idx").on(
      table.tenantId,
      table.slug
    ),
    index("mels_oracle_configs_is_active_idx").on(table.isActive),
  ]
);

export const melsOracleSyncLogs = pgTable(
  "mels_oracle_sync_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    integrationConfigId: uuid("integration_config_id")
      .notNull()
      .references(() => melsOracleIntegrationConfigs.id, { onDelete: "cascade" }),
    syncType: varchar("sync_type", { length: 30 }).notNull(),
    status: varchar("status", { length: 30 }).notNull().default("pending"),
    recordsProcessed: integer("records_processed").notNull().default(0),
    recordsFailed: integer("records_failed").notNull().default(0),
    errorLog: jsonb("error_log"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("mels_oracle_sync_logs_tenant_id_idx").on(table.tenantId),
    index("mels_oracle_sync_logs_config_id_idx").on(table.integrationConfigId),
    index("mels_oracle_sync_logs_status_idx").on(table.status),
    index("mels_oracle_sync_logs_created_at_idx").on(table.createdAt),
  ]
);

// ==========================================
// FEAT-003-2-003: Regional Regulatory Compliance
// ==========================================

export const melsComplianceRules = pgTable(
  "mels_compliance_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    ruleCode: varchar("rule_code", { length: 100 }).notNull(),
    description: text("description"),
    country: varchar("country", { length: 2 }).notNull(),
    region: varchar("region", { length: 50 }),
    regulatoryBody: varchar("regulatory_body", { length: 255 }),
    ruleType: varchar("rule_type", { length: 50 }).notNull().default("reporting"),
    frequency: varchar("frequency", { length: 30 }),
    conditions: jsonb("conditions"),
    isActive: boolean("is_active").notNull().default(true),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("mels_compliance_rules_tenant_id_idx").on(table.tenantId),
    uniqueIndex("mels_compliance_rules_tenant_code_idx").on(
      table.tenantId,
      table.ruleCode
    ),
    index("mels_compliance_rules_country_idx").on(table.country),
    index("mels_compliance_rules_rule_type_idx").on(table.ruleType),
    index("mels_compliance_rules_is_active_idx").on(table.isActive),
  ]
);

export const melsComplianceFilings = pgTable(
  "mels_compliance_filings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    complianceRuleId: uuid("compliance_rule_id")
      .notNull()
      .references(() => melsComplianceRules.id, { onDelete: "cascade" }),
    legalEntityId: uuid("legal_entity_id")
      .notNull()
      .references(() => melsLegalEntities.id),
    filingPeriod: varchar("filing_period", { length: 30 }).notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
    filedAt: timestamp("filed_at", { withTimezone: true }),
    status: varchar("status", { length: 30 }).notNull().default("pending"),
    filingReference: varchar("filing_reference", { length: 255 }),
    filingData: jsonb("filing_data"),
    submittedBy: uuid("submitted_by"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("mels_compliance_filings_tenant_id_idx").on(table.tenantId),
    index("mels_compliance_filings_rule_id_idx").on(table.complianceRuleId),
    index("mels_compliance_filings_entity_id_idx").on(table.legalEntityId),
    index("mels_compliance_filings_status_idx").on(table.status),
    index("mels_compliance_filings_due_date_idx").on(table.dueDate),
  ]
);

// ==========================================
// FEAT-003-2-004: Multi-Language & Localization
// ==========================================

export const melsLocaleConfigs = pgTable(
  "mels_locale_configs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    localeCode: varchar("locale_code", { length: 10 }).notNull(),
    localeName: varchar("locale_name", { length: 100 }).notNull(),
    language: varchar("language", { length: 50 }).notNull(),
    direction: varchar("direction", { length: 3 }).notNull().default("ltr"),
    dateFormat: varchar("date_format", { length: 30 }).notNull().default("DD/MM/YYYY"),
    numberFormat: varchar("number_format", { length: 30 }).notNull().default("1,234.56"),
    isDefault: boolean("is_default").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("mels_locale_configs_tenant_id_idx").on(table.tenantId),
    uniqueIndex("mels_locale_configs_tenant_locale_idx").on(
      table.tenantId,
      table.localeCode
    ),
    index("mels_locale_configs_is_active_idx").on(table.isActive),
  ]
);

export const melsTranslations = pgTable(
  "mels_translations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    localeCode: varchar("locale_code", { length: 10 }).notNull(),
    namespace: varchar("namespace", { length: 100 }).notNull(),
    key: varchar("key", { length: 255 }).notNull(),
    value: text("value").notNull(),
    isVerified: boolean("is_verified").notNull().default(false),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("mels_translations_tenant_id_idx").on(table.tenantId),
    uniqueIndex("mels_translations_tenant_locale_key_idx").on(
      table.tenantId,
      table.localeCode,
      table.namespace,
      table.key
    ),
    index("mels_translations_locale_code_idx").on(table.localeCode),
    index("mels_translations_namespace_idx").on(table.namespace),
  ]
);
