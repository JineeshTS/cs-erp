import type {
  thmCargoPlans,
  thmFeederCoordinations,
  thmCargoTrackings,
  thmMissedConnections,
  thmRevenueAttributions,
  thmHubEfficiencies,
  thmOptimizationEngines,
  thmPenaltyTrackings,
} from "@/db/schema";

export type ThmCargoPlan = typeof thmCargoPlans.$inferSelect;
export type NewThmCargoPlan = typeof thmCargoPlans.$inferInsert;

export type ThmFeederCoordination = typeof thmFeederCoordinations.$inferSelect;
export type NewThmFeederCoordination = typeof thmFeederCoordinations.$inferInsert;

export type ThmCargoTracking = typeof thmCargoTrackings.$inferSelect;
export type NewThmCargoTracking = typeof thmCargoTrackings.$inferInsert;

export type ThmMissedConnection = typeof thmMissedConnections.$inferSelect;
export type NewThmMissedConnection = typeof thmMissedConnections.$inferInsert;

export type ThmRevenueAttribution = typeof thmRevenueAttributions.$inferSelect;
export type NewThmRevenueAttribution = typeof thmRevenueAttributions.$inferInsert;

export type ThmHubEfficiency = typeof thmHubEfficiencies.$inferSelect;
export type NewThmHubEfficiency = typeof thmHubEfficiencies.$inferInsert;

export type ThmOptimizationEngine = typeof thmOptimizationEngines.$inferSelect;
export type NewThmOptimizationEngine = typeof thmOptimizationEngines.$inferInsert;

export type ThmPenaltyTracking = typeof thmPenaltyTrackings.$inferSelect;
export type NewThmPenaltyTracking = typeof thmPenaltyTrackings.$inferInsert;
