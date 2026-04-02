import type {
  vrsVoyageCloses,
  vrsTcSettlements,
  vrsVoyagePnls,
  vrsHireReconciliations,
  vrsResultWorkflows,
  vrsIntercoSettlements,
  vrsProfitBenchmarks,
  vrsVoyageAnalytics,
} from "@/db/schema";

export type VrsVoyageClose = typeof vrsVoyageCloses.$inferSelect;
export type NewVrsVoyageClose = typeof vrsVoyageCloses.$inferInsert;

export type VrsTcSettlement = typeof vrsTcSettlements.$inferSelect;
export type NewVrsTcSettlement = typeof vrsTcSettlements.$inferInsert;

export type VrsVoyagePnl = typeof vrsVoyagePnls.$inferSelect;
export type NewVrsVoyagePnl = typeof vrsVoyagePnls.$inferInsert;

export type VrsHireReconciliation = typeof vrsHireReconciliations.$inferSelect;
export type NewVrsHireReconciliation = typeof vrsHireReconciliations.$inferInsert;

export type VrsResultWorkflow = typeof vrsResultWorkflows.$inferSelect;
export type NewVrsResultWorkflow = typeof vrsResultWorkflows.$inferInsert;

export type VrsIntercoSettlement = typeof vrsIntercoSettlements.$inferSelect;
export type NewVrsIntercoSettlement = typeof vrsIntercoSettlements.$inferInsert;

export type VrsProfitBenchmark = typeof vrsProfitBenchmarks.$inferSelect;
export type NewVrsProfitBenchmark = typeof vrsProfitBenchmarks.$inferInsert;

export type VrsVoyageAnalytics = typeof vrsVoyageAnalytics.$inferSelect;
export type NewVrsVoyageAnalytics = typeof vrsVoyageAnalytics.$inferInsert;
