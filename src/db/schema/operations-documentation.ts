import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  date,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// FEAT-009-1-001: Bill of Lading Management
// ==========================================

export const odmBillsOfLading = pgTable(
  "odm_bills_of_lading",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    blNumber: varchar("bl_number", { length: 50 }).notNull(),
    blType: varchar("bl_type", { length: 30 }).notNull().default("original"),
    blStatus: varchar("bl_status", { length: 30 }).notNull().default("draft"),
    bookingReference: varchar("booking_reference", { length: 50 }),
    shipperId: uuid("shipper_id"),
    shipperName: varchar("shipper_name", { length: 255 }).notNull(),
    shipperAddress: text("shipper_address"),
    consigneeId: uuid("consignee_id"),
    consigneeName: varchar("consignee_name", { length: 255 }).notNull(),
    consigneeAddress: text("consignee_address"),
    notifyPartyName: varchar("notify_party_name", { length: 255 }),
    notifyPartyAddress: text("notify_party_address"),
    vesselName: varchar("vessel_name", { length: 100 }),
    voyageNumber: varchar("voyage_number", { length: 50 }),
    portOfLoading: varchar("port_of_loading", { length: 10 }),
    portOfDischarge: varchar("port_of_discharge", { length: 10 }),
    placeOfReceipt: varchar("place_of_receipt", { length: 100 }),
    placeOfDelivery: varchar("place_of_delivery", { length: 100 }),
    dateOfIssue: date("date_of_issue"),
    onBoardDate: date("on_board_date"),
    freightTerms: varchar("freight_terms", { length: 20 }).default("prepaid"),
    paymentTerms: varchar("payment_terms", { length: 30 }),
    numberOfOriginals: integer("number_of_originals").default(3),
    containerCount: integer("container_count"),
    grossWeight: integer("gross_weight"),
    weightUnit: varchar("weight_unit", { length: 5 }).default("KG"),
    volume: integer("volume"),
    volumeUnit: varchar("volume_unit", { length: 5 }).default("CBM"),
    cargoDescription: text("cargo_description"),
    marksAndNumbers: text("marks_and_numbers"),
    specialInstructions: text("special_instructions"),
    surrenderedAt: timestamp("surrendered_at", { withTimezone: true }),
    releasedAt: timestamp("released_at", { withTimezone: true }),
    printedAt: timestamp("printed_at", { withTimezone: true }),
    notes: text("notes"),
    metadata: jsonb("metadata"),
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
    index("odm_bl_tenant_id_idx").on(table.tenantId),
    uniqueIndex("odm_bl_tenant_number_idx").on(table.tenantId, table.blNumber),
    index("odm_bl_bl_type_idx").on(table.blType),
    index("odm_bl_bl_status_idx").on(table.blStatus),
    index("odm_bl_booking_ref_idx").on(table.bookingReference),
    index("odm_bl_vessel_name_idx").on(table.vesselName),
    index("odm_bl_port_loading_idx").on(table.portOfLoading),
    index("odm_bl_port_discharge_idx").on(table.portOfDischarge),
  ]
);

export const odmBlContainers = pgTable(
  "odm_bl_containers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    blId: uuid("bl_id")
      .notNull()
      .references(() => odmBillsOfLading.id),
    containerNumber: varchar("container_number", { length: 20 }).notNull(),
    sealNumber: varchar("seal_number", { length: 30 }),
    containerType: varchar("container_type", { length: 10 }),
    containerSize: varchar("container_size", { length: 5 }),
    grossWeight: integer("gross_weight"),
    tareWeight: integer("tare_weight"),
    netWeight: integer("net_weight"),
    volumeCbm: integer("volume_cbm"),
    packageCount: integer("package_count"),
    packageType: varchar("package_type", { length: 30 }),
    cargoDescription: text("cargo_description"),
    hsCode: varchar("hs_code", { length: 20 }),
    metadata: jsonb("metadata"),
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
    index("odm_bl_containers_tenant_id_idx").on(table.tenantId),
    index("odm_bl_containers_bl_id_idx").on(table.blId),
    index("odm_bl_containers_container_number_idx").on(table.containerNumber),
  ]
);

export const odmBlCharges = pgTable(
  "odm_bl_charges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    blId: uuid("bl_id")
      .notNull()
      .references(() => odmBillsOfLading.id),
    chargeCode: varchar("charge_code", { length: 30 }).notNull(),
    chargeName: varchar("charge_name", { length: 255 }).notNull(),
    chargeType: varchar("charge_type", { length: 20 }).notNull(),
    amount: integer("amount").notNull(),
    currency: varchar("currency", { length: 3 }).default("USD"),
    prepaidCollect: varchar("prepaid_collect", { length: 10 }).default("prepaid"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
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
    index("odm_bl_charges_tenant_id_idx").on(table.tenantId),
    index("odm_bl_charges_bl_id_idx").on(table.blId),
    index("odm_bl_charges_charge_code_idx").on(table.chargeCode),
  ]
);

// ==========================================
// FEAT-009-1-002: Manifest Preparation & Submission
// ==========================================

export const odmManifests = pgTable(
  "odm_manifests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    manifestNumber: varchar("manifest_number", { length: 50 }).notNull(),
    manifestType: varchar("manifest_type", { length: 30 }).notNull().default("export"),
    vesselName: varchar("vessel_name", { length: 100 }).notNull(),
    voyageNumber: varchar("voyage_number", { length: 50 }).notNull(),
    portOfLoading: varchar("port_of_loading", { length: 10 }),
    portOfDischarge: varchar("port_of_discharge", { length: 10 }),
    estimatedDeparture: timestamp("estimated_departure", { withTimezone: true }),
    estimatedArrival: timestamp("estimated_arrival", { withTimezone: true }),
    totalBls: integer("total_bls").default(0),
    totalContainers: integer("total_containers").default(0),
    totalWeight: integer("total_weight"),
    weightUnit: varchar("weight_unit", { length: 5 }).default("KG"),
    submittedTo: varchar("submitted_to", { length: 100 }),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    submittedBy: uuid("submitted_by"),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
    status: varchar("status", { length: 30 }).notNull().default("draft"),
    rejectionReason: text("rejection_reason"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
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
    index("odm_manifests_tenant_id_idx").on(table.tenantId),
    uniqueIndex("odm_manifests_tenant_number_idx").on(
      table.tenantId,
      table.manifestNumber
    ),
    index("odm_manifests_manifest_type_idx").on(table.manifestType),
    index("odm_manifests_vessel_name_idx").on(table.vesselName),
    index("odm_manifests_status_idx").on(table.status),
    index("odm_manifests_port_loading_idx").on(table.portOfLoading),
    index("odm_manifests_port_discharge_idx").on(table.portOfDischarge),
  ]
);

export const odmManifestItems = pgTable(
  "odm_manifest_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    manifestId: uuid("manifest_id")
      .notNull()
      .references(() => odmManifests.id),
    blId: uuid("bl_id").references(() => odmBillsOfLading.id),
    blNumber: varchar("bl_number", { length: 50 }),
    containerNumber: varchar("container_number", { length: 20 }),
    shipperName: varchar("shipper_name", { length: 255 }),
    consigneeName: varchar("consignee_name", { length: 255 }),
    cargoDescription: text("cargo_description"),
    hsCode: varchar("hs_code", { length: 20 }),
    packageCount: integer("package_count"),
    packageType: varchar("package_type", { length: 30 }),
    grossWeight: integer("gross_weight"),
    volumeCbm: integer("volume_cbm"),
    metadata: jsonb("metadata"),
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
    index("odm_manifest_items_tenant_id_idx").on(table.tenantId),
    index("odm_manifest_items_manifest_id_idx").on(table.manifestId),
    index("odm_manifest_items_bl_id_idx").on(table.blId),
    index("odm_manifest_items_container_number_idx").on(table.containerNumber),
  ]
);

// ==========================================
// FEAT-009-1-003: AMS ISF ICS2 Regulatory Filing
// ==========================================

export const odmRegulatoryFilings = pgTable(
  "odm_regulatory_filings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    filingReference: varchar("filing_reference", { length: 50 }).notNull(),
    filingType: varchar("filing_type", { length: 30 }).notNull(),
    regulatoryBody: varchar("regulatory_body", { length: 50 }).notNull(),
    country: varchar("country", { length: 3 }).notNull(),
    blId: uuid("bl_id").references(() => odmBillsOfLading.id),
    blNumber: varchar("bl_number", { length: 50 }),
    vesselName: varchar("vessel_name", { length: 100 }),
    voyageNumber: varchar("voyage_number", { length: 50 }),
    portOfLoading: varchar("port_of_loading", { length: 10 }),
    portOfDischarge: varchar("port_of_discharge", { length: 10 }),
    filingDeadline: timestamp("filing_deadline", { withTimezone: true }),
    filedAt: timestamp("filed_at", { withTimezone: true }),
    filedBy: uuid("filed_by"),
    responseReceivedAt: timestamp("response_received_at", { withTimezone: true }),
    responseCode: varchar("response_code", { length: 20 }),
    responseMessage: text("response_message"),
    status: varchar("status", { length: 30 }).notNull().default("pending"),
    retryCount: integer("retry_count").default(0),
    shipperName: varchar("shipper_name", { length: 255 }),
    consigneeName: varchar("consignee_name", { length: 255 }),
    sellerName: varchar("seller_name", { length: 255 }),
    buyerName: varchar("buyer_name", { length: 255 }),
    manufacturerName: varchar("manufacturer_name", { length: 255 }),
    hsCode: varchar("hs_code", { length: 20 }),
    cargoDescription: text("cargo_description"),
    containerNumber: varchar("container_number", { length: 20 }),
    sealNumber: varchar("seal_number", { length: 30 }),
    grossWeight: integer("gross_weight"),
    filingData: jsonb("filing_data"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
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
    index("odm_reg_filings_tenant_id_idx").on(table.tenantId),
    uniqueIndex("odm_reg_filings_tenant_ref_idx").on(
      table.tenantId,
      table.filingReference
    ),
    index("odm_reg_filings_filing_type_idx").on(table.filingType),
    index("odm_reg_filings_regulatory_body_idx").on(table.regulatoryBody),
    index("odm_reg_filings_country_idx").on(table.country),
    index("odm_reg_filings_bl_id_idx").on(table.blId),
    index("odm_reg_filings_status_idx").on(table.status),
    index("odm_reg_filings_filing_deadline_idx").on(table.filingDeadline),
  ]
);

// ==========================================
// FEAT-009-1-004: VGM Verified Gross Mass Management
// ==========================================

export const odmVgmRecords = pgTable(
  "odm_vgm_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    vgmReference: varchar("vgm_reference", { length: 50 }).notNull(),
    containerNumber: varchar("container_number", { length: 20 }).notNull(),
    blId: uuid("bl_id").references(() => odmBillsOfLading.id),
    blNumber: varchar("bl_number", { length: 50 }),
    bookingReference: varchar("booking_reference", { length: 50 }),
    weighingMethod: varchar("weighing_method", { length: 10 }).notNull(),
    verifiedGrossMass: integer("verified_gross_mass").notNull(),
    tareWeight: integer("tare_weight"),
    cargoWeight: integer("cargo_weight"),
    dunnageWeight: integer("dunnage_weight"),
    weightUnit: varchar("weight_unit", { length: 5 }).notNull().default("KG"),
    weighingDate: date("weighing_date").notNull(),
    weighingLocation: varchar("weighing_location", { length: 255 }),
    weighbridgeId: varchar("weighbridge_id", { length: 50 }),
    certifiedBy: varchar("certified_by", { length: 255 }).notNull(),
    certificationNumber: varchar("certification_number", { length: 100 }),
    shipperName: varchar("shipper_name", { length: 255 }),
    terminalName: varchar("terminal_name", { length: 255 }),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    submittedBy: uuid("submitted_by"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    status: varchar("status", { length: 30 }).notNull().default("pending"),
    discrepancyFlag: boolean("discrepancy_flag").notNull().default(false),
    discrepancyNotes: text("discrepancy_notes"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
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
    index("odm_vgm_tenant_id_idx").on(table.tenantId),
    uniqueIndex("odm_vgm_tenant_ref_idx").on(
      table.tenantId,
      table.vgmReference
    ),
    index("odm_vgm_container_number_idx").on(table.containerNumber),
    index("odm_vgm_bl_id_idx").on(table.blId),
    index("odm_vgm_status_idx").on(table.status),
    index("odm_vgm_weighing_method_idx").on(table.weighingMethod),
    index("odm_vgm_weighing_date_idx").on(table.weighingDate),
    index("odm_vgm_discrepancy_flag_idx").on(table.discrepancyFlag),
  ]
);

// ==========================================
// Supporting: Shipping Instructions
// ==========================================

export const odmShippingInstructions = pgTable(
  "odm_shipping_instructions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    siReference: varchar("si_reference", { length: 50 }).notNull(),
    blId: uuid("bl_id").references(() => odmBillsOfLading.id),
    bookingReference: varchar("booking_reference", { length: 50 }),
    customerId: uuid("customer_id"),
    customerName: varchar("customer_name", { length: 255 }),
    shipperName: varchar("shipper_name", { length: 255 }).notNull(),
    shipperAddress: text("shipper_address"),
    consigneeName: varchar("consignee_name", { length: 255 }).notNull(),
    consigneeAddress: text("consignee_address"),
    notifyPartyName: varchar("notify_party_name", { length: 255 }),
    cargoDescription: text("cargo_description"),
    specialInstructions: text("special_instructions"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    submittedBy: uuid("submitted_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    approvedBy: uuid("approved_by"),
    status: varchar("status", { length: 30 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
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
    index("odm_si_tenant_id_idx").on(table.tenantId),
    uniqueIndex("odm_si_tenant_ref_idx").on(table.tenantId, table.siReference),
    index("odm_si_bl_id_idx").on(table.blId),
    index("odm_si_booking_ref_idx").on(table.bookingReference),
    index("odm_si_status_idx").on(table.status),
    index("odm_si_customer_id_idx").on(table.customerId),
  ]
);

// ==========================================
// Supporting: Cargo Tracking Events
// ==========================================

export const odmCargoTrackingEvents = pgTable(
  "odm_cargo_tracking_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    blId: uuid("bl_id").references(() => odmBillsOfLading.id),
    containerNumber: varchar("container_number", { length: 20 }),
    eventType: varchar("event_type", { length: 30 }).notNull(),
    eventCode: varchar("event_code", { length: 20 }).notNull(),
    eventDescription: varchar("event_description", { length: 500 }),
    eventLocation: varchar("event_location", { length: 100 }),
    eventPort: varchar("event_port", { length: 10 }),
    eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
    reportedBy: varchar("reported_by", { length: 255 }),
    vesselName: varchar("vessel_name", { length: 100 }),
    voyageNumber: varchar("voyage_number", { length: 50 }),
    isActual: boolean("is_actual").notNull().default(true),
    notes: text("notes"),
    metadata: jsonb("metadata"),
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
    index("odm_tracking_tenant_id_idx").on(table.tenantId),
    index("odm_tracking_bl_id_idx").on(table.blId),
    index("odm_tracking_container_number_idx").on(table.containerNumber),
    index("odm_tracking_event_type_idx").on(table.eventType),
    index("odm_tracking_event_code_idx").on(table.eventCode),
    index("odm_tracking_event_date_idx").on(table.eventDate),
  ]
);

// ==========================================
// Supporting: Document Amendments
// ==========================================

export const odmDocumentAmendments = pgTable(
  "odm_document_amendments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    blId: uuid("bl_id")
      .notNull()
      .references(() => odmBillsOfLading.id),
    amendmentNumber: varchar("amendment_number", { length: 30 }).notNull(),
    amendmentType: varchar("amendment_type", { length: 30 }).notNull(),
    fieldChanged: varchar("field_changed", { length: 100 }).notNull(),
    oldValue: text("old_value"),
    newValue: text("new_value"),
    reason: text("reason"),
    requestedBy: uuid("requested_by"),
    requestedAt: timestamp("requested_at", { withTimezone: true }),
    approvedBy: uuid("approved_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    fee: integer("fee"),
    currency: varchar("currency", { length: 3 }).default("USD"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
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
    index("odm_amendments_tenant_id_idx").on(table.tenantId),
    index("odm_amendments_bl_id_idx").on(table.blId),
    index("odm_amendments_amendment_type_idx").on(table.amendmentType),
    index("odm_amendments_status_idx").on(table.status),
  ]
);
