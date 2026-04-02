import type {
  lrmTeuMaximizations,
  lrmCargoMixes,
  lrmDemandForecasts,
  lrmFreightContracts,
  lrmLeakageDetections,
  lrmRateIntegrities,
  lrmRevenueAccruals,
  lrmMaximizationEngines,
} from "@/db/schema";

export type LrmTeuMaximization = typeof lrmTeuMaximizations.$inferSelect;
export type NewLrmTeuMaximization = typeof lrmTeuMaximizations.$inferInsert;

export type LrmCargoMix = typeof lrmCargoMixes.$inferSelect;
export type NewLrmCargoMix = typeof lrmCargoMixes.$inferInsert;

export type LrmDemandForecast = typeof lrmDemandForecasts.$inferSelect;
export type NewLrmDemandForecast = typeof lrmDemandForecasts.$inferInsert;

export type LrmFreightContract = typeof lrmFreightContracts.$inferSelect;
export type NewLrmFreightContract = typeof lrmFreightContracts.$inferInsert;

export type LrmLeakageDetection = typeof lrmLeakageDetections.$inferSelect;
export type NewLrmLeakageDetection = typeof lrmLeakageDetections.$inferInsert;

export type LrmRateIntegrity = typeof lrmRateIntegrities.$inferSelect;
export type NewLrmRateIntegrity = typeof lrmRateIntegrities.$inferInsert;

export type LrmRevenueAccrual = typeof lrmRevenueAccruals.$inferSelect;
export type NewLrmRevenueAccrual = typeof lrmRevenueAccruals.$inferInsert;

export type LrmMaximizationEngine = typeof lrmMaximizationEngines.$inferSelect;
export type NewLrmMaximizationEngine = typeof lrmMaximizationEngines.$inferInsert;
