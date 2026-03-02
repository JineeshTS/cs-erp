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
// FEAT-023-1-001: IMDG Code Compliance Engine
// ==========================================

export const dgmImdgCompliance = pgTable(
  "dgm_imdg_compliance",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    complianceRef: varchar("compliance_ref", { length: 50 }).notNull(),
    unNumber: varchar("un_number", { length: 10 }).notNull(),
    properShippingName: varchar("proper_shipping_name", { length: 500 }).notNull(),
    technicalName: varchar("technical_name", { length: 500 }),
    imdgClass: varchar("imdg_class", { length: 10 }).notNull(),
    imdgSubsidiaryRisk: varchar("imdg_subsidiary_risk", { length: 50 }),
    packingGroup: varchar("packing_group", { length: 10 }),
    marinePollutant: boolean("marine_pollutant").default(false),
    emsNumber: varchar("ems_number", { length: 20 }),
    flashPoint: varchar("flash_point", { length: 20 }),
    limitedQuantity: boolean("limited_quantity").default(false),
    exceptedQuantity: boolean("excepted_quantity").default(false),
    specialProvisions: jsonb("special_provisions"),
    stowageCategory: varchar("stowage_category", { length: 10 }),
    stowageRequirements: jsonb("stowage_requirements"),
    segregationGroup: varchar("segregation_group", { length: 50 }),
    imdgCodeEdition: varchar("imdg_code_edition", { length: 20 }),
    amendmentNumber: varchar("amendment_number", { length: 20 }),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
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
    index("dgm_imdg_compliance_tenant_idx").on(t.tenantId),
    uniqueIndex("dgm_imdg_compliance_ref_tenant_idx").on(t.tenantId, t.complianceRef),
    index("dgm_imdg_compliance_un_idx").on(t.tenantId, t.unNumber),
    index("dgm_imdg_compliance_class_idx").on(t.tenantId, t.imdgClass),
    index("dgm_imdg_compliance_status_idx").on(t.tenantId, t.status),
    index("dgm_imdg_compliance_created_idx").on(t.createdAt),
    index("dgm_imdg_compliance_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-023-1-002: DG Cargo Booking Acceptance Screening
// ==========================================

export const dgmBookingScreenings = pgTable(
  "dgm_booking_screenings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    screeningRef: varchar("screening_ref", { length: 50 }).notNull(),
    bookingRef: varchar("booking_ref", { length: 50 }).notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    containerNumber: varchar("container_number", { length: 20 }),
    unNumber: varchar("un_number", { length: 10 }).notNull(),
    properShippingName: varchar("proper_shipping_name", { length: 500 }).notNull(),
    imdgClass: varchar("imdg_class", { length: 10 }).notNull(),
    packingGroup: varchar("packing_group", { length: 10 }),
    grossWeight: numeric("gross_weight", { precision: 12, scale: 3 }),
    netWeight: numeric("net_weight", { precision: 12, scale: 3 }),
    weightUnit: varchar("weight_unit", { length: 5 }).default("KG"),
    numberOfPackages: integer("number_of_packages"),
    packageType: varchar("package_type", { length: 50 }),
    marinePollutant: boolean("marine_pollutant").default(false),
    limitedQuantity: boolean("limited_quantity").default(false),
    innerPackagingDetails: text("inner_packaging_details"),
    originPort: varchar("origin_port", { length: 255 }),
    destinationPort: varchar("destination_port", { length: 255 }),
    vesselName: varchar("vessel_name", { length: 255 }),
    voyageNumber: varchar("voyage_number", { length: 50 }),
    screeningResult: varchar("screening_result", { length: 20 }),
    screeningNotes: text("screening_notes"),
    riskScore: numeric("risk_score", { precision: 5, scale: 2 }),
    validationErrors: jsonb("validation_errors"),
    screenedByName: varchar("screened_by_name", { length: 255 }),
    screenedAt: timestamp("screened_at", { withTimezone: true }),
    approvedByName: varchar("approved_by_name", { length: 255 }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
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
    index("dgm_booking_screen_tenant_idx").on(t.tenantId),
    uniqueIndex("dgm_booking_screen_ref_tenant_idx").on(t.tenantId, t.screeningRef),
    index("dgm_booking_screen_booking_idx").on(t.tenantId, t.bookingRef),
    index("dgm_booking_screen_un_idx").on(t.tenantId, t.unNumber),
    index("dgm_booking_screen_customer_idx").on(t.tenantId, t.customerName),
    index("dgm_booking_screen_status_idx").on(t.tenantId, t.status),
    index("dgm_booking_screen_created_idx").on(t.createdAt),
    index("dgm_booking_screen_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-023-1-003: Segregation Rules & Stowage Requirements
// ==========================================

export const dgmSegregationRules = pgTable(
  "dgm_segregation_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    ruleRef: varchar("rule_ref", { length: 50 }).notNull(),
    ruleName: varchar("rule_name", { length: 255 }).notNull(),
    ruleType: varchar("rule_type", { length: 30 }).notNull(),
    sourceClass: varchar("source_class", { length: 10 }).notNull(),
    targetClass: varchar("target_class", { length: 10 }).notNull(),
    segregationLevel: varchar("segregation_level", { length: 30 }).notNull(),
    stowagePosition: varchar("stowage_position", { length: 30 }),
    stowageCategory: varchar("stowage_category", { length: 10 }),
    onDeck: boolean("on_deck"),
    underDeck: boolean("under_deck"),
    awayFromSources: jsonb("away_from_sources"),
    minimumDistance: numeric("minimum_distance", { precision: 8, scale: 2 }),
    distanceUnit: varchar("distance_unit", { length: 5 }).default("M"),
    closedVsClosed: varchar("closed_vs_closed", { length: 30 }),
    closedVsOpen: varchar("closed_vs_open", { length: 30 }),
    openVsOpen: varchar("open_vs_open", { length: 30 }),
    imdgReference: varchar("imdg_reference", { length: 100 }),
    specialConditions: jsonb("special_conditions"),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    priority: integer("priority").default(0),
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
    index("dgm_seg_rules_tenant_idx").on(t.tenantId),
    uniqueIndex("dgm_seg_rules_ref_tenant_idx").on(t.tenantId, t.ruleRef),
    index("dgm_seg_rules_source_idx").on(t.tenantId, t.sourceClass),
    index("dgm_seg_rules_target_idx").on(t.tenantId, t.targetClass),
    index("dgm_seg_rules_level_idx").on(t.tenantId, t.segregationLevel),
    index("dgm_seg_rules_status_idx").on(t.tenantId, t.status),
    index("dgm_seg_rules_created_idx").on(t.createdAt),
    index("dgm_seg_rules_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-023-1-004: Placard & Label Requirements
// ==========================================

export const dgmPlacardRequirements = pgTable(
  "dgm_placard_requirements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    placardRef: varchar("placard_ref", { length: 50 }).notNull(),
    unNumber: varchar("un_number", { length: 10 }),
    imdgClass: varchar("imdg_class", { length: 10 }).notNull(),
    subsidiaryRisk: varchar("subsidiary_risk", { length: 50 }),
    placardType: varchar("placard_type", { length: 30 }).notNull(),
    labelCode: varchar("label_code", { length: 30 }),
    labelDescription: varchar("label_description", { length: 255 }),
    placementPosition: varchar("placement_position", { length: 100 }),
    sizeRequirements: varchar("size_requirements", { length: 100 }),
    colorSpecification: varchar("color_specification", { length: 100 }),
    symbolDescription: text("symbol_description"),
    applicableToContainer: boolean("applicable_to_container").default(true),
    applicableToVehicle: boolean("applicable_to_vehicle").default(false),
    applicableToPackage: boolean("applicable_to_package").default(true),
    marinePollutantMark: boolean("marine_pollutant_mark").default(false),
    elevatedTemperature: boolean("elevated_temperature").default(false),
    fumigationWarning: boolean("fumigation_warning").default(false),
    orientationArrows: boolean("orientation_arrows").default(false),
    imdgReference: varchar("imdg_reference", { length: 100 }),
    imageUrl: varchar("image_url", { length: 500 }),
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
    index("dgm_placard_req_tenant_idx").on(t.tenantId),
    uniqueIndex("dgm_placard_req_ref_tenant_idx").on(t.tenantId, t.placardRef),
    index("dgm_placard_req_class_idx").on(t.tenantId, t.imdgClass),
    index("dgm_placard_req_type_idx").on(t.tenantId, t.placardType),
    index("dgm_placard_req_status_idx").on(t.tenantId, t.status),
    index("dgm_placard_req_created_idx").on(t.createdAt),
    index("dgm_placard_req_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-023-2-001: DG Manifest Preparation & Submission
// ==========================================

export const dgmManifests = pgTable(
  "dgm_manifests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    manifestRef: varchar("manifest_ref", { length: 50 }).notNull(),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    voyageNumber: varchar("voyage_number", { length: 50 }).notNull(),
    imoNumber: varchar("imo_number", { length: 20 }),
    callSign: varchar("call_sign", { length: 20 }),
    masterName: varchar("master_name", { length: 255 }),
    portOfLoading: varchar("port_of_loading", { length: 255 }).notNull(),
    portOfDischarge: varchar("port_of_discharge", { length: 255 }).notNull(),
    departureDate: timestamp("departure_date", { withTimezone: true }),
    arrivalDate: timestamp("arrival_date", { withTimezone: true }),
    totalDgContainers: integer("total_dg_containers").default(0),
    totalDgWeight: numeric("total_dg_weight", { precision: 12, scale: 3 }),
    weightUnit: varchar("weight_unit", { length: 5 }).default("KG"),
    dgItems: jsonb("dg_items"),
    stowagePlan: jsonb("stowage_plan"),
    complianceChecks: jsonb("compliance_checks"),
    submittedToAuthority: varchar("submitted_to_authority", { length: 255 }),
    submissionDate: timestamp("submission_date", { withTimezone: true }),
    submissionReference: varchar("submission_reference", { length: 100 }),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
    preparedByName: varchar("prepared_by_name", { length: 255 }),
    approvedByName: varchar("approved_by_name", { length: 255 }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
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
    index("dgm_manifests_tenant_idx").on(t.tenantId),
    uniqueIndex("dgm_manifests_ref_tenant_idx").on(t.tenantId, t.manifestRef),
    index("dgm_manifests_vessel_idx").on(t.tenantId, t.vesselName),
    index("dgm_manifests_voyage_idx").on(t.tenantId, t.voyageNumber),
    index("dgm_manifests_port_load_idx").on(t.tenantId, t.portOfLoading),
    index("dgm_manifests_status_idx").on(t.tenantId, t.status),
    index("dgm_manifests_created_idx").on(t.createdAt),
    index("dgm_manifests_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-023-2-002: Emergency Response Procedures MFAG
// ==========================================

export const dgmEmergencyProcedures = pgTable(
  "dgm_emergency_procedures",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    procedureRef: varchar("procedure_ref", { length: 50 }).notNull(),
    procedureName: varchar("procedure_name", { length: 255 }).notNull(),
    procedureType: varchar("procedure_type", { length: 30 }).notNull(),
    emsNumber: varchar("ems_number", { length: 20 }),
    mfagTableNumber: varchar("mfag_table_number", { length: 20 }),
    applicableClasses: jsonb("applicable_classes"),
    applicableUnNumbers: jsonb("applicable_un_numbers"),
    fireResponse: text("fire_response"),
    spillageResponse: text("spillage_response"),
    firstAidMeasures: text("first_aid_measures"),
    personalProtection: text("personal_protection"),
    evacuationProcedure: text("evacuation_procedure"),
    decontamination: text("decontamination"),
    specialEquipment: jsonb("special_equipment"),
    emergencyContacts: jsonb("emergency_contacts"),
    trainingRequirements: text("training_requirements"),
    drillFrequency: varchar("drill_frequency", { length: 30 }),
    lastDrillDate: timestamp("last_drill_date", { withTimezone: true }),
    nextDrillDate: timestamp("next_drill_date", { withTimezone: true }),
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
    index("dgm_emerg_proc_tenant_idx").on(t.tenantId),
    uniqueIndex("dgm_emerg_proc_ref_tenant_idx").on(t.tenantId, t.procedureRef),
    index("dgm_emerg_proc_type_idx").on(t.tenantId, t.procedureType),
    index("dgm_emerg_proc_ems_idx").on(t.tenantId, t.emsNumber),
    index("dgm_emerg_proc_status_idx").on(t.tenantId, t.status),
    index("dgm_emerg_proc_created_idx").on(t.createdAt),
    index("dgm_emerg_proc_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-023-2-003: Chemical Safety Data Management
// ==========================================

export const dgmChemicalSafetyData = pgTable(
  "dgm_chemical_safety_data",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    safetyDataRef: varchar("safety_data_ref", { length: 50 }).notNull(),
    chemicalName: varchar("chemical_name", { length: 500 }).notNull(),
    casNumber: varchar("cas_number", { length: 30 }),
    unNumber: varchar("un_number", { length: 10 }),
    imdgClass: varchar("imdg_class", { length: 10 }),
    manufacturer: varchar("manufacturer", { length: 255 }),
    supplierName: varchar("supplier_name", { length: 255 }),
    sdsVersion: varchar("sds_version", { length: 20 }),
    sdsDate: timestamp("sds_date", { withTimezone: true }),
    hazardIdentification: text("hazard_identification"),
    compositionInfo: jsonb("composition_info"),
    firstAidMeasures: text("first_aid_measures"),
    firefightingMeasures: text("firefighting_measures"),
    accidentalRelease: text("accidental_release"),
    handlingAndStorage: text("handling_and_storage"),
    exposureControls: text("exposure_controls"),
    physicalProperties: jsonb("physical_properties"),
    stabilityReactivity: text("stability_reactivity"),
    toxicologicalInfo: text("toxicological_info"),
    ecologicalInfo: text("ecological_info"),
    disposalConsiderations: text("disposal_considerations"),
    transportInfo: text("transport_info"),
    regulatoryInfo: text("regulatory_info"),
    sdsDocumentUrl: varchar("sds_document_url", { length: 500 }),
    expiryDate: timestamp("expiry_date", { withTimezone: true }),
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
    index("dgm_chem_safety_tenant_idx").on(t.tenantId),
    uniqueIndex("dgm_chem_safety_ref_tenant_idx").on(t.tenantId, t.safetyDataRef),
    index("dgm_chem_safety_chemical_idx").on(t.tenantId, t.chemicalName),
    index("dgm_chem_safety_un_idx").on(t.tenantId, t.unNumber),
    index("dgm_chem_safety_cas_idx").on(t.tenantId, t.casNumber),
    index("dgm_chem_safety_status_idx").on(t.tenantId, t.status),
    index("dgm_chem_safety_created_idx").on(t.createdAt),
    index("dgm_chem_safety_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-023-2-004: DG Incident Reporting & Investigation
// ==========================================

export const dgmIncidentReports = pgTable(
  "dgm_incident_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    incidentRef: varchar("incident_ref", { length: 50 }).notNull(),
    incidentType: varchar("incident_type", { length: 30 }).notNull(),
    severityLevel: varchar("severity_level", { length: 20 }).notNull(),
    incidentDate: timestamp("incident_date", { withTimezone: true }).notNull(),
    locationDescription: varchar("location_description", { length: 500 }).notNull(),
    vesselName: varchar("vessel_name", { length: 255 }),
    voyageNumber: varchar("voyage_number", { length: 50 }),
    containerNumber: varchar("container_number", { length: 20 }),
    unNumber: varchar("un_number", { length: 10 }),
    properShippingName: varchar("proper_shipping_name", { length: 500 }),
    imdgClass: varchar("imdg_class", { length: 10 }),
    description: text("description").notNull(),
    immediateActions: text("immediate_actions"),
    casualties: integer("casualties").default(0),
    injuries: integer("injuries").default(0),
    environmentalImpact: text("environmental_impact"),
    propertyDamage: text("property_damage"),
    estimatedCost: numeric("estimated_cost", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    reportedByName: varchar("reported_by_name", { length: 255 }),
    reportedAt: timestamp("reported_at", { withTimezone: true }),
    investigatorName: varchar("investigator_name", { length: 255 }),
    investigationStarted: timestamp("investigation_started", { withTimezone: true }),
    investigationFindings: text("investigation_findings"),
    rootCause: text("root_cause"),
    correctiveActions: jsonb("corrective_actions"),
    preventiveMeasures: jsonb("preventive_measures"),
    lessonsLearned: text("lessons_learned"),
    regulatoryNotifications: jsonb("regulatory_notifications"),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    closedByName: varchar("closed_by_name", { length: 255 }),
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
    index("dgm_incident_rpt_tenant_idx").on(t.tenantId),
    uniqueIndex("dgm_incident_rpt_ref_tenant_idx").on(t.tenantId, t.incidentRef),
    index("dgm_incident_rpt_type_idx").on(t.tenantId, t.incidentType),
    index("dgm_incident_rpt_severity_idx").on(t.tenantId, t.severityLevel),
    index("dgm_incident_rpt_vessel_idx").on(t.tenantId, t.vesselName),
    index("dgm_incident_rpt_date_idx").on(t.tenantId, t.incidentDate),
    index("dgm_incident_rpt_status_idx").on(t.tenantId, t.status),
    index("dgm_incident_rpt_created_idx").on(t.createdAt),
    index("dgm_incident_rpt_deleted_idx").on(t.deletedAt),
  ]
);
