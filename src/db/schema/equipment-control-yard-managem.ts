import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  numeric,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// FEAT-010-1-001: Container Fleet Management & Tracking
// ==========================================

export const eqyContainerFleet = pgTable(
  "eqy_container_fleet",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    containerNumber: varchar("container_number", { length: 20 }).notNull(),
    isoTypeCode: varchar("iso_type_code", { length: 10 }),
    sizeCode: varchar("size_code", { length: 10 }).notNull(),
    typeCode: varchar("type_code", { length: 10 }).notNull(),
    ownerCode: varchar("owner_code", { length: 10 }),
    operatorCode: varchar("operator_code", { length: 10 }),
    ownershipType: varchar("ownership_type", { length: 20 })
      .notNull()
      .default("owned"),
    currentLocation: varchar("current_location", { length: 255 }),
    currentPort: varchar("current_port", { length: 10 }),
    currentStatus: varchar("current_status", { length: 20 })
      .notNull()
      .default("available"),
    lastMovementDate: timestamp("last_movement_date", { withTimezone: true }),
    lastSurveyDate: timestamp("last_survey_date", { withTimezone: true }),
    buildDate: timestamp("build_date", { withTimezone: true }),
    manufacturer: varchar("manufacturer", { length: 255 }),
    tareWeightKg: integer("tare_weight_kg"),
    maxGrossWeightKg: integer("max_gross_weight_kg"),
    capacityCbm: numeric("capacity_cbm", { precision: 8, scale: 2 }),
    metadata: jsonb("metadata"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("eqy_container_fleet_tenant_id_idx").on(table.tenantId),
    index("eqy_container_fleet_container_number_idx").on(table.containerNumber),
    index("eqy_container_fleet_current_port_idx").on(table.currentPort),
    index("eqy_container_fleet_current_status_idx").on(table.currentStatus),
    index("eqy_container_fleet_ownership_type_idx").on(table.ownershipType),
    index("eqy_container_fleet_status_idx").on(table.status),
    index("eqy_container_fleet_type_code_idx").on(table.typeCode),
  ]
);

// ==========================================
// FEAT-010-1-002: Container Repositioning Planning
// ==========================================

export const eqyRepositioningPlans = pgTable(
  "eqy_repositioning_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    planReference: varchar("plan_reference", { length: 50 }).notNull(),
    containerFleetId: uuid("container_fleet_id")
      .references(() => eqyContainerFleet.id),
    containerNumber: varchar("container_number", { length: 20 }),
    fromPort: varchar("from_port", { length: 255 }).notNull(),
    toPort: varchar("to_port", { length: 255 }).notNull(),
    tradeLane: varchar("trade_lane", { length: 100 }),
    estimatedCost: integer("estimated_cost"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    transportMode: varchar("transport_mode", { length: 20 })
      .notNull()
      .default("vessel"),
    scheduledDate: timestamp("scheduled_date", { withTimezone: true }),
    completedDate: timestamp("completed_date", { withTimezone: true }),
    reason: varchar("reason", { length: 30 }).notNull().default("demand"),
    containerType: varchar("container_type", { length: 20 }),
    containerSize: varchar("container_size", { length: 10 }),
    quantity: integer("quantity").default(1),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("eqy_repositioning_plans_tenant_id_idx").on(table.tenantId),
    index("eqy_repositioning_plans_ref_idx").on(table.planReference),
    index("eqy_repositioning_plans_fleet_idx").on(table.containerFleetId),
    index("eqy_repositioning_plans_from_port_idx").on(table.fromPort),
    index("eqy_repositioning_plans_to_port_idx").on(table.toPort),
    index("eqy_repositioning_plans_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-010-1-003: Reefer Container Management
// ==========================================

export const eqyReeferContainers = pgTable(
  "eqy_reefer_containers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    containerFleetId: uuid("container_fleet_id")
      .references(() => eqyContainerFleet.id),
    containerNumber: varchar("container_number", { length: 20 }).notNull(),
    reeferUnitModel: varchar("reefer_unit_model", { length: 100 }),
    reeferUnitSerial: varchar("reefer_unit_serial", { length: 100 }),
    setTemperature: numeric("set_temperature", { precision: 5, scale: 1 }),
    minTemperature: numeric("min_temperature", { precision: 5, scale: 1 }),
    maxTemperature: numeric("max_temperature", { precision: 5, scale: 1 }),
    humidity: numeric("humidity", { precision: 5, scale: 1 }),
    ventilation: varchar("ventilation", { length: 20 }),
    atmosphere: varchar("atmosphere", { length: 20 }).default("normal"),
    lastPtiDate: timestamp("last_pti_date", { withTimezone: true }),
    nextPtiDue: timestamp("next_pti_due", { withTimezone: true }),
    powerStatus: varchar("power_status", { length: 20 }).default("off"),
    currentTemperature: numeric("current_temperature", {
      precision: 5,
      scale: 1,
    }),
    fuelType: varchar("fuel_type", { length: 20 }),
    gensetRequired: boolean("genset_required").default(false),
    metadata: jsonb("metadata"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("eqy_reefer_containers_tenant_id_idx").on(table.tenantId),
    index("eqy_reefer_containers_fleet_idx").on(table.containerFleetId),
    index("eqy_reefer_containers_container_idx").on(table.containerNumber),
    index("eqy_reefer_containers_power_status_idx").on(table.powerStatus),
    index("eqy_reefer_containers_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-010-1-004: Container Maintenance & Repair MNR
// ==========================================

export const eqyMaintenanceRepairs = pgTable(
  "eqy_maintenance_repairs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    containerFleetId: uuid("container_fleet_id")
      .references(() => eqyContainerFleet.id),
    containerNumber: varchar("container_number", { length: 20 }).notNull(),
    mnrReference: varchar("mnr_reference", { length: 50 }).notNull(),
    repairType: varchar("repair_type", { length: 30 })
      .notNull()
      .default("structural"),
    damageCode: varchar("damage_code", { length: 20 }),
    damageLocation: varchar("damage_location", { length: 100 }),
    damageDescription: text("damage_description"),
    estimatedCost: integer("estimated_cost"),
    actualCost: integer("actual_cost"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    repairVendor: varchar("repair_vendor", { length: 255 }),
    depotCode: varchar("depot_code", { length: 20 }),
    depotName: varchar("depot_name", { length: 255 }),
    inspectionDate: timestamp("inspection_date", { withTimezone: true }),
    repairStartDate: timestamp("repair_start_date", { withTimezone: true }),
    repairCompleteDate: timestamp("repair_complete_date", {
      withTimezone: true,
    }),
    approvalStatus: varchar("approval_status", { length: 20 }).default(
      "pending"
    ),
    metadata: jsonb("metadata"),
    status: varchar("status", { length: 20 }).notNull().default("reported"),
    notes: text("notes"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("eqy_maintenance_repairs_tenant_id_idx").on(table.tenantId),
    index("eqy_maintenance_repairs_fleet_idx").on(table.containerFleetId),
    index("eqy_maintenance_repairs_container_idx").on(table.containerNumber),
    index("eqy_maintenance_repairs_ref_idx").on(table.mnrReference),
    index("eqy_maintenance_repairs_repair_type_idx").on(table.repairType),
    index("eqy_maintenance_repairs_status_idx").on(table.status),
    index("eqy_maintenance_repairs_approval_idx").on(table.approvalStatus),
  ]
);

// ==========================================
// FEAT-010-2-001: Yard Planning & Slot Allocation
// ==========================================

export const eqyYardSlots = pgTable(
  "eqy_yard_slots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    yardCode: varchar("yard_code", { length: 20 }).notNull(),
    yardName: varchar("yard_name", { length: 255 }).notNull(),
    terminalCode: varchar("terminal_code", { length: 20 }),
    blockCode: varchar("block_code", { length: 20 }),
    bayCode: varchar("bay_code", { length: 20 }),
    rowCode: varchar("row_code", { length: 20 }),
    tierCode: varchar("tier_code", { length: 20 }),
    slotCapacity: integer("slot_capacity").default(1),
    currentOccupancy: integer("current_occupancy").default(0),
    slotType: varchar("slot_type", { length: 20 }).notNull().default("dry"),
    assignedContainerNumber: varchar("assigned_container_number", {
      length: 20,
    }),
    assignedContainerId: uuid("assigned_container_id").references(
      () => eqyContainerFleet.id
    ),
    reservedFor: varchar("reserved_for", { length: 255 }),
    reservedUntil: timestamp("reserved_until", { withTimezone: true }),
    metadata: jsonb("metadata"),
    status: varchar("status", { length: 20 }).notNull().default("available"),
    notes: text("notes"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("eqy_yard_slots_tenant_id_idx").on(table.tenantId),
    index("eqy_yard_slots_yard_code_idx").on(table.yardCode),
    index("eqy_yard_slots_terminal_code_idx").on(table.terminalCode),
    index("eqy_yard_slots_slot_type_idx").on(table.slotType),
    index("eqy_yard_slots_assigned_container_idx").on(
      table.assignedContainerId
    ),
    index("eqy_yard_slots_status_idx").on(table.status),
    index("eqy_yard_slots_position_idx").on(
      table.blockCode,
      table.bayCode,
      table.rowCode,
      table.tierCode
    ),
  ]
);

// ==========================================
// FEAT-010-2-002: Gate In Out CODECO Management
// ==========================================

export const eqyGateMovements = pgTable(
  "eqy_gate_movements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    movementReference: varchar("movement_reference", { length: 50 }).notNull(),
    movementType: varchar("movement_type", { length: 20 }).notNull(),
    containerNumber: varchar("container_number", { length: 20 }).notNull(),
    containerFleetId: uuid("container_fleet_id").references(
      () => eqyContainerFleet.id
    ),
    vehiclePlate: varchar("vehicle_plate", { length: 20 }),
    driverName: varchar("driver_name", { length: 255 }),
    transportCompany: varchar("transport_company", { length: 255 }),
    sealNumber: varchar("seal_number", { length: 50 }),
    vgmWeightKg: integer("vgm_weight_kg"),
    gateCode: varchar("gate_code", { length: 20 }),
    laneNumber: varchar("lane_number", { length: 10 }),
    inspectionResult: varchar("inspection_result", { length: 20 }).default(
      "pending"
    ),
    codecoMessageId: varchar("codeco_message_id", { length: 50 }),
    ediReference: varchar("edi_reference", { length: 100 }),
    movementTimestamp: timestamp("movement_timestamp", { withTimezone: true }),
    metadata: jsonb("metadata"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    notes: text("notes"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("eqy_gate_movements_tenant_id_idx").on(table.tenantId),
    index("eqy_gate_movements_ref_idx").on(table.movementReference),
    index("eqy_gate_movements_type_idx").on(table.movementType),
    index("eqy_gate_movements_container_idx").on(table.containerNumber),
    index("eqy_gate_movements_fleet_idx").on(table.containerFleetId),
    index("eqy_gate_movements_status_idx").on(table.status),
    index("eqy_gate_movements_timestamp_idx").on(table.movementTimestamp),
  ]
);

// ==========================================
// FEAT-010-2-003: Equipment Interchange Management
// ==========================================

export const eqyEquipmentInterchanges = pgTable(
  "eqy_equipment_interchanges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    interchangeReference: varchar("interchange_reference", {
      length: 50,
    }).notNull(),
    interchangeType: varchar("interchange_type", { length: 20 }).notNull(),
    containerNumber: varchar("container_number", { length: 20 }).notNull(),
    containerFleetId: uuid("container_fleet_id").references(
      () => eqyContainerFleet.id
    ),
    partyFrom: varchar("party_from", { length: 255 }).notNull(),
    partyTo: varchar("party_to", { length: 255 }).notNull(),
    locationCode: varchar("location_code", { length: 20 }),
    locationName: varchar("location_name", { length: 255 }),
    interchangeDate: timestamp("interchange_date", {
      withTimezone: true,
    }).notNull(),
    conditionIn: varchar("condition_in", { length: 20 }),
    conditionOut: varchar("condition_out", { length: 20 }),
    damageRemarks: text("damage_remarks"),
    liabilityParty: varchar("liability_party", { length: 255 }),
    receiptNumber: varchar("receipt_number", { length: 50 }),
    metadata: jsonb("metadata"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("eqy_equipment_interchanges_tenant_id_idx").on(table.tenantId),
    index("eqy_equipment_interchanges_ref_idx").on(table.interchangeReference),
    index("eqy_equipment_interchanges_type_idx").on(table.interchangeType),
    index("eqy_equipment_interchanges_container_idx").on(table.containerNumber),
    index("eqy_equipment_interchanges_fleet_idx").on(table.containerFleetId),
    index("eqy_equipment_interchanges_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-010-2-004: On-Hire Off-Hire Container Management
// ==========================================

export const eqyOnHireOffHire = pgTable(
  "eqy_on_hire_off_hire",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    contractReference: varchar("contract_reference", { length: 50 }).notNull(),
    containerNumber: varchar("container_number", { length: 20 }).notNull(),
    containerFleetId: uuid("container_fleet_id").references(
      () => eqyContainerFleet.id
    ),
    lessorName: varchar("lessor_name", { length: 255 }),
    lesseeName: varchar("lessee_name", { length: 255 }),
    hireType: varchar("hire_type", { length: 20 }).notNull(),
    onHireDate: timestamp("on_hire_date", { withTimezone: true }).notNull(),
    offHireDate: timestamp("off_hire_date", { withTimezone: true }),
    onHireLocation: varchar("on_hire_location", { length: 255 }),
    offHireLocation: varchar("off_hire_location", { length: 255 }),
    dailyRate: integer("daily_rate"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    totalDays: integer("total_days"),
    totalCost: integer("total_cost"),
    conditionOnHire: varchar("condition_on_hire", { length: 20 }),
    conditionOffHire: varchar("condition_off_hire", { length: 20 }),
    damageCharges: integer("damage_charges"),
    cleaningCharges: integer("cleaning_charges"),
    metadata: jsonb("metadata"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("eqy_on_hire_off_hire_tenant_id_idx").on(table.tenantId),
    index("eqy_on_hire_off_hire_ref_idx").on(table.contractReference),
    index("eqy_on_hire_off_hire_container_idx").on(table.containerNumber),
    index("eqy_on_hire_off_hire_fleet_idx").on(table.containerFleetId),
    index("eqy_on_hire_off_hire_hire_type_idx").on(table.hireType),
    index("eqy_on_hire_off_hire_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-010-3-001: Container Survey & Inspection Management
// ==========================================

export const eqyContainerSurveys = pgTable(
  "eqy_container_surveys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    surveyReference: varchar("survey_reference", { length: 50 }).notNull(),
    containerNumber: varchar("container_number", { length: 20 }).notNull(),
    containerFleetId: uuid("container_fleet_id").references(
      () => eqyContainerFleet.id
    ),
    surveyType: varchar("survey_type", { length: 30 })
      .notNull()
      .default("condition"),
    surveyorName: varchar("surveyor_name", { length: 255 }),
    surveyCompany: varchar("survey_company", { length: 255 }),
    surveyDate: timestamp("survey_date", { withTimezone: true }).notNull(),
    surveyLocation: varchar("survey_location", { length: 255 }),
    overallCondition: varchar("overall_condition", { length: 20 }),
    structuralGrade: varchar("structural_grade", { length: 5 }),
    floorGrade: varchar("floor_grade", { length: 5 }),
    roofGrade: varchar("roof_grade", { length: 5 }),
    doorGrade: varchar("door_grade", { length: 5 }),
    damageFindings: jsonb("damage_findings"),
    photos: jsonb("photos"),
    nextSurveyDue: timestamp("next_survey_due", { withTimezone: true }),
    metadata: jsonb("metadata"),
    status: varchar("status", { length: 20 }).notNull().default("scheduled"),
    notes: text("notes"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("eqy_container_surveys_tenant_id_idx").on(table.tenantId),
    index("eqy_container_surveys_ref_idx").on(table.surveyReference),
    index("eqy_container_surveys_container_idx").on(table.containerNumber),
    index("eqy_container_surveys_fleet_idx").on(table.containerFleetId),
    index("eqy_container_surveys_survey_type_idx").on(table.surveyType),
    index("eqy_container_surveys_condition_idx").on(table.overallCondition),
    index("eqy_container_surveys_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-010-3-002: Leased Container Portfolio Management
// ==========================================

export const eqyLeasedContainers = pgTable(
  "eqy_leased_containers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    leaseReference: varchar("lease_reference", { length: 50 }).notNull(),
    containerFleetId: uuid("container_fleet_id").references(
      () => eqyContainerFleet.id
    ),
    containerNumber: varchar("container_number", { length: 20 }).notNull(),
    lessorName: varchar("lessor_name", { length: 255 }).notNull(),
    lessorCode: varchar("lessor_code", { length: 20 }),
    leaseType: varchar("lease_type", { length: 20 })
      .notNull()
      .default("master"),
    leaseStartDate: timestamp("lease_start_date", {
      withTimezone: true,
    }).notNull(),
    leaseEndDate: timestamp("lease_end_date", { withTimezone: true }),
    dailyRate: integer("daily_rate"),
    monthlyRate: integer("monthly_rate"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    billingCycle: varchar("billing_cycle", { length: 20 }).default("monthly"),
    pickUpLocation: varchar("pick_up_location", { length: 255 }),
    dropOffLocation: varchar("drop_off_location", { length: 255 }),
    contractTerms: jsonb("contract_terms"),
    minimumLeaseDays: integer("minimum_lease_days"),
    penaltyRate: integer("penalty_rate"),
    metadata: jsonb("metadata"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("eqy_leased_containers_tenant_id_idx").on(table.tenantId),
    index("eqy_leased_containers_ref_idx").on(table.leaseReference),
    index("eqy_leased_containers_fleet_idx").on(table.containerFleetId),
    index("eqy_leased_containers_container_idx").on(table.containerNumber),
    index("eqy_leased_containers_lessor_idx").on(table.lessorName),
    index("eqy_leased_containers_lease_type_idx").on(table.leaseType),
    index("eqy_leased_containers_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-010-3-003: Container Availability Planning AI
// ==========================================

export const eqyAvailabilityPlans = pgTable(
  "eqy_availability_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    planReference: varchar("plan_reference", { length: 50 }).notNull(),
    tradeLane: varchar("trade_lane", { length: 100 }),
    originPort: varchar("origin_port", { length: 255 }),
    destinationPort: varchar("destination_port", { length: 255 }),
    containerType: varchar("container_type", { length: 20 }),
    containerSize: varchar("container_size", { length: 10 }),
    forecastPeriodStart: timestamp("forecast_period_start", {
      withTimezone: true,
    }).notNull(),
    forecastPeriodEnd: timestamp("forecast_period_end", {
      withTimezone: true,
    }).notNull(),
    availableUnits: integer("available_units"),
    demandForecast: integer("demand_forecast"),
    surplusDeficit: integer("surplus_deficit"),
    recommendedAction: varchar("recommended_action", { length: 30 }),
    aiConfidence: numeric("ai_confidence", { precision: 5, scale: 2 }),
    aiModel: varchar("ai_model", { length: 100 }),
    executedAction: varchar("executed_action", { length: 30 }),
    executionDate: timestamp("execution_date", { withTimezone: true }),
    metadata: jsonb("metadata"),
    status: varchar("status", { length: 20 }).notNull().default("forecast"),
    notes: text("notes"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("eqy_availability_plans_tenant_id_idx").on(table.tenantId),
    index("eqy_availability_plans_ref_idx").on(table.planReference),
    index("eqy_availability_plans_trade_lane_idx").on(table.tradeLane),
    index("eqy_availability_plans_period_idx").on(
      table.forecastPeriodStart,
      table.forecastPeriodEnd
    ),
    index("eqy_availability_plans_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-010-3-004: AI Empty Repositioning Optimizer
// ==========================================

export const eqyRepositioningOptimizations = pgTable(
  "eqy_repositioning_optimizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    optimizationRunId: varchar("optimization_run_id", { length: 50 }),
    planReference: varchar("plan_reference", { length: 50 }),
    originPort: varchar("origin_port", { length: 255 }).notNull(),
    destinationPort: varchar("destination_port", { length: 255 }).notNull(),
    containerType: varchar("container_type", { length: 20 }),
    containerSize: varchar("container_size", { length: 10 }),
    quantity: integer("quantity").default(1),
    transportMode: varchar("transport_mode", { length: 20 }).default("vessel"),
    estimatedCost: integer("estimated_cost"),
    estimatedDays: integer("estimated_days"),
    estimatedCarbon: numeric("estimated_carbon", { precision: 10, scale: 2 }),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    aiScore: numeric("ai_score", { precision: 5, scale: 2 }),
    aiModel: varchar("ai_model", { length: 100 }),
    algorithm: varchar("algorithm", { length: 50 }).default("genetic"),
    inputParameters: jsonb("input_parameters"),
    results: jsonb("results"),
    alternatives: jsonb("alternatives"),
    selectedForExecution: boolean("selected_for_execution").default(false),
    executionDate: timestamp("execution_date", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    notes: text("notes"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("eqy_repositioning_optimizations_tenant_id_idx").on(table.tenantId),
    index("eqy_repositioning_optimizations_run_idx").on(
      table.optimizationRunId
    ),
    index("eqy_repositioning_optimizations_origin_idx").on(table.originPort),
    index("eqy_repositioning_optimizations_dest_idx").on(table.destinationPort),
    index("eqy_repositioning_optimizations_status_idx").on(table.status),
    index("eqy_repositioning_optimizations_algorithm_idx").on(table.algorithm),
  ]
);
