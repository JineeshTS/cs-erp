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
// FEAT-025-1-001: OOG Cargo Acceptance & Measurement Validation
// ==========================================

export const oogCargoAcceptances = pgTable(
  "oog_cargo_acceptances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    acceptanceRef: varchar("acceptance_ref", { length: 50 }).notNull(),
    bookingRef: varchar("booking_ref", { length: 50 }),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerCode: varchar("customer_code", { length: 50 }),
    cargoDescription: text("cargo_description").notNull(),
    cargoType: varchar("cargo_type", { length: 30 }).notNull(),
    containerType: varchar("container_type", { length: 30 }).notNull(),
    containerNumber: varchar("container_number", { length: 20 }),
    lengthCm: numeric("length_cm", { precision: 10, scale: 2 }),
    widthCm: numeric("width_cm", { precision: 10, scale: 2 }),
    heightCm: numeric("height_cm", { precision: 10, scale: 2 }),
    grossWeightKg: numeric("gross_weight_kg", { precision: 12, scale: 2 }).notNull(),
    overLengthCm: numeric("over_length_cm", { precision: 10, scale: 2 }),
    overWidthCm: numeric("over_width_cm", { precision: 10, scale: 2 }),
    overHeightCm: numeric("over_height_cm", { precision: 10, scale: 2 }),
    measurementValidated: boolean("measurement_validated").default(false),
    validatedByName: varchar("validated_by_name", { length: 255 }),
    validatedAt: timestamp("validated_at", { withTimezone: true }),
    originPort: varchar("origin_port", { length: 255 }).notNull(),
    destinationPort: varchar("destination_port", { length: 255 }).notNull(),
    vesselName: varchar("vessel_name", { length: 255 }),
    voyageNumber: varchar("voyage_number", { length: 50 }),
    specialHandling: jsonb("special_handling"),
    hazardous: boolean("hazardous").default(false),
    photosUrls: jsonb("photos_urls"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    index("oog_cargo_acc_tenant_idx").on(t.tenantId),
    uniqueIndex("oog_cargo_acc_ref_tenant_idx").on(t.tenantId, t.acceptanceRef),
    index("oog_cargo_acc_customer_idx").on(t.tenantId, t.customerName),
    index("oog_cargo_acc_container_idx").on(t.tenantId, t.containerNumber),
    index("oog_cargo_acc_type_idx").on(t.tenantId, t.cargoType),
    index("oog_cargo_acc_status_idx").on(t.tenantId, t.status),
    index("oog_cargo_acc_created_idx").on(t.createdAt),
    index("oog_cargo_acc_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-025-1-002: Stowage Planning for Flat Rack & Open Top
// ==========================================

export const oogStowagePlans = pgTable(
  "oog_stowage_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    stowageRef: varchar("stowage_ref", { length: 50 }).notNull(),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    voyageNumber: varchar("voyage_number", { length: 50 }).notNull(),
    containerNumber: varchar("container_number", { length: 20 }),
    containerType: varchar("container_type", { length: 30 }).notNull(),
    bayPosition: varchar("bay_position", { length: 30 }),
    rowPosition: varchar("row_position", { length: 30 }),
    tierPosition: varchar("tier_position", { length: 30 }),
    weightKg: numeric("weight_kg", { precision: 12, scale: 2 }),
    overLengthFore: numeric("over_length_fore", { precision: 10, scale: 2 }),
    overLengthAft: numeric("over_length_aft", { precision: 10, scale: 2 }),
    overWidthPort: numeric("over_width_port", { precision: 10, scale: 2 }),
    overWidthStarboard: numeric("over_width_starboard", { precision: 10, scale: 2 }),
    overHeight: numeric("over_height", { precision: 10, scale: 2 }),
    stackable: boolean("stackable").default(false),
    adjacentSlots: jsonb("adjacent_slots"),
    clearanceRequired: boolean("clearance_required").default(false),
    lashingPoints: integer("lashing_points"),
    stowageConstraints: jsonb("stowage_constraints"),
    planApproved: boolean("plan_approved").default(false),
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
      .defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    index("oog_stow_plan_tenant_idx").on(t.tenantId),
    uniqueIndex("oog_stow_plan_ref_tenant_idx").on(t.tenantId, t.stowageRef),
    index("oog_stow_plan_vessel_idx").on(t.tenantId, t.vesselName),
    index("oog_stow_plan_container_idx").on(t.tenantId, t.containerNumber),
    index("oog_stow_plan_type_idx").on(t.tenantId, t.containerType),
    index("oog_stow_plan_status_idx").on(t.tenantId, t.status),
    index("oog_stow_plan_created_idx").on(t.createdAt),
    index("oog_stow_plan_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-025-1-003: Special Equipment Management
// ==========================================

export const oogSpecialEquipment = pgTable(
  "oog_special_equipment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    equipmentRef: varchar("equipment_ref", { length: 50 }).notNull(),
    equipmentType: varchar("equipment_type", { length: 30 }).notNull(),
    equipmentNumber: varchar("equipment_number", { length: 30 }),
    equipmentName: varchar("equipment_name", { length: 255 }).notNull(),
    manufacturer: varchar("manufacturer", { length: 255 }),
    modelNumber: varchar("model_number", { length: 100 }),
    maxLoadCapacityKg: numeric("max_load_capacity_kg", { precision: 12, scale: 2 }),
    tareWeightKg: numeric("tare_weight_kg", { precision: 12, scale: 2 }),
    internalLengthCm: numeric("internal_length_cm", { precision: 10, scale: 2 }),
    internalWidthCm: numeric("internal_width_cm", { precision: 10, scale: 2 }),
    internalHeightCm: numeric("internal_height_cm", { precision: 10, scale: 2 }),
    doorOpeningWidthCm: numeric("door_opening_width_cm", { precision: 10, scale: 2 }),
    doorOpeningHeightCm: numeric("door_opening_height_cm", { precision: 10, scale: 2 }),
    certificationNumber: varchar("certification_number", { length: 100 }),
    certificationExpiry: timestamp("certification_expiry", { withTimezone: true }),
    lastInspectionDate: timestamp("last_inspection_date", { withTimezone: true }),
    nextInspectionDate: timestamp("next_inspection_date", { withTimezone: true }),
    currentLocation: varchar("current_location", { length: 255 }),
    ownershipType: varchar("ownership_type", { length: 20 }),
    leaseReference: varchar("lease_reference", { length: 100 }),
    availableFrom: timestamp("available_from", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("available"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    index("oog_spec_equip_tenant_idx").on(t.tenantId),
    uniqueIndex("oog_spec_equip_ref_tenant_idx").on(t.tenantId, t.equipmentRef),
    index("oog_spec_equip_type_idx").on(t.tenantId, t.equipmentType),
    index("oog_spec_equip_number_idx").on(t.tenantId, t.equipmentNumber),
    index("oog_spec_equip_location_idx").on(t.tenantId, t.currentLocation),
    index("oog_spec_equip_status_idx").on(t.tenantId, t.status),
    index("oog_spec_equip_created_idx").on(t.createdAt),
    index("oog_spec_equip_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-025-1-004: Cargo Securing Plan Generation
// ==========================================

export const oogSecuringPlans = pgTable(
  "oog_securing_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    securingRef: varchar("securing_ref", { length: 50 }).notNull(),
    acceptanceRef: varchar("acceptance_ref", { length: 50 }),
    containerNumber: varchar("container_number", { length: 20 }),
    cargoDescription: text("cargo_description").notNull(),
    grossWeightKg: numeric("gross_weight_kg", { precision: 12, scale: 2 }).notNull(),
    centerOfGravityX: numeric("center_of_gravity_x", { precision: 10, scale: 2 }),
    centerOfGravityY: numeric("center_of_gravity_y", { precision: 10, scale: 2 }),
    centerOfGravityZ: numeric("center_of_gravity_z", { precision: 10, scale: 2 }),
    lashingMethod: varchar("lashing_method", { length: 50 }),
    lashingMaterial: varchar("lashing_material", { length: 100 }),
    numberOfLashings: integer("number_of_lashings"),
    blockingMethod: varchar("blocking_method", { length: 50 }),
    bracingMethod: varchar("bracing_method", { length: 50 }),
    dunnageRequired: boolean("dunnage_required").default(false),
    dunnageMaterial: varchar("dunnage_material", { length: 100 }),
    accelerationForces: jsonb("acceleration_forces"),
    calculationStandard: varchar("calculation_standard", { length: 50 }),
    diagramUrl: varchar("diagram_url", { length: 500 }),
    verifiedByName: varchar("verified_by_name", { length: 255 }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    index("oog_securing_tenant_idx").on(t.tenantId),
    uniqueIndex("oog_securing_ref_tenant_idx").on(t.tenantId, t.securingRef),
    index("oog_securing_acceptance_idx").on(t.tenantId, t.acceptanceRef),
    index("oog_securing_container_idx").on(t.tenantId, t.containerNumber),
    index("oog_securing_method_idx").on(t.tenantId, t.lashingMethod),
    index("oog_securing_status_idx").on(t.tenantId, t.status),
    index("oog_securing_created_idx").on(t.createdAt),
    index("oog_securing_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-025-2-001: Heavy Lift & Project Cargo Coordination
// ==========================================

export const oogHeavyLifts = pgTable(
  "oog_heavy_lifts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    heavyLiftRef: varchar("heavy_lift_ref", { length: 50 }).notNull(),
    projectName: varchar("project_name", { length: 255 }).notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    cargoDescription: text("cargo_description").notNull(),
    numberOfPieces: integer("number_of_pieces").notNull(),
    totalWeightKg: numeric("total_weight_kg", { precision: 14, scale: 2 }).notNull(),
    heaviestPieceKg: numeric("heaviest_piece_kg", { precision: 14, scale: 2 }),
    longestPieceCm: numeric("longest_piece_cm", { precision: 10, scale: 2 }),
    widestPieceCm: numeric("widest_piece_cm", { precision: 10, scale: 2 }),
    tallestPieceCm: numeric("tallest_piece_cm", { precision: 10, scale: 2 }),
    liftingMethod: varchar("lifting_method", { length: 50 }),
    craneCapacityTons: numeric("crane_capacity_tons", { precision: 10, scale: 2 }),
    riggingPlan: jsonb("rigging_plan"),
    originPort: varchar("origin_port", { length: 255 }).notNull(),
    destinationPort: varchar("destination_port", { length: 255 }).notNull(),
    vesselName: varchar("vessel_name", { length: 255 }),
    voyageNumber: varchar("voyage_number", { length: 50 }),
    estimatedLoadDate: timestamp("estimated_load_date", { withTimezone: true }),
    estimatedDischargeDate: timestamp("estimated_discharge_date", { withTimezone: true }),
    coordinatorName: varchar("coordinator_name", { length: 255 }),
    surveyorName: varchar("surveyor_name", { length: 255 }),
    surveyReportUrl: varchar("survey_report_url", { length: 500 }),
    insuranceCoverage: varchar("insurance_coverage", { length: 100 }),
    estimatedCost: numeric("estimated_cost", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    status: varchar("status", { length: 20 }).notNull().default("planning"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    index("oog_heavy_lift_tenant_idx").on(t.tenantId),
    uniqueIndex("oog_heavy_lift_ref_tenant_idx").on(t.tenantId, t.heavyLiftRef),
    index("oog_heavy_lift_project_idx").on(t.tenantId, t.projectName),
    index("oog_heavy_lift_customer_idx").on(t.tenantId, t.customerName),
    index("oog_heavy_lift_vessel_idx").on(t.tenantId, t.vesselName),
    index("oog_heavy_lift_status_idx").on(t.tenantId, t.status),
    index("oog_heavy_lift_created_idx").on(t.createdAt),
    index("oog_heavy_lift_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-025-2-002: Multi-Modal OOG Logistics
// ==========================================

export const oogMultiModalLogistics = pgTable(
  "oog_multi_modal_logistics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    logisticsRef: varchar("logistics_ref", { length: 50 }).notNull(),
    acceptanceRef: varchar("acceptance_ref", { length: 50 }),
    containerNumber: varchar("container_number", { length: 20 }),
    cargoDescription: text("cargo_description"),
    transportMode: varchar("transport_mode", { length: 30 }).notNull(),
    carrierName: varchar("carrier_name", { length: 255 }),
    vehicleId: varchar("vehicle_id", { length: 50 }),
    originLocation: varchar("origin_location", { length: 255 }).notNull(),
    destinationLocation: varchar("destination_location", { length: 255 }).notNull(),
    transitPoints: jsonb("transit_points"),
    routeRestrictions: jsonb("route_restrictions"),
    permitRequired: boolean("permit_required").default(false),
    permitNumber: varchar("permit_number", { length: 100 }),
    escortRequired: boolean("escort_required").default(false),
    estimatedDepartureAt: timestamp("estimated_departure_at", { withTimezone: true }),
    estimatedArrivalAt: timestamp("estimated_arrival_at", { withTimezone: true }),
    actualDepartureAt: timestamp("actual_departure_at", { withTimezone: true }),
    actualArrivalAt: timestamp("actual_arrival_at", { withTimezone: true }),
    transportCost: numeric("transport_cost", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    status: varchar("status", { length: 20 }).notNull().default("planned"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    index("oog_multi_modal_tenant_idx").on(t.tenantId),
    uniqueIndex("oog_multi_modal_ref_tenant_idx").on(t.tenantId, t.logisticsRef),
    index("oog_multi_modal_acceptance_idx").on(t.tenantId, t.acceptanceRef),
    index("oog_multi_modal_mode_idx").on(t.tenantId, t.transportMode),
    index("oog_multi_modal_carrier_idx").on(t.tenantId, t.carrierName),
    index("oog_multi_modal_status_idx").on(t.tenantId, t.status),
    index("oog_multi_modal_created_idx").on(t.createdAt),
    index("oog_multi_modal_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-025-2-003: OOG Documentation & Permits
// ==========================================

export const oogDocPermits = pgTable(
  "oog_doc_permits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    documentRef: varchar("document_ref", { length: 50 }).notNull(),
    documentType: varchar("document_type", { length: 30 }).notNull(),
    acceptanceRef: varchar("acceptance_ref", { length: 50 }),
    containerNumber: varchar("container_number", { length: 20 }),
    documentTitle: varchar("document_title", { length: 255 }).notNull(),
    issuingAuthority: varchar("issuing_authority", { length: 255 }),
    issueDate: timestamp("issue_date", { withTimezone: true }),
    expiryDate: timestamp("expiry_date", { withTimezone: true }),
    permitNumber: varchar("permit_number", { length: 100 }),
    permitScope: varchar("permit_scope", { length: 100 }),
    portOfApplicability: varchar("port_of_applicability", { length: 255 }),
    countryOfApplicability: varchar("country_of_applicability", { length: 100 }),
    conditionsOfApproval: text("conditions_of_approval"),
    documentUrl: varchar("document_url", { length: 500 }),
    verifiedByName: varchar("verified_by_name", { length: 255 }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    renewalRequired: boolean("renewal_required").default(false),
    renewalDate: timestamp("renewal_date", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    index("oog_doc_permit_tenant_idx").on(t.tenantId),
    uniqueIndex("oog_doc_permit_ref_tenant_idx").on(t.tenantId, t.documentRef),
    index("oog_doc_permit_type_idx").on(t.tenantId, t.documentType),
    index("oog_doc_permit_acceptance_idx").on(t.tenantId, t.acceptanceRef),
    index("oog_doc_permit_authority_idx").on(t.tenantId, t.issuingAuthority),
    index("oog_doc_permit_status_idx").on(t.tenantId, t.status),
    index("oog_doc_permit_created_idx").on(t.createdAt),
    index("oog_doc_permit_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// FEAT-025-2-004: Port Authority Approval Management
// ==========================================

export const oogPortApprovals = pgTable(
  "oog_port_approvals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    approvalRef: varchar("approval_ref", { length: 50 }).notNull(),
    acceptanceRef: varchar("acceptance_ref", { length: 50 }),
    portName: varchar("port_name", { length: 255 }).notNull(),
    portAuthority: varchar("port_authority", { length: 255 }).notNull(),
    vesselName: varchar("vessel_name", { length: 255 }),
    voyageNumber: varchar("voyage_number", { length: 50 }),
    containerNumber: varchar("container_number", { length: 20 }),
    cargoDescription: text("cargo_description"),
    oogDimensions: jsonb("oog_dimensions"),
    grossWeightKg: numeric("gross_weight_kg", { precision: 12, scale: 2 }),
    approvalType: varchar("approval_type", { length: 30 }).notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    submittedByName: varchar("submitted_by_name", { length: 255 }),
    applicationNumber: varchar("application_number", { length: 100 }),
    approvalConditions: jsonb("approval_conditions"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    approvedByAuthority: varchar("approved_by_authority", { length: 255 }),
    rejectionReason: text("rejection_reason"),
    validFrom: timestamp("valid_from", { withTimezone: true }),
    validTo: timestamp("valid_to", { withTimezone: true }),
    fees: numeric("fees", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    index("oog_port_appr_tenant_idx").on(t.tenantId),
    uniqueIndex("oog_port_appr_ref_tenant_idx").on(t.tenantId, t.approvalRef),
    index("oog_port_appr_port_idx").on(t.tenantId, t.portName),
    index("oog_port_appr_authority_idx").on(t.tenantId, t.portAuthority),
    index("oog_port_appr_vessel_idx").on(t.tenantId, t.vesselName),
    index("oog_port_appr_type_idx").on(t.tenantId, t.approvalType),
    index("oog_port_appr_status_idx").on(t.tenantId, t.status),
    index("oog_port_appr_created_idx").on(t.createdAt),
    index("oog_port_appr_deleted_idx").on(t.deletedAt),
  ]
);
