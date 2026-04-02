import type {
  vtmPlannedMaintenanceTasks,
  vtmDryDockPlans,
  vtmSurveyTrackings,
  vtmDefectRepairs,
  vtmSpareParts,
  vtmTechnicalProcurements,
  vtmComplianceRecords,
  vtmPredictiveMaintenance,
} from "@/db/schema";

export type VtmPlannedMaintenanceTask = typeof vtmPlannedMaintenanceTasks.$inferSelect;
export type NewVtmPlannedMaintenanceTask = typeof vtmPlannedMaintenanceTasks.$inferInsert;

export type VtmDryDockPlan = typeof vtmDryDockPlans.$inferSelect;
export type NewVtmDryDockPlan = typeof vtmDryDockPlans.$inferInsert;

export type VtmSurveyTracking = typeof vtmSurveyTrackings.$inferSelect;
export type NewVtmSurveyTracking = typeof vtmSurveyTrackings.$inferInsert;

export type VtmDefectRepair = typeof vtmDefectRepairs.$inferSelect;
export type NewVtmDefectRepair = typeof vtmDefectRepairs.$inferInsert;

export type VtmSparePart = typeof vtmSpareParts.$inferSelect;
export type NewVtmSparePart = typeof vtmSpareParts.$inferInsert;

export type VtmTechnicalProcurement = typeof vtmTechnicalProcurements.$inferSelect;
export type NewVtmTechnicalProcurement = typeof vtmTechnicalProcurements.$inferInsert;

export type VtmComplianceRecord = typeof vtmComplianceRecords.$inferSelect;
export type NewVtmComplianceRecord = typeof vtmComplianceRecords.$inferInsert;

export type VtmPredictiveMaintenance = typeof vtmPredictiveMaintenance.$inferSelect;
export type NewVtmPredictiveMaintenance = typeof vtmPredictiveMaintenance.$inferInsert;
