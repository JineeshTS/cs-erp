import type {
  bfmBunkerOrders,
  bfmBunkerStems,
  bfmQualityTests,
  bfmQualityClaims,
  bfmFuelRobRecords,
  bfmFuelReconciliations,
  bfmEmissionsRecords,
  bfmSulphurRecords,
  bfmCostAllocations,
  bfmOptimizationRuns,
} from "@/db/schema";

export type BfmBunkerOrder = typeof bfmBunkerOrders.$inferSelect;
export type BfmBunkerOrderInsert = typeof bfmBunkerOrders.$inferInsert;

export type BfmBunkerStem = typeof bfmBunkerStems.$inferSelect;
export type BfmBunkerStemInsert = typeof bfmBunkerStems.$inferInsert;

export type BfmQualityTest = typeof bfmQualityTests.$inferSelect;
export type BfmQualityTestInsert = typeof bfmQualityTests.$inferInsert;

export type BfmQualityClaim = typeof bfmQualityClaims.$inferSelect;
export type BfmQualityClaimInsert = typeof bfmQualityClaims.$inferInsert;

export type BfmFuelRobRecord = typeof bfmFuelRobRecords.$inferSelect;
export type BfmFuelRobRecordInsert = typeof bfmFuelRobRecords.$inferInsert;

export type BfmFuelReconciliation = typeof bfmFuelReconciliations.$inferSelect;
export type BfmFuelReconciliationInsert = typeof bfmFuelReconciliations.$inferInsert;

export type BfmEmissionsRecord = typeof bfmEmissionsRecords.$inferSelect;
export type BfmEmissionsRecordInsert = typeof bfmEmissionsRecords.$inferInsert;

export type BfmSulphurRecord = typeof bfmSulphurRecords.$inferSelect;
export type BfmSulphurRecordInsert = typeof bfmSulphurRecords.$inferInsert;

export type BfmCostAllocation = typeof bfmCostAllocations.$inferSelect;
export type BfmCostAllocationInsert = typeof bfmCostAllocations.$inferInsert;

export type BfmOptimizationRun = typeof bfmOptimizationRuns.$inferSelect;
export type BfmOptimizationRunInsert = typeof bfmOptimizationRuns.$inferInsert;
