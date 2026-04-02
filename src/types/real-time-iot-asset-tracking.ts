import type {
  iotContainerGpsTrackings,
  iotReeferMonitorings,
  iotElectronicSeals,
  iotShockDetections,
  iotVesselPositions,
  iotPortEquipments,
  iotPredictiveAlerts,
  iotDataLakeAnalytics,
} from "@/db/schema";

export type IotContainerGpsTracking = typeof iotContainerGpsTrackings.$inferSelect;
export type NewIotContainerGpsTracking = typeof iotContainerGpsTrackings.$inferInsert;

export type IotReeferMonitoring = typeof iotReeferMonitorings.$inferSelect;
export type NewIotReeferMonitoring = typeof iotReeferMonitorings.$inferInsert;

export type IotElectronicSeal = typeof iotElectronicSeals.$inferSelect;
export type NewIotElectronicSeal = typeof iotElectronicSeals.$inferInsert;

export type IotShockDetection = typeof iotShockDetections.$inferSelect;
export type NewIotShockDetection = typeof iotShockDetections.$inferInsert;

export type IotVesselPosition = typeof iotVesselPositions.$inferSelect;
export type NewIotVesselPosition = typeof iotVesselPositions.$inferInsert;

export type IotPortEquipment = typeof iotPortEquipments.$inferSelect;
export type NewIotPortEquipment = typeof iotPortEquipments.$inferInsert;

export type IotPredictiveAlert = typeof iotPredictiveAlerts.$inferSelect;
export type NewIotPredictiveAlert = typeof iotPredictiveAlerts.$inferInsert;

export type IotDataLakeAnalytic = typeof iotDataLakeAnalytics.$inferSelect;
export type NewIotDataLakeAnalytic = typeof iotDataLakeAnalytics.$inferInsert;
