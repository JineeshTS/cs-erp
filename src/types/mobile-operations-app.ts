import type {
  mobGateProcessings,
  mobYardInspections,
  mobContainerSurveys,
  mobOfflineSyncs,
  mobDamageAssessments,
  mobDriverDeliveries,
  mobExecutiveDashboards,
  mobPushNotifications,
} from "@/db/schema";

export type MobGateProcessing = typeof mobGateProcessings.$inferSelect;
export type NewMobGateProcessing = typeof mobGateProcessings.$inferInsert;

export type MobYardInspection = typeof mobYardInspections.$inferSelect;
export type NewMobYardInspection = typeof mobYardInspections.$inferInsert;

export type MobContainerSurvey = typeof mobContainerSurveys.$inferSelect;
export type NewMobContainerSurvey = typeof mobContainerSurveys.$inferInsert;

export type MobOfflineSync = typeof mobOfflineSyncs.$inferSelect;
export type NewMobOfflineSync = typeof mobOfflineSyncs.$inferInsert;

export type MobDamageAssessment = typeof mobDamageAssessments.$inferSelect;
export type NewMobDamageAssessment = typeof mobDamageAssessments.$inferInsert;

export type MobDriverDelivery = typeof mobDriverDeliveries.$inferSelect;
export type NewMobDriverDelivery = typeof mobDriverDeliveries.$inferInsert;

export type MobExecutiveDashboard = typeof mobExecutiveDashboards.$inferSelect;
export type NewMobExecutiveDashboard = typeof mobExecutiveDashboards.$inferInsert;

export type MobPushNotification = typeof mobPushNotifications.$inferSelect;
export type NewMobPushNotification = typeof mobPushNotifications.$inferInsert;
