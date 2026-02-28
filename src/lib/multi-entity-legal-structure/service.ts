import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
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
} from "@/db/schema";

export async function getMelsOverview(tenantId: string) {
  const [
    legalEntities,
    currencyConfigs,
    fxRates,
    taxConfigs,
    taxRates,
    intercompanyTransactions,
    settlementBatches,
    settlementItems,
    oracleIntegrationConfigs,
    oracleSyncLogs,
    complianceRules,
    complianceFilings,
    localeConfigs,
    translations,
  ] = await Promise.all([
    db.select({ id: melsLegalEntities.id }).from(melsLegalEntities)
      .where(and(eq(melsLegalEntities.tenantId, tenantId), isNull(melsLegalEntities.deletedAt))),
    db.select({ id: melsCurrencyConfigs.id }).from(melsCurrencyConfigs)
      .where(and(eq(melsCurrencyConfigs.tenantId, tenantId), isNull(melsCurrencyConfigs.deletedAt))),
    db.select({ id: melsFxRates.id }).from(melsFxRates)
      .where(and(eq(melsFxRates.tenantId, tenantId), isNull(melsFxRates.deletedAt))),
    db.select({ id: melsTaxConfigs.id }).from(melsTaxConfigs)
      .where(and(eq(melsTaxConfigs.tenantId, tenantId), isNull(melsTaxConfigs.deletedAt))),
    db.select({ id: melsTaxRates.id }).from(melsTaxRates)
      .where(and(eq(melsTaxRates.tenantId, tenantId), isNull(melsTaxRates.deletedAt))),
    db.select({ id: melsIntercompanyTransactions.id }).from(melsIntercompanyTransactions)
      .where(and(eq(melsIntercompanyTransactions.tenantId, tenantId), isNull(melsIntercompanyTransactions.deletedAt))),
    db.select({ id: melsSettlementBatches.id }).from(melsSettlementBatches)
      .where(and(eq(melsSettlementBatches.tenantId, tenantId), isNull(melsSettlementBatches.deletedAt))),
    db.select({ id: melsSettlementItems.id }).from(melsSettlementItems)
      .where(and(eq(melsSettlementItems.tenantId, tenantId), isNull(melsSettlementItems.deletedAt))),
    db.select({ id: melsOracleIntegrationConfigs.id }).from(melsOracleIntegrationConfigs)
      .where(and(eq(melsOracleIntegrationConfigs.tenantId, tenantId), isNull(melsOracleIntegrationConfigs.deletedAt))),
    db.select({ id: melsOracleSyncLogs.id }).from(melsOracleSyncLogs)
      .where(and(eq(melsOracleSyncLogs.tenantId, tenantId), isNull(melsOracleSyncLogs.deletedAt))),
    db.select({ id: melsComplianceRules.id }).from(melsComplianceRules)
      .where(and(eq(melsComplianceRules.tenantId, tenantId), isNull(melsComplianceRules.deletedAt))),
    db.select({ id: melsComplianceFilings.id }).from(melsComplianceFilings)
      .where(and(eq(melsComplianceFilings.tenantId, tenantId), isNull(melsComplianceFilings.deletedAt))),
    db.select({ id: melsLocaleConfigs.id }).from(melsLocaleConfigs)
      .where(and(eq(melsLocaleConfigs.tenantId, tenantId), isNull(melsLocaleConfigs.deletedAt))),
    db.select({ id: melsTranslations.id }).from(melsTranslations)
      .where(and(eq(melsTranslations.tenantId, tenantId), isNull(melsTranslations.deletedAt))),
  ]);

  return {
    legalEntities: legalEntities.length,
    currencyConfigs: currencyConfigs.length,
    fxRates: fxRates.length,
    taxConfigs: taxConfigs.length,
    taxRates: taxRates.length,
    intercompanyTransactions: intercompanyTransactions.length,
    settlementBatches: settlementBatches.length,
    settlementItems: settlementItems.length,
    oracleIntegrationConfigs: oracleIntegrationConfigs.length,
    oracleSyncLogs: oracleSyncLogs.length,
    complianceRules: complianceRules.length,
    complianceFilings: complianceFilings.length,
    localeConfigs: localeConfigs.length,
    translations: translations.length,
  };
}
