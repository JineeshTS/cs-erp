import type {
  svpServiceSchedules,
  svpPortSequences,
  svpCanalTransits,
  svpEtaManagements,
  svpVoyageOptimizations,
  svpSpeedFuelAnalyses,
  svpWeatherRoutings,
  svpDeploymentPlans,
} from "@/db/schema";

export type SvpServiceSchedule = typeof svpServiceSchedules.$inferSelect;
export type NewSvpServiceSchedule = typeof svpServiceSchedules.$inferInsert;

export type SvpPortSequence = typeof svpPortSequences.$inferSelect;
export type NewSvpPortSequence = typeof svpPortSequences.$inferInsert;

export type SvpCanalTransit = typeof svpCanalTransits.$inferSelect;
export type NewSvpCanalTransit = typeof svpCanalTransits.$inferInsert;

export type SvpEtaManagement = typeof svpEtaManagements.$inferSelect;
export type NewSvpEtaManagement = typeof svpEtaManagements.$inferInsert;

export type SvpVoyageOptimization = typeof svpVoyageOptimizations.$inferSelect;
export type NewSvpVoyageOptimization = typeof svpVoyageOptimizations.$inferInsert;

export type SvpSpeedFuelAnalysis = typeof svpSpeedFuelAnalyses.$inferSelect;
export type NewSvpSpeedFuelAnalysis = typeof svpSpeedFuelAnalyses.$inferInsert;

export type SvpWeatherRouting = typeof svpWeatherRoutings.$inferSelect;
export type NewSvpWeatherRouting = typeof svpWeatherRoutings.$inferInsert;

export type SvpDeploymentPlan = typeof svpDeploymentPlans.$inferSelect;
export type NewSvpDeploymentPlan = typeof svpDeploymentPlans.$inferInsert;
