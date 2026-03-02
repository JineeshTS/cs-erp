import type {
  ccrImportClearances,
  ccrExportFilings,
  ccrTransitProcedures,
  ccrDutyCalculations,
  ccrAeoCompliances,
  ccrIspsCompliances,
  ccrPscPreparations,
  ccrImoRegulations,
} from "@/db/schema";

export type CcrImportClearance = typeof ccrImportClearances.$inferSelect;
export type NewCcrImportClearance = typeof ccrImportClearances.$inferInsert;

export type CcrExportFiling = typeof ccrExportFilings.$inferSelect;
export type NewCcrExportFiling = typeof ccrExportFilings.$inferInsert;

export type CcrTransitProcedure = typeof ccrTransitProcedures.$inferSelect;
export type NewCcrTransitProcedure = typeof ccrTransitProcedures.$inferInsert;

export type CcrDutyCalculation = typeof ccrDutyCalculations.$inferSelect;
export type NewCcrDutyCalculation = typeof ccrDutyCalculations.$inferInsert;

export type CcrAeoCompliance = typeof ccrAeoCompliances.$inferSelect;
export type NewCcrAeoCompliance = typeof ccrAeoCompliances.$inferInsert;

export type CcrIspsCompliance = typeof ccrIspsCompliances.$inferSelect;
export type NewCcrIspsCompliance = typeof ccrIspsCompliances.$inferInsert;

export type CcrPscPreparation = typeof ccrPscPreparations.$inferSelect;
export type NewCcrPscPreparation = typeof ccrPscPreparations.$inferInsert;

export type CcrImoRegulation = typeof ccrImoRegulations.$inferSelect;
export type NewCcrImoRegulation = typeof ccrImoRegulations.$inferInsert;
