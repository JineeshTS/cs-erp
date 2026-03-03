import type {
  hpsEmployeeProfiles,
  hpsLeaveAbsences,
  hpsAttendanceTimeTrackings,
  hpsPerformanceAppraisals,
  hpsPayrollProcessings,
  hpsSocialInsuranceRecords,
  hpsGratuityCalculations,
  hpsVisaResidencyRecords,
} from "@/db/schema";

export type HpsEmployeeProfile = typeof hpsEmployeeProfiles.$inferSelect;
export type NewHpsEmployeeProfile = typeof hpsEmployeeProfiles.$inferInsert;

export type HpsLeaveAbsence = typeof hpsLeaveAbsences.$inferSelect;
export type NewHpsLeaveAbsence = typeof hpsLeaveAbsences.$inferInsert;

export type HpsAttendanceTimeTracking = typeof hpsAttendanceTimeTrackings.$inferSelect;
export type NewHpsAttendanceTimeTracking = typeof hpsAttendanceTimeTrackings.$inferInsert;

export type HpsPerformanceAppraisal = typeof hpsPerformanceAppraisals.$inferSelect;
export type NewHpsPerformanceAppraisal = typeof hpsPerformanceAppraisals.$inferInsert;

export type HpsPayrollProcessing = typeof hpsPayrollProcessings.$inferSelect;
export type NewHpsPayrollProcessing = typeof hpsPayrollProcessings.$inferInsert;

export type HpsSocialInsuranceRecord = typeof hpsSocialInsuranceRecords.$inferSelect;
export type NewHpsSocialInsuranceRecord = typeof hpsSocialInsuranceRecords.$inferInsert;

export type HpsGratuityCalculation = typeof hpsGratuityCalculations.$inferSelect;
export type NewHpsGratuityCalculation = typeof hpsGratuityCalculations.$inferInsert;

export type HpsVisaResidencyRecord = typeof hpsVisaResidencyRecords.$inferSelect;
export type NewHpsVisaResidencyRecord = typeof hpsVisaResidencyRecords.$inferInsert;
