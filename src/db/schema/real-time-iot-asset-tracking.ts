import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// Container GPS Location Tracking
// ==========================================
export const iotContainerGpsTrackings = pgTable("iot_container_gps_trackings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  trackingRef: varchar("tracking_ref", { length: 100 }).notNull(),
  trackingType: varchar("tracking_type", { length: 50 }).notNull(), // real_time, geofence_alert, route_deviation, dwell_time, milestone_update
  containerNumber: varchar("container_number", { length: 20 }),
  containerType: varchar("container_type", { length: 50 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  altitude: decimal("altitude", { precision: 8, scale: 2 }),
  speed: decimal("speed", { precision: 6, scale: 2 }),
  heading: decimal("heading", { precision: 5, scale: 2 }),
  locationName: varchar("location_name", { length: 255 }),
  geofenceId: varchar("geofence_id", { length: 100 }),
  deviceId: varchar("device_id", { length: 100 }),
  batteryLevel: decimal("battery_level", { precision: 5, scale: 2 }),
  signalStrength: integer("signal_strength"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Reefer IoT Temperature Humidity Monitoring
// ==========================================
export const iotReeferMonitorings = pgTable("iot_reefer_monitorings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  monitoringRef: varchar("monitoring_ref", { length: 100 }).notNull(),
  monitoringType: varchar("monitoring_type", { length: 50 }).notNull(), // temperature_reading, humidity_reading, defrost_cycle, alarm_event, compliance_check
  containerNumber: varchar("container_number", { length: 20 }),
  setTemperature: decimal("set_temperature", { precision: 6, scale: 2 }),
  actualTemperature: decimal("actual_temperature", { precision: 6, scale: 2 }),
  returnAirTemp: decimal("return_air_temp", { precision: 6, scale: 2 }),
  supplyAirTemp: decimal("supply_air_temp", { precision: 6, scale: 2 }),
  humidity: decimal("humidity", { precision: 5, scale: 2 }),
  ventSetting: varchar("vent_setting", { length: 20 }),
  o2Level: decimal("o2_level", { precision: 5, scale: 2 }),
  co2Level: decimal("co2_level", { precision: 5, scale: 2 }),
  powerStatus: varchar("power_status", { length: 20 }),
  alarmCode: varchar("alarm_code", { length: 20 }),
  sensorId: varchar("sensor_id", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Electronic Seal Integrity Monitoring
// ==========================================
export const iotElectronicSeals = pgTable("iot_electronic_seals", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  sealRef: varchar("seal_ref", { length: 100 }).notNull(),
  sealType: varchar("seal_type", { length: 50 }).notNull(), // bolt_seal, cable_seal, rfid_seal, gps_seal, smart_seal
  sealNumber: varchar("seal_number", { length: 50 }),
  containerNumber: varchar("container_number", { length: 20 }),
  sealStatus: varchar("seal_status", { length: 30 }),
  integrityCheck: boolean("integrity_check"),
  tamperDetected: boolean("tamper_detected"),
  lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
  appliedAt: timestamp("applied_at", { withTimezone: true }),
  removedAt: timestamp("removed_at", { withTimezone: true }),
  appliedBy: varchar("applied_by", { length: 255 }),
  appliedLocation: varchar("applied_location", { length: 255 }),
  deviceId: varchar("device_id", { length: 100 }),
  batteryLevel: decimal("battery_level", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Shock Tilt and Vibration Detection
// ==========================================
export const iotShockDetections = pgTable("iot_shock_detections", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  detectionRef: varchar("detection_ref", { length: 100 }).notNull(),
  detectionType: varchar("detection_type", { length: 50 }).notNull(), // shock_event, tilt_alert, vibration_anomaly, drop_detection, continuous_monitoring
  containerNumber: varchar("container_number", { length: 20 }),
  shockIntensityG: decimal("shock_intensity_g", { precision: 8, scale: 4 }),
  tiltAngle: decimal("tilt_angle", { precision: 6, scale: 2 }),
  vibrationFrequency: decimal("vibration_frequency", { precision: 8, scale: 2 }),
  duration: decimal("duration", { precision: 10, scale: 2 }),
  thresholdExceeded: boolean("threshold_exceeded"),
  severityLevel: varchar("severity_level", { length: 20 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  sensorId: varchar("sensor_id", { length: 100 }),
  cargoDescription: text("cargo_description"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// AIS Vessel Position Tracking
// ==========================================
export const iotVesselPositions = pgTable("iot_vessel_positions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  positionRef: varchar("position_ref", { length: 100 }).notNull(),
  positionType: varchar("position_type", { length: 50 }).notNull(), // ais_report, manual_position, satellite_fix, port_arrival, port_departure
  vesselName: varchar("vessel_name", { length: 255 }),
  vesselImo: varchar("vessel_imo", { length: 20 }),
  mmsi: varchar("mmsi", { length: 20 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  courseOverGround: decimal("course_over_ground", { precision: 5, scale: 2 }),
  speedOverGround: decimal("speed_over_ground", { precision: 5, scale: 2 }),
  navStatus: varchar("nav_status", { length: 50 }),
  destination: varchar("destination", { length: 255 }),
  eta: timestamp("eta", { withTimezone: true }),
  draught: decimal("draught", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Port Equipment IoT Monitoring
// ==========================================
export const iotPortEquipments = pgTable("iot_port_equipments", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  equipmentRef: varchar("equipment_ref", { length: 100 }).notNull(),
  equipmentType: varchar("equipment_type", { length: 50 }).notNull(), // crane_monitoring, rtg_tracking, straddle_carrier, reach_stacker, yard_tractor
  equipmentName: varchar("equipment_name", { length: 255 }),
  equipmentId: varchar("equipment_id", { length: 50 }),
  portCode: varchar("port_code", { length: 10 }),
  terminalName: varchar("terminal_name", { length: 255 }),
  operationalStatus: varchar("operational_status", { length: 30 }),
  utilizationPct: decimal("utilization_pct", { precision: 5, scale: 2 }),
  fuelConsumption: decimal("fuel_consumption", { precision: 10, scale: 2 }),
  hoursOperated: decimal("hours_operated", { precision: 10, scale: 2 }),
  lastMaintenanceAt: timestamp("last_maintenance_at", { withTimezone: true }),
  nextMaintenanceDue: timestamp("next_maintenance_due", { withTimezone: true }),
  sensorId: varchar("sensor_id", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Predictive Alert & Maintenance Engine
// ==========================================
export const iotPredictiveAlerts = pgTable("iot_predictive_alerts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  alertRef: varchar("alert_ref", { length: 100 }).notNull(),
  alertType: varchar("alert_type", { length: 50 }).notNull(), // predictive_failure, anomaly_detection, threshold_breach, maintenance_due, pattern_alert
  assetType: varchar("asset_type", { length: 50 }),
  assetIdentifier: varchar("asset_identifier", { length: 100 }),
  alertSeverity: varchar("alert_severity", { length: 20 }),
  predictionConfidence: decimal("prediction_confidence", { precision: 5, scale: 2 }),
  predictedFailureDate: timestamp("predicted_failure_date", { withTimezone: true }),
  recommendedAction: text("recommended_action"),
  estimatedCost: decimal("estimated_cost", { precision: 14, scale: 2 }),
  costCurrency: varchar("cost_currency", { length: 3 }),
  acknowledged: boolean("acknowledged"),
  acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// IoT Data Lake Analytics Dashboard
// ==========================================
export const iotDataLakeAnalytics = pgTable("iot_data_lake_analytics", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  analyticsRef: varchar("analytics_ref", { length: 100 }).notNull(),
  analyticsType: varchar("analytics_type", { length: 50 }).notNull(), // fleet_overview, asset_utilization, sensor_health, trend_analysis, compliance_report
  reportName: varchar("report_name", { length: 255 }),
  reportingPeriod: varchar("reporting_period", { length: 20 }),
  dataSourceCount: integer("data_source_count"),
  recordsProcessed: integer("records_processed"),
  anomaliesDetected: integer("anomalies_detected"),
  avgResponseTime: decimal("avg_response_time", { precision: 8, scale: 2 }),
  uptimePct: decimal("uptime_pct", { precision: 5, scale: 2 }),
  dashboardConfig: jsonb("dashboard_config"),
  lastRefreshedAt: timestamp("last_refreshed_at", { withTimezone: true }),
  scheduleCron: varchar("schedule_cron", { length: 50 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
