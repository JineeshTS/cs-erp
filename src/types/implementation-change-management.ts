import type {
  icmProjectPlans,
  icmDataMigrations,
  icmUatManagements,
  icmGoLiveChecklists,
  icmChangeRequests,
  icmSystemConfigs,
  icmTrainingCompletions,
  icmHypercareSupports,
} from "@/db/schema";

export type IcmProjectPlan = typeof icmProjectPlans.$inferSelect;
export type NewIcmProjectPlan = typeof icmProjectPlans.$inferInsert;

export type IcmDataMigration = typeof icmDataMigrations.$inferSelect;
export type NewIcmDataMigration = typeof icmDataMigrations.$inferInsert;

export type IcmUatManagement = typeof icmUatManagements.$inferSelect;
export type NewIcmUatManagement = typeof icmUatManagements.$inferInsert;

export type IcmGoLiveChecklist = typeof icmGoLiveChecklists.$inferSelect;
export type NewIcmGoLiveChecklist = typeof icmGoLiveChecklists.$inferInsert;

export type IcmChangeRequest = typeof icmChangeRequests.$inferSelect;
export type NewIcmChangeRequest = typeof icmChangeRequests.$inferInsert;

export type IcmSystemConfig = typeof icmSystemConfigs.$inferSelect;
export type NewIcmSystemConfig = typeof icmSystemConfigs.$inferInsert;

export type IcmTrainingCompletion = typeof icmTrainingCompletions.$inferSelect;
export type NewIcmTrainingCompletion = typeof icmTrainingCompletions.$inferInsert;

export type IcmHypercareSupport = typeof icmHypercareSupports.$inferSelect;
export type NewIcmHypercareSupport = typeof icmHypercareSupports.$inferInsert;
