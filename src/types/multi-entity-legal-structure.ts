import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  melsLegalEntities,
  melsCurrencyConfigs,
  melsFxRates,
  melsTaxConfigs,
  melsTaxRates,
  melsIntercompanyTransactions,
  melsSettlementBatches,
  melsSettlementItems,
  melsOracleIntegrationConfigs,
  melsOracleSyncLogs,
  melsComplianceRules,
  melsComplianceFilings,
  melsLocaleConfigs,
  melsTranslations,
} from "@/db/schema/multi-entity-legal-structure";

// Legal Entities
export type LegalEntity = InferSelectModel<typeof melsLegalEntities>;
export type NewLegalEntity = InferInsertModel<typeof melsLegalEntities>;

// Currency Configs
export type CurrencyConfig = InferSelectModel<typeof melsCurrencyConfigs>;
export type NewCurrencyConfig = InferInsertModel<typeof melsCurrencyConfigs>;

// FX Rates
export type FxRate = InferSelectModel<typeof melsFxRates>;
export type NewFxRate = InferInsertModel<typeof melsFxRates>;

// Tax Configs
export type TaxConfig = InferSelectModel<typeof melsTaxConfigs>;
export type NewTaxConfig = InferInsertModel<typeof melsTaxConfigs>;

// Tax Rates
export type TaxRate = InferSelectModel<typeof melsTaxRates>;
export type NewTaxRate = InferInsertModel<typeof melsTaxRates>;

// Intercompany Transactions
export type IntercompanyTransaction = InferSelectModel<typeof melsIntercompanyTransactions>;
export type NewIntercompanyTransaction = InferInsertModel<typeof melsIntercompanyTransactions>;

// Settlement Batches
export type SettlementBatch = InferSelectModel<typeof melsSettlementBatches>;
export type NewSettlementBatch = InferInsertModel<typeof melsSettlementBatches>;

// Settlement Items
export type SettlementItem = InferSelectModel<typeof melsSettlementItems>;
export type NewSettlementItem = InferInsertModel<typeof melsSettlementItems>;

// Oracle Integration Configs
export type OracleIntegrationConfig = InferSelectModel<typeof melsOracleIntegrationConfigs>;
export type NewOracleIntegrationConfig = InferInsertModel<typeof melsOracleIntegrationConfigs>;

// Oracle Sync Logs
export type OracleSyncLog = InferSelectModel<typeof melsOracleSyncLogs>;
export type NewOracleSyncLog = InferInsertModel<typeof melsOracleSyncLogs>;

// Compliance Rules
export type ComplianceRule = InferSelectModel<typeof melsComplianceRules>;
export type NewComplianceRule = InferInsertModel<typeof melsComplianceRules>;

// Compliance Filings
export type ComplianceFiling = InferSelectModel<typeof melsComplianceFilings>;
export type NewComplianceFiling = InferInsertModel<typeof melsComplianceFilings>;

// Locale Configs
export type LocaleConfig = InferSelectModel<typeof melsLocaleConfigs>;
export type NewLocaleConfig = InferInsertModel<typeof melsLocaleConfigs>;

// Translations
export type Translation = InferSelectModel<typeof melsTranslations>;
export type NewTranslation = InferInsertModel<typeof melsTranslations>;
