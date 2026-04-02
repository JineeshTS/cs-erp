import type {
  famAssetRegistries,
  famDepreciationSchedules,
  famAssetDisposals,
  famInsuranceValuations,
  famMaintenanceSchedules,
  famCapexOpexClassifications,
  famImpairmentTests,
  famLeaseAccounting,
} from "@/db/schema";

export type FamAssetRegistry = typeof famAssetRegistries.$inferSelect;
export type NewFamAssetRegistry = typeof famAssetRegistries.$inferInsert;

export type FamDepreciationSchedule = typeof famDepreciationSchedules.$inferSelect;
export type NewFamDepreciationSchedule = typeof famDepreciationSchedules.$inferInsert;

export type FamAssetDisposal = typeof famAssetDisposals.$inferSelect;
export type NewFamAssetDisposal = typeof famAssetDisposals.$inferInsert;

export type FamInsuranceValuation = typeof famInsuranceValuations.$inferSelect;
export type NewFamInsuranceValuation = typeof famInsuranceValuations.$inferInsert;

export type FamMaintenanceSchedule = typeof famMaintenanceSchedules.$inferSelect;
export type NewFamMaintenanceSchedule = typeof famMaintenanceSchedules.$inferInsert;

export type FamCapexOpexClassification = typeof famCapexOpexClassifications.$inferSelect;
export type NewFamCapexOpexClassification = typeof famCapexOpexClassifications.$inferInsert;

export type FamImpairmentTest = typeof famImpairmentTests.$inferSelect;
export type NewFamImpairmentTest = typeof famImpairmentTests.$inferInsert;

export type FamLeaseAccount = typeof famLeaseAccounting.$inferSelect;
export type NewFamLeaseAccount = typeof famLeaseAccounting.$inferInsert;
