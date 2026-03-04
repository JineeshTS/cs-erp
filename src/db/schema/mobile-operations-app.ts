import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// Gate In & Out Mobile Processing
// ==========================================
export const mobGateProcessings = pgTable("mob_gate_processings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  gateRef: varchar("gate_ref", { length: 100 }).notNull(),
  gateType: varchar("gate_type", { length: 50 }).notNull(), // gate_in, gate_out, pre_gate, re_entry, emergency_exit
  containerNumber: varchar("container_number", { length: 20 }),
  containerSize: varchar("container_size", { length: 10 }),
  containerType: varchar("container_type", { length: 50 }),
  truckPlate: varchar("truck_plate", { length: 20 }),
  driverName: varchar("driver_name", { length: 255 }),
  driverLicense: varchar("driver_license", { length: 50 }),
  sealNumber: varchar("seal_number", { length: 50 }),
  gateNumber: varchar("gate_number", { length: 10 }),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  yardLocation: varchar("yard_location", { length: 100 }),
  damageFound: boolean("damage_found"),
  photoCount: integer("photo_count"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Yard Inspection Mobile App
// ==========================================
export const mobYardInspections = pgTable("mob_yard_inspections", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  inspectionRef: varchar("inspection_ref", { length: 100 }).notNull(),
  inspectionType: varchar("inspection_type", { length: 50 }).notNull(), // routine_check, safety_audit, inventory_count, condition_survey, compliance_review
  yardSection: varchar("yard_section", { length: 50 }),
  inspectorName: varchar("inspector_name", { length: 255 }),
  containersChecked: integer("containers_checked"),
  issuesFound: integer("issues_found"),
  criticalIssues: integer("critical_issues"),
  completionPct: decimal("completion_pct", { precision: 5, scale: 2 }),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  weatherCondition: varchar("weather_condition", { length: 50 }),
  photoCount: integer("photo_count"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Container Survey Mobile App
// ==========================================
export const mobContainerSurveys = pgTable("mob_container_surveys", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  surveyRef: varchar("survey_ref", { length: 100 }).notNull(),
  surveyType: varchar("survey_type", { length: 50 }).notNull(), // pre_trip, off_hire, on_hire, periodic, damage_survey
  containerNumber: varchar("container_number", { length: 20 }),
  containerSize: varchar("container_size", { length: 10 }),
  containerCondition: varchar("container_condition", { length: 30 }),
  surveyorName: varchar("surveyor_name", { length: 255 }),
  surveyLocation: varchar("survey_location", { length: 255 }),
  damageCount: integer("damage_count"),
  estimatedRepairCost: decimal("estimated_repair_cost", { precision: 14, scale: 2 }),
  repairCurrency: varchar("repair_currency", { length: 3 }),
  cscPlateValid: boolean("csc_plate_valid"),
  surveyedAt: timestamp("surveyed_at", { withTimezone: true }),
  photoCount: integer("photo_count"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Offline Sync Capability
// ==========================================
export const mobOfflineSyncs = pgTable("mob_offline_syncs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  syncRef: varchar("sync_ref", { length: 100 }).notNull(),
  syncType: varchar("sync_type", { length: 50 }).notNull(), // full_sync, incremental_sync, conflict_resolution, data_push, data_pull
  deviceId: varchar("device_id", { length: 100 }),
  deviceName: varchar("device_name", { length: 255 }),
  userName: varchar("user_name", { length: 255 }),
  recordsSynced: integer("records_synced"),
  recordsFailed: integer("records_failed"),
  conflictsDetected: integer("conflicts_detected"),
  conflictsResolved: integer("conflicts_resolved"),
  syncStartedAt: timestamp("sync_started_at", { withTimezone: true }),
  syncCompletedAt: timestamp("sync_completed_at", { withTimezone: true }),
  dataSizeKb: decimal("data_size_kb", { precision: 12, scale: 2 }),
  syncDurationMs: integer("sync_duration_ms"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Container Damage Photo Upload & AI Assessment
// ==========================================
export const mobDamageAssessments = pgTable("mob_damage_assessments", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  assessmentRef: varchar("assessment_ref", { length: 100 }).notNull(),
  assessmentType: varchar("assessment_type", { length: 50 }).notNull(), // ai_detection, manual_assessment, photo_review, severity_classification, repair_estimate
  containerNumber: varchar("container_number", { length: 20 }),
  damageLocation: varchar("damage_location", { length: 100 }),
  damageCategory: varchar("damage_category", { length: 50 }),
  severityLevel: varchar("severity_level", { length: 20 }),
  aiConfidence: decimal("ai_confidence", { precision: 5, scale: 2 }),
  aiDetectedType: varchar("ai_detected_type", { length: 100 }),
  estimatedRepairCost: decimal("estimated_repair_cost", { precision: 14, scale: 2 }),
  repairCurrency: varchar("repair_currency", { length: 3 }),
  photoUrl: text("photo_url"),
  photoCount: integer("photo_count"),
  assessedBy: varchar("assessed_by", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Driver App & POD Delivery Confirmation
// ==========================================
export const mobDriverDeliveries = pgTable("mob_driver_deliveries", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  deliveryRef: varchar("delivery_ref", { length: 100 }).notNull(),
  deliveryType: varchar("delivery_type", { length: 50 }).notNull(), // pickup, delivery, return_empty, cross_dock, relay
  containerNumber: varchar("container_number", { length: 20 }),
  driverName: varchar("driver_name", { length: 255 }),
  truckPlate: varchar("truck_plate", { length: 20 }),
  originLocation: varchar("origin_location", { length: 255 }),
  destinationLocation: varchar("destination_location", { length: 255 }),
  podReceivedBy: varchar("pod_received_by", { length: 255 }),
  podSignatureUrl: text("pod_signature_url"),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  podPhotoCount: integer("pod_photo_count"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Executive Mobile Dashboard
// ==========================================
export const mobExecutiveDashboards = pgTable("mob_executive_dashboards", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  dashboardRef: varchar("dashboard_ref", { length: 100 }).notNull(),
  dashboardType: varchar("dashboard_type", { length: 50 }).notNull(), // revenue_overview, operations_summary, fleet_status, financial_snapshot, kpi_tracker
  dashboardName: varchar("dashboard_name", { length: 255 }),
  reportingPeriod: varchar("reporting_period", { length: 20 }),
  widgetCount: integer("widget_count"),
  refreshInterval: integer("refresh_interval"),
  lastRefreshedAt: timestamp("last_refreshed_at", { withTimezone: true }),
  accessLevel: varchar("access_level", { length: 20 }),
  favorited: boolean("favorited"),
  sharedWith: text("shared_with"),
  dashboardConfig: jsonb("dashboard_config"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Push Notification Management
// ==========================================
export const mobPushNotifications = pgTable("mob_push_notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  notificationRef: varchar("notification_ref", { length: 100 }).notNull(),
  notificationType: varchar("notification_type", { length: 50 }).notNull(), // alert, reminder, update, broadcast, escalation
  title: varchar("title", { length: 255 }),
  body: text("body"),
  channel: varchar("channel", { length: 50 }),
  priority: varchar("priority", { length: 20 }),
  targetAudience: varchar("target_audience", { length: 100 }),
  recipientCount: integer("recipient_count"),
  deliveredCount: integer("delivered_count"),
  readCount: integer("read_count"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
