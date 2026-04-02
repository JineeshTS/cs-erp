import { z } from "zod";
import { metadataSchema } from "@/lib/validation";

// Legal Entity schemas
export const createLegalEntitySchema = z.object({
  parentEntityId: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  shortName: z.string().max(50).optional(),
  slug: z.string().min(1).max(100),
  entityType: z.enum(["holding", "subsidiary", "branch", "joint_venture", "representative"]).optional(),
  legalName: z.string().min(1).max(500),
  registrationNumber: z.string().max(100).optional(),
  taxId: z.string().max(100).optional(),
  vatNumber: z.string().max(100).optional(),
  country: z.string().length(2),
  region: z.string().max(50).optional(),
  baseCurrency: z.string().length(3).optional(),
  timezone: z.string().max(50).optional(),
  fiscalYearStart: z.string().max(5).optional(),
  address: z.record(z.string(), z.unknown()).optional(),
  contactInfo: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
  isHeadquarters: z.boolean().optional(),
  metadata: metadataSchema,
});
export const updateLegalEntitySchema = createLegalEntitySchema.partial();

// Currency Config schemas
export const createCurrencyConfigSchema = z.object({
  legalEntityId: z.string().uuid(),
  currencyCode: z.string().length(3),
  currencyName: z.string().min(1).max(100),
  symbol: z.string().max(10).optional(),
  decimalPlaces: z.number().int().min(0).max(8).optional(),
  smallestUnit: z.number().int().positive().optional(),
  isBaseCurrency: z.boolean().optional(),
  isEnabled: z.boolean().optional(),
  metadata: metadataSchema,
});
export const updateCurrencyConfigSchema = createCurrencyConfigSchema.partial();

// FX Rate schemas
export const createFxRateSchema = z.object({
  sourceCurrency: z.string().length(3),
  targetCurrency: z.string().length(3),
  rate: z.number().int().positive(),
  rateMultiplier: z.number().int().positive().optional(),
  rateType: z.enum(["spot", "forward", "official", "custom"]).optional(),
  provider: z.string().max(100).optional(),
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  metadata: metadataSchema,
});
export const updateFxRateSchema = createFxRateSchema.partial();

// Tax Config schemas
export const createTaxConfigSchema = z.object({
  legalEntityId: z.string().uuid().optional(),
  taxName: z.string().min(1).max(255),
  taxCode: z.string().min(1).max(50),
  taxType: z.enum(["vat", "gst", "excise", "customs_duty", "withholding", "corporate", "other"]).optional(),
  country: z.string().length(2),
  region: z.string().max(50).optional(),
  description: z.string().optional(),
  isCompound: z.boolean().optional(),
  isActive: z.boolean().optional(),
  metadata: metadataSchema,
});
export const updateTaxConfigSchema = createTaxConfigSchema.partial();

// Tax Rate schemas
export const createTaxRateSchema = z.object({
  taxConfigId: z.string().uuid(),
  rateBps: z.number().int().min(0),
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  metadata: metadataSchema,
});
export const updateTaxRateSchema = createTaxRateSchema.partial();

// Intercompany Transaction schemas
export const createIntercompanyTransactionSchema = z.object({
  transactionNumber: z.string().min(1).max(100),
  sourceEntityId: z.string().uuid(),
  targetEntityId: z.string().uuid(),
  transactionType: z.enum(["sale", "purchase", "loan", "service", "dividend", "royalty", "management_fee", "other"]),
  description: z.string().optional(),
  currency: z.string().length(3),
  amount: z.number().int().positive(),
  fxRate: z.number().int().optional(),
  fxRateMultiplier: z.number().int().positive().optional(),
  baseAmount: z.number().int().optional(),
  status: z.enum(["draft", "pending", "approved", "posted", "reversed", "cancelled"]).optional(),
  referenceType: z.string().max(50).optional(),
  referenceId: z.string().uuid().optional(),
  metadata: metadataSchema,
});
export const updateIntercompanyTransactionSchema = createIntercompanyTransactionSchema.partial();

// Settlement Batch schemas
export const createSettlementBatchSchema = z.object({
  batchNumber: z.string().min(1).max(100),
  description: z.string().optional(),
  settlementDate: z.string().datetime(),
  currency: z.string().length(3),
  totalAmount: z.number().int().optional(),
  netAmount: z.number().int().optional(),
  status: z.enum(["draft", "pending", "approved", "settled", "cancelled"]).optional(),
  metadata: metadataSchema,
});
export const updateSettlementBatchSchema = createSettlementBatchSchema.partial();

// Settlement Item schemas
export const createSettlementItemSchema = z.object({
  batchId: z.string().uuid(),
  transactionId: z.string().uuid(),
  amount: z.number().int(),
  netDirection: z.enum(["debit", "credit"]),
  metadata: metadataSchema,
});
export const updateSettlementItemSchema = createSettlementItemSchema.partial();

// Oracle Integration Config schemas
export const createOracleIntegrationConfigSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100),
  description: z.string().optional(),
  endpointUrl: z.string().url().max(1000),
  authConfig: z.record(z.string(), z.unknown()).optional(),
  mappingConfig: z.record(z.string(), z.unknown()).optional(),
  syncSchedule: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
  metadata: metadataSchema,
});
export const updateOracleIntegrationConfigSchema = createOracleIntegrationConfigSchema.partial();

// Oracle Sync Log schemas
export const createOracleSyncLogSchema = z.object({
  integrationConfigId: z.string().uuid(),
  syncType: z.enum(["full", "incremental", "manual"]),
  status: z.enum(["pending", "running", "completed", "failed", "cancelled"]).optional(),
  recordsProcessed: z.number().int().min(0).optional(),
  recordsFailed: z.number().int().min(0).optional(),
  errorLog: z.record(z.string(), z.unknown()).optional(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  metadata: metadataSchema,
});
export const updateOracleSyncLogSchema = createOracleSyncLogSchema.partial();

// Compliance Rule schemas
export const createComplianceRuleSchema = z.object({
  name: z.string().min(1).max(255),
  ruleCode: z.string().min(1).max(100),
  description: z.string().optional(),
  country: z.string().length(2),
  region: z.string().max(50).optional(),
  regulatoryBody: z.string().max(255).optional(),
  ruleType: z.enum(["reporting", "filing", "disclosure", "audit", "registration", "other"]).optional(),
  frequency: z.string().max(30).optional(),
  conditions: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
  metadata: metadataSchema,
});
export const updateComplianceRuleSchema = createComplianceRuleSchema.partial();

// Compliance Filing schemas
export const createComplianceFilingSchema = z.object({
  complianceRuleId: z.string().uuid(),
  legalEntityId: z.string().uuid(),
  filingPeriod: z.string().min(1).max(30),
  dueDate: z.string().datetime(),
  filedAt: z.string().datetime().optional(),
  status: z.enum(["pending", "in_progress", "submitted", "accepted", "rejected", "overdue"]).optional(),
  filingReference: z.string().max(255).optional(),
  filingData: z.record(z.string(), z.unknown()).optional(),
  submittedBy: z.string().uuid().optional(),
  metadata: metadataSchema,
});
export const updateComplianceFilingSchema = createComplianceFilingSchema.partial();

// Locale Config schemas
export const createLocaleConfigSchema = z.object({
  localeCode: z.string().min(2).max(10),
  localeName: z.string().min(1).max(100),
  language: z.string().min(1).max(50),
  direction: z.enum(["ltr", "rtl"]).optional(),
  dateFormat: z.string().max(30).optional(),
  numberFormat: z.string().max(30).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
  metadata: metadataSchema,
});
export const updateLocaleConfigSchema = createLocaleConfigSchema.partial();

// Translation schemas
export const createTranslationSchema = z.object({
  localeCode: z.string().min(2).max(10),
  namespace: z.string().min(1).max(100),
  key: z.string().min(1).max(255),
  value: z.string().min(1),
  isVerified: z.boolean().optional(),
  metadata: metadataSchema,
});
export const updateTranslationSchema = createTranslationSchema.partial();
