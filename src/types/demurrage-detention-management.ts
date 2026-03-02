import type {
  ddmDemurrageCalculations,
  ddmFreeTimeRules,
  ddmDetentionTrackings,
  ddmInvoices,
  ddmDisputes,
  ddmWaivers,
  ddmPredictions,
  ddmNotifications,
} from "@/db/schema";

export type DdmDemurrageCalculation = typeof ddmDemurrageCalculations.$inferSelect;
export type NewDdmDemurrageCalculation = typeof ddmDemurrageCalculations.$inferInsert;

export type DdmFreeTimeRule = typeof ddmFreeTimeRules.$inferSelect;
export type NewDdmFreeTimeRule = typeof ddmFreeTimeRules.$inferInsert;

export type DdmDetentionTracking = typeof ddmDetentionTrackings.$inferSelect;
export type NewDdmDetentionTracking = typeof ddmDetentionTrackings.$inferInsert;

export type DdmInvoice = typeof ddmInvoices.$inferSelect;
export type NewDdmInvoice = typeof ddmInvoices.$inferInsert;

export type DdmDispute = typeof ddmDisputes.$inferSelect;
export type NewDdmDispute = typeof ddmDisputes.$inferInsert;

export type DdmWaiver = typeof ddmWaivers.$inferSelect;
export type NewDdmWaiver = typeof ddmWaivers.$inferInsert;

export type DdmPrediction = typeof ddmPredictions.$inferSelect;
export type NewDdmPrediction = typeof ddmPredictions.$inferInsert;

export type DdmNotification = typeof ddmNotifications.$inferSelect;
export type NewDdmNotification = typeof ddmNotifications.$inferInsert;
