import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
  index,
  uniqueIndex,
  numeric,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// FEAT-024-1-001: Reefer Cargo Booking & Acceptance
// ==========================================

export const rcmReeferBookings = pgTable(
  "rcm_reefer_bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    bookingRef: varchar("booking_ref", { length: 50 }).notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerCode: varchar("customer_code", { length: 50 }),
    containerNumber: varchar("container_number", { length: 20 }),
    containerSize: varchar("container_size", { length: 10 }).notNull(),
    containerType: varchar("container_type", { length: 30 }).notNull(),
    commodityName: varchar("commodity_name", { length: 255 }).notNull(),
    commodityCode: varchar("commodity_code", { length: 50 }),
    requiredTempC: numeric("required_temp_c", { precision: 6, scale: 2 }).notNull(),
    requiredHumidity: numeric("required_humidity", { precision: 5, scale: 2 }),
    ventilationSetting: varchar("ventilation_setting", { length: 50 }),
    atmosphereControl: varchar("atmosphere_control", { length: 30 }),
    o2Level: numeric("o2_level", { precision: 5, scale: 2 }),
    co2Level: numeric("co2_level", { precision: 5, scale: 2 }),
    originPort: varchar("origin_port", { length: 255 }).notNull(),
    destinationPort: varchar("destination_port", { length: 255 }).notNull(),
    vesselName: varchar("vessel_name", { length: 255 }),
    voyageNumber: varchar("voyage_number", { length: 50 }),
    loadDate: timestamp("load_date", { withTimezone: true }),
    dischargeDate: timestamp("discharge_date", { withTimezone: true }),
    transitDays: integer("transit_days"),
    specialInstructions: text("special_instructions"),
    acceptanceChecklist: jsonb("acceptance_checklist"),
    acceptedByName: varchar("accepted_by_name", { length: 255 }),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("rcm_reefer_book_tenant_idx").on(t.tenantId),
    uniqueIndex("rcm_reefer_book_ref_tenant_idx").on(t.tenantId, t.bookingRef),
    index("rcm_reefer_book_customer_idx").on(t.tenantId, t.customerName),
    index("rcm_reefer_book_container_idx").on(t.tenantId, t.containerNumber),
    index("rcm_reefer_book_commodity_idx").on(t.tenantId, t.commodityName),
    index("rcm_reefer_book_status_idx").on(t.tenantId, t.status),
    index("rcm_reefer_book_created_idx").on(t.createdAt),
    index("rcm_reefer_book_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-024-1-002: Temperature & Humidity IoT Monitoring
// ==========================================

export const rcmTempMonitorings = pgTable(
  "rcm_temp_monitorings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    monitoringRef: varchar("monitoring_ref", { length: 50 }).notNull(),
    containerNumber: varchar("container_number", { length: 20 }).notNull(),
    bookingRef: varchar("booking_ref", { length: 50 }),
    sensorId: varchar("sensor_id", { length: 50 }),
    sensorType: varchar("sensor_type", { length: 30 }),
    setPointTempC: numeric("set_point_temp_c", { precision: 6, scale: 2 }).notNull(),
    actualTempC: numeric("actual_temp_c", { precision: 6, scale: 2 }),
    setPointHumidity: numeric("set_point_humidity", { precision: 5, scale: 2 }),
    actualHumidity: numeric("actual_humidity", { precision: 5, scale: 2 }),
    supplyAirTempC: numeric("supply_air_temp_c", { precision: 6, scale: 2 }),
    returnAirTempC: numeric("return_air_temp_c", { precision: 6, scale: 2 }),
    o2Level: numeric("o2_level", { precision: 5, scale: 2 }),
    co2Level: numeric("co2_level", { precision: 5, scale: 2 }),
    powerStatus: varchar("power_status", { length: 20 }),
    compressorStatus: varchar("compressor_status", { length: 20 }),
    defrostCycleActive: boolean("defrost_cycle_active").default(false),
    readingTimestamp: timestamp("reading_timestamp", { withTimezone: true }).notNull(),
    locationDescription: varchar("location_description", { length: 255 }),
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),
    alertTriggered: boolean("alert_triggered").default(false),
    alertType: varchar("alert_type", { length: 30 }),
    dataSource: varchar("data_source", { length: 30 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("rcm_temp_mon_tenant_idx").on(t.tenantId),
    uniqueIndex("rcm_temp_mon_ref_tenant_idx").on(t.tenantId, t.monitoringRef),
    index("rcm_temp_mon_container_idx").on(t.tenantId, t.containerNumber),
    index("rcm_temp_mon_sensor_idx").on(t.tenantId, t.sensorId),
    index("rcm_temp_mon_reading_idx").on(t.tenantId, t.readingTimestamp),
    index("rcm_temp_mon_status_idx").on(t.tenantId, t.status),
    index("rcm_temp_mon_created_idx").on(t.createdAt),
    index("rcm_temp_mon_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-024-1-003: Pre-Trip Inspection PTI Management
// ==========================================

export const rcmPtiInspections = pgTable(
  "rcm_pti_inspections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    inspectionRef: varchar("inspection_ref", { length: 50 }).notNull(),
    containerNumber: varchar("container_number", { length: 20 }).notNull(),
    bookingRef: varchar("booking_ref", { length: 50 }),
    inspectionType: varchar("inspection_type", { length: 30 }).notNull(),
    inspectionDate: timestamp("inspection_date", { withTimezone: true }).notNull(),
    depotName: varchar("depot_name", { length: 255 }),
    depotLocation: varchar("depot_location", { length: 255 }),
    inspectorName: varchar("inspector_name", { length: 255 }),
    setPointTempC: numeric("set_point_temp_c", { precision: 6, scale: 2 }),
    achievedTempC: numeric("achieved_temp_c", { precision: 6, scale: 2 }),
    cooldownMinutes: integer("cooldown_minutes"),
    compressorOk: boolean("compressor_ok"),
    evaporatorOk: boolean("evaporator_ok"),
    condenserOk: boolean("condenser_ok"),
    controllerOk: boolean("controller_ok"),
    doorSealsOk: boolean("door_seals_ok"),
    drainHolesOk: boolean("drain_holes_ok"),
    powerCableOk: boolean("power_cable_ok"),
    cleanlinessOk: boolean("cleanliness_ok"),
    overallResult: varchar("overall_result", { length: 20 }),
    defectsFound: jsonb("defects_found"),
    repairsRequired: text("repairs_required"),
    certificateNumber: varchar("certificate_number", { length: 50 }),
    certificateExpiry: timestamp("certificate_expiry", { withTimezone: true }),
    photosUrls: jsonb("photos_urls"),
    status: varchar("status", { length: 20 }).notNull().default("scheduled"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("rcm_pti_insp_tenant_idx").on(t.tenantId),
    uniqueIndex("rcm_pti_insp_ref_tenant_idx").on(t.tenantId, t.inspectionRef),
    index("rcm_pti_insp_container_idx").on(t.tenantId, t.containerNumber),
    index("rcm_pti_insp_type_idx").on(t.tenantId, t.inspectionType),
    index("rcm_pti_insp_date_idx").on(t.tenantId, t.inspectionDate),
    index("rcm_pti_insp_result_idx").on(t.tenantId, t.overallResult),
    index("rcm_pti_insp_status_idx").on(t.tenantId, t.status),
    index("rcm_pti_insp_created_idx").on(t.createdAt),
    index("rcm_pti_insp_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-024-1-004: Reefer Plug & Power Management
// ==========================================

export const rcmPowerManagement = pgTable(
  "rcm_power_management",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    powerRef: varchar("power_ref", { length: 50 }).notNull(),
    containerNumber: varchar("container_number", { length: 20 }).notNull(),
    locationName: varchar("location_name", { length: 255 }).notNull(),
    locationType: varchar("location_type", { length: 30 }).notNull(),
    plugType: varchar("plug_type", { length: 30 }),
    voltage: varchar("voltage", { length: 20 }),
    amperage: varchar("amperage", { length: 20 }),
    bayPosition: varchar("bay_position", { length: 30 }),
    tierPosition: varchar("tier_position", { length: 30 }),
    pluggedInAt: timestamp("plugged_in_at", { withTimezone: true }),
    unpluggedAt: timestamp("unplugged_at", { withTimezone: true }),
    totalPlugHours: numeric("total_plug_hours", { precision: 8, scale: 2 }),
    powerConsumptionKwh: numeric("power_consumption_kwh", { precision: 10, scale: 2 }),
    costPerKwh: numeric("cost_per_kwh", { precision: 8, scale: 4 }),
    totalCost: numeric("total_cost", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    powerInterruptions: integer("power_interruptions").default(0),
    lastInterruptionAt: timestamp("last_interruption_at", { withTimezone: true }),
    gensetBackup: boolean("genset_backup").default(false),
    monitoredByName: varchar("monitored_by_name", { length: 255 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("rcm_power_mgmt_tenant_idx").on(t.tenantId),
    uniqueIndex("rcm_power_mgmt_ref_tenant_idx").on(t.tenantId, t.powerRef),
    index("rcm_power_mgmt_container_idx").on(t.tenantId, t.containerNumber),
    index("rcm_power_mgmt_location_idx").on(t.tenantId, t.locationName),
    index("rcm_power_mgmt_type_idx").on(t.tenantId, t.locationType),
    index("rcm_power_mgmt_status_idx").on(t.tenantId, t.status),
    index("rcm_power_mgmt_created_idx").on(t.createdAt),
    index("rcm_power_mgmt_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-024-2-001: Cold Chain Documentation & Compliance
// ==========================================

export const rcmColdChainDocs = pgTable(
  "rcm_cold_chain_docs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    documentRef: varchar("document_ref", { length: 50 }).notNull(),
    documentType: varchar("document_type", { length: 30 }).notNull(),
    containerNumber: varchar("container_number", { length: 20 }),
    bookingRef: varchar("booking_ref", { length: 50 }),
    customerName: varchar("customer_name", { length: 255 }),
    commodityName: varchar("commodity_name", { length: 255 }),
    originCountry: varchar("origin_country", { length: 100 }),
    destinationCountry: varchar("destination_country", { length: 100 }),
    phytosanitaryCert: varchar("phytosanitary_cert", { length: 100 }),
    healthCert: varchar("health_cert", { length: 100 }),
    fumigationCert: varchar("fumigation_cert", { length: 100 }),
    temperatureLogUrl: varchar("temperature_log_url", { length: 500 }),
    complianceStandard: varchar("compliance_standard", { length: 100 }),
    regulatoryBody: varchar("regulatory_body", { length: 255 }),
    inspectionResult: varchar("inspection_result", { length: 20 }),
    inspectionDate: timestamp("inspection_date", { withTimezone: true }),
    inspectorName: varchar("inspector_name", { length: 255 }),
    expiryDate: timestamp("expiry_date", { withTimezone: true }),
    documentUrl: varchar("document_url", { length: 500 }),
    verifiedByName: varchar("verified_by_name", { length: 255 }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("rcm_cold_chain_tenant_idx").on(t.tenantId),
    uniqueIndex("rcm_cold_chain_ref_tenant_idx").on(t.tenantId, t.documentRef),
    index("rcm_cold_chain_type_idx").on(t.tenantId, t.documentType),
    index("rcm_cold_chain_container_idx").on(t.tenantId, t.containerNumber),
    index("rcm_cold_chain_customer_idx").on(t.tenantId, t.customerName),
    index("rcm_cold_chain_status_idx").on(t.tenantId, t.status),
    index("rcm_cold_chain_created_idx").on(t.createdAt),
    index("rcm_cold_chain_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-024-2-002: Reefer Breakdown & Emergency Response
// ==========================================

export const rcmBreakdownResponses = pgTable(
  "rcm_breakdown_responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    breakdownRef: varchar("breakdown_ref", { length: 50 }).notNull(),
    containerNumber: varchar("container_number", { length: 20 }).notNull(),
    bookingRef: varchar("booking_ref", { length: 50 }),
    breakdownType: varchar("breakdown_type", { length: 30 }).notNull(),
    severityLevel: varchar("severity_level", { length: 20 }).notNull(),
    reportedAt: timestamp("reported_at", { withTimezone: true }).notNull(),
    locationDescription: varchar("location_description", { length: 500 }),
    vesselName: varchar("vessel_name", { length: 255 }),
    voyageNumber: varchar("voyage_number", { length: 50 }),
    faultDescription: text("fault_description").notNull(),
    faultCode: varchar("fault_code", { length: 30 }),
    lastKnownTempC: numeric("last_known_temp_c", { precision: 6, scale: 2 }),
    cargoAtRisk: boolean("cargo_at_risk").default(false),
    commodityName: varchar("commodity_name", { length: 255 }),
    immediateAction: text("immediate_action"),
    technicianName: varchar("technician_name", { length: 255 }),
    responseStartedAt: timestamp("response_started_at", { withTimezone: true }),
    repairDescription: text("repair_description"),
    partsUsed: jsonb("parts_used"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    totalDowntimeMinutes: integer("total_downtime_minutes"),
    repairCost: numeric("repair_cost", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    containerSwapped: boolean("container_swapped").default(false),
    swappedToContainer: varchar("swapped_to_container", { length: 20 }),
    status: varchar("status", { length: 20 }).notNull().default("reported"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("rcm_breakdown_tenant_idx").on(t.tenantId),
    uniqueIndex("rcm_breakdown_ref_tenant_idx").on(t.tenantId, t.breakdownRef),
    index("rcm_breakdown_container_idx").on(t.tenantId, t.containerNumber),
    index("rcm_breakdown_type_idx").on(t.tenantId, t.breakdownType),
    index("rcm_breakdown_severity_idx").on(t.tenantId, t.severityLevel),
    index("rcm_breakdown_status_idx").on(t.tenantId, t.status),
    index("rcm_breakdown_created_idx").on(t.createdAt),
    index("rcm_breakdown_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-024-2-003: Temperature Exceedance Alerts & Escalation
// ==========================================

export const rcmTempAlerts = pgTable(
  "rcm_temp_alerts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    alertRef: varchar("alert_ref", { length: 50 }).notNull(),
    containerNumber: varchar("container_number", { length: 20 }).notNull(),
    bookingRef: varchar("booking_ref", { length: 50 }),
    alertType: varchar("alert_type", { length: 30 }).notNull(),
    alertSeverity: varchar("alert_severity", { length: 20 }).notNull(),
    setPointTempC: numeric("set_point_temp_c", { precision: 6, scale: 2 }).notNull(),
    actualTempC: numeric("actual_temp_c", { precision: 6, scale: 2 }).notNull(),
    deviationC: numeric("deviation_c", { precision: 6, scale: 2 }),
    thresholdC: numeric("threshold_c", { precision: 6, scale: 2 }),
    exceedanceDurationMinutes: integer("exceedance_duration_minutes"),
    triggeredAt: timestamp("triggered_at", { withTimezone: true }).notNull(),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
    acknowledgedByName: varchar("acknowledged_by_name", { length: 255 }),
    escalationLevel: integer("escalation_level").default(0),
    escalatedToName: varchar("escalated_to_name", { length: 255 }),
    escalatedAt: timestamp("escalated_at", { withTimezone: true }),
    correctionAction: text("correction_action"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolvedByName: varchar("resolved_by_name", { length: 255 }),
    cargoImpact: varchar("cargo_impact", { length: 30 }),
    notificationsSent: jsonb("notifications_sent"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("rcm_temp_alert_tenant_idx").on(t.tenantId),
    uniqueIndex("rcm_temp_alert_ref_tenant_idx").on(t.tenantId, t.alertRef),
    index("rcm_temp_alert_container_idx").on(t.tenantId, t.containerNumber),
    index("rcm_temp_alert_type_idx").on(t.tenantId, t.alertType),
    index("rcm_temp_alert_severity_idx").on(t.tenantId, t.alertSeverity),
    index("rcm_temp_alert_triggered_idx").on(t.tenantId, t.triggeredAt),
    index("rcm_temp_alert_status_idx").on(t.tenantId, t.status),
    index("rcm_temp_alert_created_idx").on(t.createdAt),
    index("rcm_temp_alert_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-024-2-004: Cargo Claim Prevention Analytics
// ==========================================

export const rcmClaimAnalytics = pgTable(
  "rcm_claim_analytics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    analyticsRef: varchar("analytics_ref", { length: 50 }).notNull(),
    containerNumber: varchar("container_number", { length: 20 }),
    bookingRef: varchar("booking_ref", { length: 50 }),
    customerName: varchar("customer_name", { length: 255 }),
    commodityName: varchar("commodity_name", { length: 255 }),
    analysisType: varchar("analysis_type", { length: 30 }).notNull(),
    riskLevel: varchar("risk_level", { length: 20 }).notNull(),
    riskScore: numeric("risk_score", { precision: 5, scale: 2 }),
    tempExceedanceCount: integer("temp_exceedance_count").default(0),
    totalExceedanceMinutes: integer("total_exceedance_minutes").default(0),
    maxDeviationC: numeric("max_deviation_c", { precision: 6, scale: 2 }),
    claimProbability: numeric("claim_probability", { precision: 5, scale: 2 }),
    estimatedClaimAmount: numeric("estimated_claim_amount", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    preventiveActions: jsonb("preventive_actions"),
    aiRecommendations: text("ai_recommendations"),
    modelVersion: varchar("model_version", { length: 50 }),
    confidenceScore: numeric("confidence_score", { precision: 5, scale: 2 }),
    actualClaimFiled: boolean("actual_claim_filed").default(false),
    actualClaimAmount: numeric("actual_claim_amount", { precision: 12, scale: 2 }),
    predictionAccuracy: numeric("prediction_accuracy", { precision: 5, scale: 2 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("rcm_claim_analytics_tenant_idx").on(t.tenantId),
    uniqueIndex("rcm_claim_analytics_ref_tenant_idx").on(t.tenantId, t.analyticsRef),
    index("rcm_claim_analytics_container_idx").on(t.tenantId, t.containerNumber),
    index("rcm_claim_analytics_customer_idx").on(t.tenantId, t.customerName),
    index("rcm_claim_analytics_risk_idx").on(t.tenantId, t.riskLevel),
    index("rcm_claim_analytics_type_idx").on(t.tenantId, t.analysisType),
    index("rcm_claim_analytics_status_idx").on(t.tenantId, t.status),
    index("rcm_claim_analytics_created_idx").on(t.createdAt),
    index("rcm_claim_analytics_deleted_idx").on(t.deletedAt),
  ]
);
