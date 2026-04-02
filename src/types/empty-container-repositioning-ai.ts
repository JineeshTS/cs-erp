import type {
  ecrInventorySnapshots,
  ecrRepositioningPlans,
  ecrCostTrackings,
  ecrRouteOptimizers,
  ecrDemandForecasts,
  ecrLeasingDecisions,
  ecrReturnIncentives,
  ecrPnlAttributions,
} from "@/db/schema";

export type EcrInventorySnapshot = typeof ecrInventorySnapshots.$inferSelect;
export type NewEcrInventorySnapshot = typeof ecrInventorySnapshots.$inferInsert;

export type EcrRepositioningPlan = typeof ecrRepositioningPlans.$inferSelect;
export type NewEcrRepositioningPlan = typeof ecrRepositioningPlans.$inferInsert;

export type EcrCostTracking = typeof ecrCostTrackings.$inferSelect;
export type NewEcrCostTracking = typeof ecrCostTrackings.$inferInsert;

export type EcrRouteOptimizer = typeof ecrRouteOptimizers.$inferSelect;
export type NewEcrRouteOptimizer = typeof ecrRouteOptimizers.$inferInsert;

export type EcrDemandForecast = typeof ecrDemandForecasts.$inferSelect;
export type NewEcrDemandForecast = typeof ecrDemandForecasts.$inferInsert;

export type EcrLeasingDecision = typeof ecrLeasingDecisions.$inferSelect;
export type NewEcrLeasingDecision = typeof ecrLeasingDecisions.$inferInsert;

export type EcrReturnIncentive = typeof ecrReturnIncentives.$inferSelect;
export type NewEcrReturnIncentive = typeof ecrReturnIncentives.$inferInsert;

export type EcrPnlAttribution = typeof ecrPnlAttributions.$inferSelect;
export type NewEcrPnlAttribution = typeof ecrPnlAttributions.$inferInsert;
