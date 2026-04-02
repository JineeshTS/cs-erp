import type {
  icmPiClubPolicies,
  icmHullMachineryInsurances,
  icmCargoInsurancePolicies,
  icmSurveyAppointments,
  icmClaimsRegistrations,
  icmClaimsRecoveries,
  icmClaimsPredictions,
  icmLossPreventionReports,
} from "@/db/schema";

export type IcmPiClubPolicy = typeof icmPiClubPolicies.$inferSelect;
export type NewIcmPiClubPolicy = typeof icmPiClubPolicies.$inferInsert;

export type IcmHullMachineryInsurance = typeof icmHullMachineryInsurances.$inferSelect;
export type NewIcmHullMachineryInsurance = typeof icmHullMachineryInsurances.$inferInsert;

export type IcmCargoInsurancePolicy = typeof icmCargoInsurancePolicies.$inferSelect;
export type NewIcmCargoInsurancePolicy = typeof icmCargoInsurancePolicies.$inferInsert;

export type IcmSurveyAppointment = typeof icmSurveyAppointments.$inferSelect;
export type NewIcmSurveyAppointment = typeof icmSurveyAppointments.$inferInsert;

export type IcmClaimsRegistration = typeof icmClaimsRegistrations.$inferSelect;
export type NewIcmClaimsRegistration = typeof icmClaimsRegistrations.$inferInsert;

export type IcmClaimsRecovery = typeof icmClaimsRecoveries.$inferSelect;
export type NewIcmClaimsRecovery = typeof icmClaimsRecoveries.$inferInsert;

export type IcmClaimsPrediction = typeof icmClaimsPredictions.$inferSelect;
export type NewIcmClaimsPrediction = typeof icmClaimsPredictions.$inferInsert;

export type IcmLossPreventionReport = typeof icmLossPreventionReports.$inferSelect;
export type NewIcmLossPreventionReport = typeof icmLossPreventionReports.$inferInsert;
