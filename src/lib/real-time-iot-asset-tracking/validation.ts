import { z } from "zod/v4";
import { metadataSchema } from "@/lib/validation";

// ==========================================
// Container GPS Location Tracking
// ==========================================
export const createContainerGpsTrackingSchema = z.object({
  trackingType: z.enum(["real_time", "geofence_alert", "route_deviation", "dwell_time", "milestone_update"]),
  containerNumber: z.string().max(20).optional(),
  containerType: z.string().max(50).optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  altitude: z.string().optional(),
  speed: z.string().optional(),
  heading: z.string().optional(),
  locationName: z.string().max(255).optional(),
  geofenceId: z.string().max(100).optional(),
  deviceId: z.string().max(100).optional(),
  batteryLevel: z.string().optional(),
  signalStrength: z.number().int().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateContainerGpsTrackingSchema = createContainerGpsTrackingSchema.partial();

// ==========================================
// Reefer IoT Temperature Humidity Monitoring
// ==========================================
export const createReeferMonitoringSchema = z.object({
  monitoringType: z.enum(["temperature_reading", "humidity_reading", "defrost_cycle", "alarm_event", "compliance_check"]),
  containerNumber: z.string().max(20).optional(),
  setTemperature: z.string().optional(),
  actualTemperature: z.string().optional(),
  returnAirTemp: z.string().optional(),
  supplyAirTemp: z.string().optional(),
  humidity: z.string().optional(),
  ventSetting: z.string().max(20).optional(),
  o2Level: z.string().optional(),
  co2Level: z.string().optional(),
  powerStatus: z.string().max(20).optional(),
  alarmCode: z.string().max(20).optional(),
  sensorId: z.string().max(100).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateReeferMonitoringSchema = createReeferMonitoringSchema.partial();

// ==========================================
// Electronic Seal Integrity Monitoring
// ==========================================
export const createElectronicSealSchema = z.object({
  sealType: z.enum(["bolt_seal", "cable_seal", "rfid_seal", "gps_seal", "smart_seal"]),
  sealNumber: z.string().max(50).optional(),
  containerNumber: z.string().max(20).optional(),
  sealStatus: z.string().max(30).optional(),
  integrityCheck: z.boolean().optional(),
  tamperDetected: z.boolean().optional(),
  lastVerifiedAt: z.coerce.date().optional(),
  appliedAt: z.coerce.date().optional(),
  removedAt: z.coerce.date().optional(),
  appliedBy: z.string().max(255).optional(),
  appliedLocation: z.string().max(255).optional(),
  deviceId: z.string().max(100).optional(),
  batteryLevel: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateElectronicSealSchema = createElectronicSealSchema.partial();

// ==========================================
// Shock Tilt and Vibration Detection
// ==========================================
export const createShockDetectionSchema = z.object({
  detectionType: z.enum(["shock_event", "tilt_alert", "vibration_anomaly", "drop_detection", "continuous_monitoring"]),
  containerNumber: z.string().max(20).optional(),
  shockIntensityG: z.string().optional(),
  tiltAngle: z.string().optional(),
  vibrationFrequency: z.string().optional(),
  duration: z.string().optional(),
  thresholdExceeded: z.boolean().optional(),
  severityLevel: z.string().max(20).optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  sensorId: z.string().max(100).optional(),
  cargoDescription: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateShockDetectionSchema = createShockDetectionSchema.partial();

// ==========================================
// AIS Vessel Position Tracking
// ==========================================
export const createVesselPositionSchema = z.object({
  positionType: z.enum(["ais_report", "manual_position", "satellite_fix", "port_arrival", "port_departure"]),
  vesselName: z.string().max(255).optional(),
  vesselImo: z.string().max(20).optional(),
  mmsi: z.string().max(20).optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  courseOverGround: z.string().optional(),
  speedOverGround: z.string().optional(),
  navStatus: z.string().max(50).optional(),
  destination: z.string().max(255).optional(),
  eta: z.coerce.date().optional(),
  draught: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateVesselPositionSchema = createVesselPositionSchema.partial();

// ==========================================
// Port Equipment IoT Monitoring
// ==========================================
export const createPortEquipmentSchema = z.object({
  equipmentType: z.enum(["crane_monitoring", "rtg_tracking", "straddle_carrier", "reach_stacker", "yard_tractor"]),
  equipmentName: z.string().max(255).optional(),
  equipmentId: z.string().max(50).optional(),
  portCode: z.string().max(10).optional(),
  terminalName: z.string().max(255).optional(),
  operationalStatus: z.string().max(30).optional(),
  utilizationPct: z.string().optional(),
  fuelConsumption: z.string().optional(),
  hoursOperated: z.string().optional(),
  lastMaintenanceAt: z.coerce.date().optional(),
  nextMaintenanceDue: z.coerce.date().optional(),
  sensorId: z.string().max(100).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updatePortEquipmentSchema = createPortEquipmentSchema.partial();

// ==========================================
// Predictive Alert & Maintenance Engine
// ==========================================
export const createPredictiveAlertSchema = z.object({
  alertType: z.enum(["predictive_failure", "anomaly_detection", "threshold_breach", "maintenance_due", "pattern_alert"]),
  assetType: z.string().max(50).optional(),
  assetIdentifier: z.string().max(100).optional(),
  alertSeverity: z.string().max(20).optional(),
  predictionConfidence: z.string().optional(),
  predictedFailureDate: z.coerce.date().optional(),
  recommendedAction: z.string().optional(),
  estimatedCost: z.string().optional(),
  costCurrency: z.string().max(3).optional(),
  acknowledged: z.boolean().optional(),
  acknowledgedAt: z.coerce.date().optional(),
  resolvedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updatePredictiveAlertSchema = createPredictiveAlertSchema.partial();

// ==========================================
// IoT Data Lake Analytics Dashboard
// ==========================================
export const createDataLakeAnalyticSchema = z.object({
  analyticsType: z.enum(["fleet_overview", "asset_utilization", "sensor_health", "trend_analysis", "compliance_report"]),
  reportName: z.string().max(255).optional(),
  reportingPeriod: z.string().max(20).optional(),
  dataSourceCount: z.number().int().optional(),
  recordsProcessed: z.number().int().optional(),
  anomaliesDetected: z.number().int().optional(),
  avgResponseTime: z.string().optional(),
  uptimePct: z.string().optional(),
  dashboardConfig: z.record(z.string(), z.unknown()).optional(),
  lastRefreshedAt: z.coerce.date().optional(),
  scheduleCron: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateDataLakeAnalyticSchema = createDataLakeAnalyticSchema.partial();
