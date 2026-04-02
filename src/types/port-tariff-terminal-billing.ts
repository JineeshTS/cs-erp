import type {
  pttTerminalHandlingCharges,
  pttPortDuesWharfages,
  pttPilotageTowageCharges,
  pttStorageDemurrageTariffs,
  pttTariffComparisons,
  pttInvoiceValidations,
  pttCostOptimizations,
  pttBudgetPlannings,
} from "@/db/schema";

export type PttTerminalHandlingCharge = typeof pttTerminalHandlingCharges.$inferSelect;
export type NewPttTerminalHandlingCharge = typeof pttTerminalHandlingCharges.$inferInsert;

export type PttPortDuesWharfage = typeof pttPortDuesWharfages.$inferSelect;
export type NewPttPortDuesWharfage = typeof pttPortDuesWharfages.$inferInsert;

export type PttPilotageTowageCharge = typeof pttPilotageTowageCharges.$inferSelect;
export type NewPttPilotageTowageCharge = typeof pttPilotageTowageCharges.$inferInsert;

export type PttStorageDemurrageTariff = typeof pttStorageDemurrageTariffs.$inferSelect;
export type NewPttStorageDemurrageTariff = typeof pttStorageDemurrageTariffs.$inferInsert;

export type PttTariffComparison = typeof pttTariffComparisons.$inferSelect;
export type NewPttTariffComparison = typeof pttTariffComparisons.$inferInsert;

export type PttInvoiceValidation = typeof pttInvoiceValidations.$inferSelect;
export type NewPttInvoiceValidation = typeof pttInvoiceValidations.$inferInsert;

export type PttCostOptimization = typeof pttCostOptimizations.$inferSelect;
export type NewPttCostOptimization = typeof pttCostOptimizations.$inferInsert;

export type PttBudgetPlanning = typeof pttBudgetPlannings.$inferSelect;
export type NewPttBudgetPlanning = typeof pttBudgetPlannings.$inferInsert;
