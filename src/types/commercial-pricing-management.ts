import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  cpmTariffs,
  cpmTariffRates,
  cpmSpecialRates,
  cpmSurcharges,
  cpmDetentionDemurrage,
  cpmYieldTargets,
  cpmRateBenchmarks,
  cpmProfitabilityAnalyses,
  cpmAiPricingModels,
  cpmVsaSlotRates,
  cpmDeadFreightRecords,
  cpmRevenueLeakages,
  cpmPricingApprovals,
} from "@/db/schema/commercial-pricing-management";

// Tariff
export type Tariff = InferSelectModel<typeof cpmTariffs>;
export type NewTariff = InferInsertModel<typeof cpmTariffs>;

// Tariff Rate
export type TariffRate = InferSelectModel<typeof cpmTariffRates>;
export type NewTariffRate = InferInsertModel<typeof cpmTariffRates>;

// Special Rate
export type SpecialRate = InferSelectModel<typeof cpmSpecialRates>;
export type NewSpecialRate = InferInsertModel<typeof cpmSpecialRates>;

// Surcharge
export type Surcharge = InferSelectModel<typeof cpmSurcharges>;
export type NewSurcharge = InferInsertModel<typeof cpmSurcharges>;

// Detention Demurrage
export type DetentionDemurrage = InferSelectModel<typeof cpmDetentionDemurrage>;
export type NewDetentionDemurrage = InferInsertModel<typeof cpmDetentionDemurrage>;

// Yield Target
export type YieldTarget = InferSelectModel<typeof cpmYieldTargets>;
export type NewYieldTarget = InferInsertModel<typeof cpmYieldTargets>;

// Rate Benchmark
export type RateBenchmark = InferSelectModel<typeof cpmRateBenchmarks>;
export type NewRateBenchmark = InferInsertModel<typeof cpmRateBenchmarks>;

// Profitability Analysis
export type ProfitabilityAnalysis = InferSelectModel<typeof cpmProfitabilityAnalyses>;
export type NewProfitabilityAnalysis = InferInsertModel<typeof cpmProfitabilityAnalyses>;

// AI Pricing Model
export type AiPricingModel = InferSelectModel<typeof cpmAiPricingModels>;
export type NewAiPricingModel = InferInsertModel<typeof cpmAiPricingModels>;

// VSA Slot Rate
export type VsaSlotRate = InferSelectModel<typeof cpmVsaSlotRates>;
export type NewVsaSlotRate = InferInsertModel<typeof cpmVsaSlotRates>;

// Dead Freight Record
export type DeadFreightRecord = InferSelectModel<typeof cpmDeadFreightRecords>;
export type NewDeadFreightRecord = InferInsertModel<typeof cpmDeadFreightRecords>;

// Revenue Leakage
export type RevenueLeakage = InferSelectModel<typeof cpmRevenueLeakages>;
export type NewRevenueLeakage = InferInsertModel<typeof cpmRevenueLeakages>;

// Pricing Approval
export type PricingApproval = InferSelectModel<typeof cpmPricingApprovals>;
export type NewPricingApproval = InferInsertModel<typeof cpmPricingApprovals>;
