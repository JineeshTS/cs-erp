import { z } from "zod/v4";

// ==========================================
// Gate In & Out Mobile Processing
// ==========================================
export const createGateProcessingSchema = z.object({
  gateType: z.enum(["gate_in", "gate_out", "pre_gate", "re_entry", "emergency_exit"]),
  containerNumber: z.string().max(20).optional(),
  containerSize: z.string().max(10).optional(),
  containerType: z.string().max(50).optional(),
  truckPlate: z.string().max(20).optional(),
  driverName: z.string().max(255).optional(),
  driverLicense: z.string().max(50).optional(),
  sealNumber: z.string().max(50).optional(),
  gateNumber: z.string().max(10).optional(),
  processedAt: z.coerce.date().optional(),
  yardLocation: z.string().max(100).optional(),
  damageFound: z.boolean().optional(),
  photoCount: z.number().int().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateGateProcessingSchema = createGateProcessingSchema.partial();

// ==========================================
// Yard Inspection Mobile App
// ==========================================
export const createYardInspectionSchema = z.object({
  inspectionType: z.enum(["routine_check", "safety_audit", "inventory_count", "condition_survey", "compliance_review"]),
  yardSection: z.string().max(50).optional(),
  inspectorName: z.string().max(255).optional(),
  containersChecked: z.number().int().optional(),
  issuesFound: z.number().int().optional(),
  criticalIssues: z.number().int().optional(),
  completionPct: z.string().optional(),
  startedAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  weatherCondition: z.string().max(50).optional(),
  photoCount: z.number().int().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateYardInspectionSchema = createYardInspectionSchema.partial();

// ==========================================
// Container Survey Mobile App
// ==========================================
export const createContainerSurveySchema = z.object({
  surveyType: z.enum(["pre_trip", "off_hire", "on_hire", "periodic", "damage_survey"]),
  containerNumber: z.string().max(20).optional(),
  containerSize: z.string().max(10).optional(),
  containerCondition: z.string().max(30).optional(),
  surveyorName: z.string().max(255).optional(),
  surveyLocation: z.string().max(255).optional(),
  damageCount: z.number().int().optional(),
  estimatedRepairCost: z.string().optional(),
  repairCurrency: z.string().max(3).optional(),
  cscPlateValid: z.boolean().optional(),
  surveyedAt: z.coerce.date().optional(),
  photoCount: z.number().int().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateContainerSurveySchema = createContainerSurveySchema.partial();

// ==========================================
// Offline Sync Capability
// ==========================================
export const createOfflineSyncSchema = z.object({
  syncType: z.enum(["full_sync", "incremental_sync", "conflict_resolution", "data_push", "data_pull"]),
  deviceId: z.string().max(100).optional(),
  deviceName: z.string().max(255).optional(),
  userName: z.string().max(255).optional(),
  recordsSynced: z.number().int().optional(),
  recordsFailed: z.number().int().optional(),
  conflictsDetected: z.number().int().optional(),
  conflictsResolved: z.number().int().optional(),
  syncStartedAt: z.coerce.date().optional(),
  syncCompletedAt: z.coerce.date().optional(),
  dataSizeKb: z.string().optional(),
  syncDurationMs: z.number().int().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateOfflineSyncSchema = createOfflineSyncSchema.partial();

// ==========================================
// Container Damage Photo Upload & AI Assessment
// ==========================================
export const createDamageAssessmentSchema = z.object({
  assessmentType: z.enum(["ai_detection", "manual_assessment", "photo_review", "severity_classification", "repair_estimate"]),
  containerNumber: z.string().max(20).optional(),
  damageLocation: z.string().max(100).optional(),
  damageCategory: z.string().max(50).optional(),
  severityLevel: z.string().max(20).optional(),
  aiConfidence: z.string().optional(),
  aiDetectedType: z.string().max(100).optional(),
  estimatedRepairCost: z.string().optional(),
  repairCurrency: z.string().max(3).optional(),
  photoUrl: z.string().optional(),
  photoCount: z.number().int().optional(),
  assessedBy: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateDamageAssessmentSchema = createDamageAssessmentSchema.partial();

// ==========================================
// Driver App & POD Delivery Confirmation
// ==========================================
export const createDriverDeliverySchema = z.object({
  deliveryType: z.enum(["pickup", "delivery", "return_empty", "cross_dock", "relay"]),
  containerNumber: z.string().max(20).optional(),
  driverName: z.string().max(255).optional(),
  truckPlate: z.string().max(20).optional(),
  originLocation: z.string().max(255).optional(),
  destinationLocation: z.string().max(255).optional(),
  podReceivedBy: z.string().max(255).optional(),
  podSignatureUrl: z.string().optional(),
  deliveredAt: z.coerce.date().optional(),
  podPhotoCount: z.number().int().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateDriverDeliverySchema = createDriverDeliverySchema.partial();

// ==========================================
// Executive Mobile Dashboard
// ==========================================
export const createExecutiveDashboardSchema = z.object({
  dashboardType: z.enum(["revenue_overview", "operations_summary", "fleet_status", "financial_snapshot", "kpi_tracker"]),
  dashboardName: z.string().max(255).optional(),
  reportingPeriod: z.string().max(20).optional(),
  widgetCount: z.number().int().optional(),
  refreshInterval: z.number().int().optional(),
  lastRefreshedAt: z.coerce.date().optional(),
  accessLevel: z.string().max(20).optional(),
  favorited: z.boolean().optional(),
  sharedWith: z.string().optional(),
  dashboardConfig: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateExecutiveDashboardSchema = createExecutiveDashboardSchema.partial();

// ==========================================
// Push Notification Management
// ==========================================
export const createPushNotificationSchema = z.object({
  notificationType: z.enum(["alert", "reminder", "update", "broadcast", "escalation"]),
  title: z.string().max(255).optional(),
  body: z.string().optional(),
  channel: z.string().max(50).optional(),
  priority: z.string().max(20).optional(),
  targetAudience: z.string().max(100).optional(),
  recipientCount: z.number().int().optional(),
  deliveredCount: z.number().int().optional(),
  readCount: z.number().int().optional(),
  scheduledAt: z.coerce.date().optional(),
  sentAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updatePushNotificationSchema = createPushNotificationSchema.partial();
