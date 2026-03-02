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
// Port Call Planning & Coordination
// ==========================================
export const pamPortCallPlans = pgTable(
  "pam_port_call_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    planRef: varchar("plan_ref", { length: 50 }).notNull(),
    planType: varchar("plan_type", { length: 30 }).notNull(), // scheduled, unscheduled, emergency, bunker_only, crew_change
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    imoNumber: varchar("imo_number", { length: 20 }),
    voyageRef: varchar("voyage_ref", { length: 50 }),
    portName: varchar("port_name", { length: 255 }).notNull(),
    portCode: varchar("port_code", { length: 10 }),
    berthName: varchar("berth_name", { length: 100 }),
    terminalName: varchar("terminal_name", { length: 255 }),
    agentName: varchar("agent_name", { length: 255 }),
    agentContactEmail: varchar("agent_contact_email", { length: 255 }),
    agentContactPhone: varchar("agent_contact_phone", { length: 50 }),
    eta: timestamp("eta", { withTimezone: true }),
    etd: timestamp("etd", { withTimezone: true }),
    ata: timestamp("ata", { withTimezone: true }),
    atd: timestamp("atd", { withTimezone: true }),
    pilotRequired: boolean("pilot_required").default(false),
    tugRequired: boolean("tug_required").default(false),
    tugsCount: integer("tugs_count"),
    cargoOpsPlanned: jsonb("cargo_ops_planned"), // { loading: [], discharging: [], transshipment: [] }
    servicesRequired: jsonb("services_required"), // array of service types
    specialInstructions: text("special_instructions"),
    portChargesEstimate: decimal("port_charges_estimate", { precision: 14, scale: 2 }),
    portChargesCurrency: varchar("port_charges_currency", { length: 3 }).default("USD"),
    status: varchar("status", { length: 20 }).notNull().default("planned"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("pam_port_call_plan_tenant_idx").on(t.tenantId),
    index("pam_port_call_plan_ref_idx").on(t.planRef),
    index("pam_port_call_plan_status_idx").on(t.status),
    index("pam_port_call_plan_vessel_idx").on(t.vesselName),
    index("pam_port_call_plan_port_idx").on(t.portName),
    index("pam_port_call_plan_eta_idx").on(t.eta),
    index("pam_port_call_plan_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Husbandry & Crew Services
// ==========================================
export const pamHusbandryServices = pgTable(
  "pam_husbandry_services",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    serviceRef: varchar("service_ref", { length: 50 }).notNull(),
    serviceType: varchar("service_type", { length: 30 }).notNull(), // provisions, medical, repairs, stores, crew_welfare, launch_service, garbage_removal, fresh_water
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    imoNumber: varchar("imo_number", { length: 20 }),
    portCallRef: varchar("port_call_ref", { length: 50 }),
    portName: varchar("port_name", { length: 255 }),
    supplierName: varchar("supplier_name", { length: 255 }),
    supplierContact: varchar("supplier_contact", { length: 255 }),
    supplierPhone: varchar("supplier_phone", { length: 50 }),
    requestedDate: timestamp("requested_date", { withTimezone: true }),
    deliveryDate: timestamp("delivery_date", { withTimezone: true }),
    completedDate: timestamp("completed_date", { withTimezone: true }),
    description: text("description"),
    quantity: integer("quantity"),
    unit: varchar("unit", { length: 30 }),
    estimatedCost: decimal("estimated_cost", { precision: 14, scale: 2 }),
    actualCost: decimal("actual_cost", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    invoiceRef: varchar("invoice_ref", { length: 50 }),
    approvedBy: varchar("approved_by", { length: 255 }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("requested"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("pam_husbandry_svc_tenant_idx").on(t.tenantId),
    index("pam_husbandry_svc_ref_idx").on(t.serviceRef),
    index("pam_husbandry_svc_status_idx").on(t.status),
    index("pam_husbandry_svc_type_idx").on(t.serviceType),
    index("pam_husbandry_svc_vessel_idx").on(t.vesselName),
    index("pam_husbandry_svc_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Pre-Arrival Checklist & Notifications
// ==========================================
export const pamPreArrivalChecklists = pgTable(
  "pam_pre_arrival_checklists",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    checklistRef: varchar("checklist_ref", { length: 50 }).notNull(),
    checklistType: varchar("checklist_type", { length: 30 }).notNull(), // standard, hazmat, tanker, bulk, passenger, port_specific
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    imoNumber: varchar("imo_number", { length: 20 }),
    portCallRef: varchar("port_call_ref", { length: 50 }),
    portName: varchar("port_name", { length: 255 }),
    arrivalDate: timestamp("arrival_date", { withTimezone: true }),
    documentsDue: timestamp("documents_due", { withTimezone: true }),
    checklistItems: jsonb("checklist_items"), // [{ item, required, completed, completedAt, completedBy }]
    completedCount: integer("completed_count").default(0),
    totalCount: integer("total_count").default(0),
    notificationsSent: jsonb("notifications_sent"), // [{ type, recipient, sentAt, channel }]
    lastNotificationAt: timestamp("last_notification_at", { withTimezone: true }),
    portAuthorityNotified: boolean("port_authority_notified").default(false),
    customsNotified: boolean("customs_notified").default(false),
    immigrationNotified: boolean("immigration_notified").default(false),
    healthAuthorityNotified: boolean("health_authority_notified").default(false),
    assignedTo: varchar("assigned_to", { length: 255 }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("pam_pre_arrival_cl_tenant_idx").on(t.tenantId),
    index("pam_pre_arrival_cl_ref_idx").on(t.checklistRef),
    index("pam_pre_arrival_cl_status_idx").on(t.status),
    index("pam_pre_arrival_cl_vessel_idx").on(t.vesselName),
    index("pam_pre_arrival_cl_arrival_idx").on(t.arrivalDate),
    index("pam_pre_arrival_cl_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Port Authority Communications Management
// ==========================================
export const pamPortAuthorityCommunications = pgTable(
  "pam_port_authority_communications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    commRef: varchar("comm_ref", { length: 50 }).notNull(),
    commType: varchar("comm_type", { length: 30 }).notNull(), // notice_arrival, clearance_request, berthing_request, departure_notice, safety_report, incident_report, general
    authorityName: varchar("authority_name", { length: 255 }).notNull(),
    authorityDepartment: varchar("authority_department", { length: 255 }),
    contactPerson: varchar("contact_person", { length: 255 }),
    contactEmail: varchar("contact_email", { length: 255 }),
    contactPhone: varchar("contact_phone", { length: 50 }),
    vesselName: varchar("vessel_name", { length: 255 }),
    imoNumber: varchar("imo_number", { length: 20 }),
    portCallRef: varchar("port_call_ref", { length: 50 }),
    portName: varchar("port_name", { length: 255 }),
    subject: varchar("subject", { length: 500 }).notNull(),
    messageBody: text("message_body"),
    direction: varchar("direction", { length: 10 }).notNull().default("outbound"), // inbound, outbound
    priority: varchar("priority", { length: 10 }).default("normal"), // low, normal, high, urgent
    sentAt: timestamp("sent_at", { withTimezone: true }),
    receivedAt: timestamp("received_at", { withTimezone: true }),
    responseRequired: boolean("response_required").default(false),
    responseDeadline: timestamp("response_deadline", { withTimezone: true }),
    responseText: text("response_text"),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    attachments: jsonb("attachments"), // [{ name, url, type, size }]
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("pam_port_auth_comm_tenant_idx").on(t.tenantId),
    index("pam_port_auth_comm_ref_idx").on(t.commRef),
    index("pam_port_auth_comm_status_idx").on(t.status),
    index("pam_port_auth_comm_type_idx").on(t.commType),
    index("pam_port_auth_comm_vessel_idx").on(t.vesselName),
    index("pam_port_auth_comm_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Crew Change Coordination & Logistics
// ==========================================
export const pamCrewChangeCoordinations = pgTable(
  "pam_crew_change_coordinations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    coordinationRef: varchar("coordination_ref", { length: 50 }).notNull(),
    coordinationType: varchar("coordination_type", { length: 30 }).notNull(), // sign_on, sign_off, relief, emergency, medical_repatriation
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    imoNumber: varchar("imo_number", { length: 20 }),
    portCallRef: varchar("port_call_ref", { length: 50 }),
    portName: varchar("port_name", { length: 255 }),
    crewMemberName: varchar("crew_member_name", { length: 255 }).notNull(),
    crewRank: varchar("crew_rank", { length: 100 }),
    nationality: varchar("nationality", { length: 100 }),
    passportNumber: varchar("passport_number", { length: 50 }),
    seamanBookNumber: varchar("seaman_book_number", { length: 50 }),
    visaRequired: boolean("visa_required").default(false),
    visaStatus: varchar("visa_status", { length: 20 }), // not_required, pending, approved, rejected
    flightDetails: jsonb("flight_details"), // { airline, flightNo, departure, arrival, bookingRef }
    hotelRequired: boolean("hotel_required").default(false),
    hotelDetails: jsonb("hotel_details"), // { name, address, checkIn, checkOut, bookingRef }
    transportArranged: boolean("transport_arranged").default(false),
    transportDetails: text("transport_details"),
    scheduledDate: timestamp("scheduled_date", { withTimezone: true }),
    completedDate: timestamp("completed_date", { withTimezone: true }),
    estimatedCost: decimal("estimated_cost", { precision: 14, scale: 2 }),
    actualCost: decimal("actual_cost", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    status: varchar("status", { length: 20 }).notNull().default("planned"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("pam_crew_change_tenant_idx").on(t.tenantId),
    index("pam_crew_change_ref_idx").on(t.coordinationRef),
    index("pam_crew_change_status_idx").on(t.status),
    index("pam_crew_change_type_idx").on(t.coordinationType),
    index("pam_crew_change_vessel_idx").on(t.vesselName),
    index("pam_crew_change_scheduled_idx").on(t.scheduledDate),
    index("pam_crew_change_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Cash to Master & Petty Cash
// ==========================================
export const pamCashToMasters = pgTable(
  "pam_cash_to_masters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    transactionRef: varchar("transaction_ref", { length: 50 }).notNull(),
    transactionType: varchar("transaction_type", { length: 30 }).notNull(), // cash_advance, petty_cash, reimbursement, settlement
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    imoNumber: varchar("imo_number", { length: 20 }),
    portCallRef: varchar("port_call_ref", { length: 50 }),
    portName: varchar("port_name", { length: 255 }),
    masterName: varchar("master_name", { length: 255 }),
    requestedAmount: decimal("requested_amount", { precision: 14, scale: 2 }).notNull(),
    approvedAmount: decimal("approved_amount", { precision: 14, scale: 2 }),
    disbursedAmount: decimal("disbursed_amount", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    exchangeRate: decimal("exchange_rate", { precision: 12, scale: 6 }),
    localCurrency: varchar("local_currency", { length: 3 }),
    localAmount: decimal("local_amount", { precision: 14, scale: 2 }),
    purpose: text("purpose"),
    requestedBy: varchar("requested_by", { length: 255 }),
    requestedAt: timestamp("requested_at", { withTimezone: true }),
    approvedBy: varchar("approved_by", { length: 255 }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    disbursedBy: varchar("disbursed_by", { length: 255 }),
    disbursedAt: timestamp("disbursed_at", { withTimezone: true }),
    receipts: jsonb("receipts"), // [{ description, amount, receiptRef, date }]
    settlementDate: timestamp("settlement_date", { withTimezone: true }),
    settlementRef: varchar("settlement_ref", { length: 50 }),
    status: varchar("status", { length: 20 }).notNull().default("requested"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("pam_cash_master_tenant_idx").on(t.tenantId),
    index("pam_cash_master_ref_idx").on(t.transactionRef),
    index("pam_cash_master_status_idx").on(t.status),
    index("pam_cash_master_type_idx").on(t.transactionType),
    index("pam_cash_master_vessel_idx").on(t.vesselName),
    index("pam_cash_master_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Vessel Clearance Inward & Outward
// ==========================================
export const pamVesselClearances = pgTable(
  "pam_vessel_clearances",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    clearanceRef: varchar("clearance_ref", { length: 50 }).notNull(),
    clearanceType: varchar("clearance_type", { length: 30 }).notNull(), // inward, outward, coastal, transit
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    imoNumber: varchar("imo_number", { length: 20 }),
    portCallRef: varchar("port_call_ref", { length: 50 }),
    portName: varchar("port_name", { length: 255 }).notNull(),
    flagState: varchar("flag_state", { length: 100 }),
    lastPort: varchar("last_port", { length: 255 }),
    nextPort: varchar("next_port", { length: 255 }),
    grossTonnage: decimal("gross_tonnage", { precision: 12, scale: 2 }),
    netTonnage: decimal("net_tonnage", { precision: 12, scale: 2 }),
    crewCount: integer("crew_count"),
    passengerCount: integer("passenger_count"),
    cargoDescription: text("cargo_description"),
    healthDeclaration: boolean("health_declaration").default(false),
    customsClearance: boolean("customs_clearance").default(false),
    immigrationClearance: boolean("immigration_clearance").default(false),
    portHealthClearance: boolean("port_health_clearance").default(false),
    quarantineClearance: boolean("quarantine_clearance").default(false),
    documentsSubmitted: jsonb("documents_submitted"), // [{ docType, docRef, submittedAt, status }]
    authorityApprovals: jsonb("authority_approvals"), // [{ authority, approvedBy, approvedAt, remarks }]
    clearanceGrantedAt: timestamp("clearance_granted_at", { withTimezone: true }),
    clearanceGrantedBy: varchar("clearance_granted_by", { length: 255 }),
    validUntil: timestamp("valid_until", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("pam_vessel_cl_tenant_idx").on(t.tenantId),
    index("pam_vessel_cl_ref_idx").on(t.clearanceRef),
    index("pam_vessel_cl_status_idx").on(t.status),
    index("pam_vessel_cl_type_idx").on(t.clearanceType),
    index("pam_vessel_cl_vessel_idx").on(t.vesselName),
    index("pam_vessel_cl_port_idx").on(t.portName),
    index("pam_vessel_cl_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Disbursement Account Management
// ==========================================
export const pamDisbursementAccounts = pgTable(
  "pam_disbursement_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    accountRef: varchar("account_ref", { length: 50 }).notNull(),
    accountType: varchar("account_type", { length: 30 }).notNull(), // proforma, final, supplementary, credit_note
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    imoNumber: varchar("imo_number", { length: 20 }),
    portCallRef: varchar("port_call_ref", { length: 50 }),
    portName: varchar("port_name", { length: 255 }),
    voyageRef: varchar("voyage_ref", { length: 50 }),
    principalName: varchar("principal_name", { length: 255 }),
    principalRef: varchar("principal_ref", { length: 50 }),
    lineItems: jsonb("line_items"), // [{ description, category, amount, currency, vendor, invoiceRef, date }]
    subtotal: decimal("subtotal", { precision: 14, scale: 2 }),
    agencyFee: decimal("agency_fee", { precision: 14, scale: 2 }),
    taxAmount: decimal("tax_amount", { precision: 14, scale: 2 }),
    totalAmount: decimal("total_amount", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    advanceReceived: decimal("advance_received", { precision: 14, scale: 2 }),
    balanceDue: decimal("balance_due", { precision: 14, scale: 2 }),
    proformaRef: varchar("proforma_ref", { length: 50 }),
    proformaAmount: decimal("proforma_amount", { precision: 14, scale: 2 }),
    variance: decimal("variance", { precision: 14, scale: 2 }),
    varianceExplanation: text("variance_explanation"),
    issuedAt: timestamp("issued_at", { withTimezone: true }),
    dueDate: timestamp("due_date", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    paymentRef: varchar("payment_ref", { length: 50 }),
    approvedBy: varchar("approved_by", { length: 255 }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("pam_disbursement_acct_tenant_idx").on(t.tenantId),
    index("pam_disbursement_acct_ref_idx").on(t.accountRef),
    index("pam_disbursement_acct_status_idx").on(t.status),
    index("pam_disbursement_acct_type_idx").on(t.accountType),
    index("pam_disbursement_acct_vessel_idx").on(t.vesselName),
    index("pam_disbursement_acct_deleted_idx").on(t.deletedAt),
  ]
);
