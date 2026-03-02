import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// Pre-Load Cargo Survey Management
// ==========================================
export const simCargoSurveys = pgTable(
  "sim_cargo_surveys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    surveyRef: varchar("survey_ref", { length: 50 }).notNull(),
    surveyType: varchar("survey_type", { length: 30 }).notNull(), // pre_load, loading, discharge, tally
    bookingRef: varchar("booking_ref", { length: 50 }),
    blNumber: varchar("bl_number", { length: 50 }),
    vesselName: varchar("vessel_name", { length: 255 }),
    voyageNumber: varchar("voyage_number", { length: 50 }),
    portName: varchar("port_name", { length: 255 }),
    terminalName: varchar("terminal_name", { length: 255 }),
    cargoDescription: text("cargo_description"),
    hsCode: varchar("hs_code", { length: 20 }),
    packageType: varchar("package_type", { length: 50 }),
    declaredQuantity: integer("declared_quantity"),
    surveyedQuantity: integer("surveyed_quantity"),
    declaredWeightKg: decimal("declared_weight_kg", { precision: 12, scale: 2 }),
    surveyedWeightKg: decimal("surveyed_weight_kg", { precision: 12, scale: 2 }),
    weightVarianceKg: decimal("weight_variance_kg", { precision: 12, scale: 2 }),
    cargoCondition: varchar("cargo_condition", { length: 30 }), // good, damaged, mixed, wet
    damageDescription: text("damage_description"),
    damagePhotos: jsonb("damage_photos"), // array of URLs
    surveyorName: varchar("surveyor_name", { length: 255 }),
    surveyorCompany: varchar("surveyor_company", { length: 255 }),
    surveyorLicense: varchar("surveyor_license", { length: 50 }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    clientName: varchar("client_name", { length: 255 }),
    clientRef: varchar("client_ref", { length: 50 }),
    findings: jsonb("findings"),
    recommendations: text("recommendations"),
    status: varchar("status", { length: 20 }).notNull().default("scheduled"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("sim_cargo_survey_tenant_idx").on(t.tenantId),
    index("sim_cargo_survey_ref_idx").on(t.surveyRef),
    index("sim_cargo_survey_status_idx").on(t.status),
    index("sim_cargo_survey_type_idx").on(t.surveyType),
    index("sim_cargo_survey_vessel_idx").on(t.vesselName),
    index("sim_cargo_survey_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Container Condition Survey & MNR
// ==========================================
export const simContainerSurveys = pgTable(
  "sim_container_surveys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    surveyRef: varchar("survey_ref", { length: 50 }).notNull(),
    surveyType: varchar("survey_type", { length: 30 }).notNull(), // on_hire, off_hire, periodic, damage
    containerNumber: varchar("container_number", { length: 20 }).notNull(),
    containerType: varchar("container_type", { length: 30 }),
    containerSizeIso: varchar("container_size_iso", { length: 10 }),
    ownerOperator: varchar("owner_operator", { length: 255 }),
    depotName: varchar("depot_name", { length: 255 }),
    depotLocation: varchar("depot_location", { length: 255 }),
    overallCondition: varchar("overall_condition", { length: 20 }), // a_grade, b_grade, c_grade, damaged
    structuralCondition: varchar("structural_condition", { length: 20 }), // good, fair, poor
    floorCondition: varchar("floor_condition", { length: 20 }),
    roofCondition: varchar("roof_condition", { length: 20 }),
    doorCondition: varchar("door_condition", { length: 20 }),
    paintCondition: varchar("paint_condition", { length: 20 }),
    cscPlateValid: boolean("csc_plate_valid"),
    cscExpiryDate: timestamp("csc_expiry_date", { withTimezone: true }),
    mnrRequired: boolean("mnr_required").default(false),
    mnrEstimateCost: decimal("mnr_estimate_cost", { precision: 12, scale: 2 }),
    mnrCurrency: varchar("mnr_currency", { length: 3 }),
    mnrApproved: boolean("mnr_approved"),
    mnrCompletedAt: timestamp("mnr_completed_at", { withTimezone: true }),
    damageDetails: jsonb("damage_details"),
    photos: jsonb("photos"),
    surveyorName: varchar("surveyor_name", { length: 255 }),
    surveyorCompany: varchar("surveyor_company", { length: 255 }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("scheduled"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("sim_container_surv_tenant_idx").on(t.tenantId),
    index("sim_container_surv_ref_idx").on(t.surveyRef),
    index("sim_container_surv_status_idx").on(t.status),
    index("sim_container_surv_cntr_idx").on(t.containerNumber),
    index("sim_container_surv_type_idx").on(t.surveyType),
    index("sim_container_surv_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Draft Survey Coordination & Calculation
// ==========================================
export const simDraftSurveys = pgTable(
  "sim_draft_surveys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    surveyRef: varchar("survey_ref", { length: 50 }).notNull(),
    surveyType: varchar("survey_type", { length: 30 }).notNull(), // initial, intermediate, final
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    imoNumber: varchar("imo_number", { length: 20 }),
    voyageNumber: varchar("voyage_number", { length: 50 }),
    portName: varchar("port_name", { length: 255 }),
    berthName: varchar("berth_name", { length: 100 }),
    cargoType: varchar("cargo_type", { length: 100 }),
    draftFore: decimal("draft_fore", { precision: 8, scale: 3 }),
    draftAft: decimal("draft_aft", { precision: 8, scale: 3 }),
    draftMidPort: decimal("draft_mid_port", { precision: 8, scale: 3 }),
    draftMidStarboard: decimal("draft_mid_starboard", { precision: 8, scale: 3 }),
    meanDraft: decimal("mean_draft", { precision: 8, scale: 3 }),
    trim: decimal("trim", { precision: 8, scale: 3 }),
    displacement: decimal("displacement", { precision: 14, scale: 2 }),
    ballastWeight: decimal("ballast_weight", { precision: 14, scale: 2 }),
    constantsWeight: decimal("constants_weight", { precision: 14, scale: 2 }),
    freshWaterWeight: decimal("fresh_water_weight", { precision: 14, scale: 2 }),
    fuelWeight: decimal("fuel_weight", { precision: 14, scale: 2 }),
    netCargoWeight: decimal("net_cargo_weight", { precision: 14, scale: 2 }),
    waterDensity: decimal("water_density", { precision: 6, scale: 4 }),
    waterTemp: decimal("water_temp", { precision: 5, scale: 2 }),
    surveyorName: varchar("surveyor_name", { length: 255 }),
    surveyorCompany: varchar("surveyor_company", { length: 255 }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    calculations: jsonb("calculations"),
    status: varchar("status", { length: 20 }).notNull().default("scheduled"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("sim_draft_survey_tenant_idx").on(t.tenantId),
    index("sim_draft_survey_ref_idx").on(t.surveyRef),
    index("sim_draft_survey_status_idx").on(t.status),
    index("sim_draft_survey_vessel_idx").on(t.vesselName),
    index("sim_draft_survey_type_idx").on(t.surveyType),
    index("sim_draft_survey_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// On-Hire & Off-Hire Survey Management
// ==========================================
export const simHireSurveys = pgTable(
  "sim_hire_surveys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    surveyRef: varchar("survey_ref", { length: 50 }).notNull(),
    surveyType: varchar("survey_type", { length: 30 }).notNull(), // on_hire, off_hire
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    imoNumber: varchar("imo_number", { length: 20 }),
    chartererName: varchar("charterer_name", { length: 255 }),
    ownerName: varchar("owner_name", { length: 255 }),
    charterPartyRef: varchar("charter_party_ref", { length: 50 }),
    portName: varchar("port_name", { length: 255 }),
    hullCondition: varchar("hull_condition", { length: 20 }), // good, fair, poor
    deckCondition: varchar("deck_condition", { length: 20 }),
    engineCondition: varchar("engine_condition", { length: 20 }),
    accommodationCondition: varchar("accommodation_condition", { length: 20 }),
    safetyEquipmentOk: boolean("safety_equipment_ok"),
    bunkerRobFuel: decimal("bunker_rob_fuel", { precision: 12, scale: 2 }),
    bunkerRobDiesel: decimal("bunker_rob_diesel", { precision: 12, scale: 2 }),
    bunkerRobLubeOil: decimal("bunker_rob_lube_oil", { precision: 12, scale: 2 }),
    freshWaterRob: decimal("fresh_water_rob", { precision: 12, scale: 2 }),
    constantsWeight: decimal("constants_weight", { precision: 12, scale: 2 }),
    deficiencies: jsonb("deficiencies"),
    previousDamages: jsonb("previous_damages"),
    photos: jsonb("photos"),
    surveyorName: varchar("surveyor_name", { length: 255 }),
    surveyorCompany: varchar("surveyor_company", { length: 255 }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    deliveryDate: timestamp("delivery_date", { withTimezone: true }),
    redeliveryDate: timestamp("redelivery_date", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("scheduled"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("sim_hire_survey_tenant_idx").on(t.tenantId),
    index("sim_hire_survey_ref_idx").on(t.surveyRef),
    index("sim_hire_survey_status_idx").on(t.status),
    index("sim_hire_survey_vessel_idx").on(t.vesselName),
    index("sim_hire_survey_type_idx").on(t.surveyType),
    index("sim_hire_survey_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Hatch & Hold Inspection Management
// ==========================================
export const simHatchInspections = pgTable(
  "sim_hatch_inspections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    inspectionRef: varchar("inspection_ref", { length: 50 }).notNull(),
    inspectionType: varchar("inspection_type", { length: 30 }).notNull(), // pre_loading, intermediate, final
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    imoNumber: varchar("imo_number", { length: 20 }),
    voyageNumber: varchar("voyage_number", { length: 50 }),
    portName: varchar("port_name", { length: 255 }),
    holdNumber: varchar("hold_number", { length: 20 }),
    hatchCoverType: varchar("hatch_cover_type", { length: 50 }),
    cleanliness: varchar("cleanliness", { length: 20 }), // clean, acceptable, dirty, contaminated
    dryness: varchar("dryness", { length: 20 }), // dry, damp, wet
    odorFree: boolean("odor_free"),
    previousCargo: varchar("previous_cargo", { length: 255 }),
    residueFound: boolean("residue_found"),
    residueDescription: text("residue_description"),
    hatchCoverSeal: varchar("hatch_cover_seal", { length: 20 }), // good, fair, poor, failed
    waterTightness: varchar("water_tightness", { length: 20 }), // pass, fail
    ventilationOk: boolean("ventilation_ok"),
    bilgesClean: boolean("bilges_clean"),
    ladderCondition: varchar("ladder_condition", { length: 20 }),
    lightingOk: boolean("lighting_ok"),
    cargoFitness: varchar("cargo_fitness", { length: 20 }), // fit, conditional, unfit
    deficiencies: jsonb("deficiencies"),
    photos: jsonb("photos"),
    inspectorName: varchar("inspector_name", { length: 255 }),
    inspectorCompany: varchar("inspector_company", { length: 255 }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("scheduled"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("sim_hatch_insp_tenant_idx").on(t.tenantId),
    index("sim_hatch_insp_ref_idx").on(t.inspectionRef),
    index("sim_hatch_insp_status_idx").on(t.status),
    index("sim_hatch_insp_vessel_idx").on(t.vesselName),
    index("sim_hatch_insp_type_idx").on(t.inspectionType),
    index("sim_hatch_insp_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Reefer PTI Survey Coordination
// ==========================================
export const simReeferPtiSurveys = pgTable(
  "sim_reefer_pti_surveys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    surveyRef: varchar("survey_ref", { length: 50 }).notNull(),
    surveyType: varchar("survey_type", { length: 30 }).notNull(), // pti, periodic, complaint, pre_trip
    containerNumber: varchar("container_number", { length: 20 }).notNull(),
    containerType: varchar("container_type", { length: 30 }),
    unitManufacturer: varchar("unit_manufacturer", { length: 100 }),
    unitModel: varchar("unit_model", { length: 100 }),
    unitSerialNumber: varchar("unit_serial_number", { length: 50 }),
    depotName: varchar("depot_name", { length: 255 }),
    depotLocation: varchar("depot_location", { length: 255 }),
    setPointTemp: decimal("set_point_temp", { precision: 6, scale: 2 }),
    supplyAirTemp: decimal("supply_air_temp", { precision: 6, scale: 2 }),
    returnAirTemp: decimal("return_air_temp", { precision: 6, scale: 2 }),
    ambientTemp: decimal("ambient_temp", { precision: 6, scale: 2 }),
    humidityPercent: decimal("humidity_percent", { precision: 5, scale: 2 }),
    ventSetting: varchar("vent_setting", { length: 20 }),
    defrostOk: boolean("defrost_ok"),
    compressorOk: boolean("compressor_ok"),
    condenserOk: boolean("condenser_ok"),
    evaporatorOk: boolean("evaporator_ok"),
    controllerOk: boolean("controller_ok"),
    gasketOk: boolean("gasket_ok"),
    powerSupplyOk: boolean("power_supply_ok"),
    dataLoggerDownloaded: boolean("data_logger_downloaded"),
    overallResult: varchar("overall_result", { length: 20 }), // pass, fail, conditional
    defects: jsonb("defects"),
    photos: jsonb("photos"),
    technicianName: varchar("technician_name", { length: 255 }),
    technicianCompany: varchar("technician_company", { length: 255 }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    nextPtiDue: timestamp("next_pti_due", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("scheduled"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("sim_reefer_pti_tenant_idx").on(t.tenantId),
    index("sim_reefer_pti_ref_idx").on(t.surveyRef),
    index("sim_reefer_pti_status_idx").on(t.status),
    index("sim_reefer_pti_cntr_idx").on(t.containerNumber),
    index("sim_reefer_pti_type_idx").on(t.surveyType),
    index("sim_reefer_pti_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Classification Society Interface
// ==========================================
export const simClassificationSurveys = pgTable(
  "sim_classification_surveys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    surveyRef: varchar("survey_ref", { length: 50 }).notNull(),
    surveyType: varchar("survey_type", { length: 30 }).notNull(), // annual, special, intermediate, renewal, bottom
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    imoNumber: varchar("imo_number", { length: 20 }),
    classificationSociety: varchar("classification_society", { length: 255 }).notNull(),
    classNotation: varchar("class_notation", { length: 100 }),
    surveyorName: varchar("surveyor_name", { length: 255 }),
    surveyorId: varchar("surveyor_id", { length: 50 }),
    surveyLocation: varchar("survey_location", { length: 255 }),
    certificateType: varchar("certificate_type", { length: 100 }),
    certificateNumber: varchar("certificate_number", { length: 100 }),
    certificateIssuedAt: timestamp("certificate_issued_at", { withTimezone: true }),
    certificateExpiresAt: timestamp("certificate_expires_at", { withTimezone: true }),
    windowStart: timestamp("window_start", { withTimezone: true }),
    windowEnd: timestamp("window_end", { withTimezone: true }),
    conditionsOfClass: jsonb("conditions_of_class"),
    recommendations: jsonb("recommendations"),
    findingsCount: integer("findings_count").default(0),
    nonConformities: jsonb("non_conformities"),
    rectificationDeadline: timestamp("rectification_deadline", { withTimezone: true }),
    rectifiedAt: timestamp("rectified_at", { withTimezone: true }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    overallResult: varchar("overall_result", { length: 20 }), // passed, conditional, failed
    status: varchar("status", { length: 20 }).notNull().default("scheduled"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("sim_class_survey_tenant_idx").on(t.tenantId),
    index("sim_class_survey_ref_idx").on(t.surveyRef),
    index("sim_class_survey_status_idx").on(t.status),
    index("sim_class_survey_vessel_idx").on(t.vesselName),
    index("sim_class_survey_type_idx").on(t.surveyType),
    index("sim_class_survey_society_idx").on(t.classificationSociety),
    index("sim_class_survey_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Survey Report Management & Archive
// ==========================================
export const simSurveyReports = pgTable(
  "sim_survey_reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    reportRef: varchar("report_ref", { length: 50 }).notNull(),
    reportType: varchar("report_type", { length: 30 }).notNull(), // survey, inspection, audit, certificate
    sourceModule: varchar("source_module", { length: 50 }),
    sourceSurveyRef: varchar("source_survey_ref", { length: 50 }),
    title: varchar("title", { length: 500 }).notNull(),
    vesselName: varchar("vessel_name", { length: 255 }),
    containerNumber: varchar("container_number", { length: 20 }),
    surveyorName: varchar("surveyor_name", { length: 255 }),
    surveyorCompany: varchar("surveyor_company", { length: 255 }),
    surveyDate: timestamp("survey_date", { withTimezone: true }),
    reportDate: timestamp("report_date", { withTimezone: true }),
    documentUrl: varchar("document_url", { length: 500 }),
    documentFormat: varchar("document_format", { length: 20 }), // pdf, docx, xlsx
    fileSizeBytes: integer("file_size_bytes"),
    summary: text("summary"),
    findings: jsonb("findings"),
    recommendations: jsonb("recommendations"),
    attachments: jsonb("attachments"),
    retentionYears: integer("retention_years"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    approvedBy: varchar("approved_by", { length: 255 }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    tags: jsonb("tags"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("sim_survey_report_tenant_idx").on(t.tenantId),
    index("sim_survey_report_ref_idx").on(t.reportRef),
    index("sim_survey_report_status_idx").on(t.status),
    index("sim_survey_report_type_idx").on(t.reportType),
    index("sim_survey_report_vessel_idx").on(t.vesselName),
    index("sim_survey_report_source_idx").on(t.sourceSurveyRef),
    index("sim_survey_report_deleted_idx").on(t.deletedAt),
  ]
);
