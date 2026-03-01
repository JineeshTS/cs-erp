import type {
  cfmVoyageBudgets,
  cfmPortDisbursements,
  cfmRevenueRecognitions,
  cfmAgencyCommissions,
  cfmVoyagePnlReports,
  cfmContainerCosts,
  cfmOverheadAllocations,
  cfmVarianceAnalyses,
  cfmCostCentres,
  cfmCapexItems,
  cfmAnomalyDetections,
  cfmKpiReports,
} from "@/db/schema";

export type CfmVoyageBudget = typeof cfmVoyageBudgets.$inferSelect;
export type CfmVoyageBudgetInsert = typeof cfmVoyageBudgets.$inferInsert;

export type CfmPortDisbursement = typeof cfmPortDisbursements.$inferSelect;
export type CfmPortDisbursementInsert = typeof cfmPortDisbursements.$inferInsert;

export type CfmRevenueRecognition = typeof cfmRevenueRecognitions.$inferSelect;
export type CfmRevenueRecognitionInsert = typeof cfmRevenueRecognitions.$inferInsert;

export type CfmAgencyCommission = typeof cfmAgencyCommissions.$inferSelect;
export type CfmAgencyCommissionInsert = typeof cfmAgencyCommissions.$inferInsert;

export type CfmVoyagePnlReport = typeof cfmVoyagePnlReports.$inferSelect;
export type CfmVoyagePnlReportInsert = typeof cfmVoyagePnlReports.$inferInsert;

export type CfmContainerCost = typeof cfmContainerCosts.$inferSelect;
export type CfmContainerCostInsert = typeof cfmContainerCosts.$inferInsert;

export type CfmOverheadAllocation = typeof cfmOverheadAllocations.$inferSelect;
export type CfmOverheadAllocationInsert = typeof cfmOverheadAllocations.$inferInsert;

export type CfmVarianceAnalysis = typeof cfmVarianceAnalyses.$inferSelect;
export type CfmVarianceAnalysisInsert = typeof cfmVarianceAnalyses.$inferInsert;

export type CfmCostCentre = typeof cfmCostCentres.$inferSelect;
export type CfmCostCentreInsert = typeof cfmCostCentres.$inferInsert;

export type CfmCapexItem = typeof cfmCapexItems.$inferSelect;
export type CfmCapexItemInsert = typeof cfmCapexItems.$inferInsert;

export type CfmAnomalyDetection = typeof cfmAnomalyDetections.$inferSelect;
export type CfmAnomalyDetectionInsert = typeof cfmAnomalyDetections.$inferInsert;

export type CfmKpiReport = typeof cfmKpiReports.$inferSelect;
export type CfmKpiReportInsert = typeof cfmKpiReports.$inferInsert;
