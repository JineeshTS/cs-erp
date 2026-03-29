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
// FEAT-006-1-001: Online Booking
// ==========================================

export const cspPortalBookings = pgTable(
  "csp_portal_bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    bookingRef: varchar("booking_ref", { length: 50 }).notNull(),
    customerId: uuid("customer_id").notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    originPort: varchar("origin_port", { length: 20 }).notNull(),
    destinationPort: varchar("destination_port", { length: 20 }).notNull(),
    cargoType: varchar("cargo_type", { length: 50 }).notNull(),
    cargoDescription: text("cargo_description"),
    containerType: varchar("container_type", { length: 30 }),
    containerCount: integer("container_count").notNull().default(1),
    weight: integer("weight"),
    volume: integer("volume"),
    preferredVesselDate: timestamp("preferred_vessel_date", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    specialRequirements: jsonb("special_requirements"),
    hazardous: boolean("hazardous").notNull().default(false),
    temperature: integer("temperature"),
    incoterm: varchar("incoterm", { length: 10 }),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancellationReason: text("cancellation_reason"),
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
    index("csp_bookings_tenant_id_idx").on(table.tenantId),
    uniqueIndex("csp_bookings_tenant_ref_idx").on(table.tenantId, table.bookingRef),
    index("csp_bookings_customer_id_idx").on(table.customerId),
    index("csp_bookings_origin_idx").on(table.originPort),
    index("csp_bookings_dest_idx").on(table.destinationPort),
    index("csp_bookings_status_idx").on(table.status),
    index("csp_bookings_cargo_type_idx").on(table.cargoType),
  ]
);

export const cspPortalBookingContainers = pgTable(
  "csp_portal_booking_containers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => cspPortalBookings.id),
    containerNumber: varchar("container_number", { length: 20 }),
    containerType: varchar("container_type", { length: 30 }).notNull(),
    sealNumber: varchar("seal_number", { length: 50 }),
    weight: integer("weight"),
    volume: integer("volume"),
    cargoDescription: text("cargo_description"),
    hazardous: boolean("hazardous").notNull().default(false),
    temperature: integer("temperature"),
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
    index("csp_bk_containers_tenant_id_idx").on(table.tenantId),
    index("csp_bk_containers_booking_id_idx").on(table.bookingId),
    index("csp_bk_containers_number_idx").on(table.containerNumber),
    index("csp_bk_containers_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-006-1-002: Shipment Tracking
// ==========================================

export const cspShipmentTracking = pgTable(
  "csp_shipment_tracking",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    trackingNumber: varchar("tracking_number", { length: 50 }).notNull(),
    bookingId: uuid("booking_id")
      .references(() => cspPortalBookings.id),
    blNumber: varchar("bl_number", { length: 50 }),
    containerNumber: varchar("container_number", { length: 20 }),
    vesselName: varchar("vessel_name", { length: 255 }),
    voyageNumber: varchar("voyage_number", { length: 50 }),
    originPort: varchar("origin_port", { length: 20 }).notNull(),
    destinationPort: varchar("destination_port", { length: 20 }).notNull(),
    currentPort: varchar("current_port", { length: 20 }),
    currentStatus: varchar("current_status", { length: 30 }).notNull().default("booked"),
    eta: timestamp("eta", { withTimezone: true }),
    ata: timestamp("ata", { withTimezone: true }),
    etd: timestamp("etd", { withTimezone: true }),
    atd: timestamp("atd", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
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
    index("csp_tracking_tenant_id_idx").on(table.tenantId),
    uniqueIndex("csp_tracking_tenant_number_idx").on(table.tenantId, table.trackingNumber),
    index("csp_tracking_booking_id_idx").on(table.bookingId),
    index("csp_tracking_bl_idx").on(table.blNumber),
    index("csp_tracking_container_idx").on(table.containerNumber),
    index("csp_tracking_status_idx").on(table.currentStatus),
    index("csp_tracking_origin_idx").on(table.originPort),
    index("csp_tracking_dest_idx").on(table.destinationPort),
  ]
);

export const cspTrackingEvents = pgTable(
  "csp_tracking_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    trackingId: uuid("tracking_id")
      .notNull()
      .references(() => cspShipmentTracking.id),
    eventCode: varchar("event_code", { length: 30 }).notNull(),
    eventDescription: text("event_description").notNull(),
    location: varchar("location", { length: 100 }),
    portCode: varchar("port_code", { length: 20 }),
    eventTime: timestamp("event_time", { withTimezone: true }).notNull(),
    isPublic: boolean("is_public").notNull().default(true),
    details: jsonb("details"),
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
    index("csp_events_tenant_id_idx").on(table.tenantId),
    index("csp_events_tracking_id_idx").on(table.trackingId),
    index("csp_events_code_idx").on(table.eventCode),
    index("csp_events_time_idx").on(table.eventTime),
  ]
);

// ==========================================
// FEAT-006-1-003: Document Management
// ==========================================

export const cspPortalDocuments = pgTable(
  "csp_portal_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    documentRef: varchar("document_ref", { length: 50 }).notNull(),
    documentType: varchar("document_type", { length: 50 }).notNull(),
    documentName: varchar("document_name", { length: 255 }).notNull(),
    customerId: uuid("customer_id").notNull(),
    bookingId: uuid("booking_id")
      .references(() => cspPortalBookings.id),
    blNumber: varchar("bl_number", { length: 50 }),
    fileUrl: varchar("file_url", { length: 500 }),
    fileSize: integer("file_size"),
    mimeType: varchar("mime_type", { length: 100 }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    isCustomerVisible: boolean("is_customer_visible").notNull().default(true),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    downloadCount: integer("download_count").notNull().default(0),
    lastDownloadedAt: timestamp("last_downloaded_at", { withTimezone: true }),
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
    index("csp_docs_tenant_id_idx").on(table.tenantId),
    uniqueIndex("csp_docs_tenant_ref_idx").on(table.tenantId, table.documentRef),
    index("csp_docs_type_idx").on(table.documentType),
    index("csp_docs_customer_id_idx").on(table.customerId),
    index("csp_docs_booking_id_idx").on(table.bookingId),
    index("csp_docs_bl_idx").on(table.blNumber),
    index("csp_docs_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-006-1-004: Invoice & Payment Portal
// ==========================================

export const cspPortalInvoices = pgTable(
  "csp_portal_invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    invoiceRef: varchar("invoice_ref", { length: 50 }).notNull(),
    customerId: uuid("customer_id").notNull(),
    bookingId: uuid("booking_id")
      .references(() => cspPortalBookings.id),
    invoiceType: varchar("invoice_type", { length: 30 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    subtotal: integer("subtotal").notNull(),
    taxAmount: integer("tax_amount").notNull().default(0),
    totalAmount: integer("total_amount").notNull(),
    paidAmount: integer("paid_amount").notNull().default(0),
    balanceDue: integer("balance_due").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    dueDate: timestamp("due_date", { withTimezone: true }),
    issuedAt: timestamp("issued_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    lineItems: jsonb("line_items"),
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
    index("csp_invoices_tenant_id_idx").on(table.tenantId),
    uniqueIndex("csp_invoices_tenant_ref_idx").on(table.tenantId, table.invoiceRef),
    index("csp_invoices_customer_id_idx").on(table.customerId),
    index("csp_invoices_booking_id_idx").on(table.bookingId),
    index("csp_invoices_type_idx").on(table.invoiceType),
    index("csp_invoices_status_idx").on(table.status),
    index("csp_invoices_due_date_idx").on(table.dueDate),
  ]
);

export const cspPortalPayments = pgTable(
  "csp_portal_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    paymentRef: varchar("payment_ref", { length: 50 }).notNull(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => cspPortalInvoices.id),
    customerId: uuid("customer_id").notNull(),
    amount: integer("amount").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    paymentMethod: varchar("payment_method", { length: 30 }).notNull(),
    gatewayProvider: varchar("gateway_provider", { length: 50 }),
    gatewayRef: varchar("gateway_ref", { length: 255 }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    failureReason: text("failure_reason"),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),
    refundAmount: integer("refund_amount"),
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
    index("csp_payments_tenant_id_idx").on(table.tenantId),
    uniqueIndex("csp_payments_tenant_ref_idx").on(table.tenantId, table.paymentRef),
    index("csp_payments_invoice_id_idx").on(table.invoiceId),
    index("csp_payments_customer_id_idx").on(table.customerId),
    index("csp_payments_method_idx").on(table.paymentMethod),
    index("csp_payments_status_idx").on(table.status),
    index("csp_payments_gateway_ref_idx").on(table.gatewayRef),
  ]
);

export const cspPaymentTransactions = pgTable(
  "csp_payment_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    paymentId: uuid("payment_id")
      .notNull()
      .references(() => cspPortalPayments.id),
    transactionRef: varchar("transaction_ref", { length: 100 }).notNull(),
    transactionType: varchar("transaction_type", { length: 30 }).notNull(),
    amount: integer("amount").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    status: varchar("status", { length: 20 }).notNull(),
    gatewayResponse: jsonb("gateway_response"),
    errorCode: varchar("error_code", { length: 50 }),
    errorMessage: text("error_message"),
    processedAt: timestamp("processed_at", { withTimezone: true }),
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
    index("csp_txn_tenant_id_idx").on(table.tenantId),
    index("csp_txn_payment_id_idx").on(table.paymentId),
    index("csp_txn_ref_idx").on(table.transactionRef),
    index("csp_txn_type_idx").on(table.transactionType),
    index("csp_txn_status_idx").on(table.status),
  ]
);
