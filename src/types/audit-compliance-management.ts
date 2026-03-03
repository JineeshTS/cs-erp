import type {
  acmInternalAudits,
  acmRegulatoryComplianceCalendars,
  acmRiskRegisters,
  acmPolicyProcedures,
  acmRegulatoryReportingSubmissions,
  acmSoxFinancialControls,
  acmIsoCertificationTrackings,
  acmAiRiskDetections,
} from "@/db/schema";

export type AcmInternalAudit = typeof acmInternalAudits.$inferSelect;
export type NewAcmInternalAudit = typeof acmInternalAudits.$inferInsert;

export type AcmRegulatoryComplianceCalendar = typeof acmRegulatoryComplianceCalendars.$inferSelect;
export type NewAcmRegulatoryComplianceCalendar = typeof acmRegulatoryComplianceCalendars.$inferInsert;

export type AcmRiskRegister = typeof acmRiskRegisters.$inferSelect;
export type NewAcmRiskRegister = typeof acmRiskRegisters.$inferInsert;

export type AcmPolicyProcedure = typeof acmPolicyProcedures.$inferSelect;
export type NewAcmPolicyProcedure = typeof acmPolicyProcedures.$inferInsert;

export type AcmRegulatoryReportingSubmission = typeof acmRegulatoryReportingSubmissions.$inferSelect;
export type NewAcmRegulatoryReportingSubmission = typeof acmRegulatoryReportingSubmissions.$inferInsert;

export type AcmSoxFinancialControl = typeof acmSoxFinancialControls.$inferSelect;
export type NewAcmSoxFinancialControl = typeof acmSoxFinancialControls.$inferInsert;

export type AcmIsoCertificationTracking = typeof acmIsoCertificationTrackings.$inferSelect;
export type NewAcmIsoCertificationTracking = typeof acmIsoCertificationTrackings.$inferInsert;

export type AcmAiRiskDetection = typeof acmAiRiskDetections.$inferSelect;
export type NewAcmAiRiskDetection = typeof acmAiRiskDetections.$inferInsert;
