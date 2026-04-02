import type {
  locCargoCutoffs,
  locOverbookingRollovers,
  locRollingUpgrades,
  locRevenueIntegrityAudits,
  locSlotSwapCoordinations,
  locScheduleDeviations,
  locCargoMixOptimizations,
  locLoadFactorReports,
} from "@/db/schema";

export type LocCargoCutoff = typeof locCargoCutoffs.$inferSelect;
export type NewLocCargoCutoff = typeof locCargoCutoffs.$inferInsert;

export type LocOverbookingRollover = typeof locOverbookingRollovers.$inferSelect;
export type NewLocOverbookingRollover = typeof locOverbookingRollovers.$inferInsert;

export type LocRollingUpgrade = typeof locRollingUpgrades.$inferSelect;
export type NewLocRollingUpgrade = typeof locRollingUpgrades.$inferInsert;

export type LocRevenueIntegrityAudit = typeof locRevenueIntegrityAudits.$inferSelect;
export type NewLocRevenueIntegrityAudit = typeof locRevenueIntegrityAudits.$inferInsert;

export type LocSlotSwapCoordination = typeof locSlotSwapCoordinations.$inferSelect;
export type NewLocSlotSwapCoordination = typeof locSlotSwapCoordinations.$inferInsert;

export type LocScheduleDeviation = typeof locScheduleDeviations.$inferSelect;
export type NewLocScheduleDeviation = typeof locScheduleDeviations.$inferInsert;

export type LocCargoMixOptimization = typeof locCargoMixOptimizations.$inferSelect;
export type NewLocCargoMixOptimization = typeof locCargoMixOptimizations.$inferInsert;

export type LocLoadFactorReport = typeof locLoadFactorReports.$inferSelect;
export type NewLocLoadFactorReport = typeof locLoadFactorReports.$inferInsert;
