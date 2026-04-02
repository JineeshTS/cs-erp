import {
  pgTable,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// FEAT-013-1-001: Bunker Procurement & Ordering
// ==========================================

export const bfmBunkerOrders = pgTable(
  "bfm_bunker_orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    orderRef: varchar("order_ref", { length: 50 }).notNull(),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    vesselImo: varchar("vessel_imo", { length: 20 }),
    voyageRef: varchar("voyage_ref", { length: 50 }),
    supplierName: varchar("supplier_name", { length: 255 }).notNull(),
    supplierCode: varchar("supplier_code", { length: 50 }),
    port: varchar("port", { length: 50 }).notNull(),
    deliveryDate: timestamp("delivery_date", { withTimezone: true }),
    fuelType: varchar("fuel_type", { length: 30 }).notNull(),
    fuelGrade: varchar("fuel_grade", { length: 30 }),
    quantityOrdered: integer("quantity_ordered").notNull(),
    quantityDelivered: integer("quantity_delivered"),
    unit: varchar("unit", { length: 10 }).notNull().default("MT"),
    pricePerUnit: integer("price_per_unit"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    totalAmount: integer("total_amount"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    paymentTerms: varchar("payment_terms", { length: 100 }),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("bfm_orders_tenant_id_idx").on(table.tenantId),
    uniqueIndex("bfm_orders_tenant_ref_idx").on(table.tenantId, table.orderRef),
    index("bfm_orders_vessel_idx").on(table.vesselName),
    index("bfm_orders_supplier_idx").on(table.supplierName),
    index("bfm_orders_port_idx").on(table.port),
    index("bfm_orders_fuel_type_idx").on(table.fuelType),
    index("bfm_orders_status_idx").on(table.status),
    index("bfm_orders_delivery_date_idx").on(table.deliveryDate),
  ]
);

// ==========================================
// FEAT-013-1-002: Bunker Stem & Supply Planning
// ==========================================

export const bfmBunkerStems = pgTable(
  "bfm_bunker_stems",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    stemRef: varchar("stem_ref", { length: 50 }).notNull(),
    orderId: uuid("order_id")
      .references(() => bfmBunkerOrders.id),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    vesselImo: varchar("vessel_imo", { length: 20 }),
    port: varchar("port", { length: 50 }).notNull(),
    berth: varchar("berth", { length: 50 }),
    supplierName: varchar("supplier_name", { length: 255 }),
    bargeName: varchar("barge_name", { length: 255 }),
    fuelType: varchar("fuel_type", { length: 30 }).notNull(),
    fuelGrade: varchar("fuel_grade", { length: 30 }),
    quantityNominated: integer("quantity_nominated").notNull(),
    quantityDelivered: integer("quantity_delivered"),
    unit: varchar("unit", { length: 10 }).notNull().default("MT"),
    deliveryWindowStart: timestamp("delivery_window_start", { withTimezone: true }),
    deliveryWindowEnd: timestamp("delivery_window_end", { withTimezone: true }),
    actualDeliveryStart: timestamp("actual_delivery_start", { withTimezone: true }),
    actualDeliveryEnd: timestamp("actual_delivery_end", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("planned"),
    pumpingRate: integer("pumping_rate"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("bfm_stems_tenant_id_idx").on(table.tenantId),
    uniqueIndex("bfm_stems_tenant_ref_idx").on(table.tenantId, table.stemRef),
    index("bfm_stems_order_id_idx").on(table.orderId),
    index("bfm_stems_vessel_idx").on(table.vesselName),
    index("bfm_stems_port_idx").on(table.port),
    index("bfm_stems_fuel_type_idx").on(table.fuelType),
    index("bfm_stems_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-013-1-003: Bunker Quality Management & Claims
// ==========================================

export const bfmQualityTests = pgTable(
  "bfm_quality_tests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    testRef: varchar("test_ref", { length: 50 }).notNull(),
    stemId: uuid("stem_id")
      .references(() => bfmBunkerStems.id),
    orderId: uuid("order_id")
      .references(() => bfmBunkerOrders.id),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    sampleDate: timestamp("sample_date", { withTimezone: true }).notNull(),
    labName: varchar("lab_name", { length: 255 }),
    fuelType: varchar("fuel_type", { length: 30 }).notNull(),
    density: integer("density"),
    viscosity: integer("viscosity"),
    sulphurContent: integer("sulphur_content"),
    flashPoint: integer("flash_point"),
    waterContent: integer("water_content"),
    ashContent: integer("ash_content"),
    calorificValue: integer("calorific_value"),
    testResults: jsonb("test_results"),
    isoCompliant: boolean("iso_compliant"),
    marpolCompliant: boolean("marpol_compliant"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("bfm_quality_tenant_id_idx").on(table.tenantId),
    uniqueIndex("bfm_quality_tenant_ref_idx").on(table.tenantId, table.testRef),
    index("bfm_quality_stem_id_idx").on(table.stemId),
    index("bfm_quality_order_id_idx").on(table.orderId),
    index("bfm_quality_vessel_idx").on(table.vesselName),
    index("bfm_quality_fuel_type_idx").on(table.fuelType),
    index("bfm_quality_status_idx").on(table.status),
  ]
);

export const bfmQualityClaims = pgTable(
  "bfm_quality_claims",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    claimRef: varchar("claim_ref", { length: 50 }).notNull(),
    testId: uuid("test_id")
      .references(() => bfmQualityTests.id),
    orderId: uuid("order_id")
      .references(() => bfmBunkerOrders.id),
    supplierName: varchar("supplier_name", { length: 255 }).notNull(),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    claimType: varchar("claim_type", { length: 30 }).notNull(),
    claimDescription: text("claim_description").notNull(),
    claimAmount: integer("claim_amount"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    quantityDisputed: integer("quantity_disputed"),
    status: varchar("status", { length: 20 }).notNull().default("open"),
    filedAt: timestamp("filed_at", { withTimezone: true }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolutionNotes: text("resolution_notes"),
    settlementAmount: integer("settlement_amount"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("bfm_claims_tenant_id_idx").on(table.tenantId),
    uniqueIndex("bfm_claims_tenant_ref_idx").on(table.tenantId, table.claimRef),
    index("bfm_claims_test_id_idx").on(table.testId),
    index("bfm_claims_order_id_idx").on(table.orderId),
    index("bfm_claims_supplier_idx").on(table.supplierName),
    index("bfm_claims_type_idx").on(table.claimType),
    index("bfm_claims_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-013-1-004: Fuel ROB Tracking & Reconciliation
// ==========================================

export const bfmFuelRobRecords = pgTable(
  "bfm_fuel_rob_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    vesselImo: varchar("vessel_imo", { length: 20 }),
    voyageRef: varchar("voyage_ref", { length: 50 }),
    reportDate: timestamp("report_date", { withTimezone: true }).notNull(),
    fuelType: varchar("fuel_type", { length: 30 }).notNull(),
    robQuantity: integer("rob_quantity").notNull(),
    unit: varchar("unit", { length: 10 }).notNull().default("MT"),
    consumptionDaily: integer("consumption_daily"),
    consumptionVoyage: integer("consumption_voyage"),
    receivedQuantity: integer("received_quantity"),
    transferredQuantity: integer("transferred_quantity"),
    location: varchar("location", { length: 100 }),
    portCode: varchar("port_code", { length: 20 }),
    reportType: varchar("report_type", { length: 20 }).notNull().default("noon"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("bfm_rob_tenant_id_idx").on(table.tenantId),
    index("bfm_rob_vessel_idx").on(table.vesselName),
    index("bfm_rob_voyage_idx").on(table.voyageRef),
    index("bfm_rob_fuel_type_idx").on(table.fuelType),
    index("bfm_rob_report_date_idx").on(table.reportDate),
    index("bfm_rob_report_type_idx").on(table.reportType),
  ]
);

export const bfmFuelReconciliations = pgTable(
  "bfm_fuel_reconciliations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    reconciliationRef: varchar("reconciliation_ref", { length: 50 }).notNull(),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    vesselImo: varchar("vessel_imo", { length: 20 }),
    voyageRef: varchar("voyage_ref", { length: 50 }),
    fuelType: varchar("fuel_type", { length: 30 }).notNull(),
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
    openingRob: integer("opening_rob").notNull(),
    closingRob: integer("closing_rob").notNull(),
    totalReceived: integer("total_received").notNull().default(0),
    totalConsumed: integer("total_consumed").notNull().default(0),
    totalTransferred: integer("total_transferred").notNull().default(0),
    variance: integer("variance"),
    variancePercent: integer("variance_percent"),
    unit: varchar("unit", { length: 10 }).notNull().default("MT"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    reconciledAt: timestamp("reconciled_at", { withTimezone: true }),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("bfm_recon_tenant_id_idx").on(table.tenantId),
    uniqueIndex("bfm_recon_tenant_ref_idx").on(table.tenantId, table.reconciliationRef),
    index("bfm_recon_vessel_idx").on(table.vesselName),
    index("bfm_recon_voyage_idx").on(table.voyageRef),
    index("bfm_recon_fuel_type_idx").on(table.fuelType),
    index("bfm_recon_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-013-2-001: EEXI CII Emissions Compliance
// ==========================================

export const bfmEmissionsRecords = pgTable(
  "bfm_emissions_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    recordRef: varchar("record_ref", { length: 50 }).notNull(),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    vesselImo: varchar("vessel_imo", { length: 20 }),
    voyageRef: varchar("voyage_ref", { length: 50 }),
    reportingPeriod: varchar("reporting_period", { length: 20 }).notNull(),
    reportYear: integer("report_year").notNull(),
    co2Emissions: integer("co2_emissions"),
    noxEmissions: integer("nox_emissions"),
    soxEmissions: integer("sox_emissions"),
    eexiValue: integer("eexi_value"),
    eexiRequired: integer("eexi_required"),
    eexiCompliant: boolean("eexi_compliant"),
    ciiRating: varchar("cii_rating", { length: 5 }),
    ciiValue: integer("cii_value"),
    ciiRequired: integer("cii_required"),
    distanceTravelled: integer("distance_travelled"),
    cargoCarried: integer("cargo_carried"),
    fuelConsumed: jsonb("fuel_consumed"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("bfm_emissions_tenant_id_idx").on(table.tenantId),
    uniqueIndex("bfm_emissions_tenant_ref_idx").on(table.tenantId, table.recordRef),
    index("bfm_emissions_vessel_idx").on(table.vesselName),
    index("bfm_emissions_voyage_idx").on(table.voyageRef),
    index("bfm_emissions_year_idx").on(table.reportYear),
    index("bfm_emissions_cii_idx").on(table.ciiRating),
    index("bfm_emissions_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-013-2-002: Low Sulphur Fuel Management
// ==========================================

export const bfmSulphurRecords = pgTable(
  "bfm_sulphur_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    recordRef: varchar("record_ref", { length: 50 }).notNull(),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    vesselImo: varchar("vessel_imo", { length: 20 }),
    port: varchar("port", { length: 50 }),
    fuelType: varchar("fuel_type", { length: 30 }).notNull(),
    sulphurContentActual: integer("sulphur_content_actual").notNull(),
    sulphurLimit: integer("sulphur_limit").notNull(),
    isCompliant: boolean("is_compliant").notNull(),
    ecaZone: varchar("eca_zone", { length: 50 }),
    scrubberEquipped: boolean("scrubber_equipped").notNull().default(false),
    scrubberOperational: boolean("scrubber_operational"),
    changoverDate: timestamp("changeover_date", { withTimezone: true }),
    changoverPort: varchar("changeover_port", { length: 50 }),
    changoverFromFuel: varchar("changeover_from_fuel", { length: 30 }),
    changoverToFuel: varchar("changeover_to_fuel", { length: 30 }),
    bdn: jsonb("bdn"),
    status: varchar("status", { length: 20 }).notNull().default("recorded"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("bfm_sulphur_tenant_id_idx").on(table.tenantId),
    uniqueIndex("bfm_sulphur_tenant_ref_idx").on(table.tenantId, table.recordRef),
    index("bfm_sulphur_vessel_idx").on(table.vesselName),
    index("bfm_sulphur_fuel_type_idx").on(table.fuelType),
    index("bfm_sulphur_compliant_idx").on(table.isCompliant),
    index("bfm_sulphur_eca_idx").on(table.ecaZone),
    index("bfm_sulphur_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-013-2-003: Bunker Cost Allocation per Voyage
// ==========================================

export const bfmCostAllocations = pgTable(
  "bfm_cost_allocations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    allocationRef: varchar("allocation_ref", { length: 50 }).notNull(),
    voyageRef: varchar("voyage_ref", { length: 50 }).notNull(),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    vesselImo: varchar("vessel_imo", { length: 20 }),
    orderId: uuid("order_id")
      .references(() => bfmBunkerOrders.id),
    fuelType: varchar("fuel_type", { length: 30 }).notNull(),
    quantityAllocated: integer("quantity_allocated").notNull(),
    unit: varchar("unit", { length: 10 }).notNull().default("MT"),
    costPerUnit: integer("cost_per_unit").notNull(),
    totalCost: integer("total_cost").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    allocationMethod: varchar("allocation_method", { length: 30 }).notNull(),
    legFrom: varchar("leg_from", { length: 50 }),
    legTo: varchar("leg_to", { length: 50 }),
    percentageOfVoyage: integer("percentage_of_voyage"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    approvedBy: uuid("approved_by"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("bfm_alloc_tenant_id_idx").on(table.tenantId),
    uniqueIndex("bfm_alloc_tenant_ref_idx").on(table.tenantId, table.allocationRef),
    index("bfm_alloc_voyage_idx").on(table.voyageRef),
    index("bfm_alloc_vessel_idx").on(table.vesselName),
    index("bfm_alloc_order_id_idx").on(table.orderId),
    index("bfm_alloc_fuel_type_idx").on(table.fuelType),
    index("bfm_alloc_method_idx").on(table.allocationMethod),
    index("bfm_alloc_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-013-2-004: AI Bunker Optimization Engine
// ==========================================

export const bfmOptimizationRuns = pgTable(
  "bfm_optimization_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    runRef: varchar("run_ref", { length: 50 }).notNull(),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    vesselImo: varchar("vessel_imo", { length: 20 }),
    voyageRef: varchar("voyage_ref", { length: 50 }),
    optimizationType: varchar("optimization_type", { length: 30 }).notNull(),
    inputParameters: jsonb("input_parameters").notNull(),
    constraints: jsonb("constraints"),
    recommendations: jsonb("recommendations"),
    potentialSavings: integer("potential_savings"),
    savingsCurrency: varchar("savings_currency", { length: 3 }).notNull().default("USD"),
    optimalPort: varchar("optimal_port", { length: 50 }),
    optimalFuelType: varchar("optimal_fuel_type", { length: 30 }),
    optimalQuantity: integer("optimal_quantity"),
    optimalSupplier: varchar("optimal_supplier", { length: 255 }),
    confidenceScore: integer("confidence_score"),
    modelVersion: varchar("model_version", { length: 20 }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    acceptedBy: uuid("accepted_by"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("bfm_optim_tenant_id_idx").on(table.tenantId),
    uniqueIndex("bfm_optim_tenant_ref_idx").on(table.tenantId, table.runRef),
    index("bfm_optim_vessel_idx").on(table.vesselName),
    index("bfm_optim_voyage_idx").on(table.voyageRef),
    index("bfm_optim_type_idx").on(table.optimizationType),
    index("bfm_optim_status_idx").on(table.status),
  ]
);
