import type {
  rcmReeferBookings,
  rcmTempMonitorings,
  rcmPtiInspections,
  rcmPowerManagement,
  rcmColdChainDocs,
  rcmBreakdownResponses,
  rcmTempAlerts,
  rcmClaimAnalytics,
} from "@/db/schema";

export type RcmReeferBooking = typeof rcmReeferBookings.$inferSelect;
export type NewRcmReeferBooking = typeof rcmReeferBookings.$inferInsert;

export type RcmTempMonitoring = typeof rcmTempMonitorings.$inferSelect;
export type NewRcmTempMonitoring = typeof rcmTempMonitorings.$inferInsert;

export type RcmPtiInspection = typeof rcmPtiInspections.$inferSelect;
export type NewRcmPtiInspection = typeof rcmPtiInspections.$inferInsert;

export type RcmPowerManagement = typeof rcmPowerManagement.$inferSelect;
export type NewRcmPowerManagement = typeof rcmPowerManagement.$inferInsert;

export type RcmColdChainDoc = typeof rcmColdChainDocs.$inferSelect;
export type NewRcmColdChainDoc = typeof rcmColdChainDocs.$inferInsert;

export type RcmBreakdownResponse = typeof rcmBreakdownResponses.$inferSelect;
export type NewRcmBreakdownResponse = typeof rcmBreakdownResponses.$inferInsert;

export type RcmTempAlert = typeof rcmTempAlerts.$inferSelect;
export type NewRcmTempAlert = typeof rcmTempAlerts.$inferInsert;

export type RcmClaimAnalytic = typeof rcmClaimAnalytics.$inferSelect;
export type NewRcmClaimAnalytic = typeof rcmClaimAnalytics.$inferInsert;
