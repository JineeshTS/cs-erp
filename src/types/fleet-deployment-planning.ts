import type {
  fdpDeploymentDecisions,
  fdpFleetUtilizations,
  fdpNetworkDesigns,
  fdpDeploymentOptimizers,
  fdpFleetFinancials,
  fdpVesselSwaps,
  fdpDeploymentContracts,
  fdpMarketIntelligence,
} from "@/db/schema";

export type FdpDeploymentDecision = typeof fdpDeploymentDecisions.$inferSelect;
export type NewFdpDeploymentDecision = typeof fdpDeploymentDecisions.$inferInsert;

export type FdpFleetUtilization = typeof fdpFleetUtilizations.$inferSelect;
export type NewFdpFleetUtilization = typeof fdpFleetUtilizations.$inferInsert;

export type FdpNetworkDesign = typeof fdpNetworkDesigns.$inferSelect;
export type NewFdpNetworkDesign = typeof fdpNetworkDesigns.$inferInsert;

export type FdpDeploymentOptimizer = typeof fdpDeploymentOptimizers.$inferSelect;
export type NewFdpDeploymentOptimizer = typeof fdpDeploymentOptimizers.$inferInsert;

export type FdpFleetFinancial = typeof fdpFleetFinancials.$inferSelect;
export type NewFdpFleetFinancial = typeof fdpFleetFinancials.$inferInsert;

export type FdpVesselSwap = typeof fdpVesselSwaps.$inferSelect;
export type NewFdpVesselSwap = typeof fdpVesselSwaps.$inferInsert;

export type FdpDeploymentContract = typeof fdpDeploymentContracts.$inferSelect;
export type NewFdpDeploymentContract = typeof fdpDeploymentContracts.$inferInsert;

export type FdpMarketIntelligence = typeof fdpMarketIntelligence.$inferSelect;
export type NewFdpMarketIntelligence = typeof fdpMarketIntelligence.$inferInsert;
