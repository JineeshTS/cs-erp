import type {
  ccmClaimRegistrations,
  ccmLiabilityAssessments,
  ccmDamageSurveys,
  ccmTimeBarTrackings,
  ccmClaimSettlements,
  ccmSubrogationRecoveries,
  ccmClaimPredictions,
  ccmPortfolioAnalytics,
} from "@/db/schema";

export type CcmClaimRegistration = typeof ccmClaimRegistrations.$inferSelect;
export type NewCcmClaimRegistration = typeof ccmClaimRegistrations.$inferInsert;

export type CcmLiabilityAssessment = typeof ccmLiabilityAssessments.$inferSelect;
export type NewCcmLiabilityAssessment = typeof ccmLiabilityAssessments.$inferInsert;

export type CcmDamageSurvey = typeof ccmDamageSurveys.$inferSelect;
export type NewCcmDamageSurvey = typeof ccmDamageSurveys.$inferInsert;

export type CcmTimeBarTracking = typeof ccmTimeBarTrackings.$inferSelect;
export type NewCcmTimeBarTracking = typeof ccmTimeBarTrackings.$inferInsert;

export type CcmClaimSettlement = typeof ccmClaimSettlements.$inferSelect;
export type NewCcmClaimSettlement = typeof ccmClaimSettlements.$inferInsert;

export type CcmSubrogationRecovery = typeof ccmSubrogationRecoveries.$inferSelect;
export type NewCcmSubrogationRecovery = typeof ccmSubrogationRecoveries.$inferInsert;

export type CcmClaimPrediction = typeof ccmClaimPredictions.$inferSelect;
export type NewCcmClaimPrediction = typeof ccmClaimPredictions.$inferInsert;

export type CcmPortfolioAnalytic = typeof ccmPortfolioAnalytics.$inferSelect;
export type NewCcmPortfolioAnalytic = typeof ccmPortfolioAnalytics.$inferInsert;
