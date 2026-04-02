import type {
  pdaProformaEstimates,
  pdaFinalDas,
  pdaPortCosts,
  pdaAgentStatements,
  pdaExpenseAllocations,
  pdaVarianceAnalyses,
  pdaCostBenchmarks,
  pdaConsolidatedReports,
} from "@/db/schema";

export type PdaProformaEstimate = typeof pdaProformaEstimates.$inferSelect;
export type PdaProformaEstimateInsert = typeof pdaProformaEstimates.$inferInsert;

export type PdaFinalDa = typeof pdaFinalDas.$inferSelect;
export type PdaFinalDaInsert = typeof pdaFinalDas.$inferInsert;

export type PdaPortCost = typeof pdaPortCosts.$inferSelect;
export type PdaPortCostInsert = typeof pdaPortCosts.$inferInsert;

export type PdaAgentStatement = typeof pdaAgentStatements.$inferSelect;
export type PdaAgentStatementInsert = typeof pdaAgentStatements.$inferInsert;

export type PdaExpenseAllocation = typeof pdaExpenseAllocations.$inferSelect;
export type PdaExpenseAllocationInsert = typeof pdaExpenseAllocations.$inferInsert;

export type PdaVarianceAnalysis = typeof pdaVarianceAnalyses.$inferSelect;
export type PdaVarianceAnalysisInsert = typeof pdaVarianceAnalyses.$inferInsert;

export type PdaCostBenchmark = typeof pdaCostBenchmarks.$inferSelect;
export type PdaCostBenchmarkInsert = typeof pdaCostBenchmarks.$inferInsert;

export type PdaConsolidatedReport = typeof pdaConsolidatedReports.$inferSelect;
export type PdaConsolidatedReportInsert = typeof pdaConsolidatedReports.$inferInsert;
