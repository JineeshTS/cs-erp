import type {
  crmCrewRotations,
  crmCertificateTrackings,
  crmPayrollAllotments,
  crmFlagStateCompliance,
  crmManningAgencies,
  crmVisaTravelRecords,
  crmWelfareMedicalRecords,
  crmMlcCompliance,
} from "@/db/schema";

export type CrmCrewRotation = typeof crmCrewRotations.$inferSelect;
export type NewCrmCrewRotation = typeof crmCrewRotations.$inferInsert;

export type CrmCertificateTracking = typeof crmCertificateTrackings.$inferSelect;
export type NewCrmCertificateTracking = typeof crmCertificateTrackings.$inferInsert;

export type CrmPayrollAllotment = typeof crmPayrollAllotments.$inferSelect;
export type NewCrmPayrollAllotment = typeof crmPayrollAllotments.$inferInsert;

export type CrmFlagStateCompliance = typeof crmFlagStateCompliance.$inferSelect;
export type NewCrmFlagStateCompliance = typeof crmFlagStateCompliance.$inferInsert;

export type CrmManningAgency = typeof crmManningAgencies.$inferSelect;
export type NewCrmManningAgency = typeof crmManningAgencies.$inferInsert;

export type CrmVisaTravelRecord = typeof crmVisaTravelRecords.$inferSelect;
export type NewCrmVisaTravelRecord = typeof crmVisaTravelRecords.$inferInsert;

export type CrmWelfareMedicalRecord = typeof crmWelfareMedicalRecords.$inferSelect;
export type NewCrmWelfareMedicalRecord = typeof crmWelfareMedicalRecords.$inferInsert;

export type CrmMlcCompliance = typeof crmMlcCompliance.$inferSelect;
export type NewCrmMlcCompliance = typeof crmMlcCompliance.$inferInsert;
