import type {
  lprRiskRegisters,
  lprHsseRecords,
  lprNearMissReports,
  lprIncidentInvestigations,
  lprPiClubScorings,
  lprContinuityPlans,
  lprEmergencyProcedures,
  lprRiskKpiDashboards,
} from "@/db/schema";

export type LprRiskRegister = typeof lprRiskRegisters.$inferSelect;
export type NewLprRiskRegister = typeof lprRiskRegisters.$inferInsert;

export type LprHsseRecord = typeof lprHsseRecords.$inferSelect;
export type NewLprHsseRecord = typeof lprHsseRecords.$inferInsert;

export type LprNearMissReport = typeof lprNearMissReports.$inferSelect;
export type NewLprNearMissReport = typeof lprNearMissReports.$inferInsert;

export type LprIncidentInvestigation = typeof lprIncidentInvestigations.$inferSelect;
export type NewLprIncidentInvestigation = typeof lprIncidentInvestigations.$inferInsert;

export type LprPiClubScoring = typeof lprPiClubScorings.$inferSelect;
export type NewLprPiClubScoring = typeof lprPiClubScorings.$inferInsert;

export type LprContinuityPlan = typeof lprContinuityPlans.$inferSelect;
export type NewLprContinuityPlan = typeof lprContinuityPlans.$inferInsert;

export type LprEmergencyProcedure = typeof lprEmergencyProcedures.$inferSelect;
export type NewLprEmergencyProcedure = typeof lprEmergencyProcedures.$inferInsert;

export type LprRiskKpiDashboard = typeof lprRiskKpiDashboards.$inferSelect;
export type NewLprRiskKpiDashboard = typeof lprRiskKpiDashboards.$inferInsert;
