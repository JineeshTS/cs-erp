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
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// FEAT-020-1-001: Crew Planning & Rotation Management
// ==========================================

export const crmCrewRotations = pgTable(
  "crm_crew_rotations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    rotationRef: varchar("rotation_ref", { length: 50 }).notNull(),
    vesselId: uuid("vessel_id"),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    crewMemberName: varchar("crew_member_name", { length: 255 }).notNull(),
    rank: varchar("rank", { length: 100 }).notNull(),
    nationality: varchar("nationality", { length: 100 }),
    joiningDate: timestamp("joining_date", { withTimezone: true }).notNull(),
    relievingDate: timestamp("relieving_date", { withTimezone: true }),
    contractDuration: integer("contract_duration"),
    rotationType: varchar("rotation_type", { length: 30 }).notNull(),
    relievingCrewName: varchar("relieving_crew_name", { length: 255 }),
    handoverNotes: text("handover_notes"),
    travelArrangements: jsonb("travel_arrangements"),
    reliefPort: varchar("relief_port", { length: 255 }),
    reliefCountry: varchar("relief_country", { length: 100 }),
    approvedByName: varchar("approved_by_name", { length: 255 }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("planned"),
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
    index("crm_cr_tenant_id_idx").on(table.tenantId),
    uniqueIndex("crm_cr_tenant_ref_idx").on(table.tenantId, table.rotationRef),
    index("crm_cr_vessel_id_idx").on(table.vesselId),
    index("crm_cr_vessel_name_idx").on(table.vesselName),
    index("crm_cr_crew_member_idx").on(table.crewMemberName),
    index("crm_cr_rank_idx").on(table.rank),
    index("crm_cr_joining_date_idx").on(table.joiningDate),
    index("crm_cr_rotation_type_idx").on(table.rotationType),
    index("crm_cr_status_idx").on(table.status),
    index("crm_cr_created_at_idx").on(table.createdAt),
  ]
);

// ==========================================
// FEAT-020-1-002: Certificate & Competency Tracking STCW
// ==========================================

export const crmCertificateTrackings = pgTable(
  "crm_certificate_trackings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    certificateRef: varchar("certificate_ref", { length: 50 }).notNull(),
    crewMemberName: varchar("crew_member_name", { length: 255 }).notNull(),
    rank: varchar("rank", { length: 100 }),
    certificateType: varchar("certificate_type", { length: 30 }).notNull(),
    certificateName: varchar("certificate_name", { length: 255 }).notNull(),
    certificateNumber: varchar("certificate_number", { length: 100 }),
    issuingAuthority: varchar("issuing_authority", { length: 255 }),
    issuingCountry: varchar("issuing_country", { length: 100 }),
    issueDate: timestamp("issue_date", { withTimezone: true }),
    expiryDate: timestamp("expiry_date", { withTimezone: true }),
    lastVerified: timestamp("last_verified", { withTimezone: true }),
    stcwRegulation: varchar("stcw_regulation", { length: 100 }),
    competencyLevel: varchar("competency_level", { length: 50 }),
    revalidationRequired: boolean("revalidation_required").default(false),
    revalidationDate: timestamp("revalidation_date", { withTimezone: true }),
    documentUrl: varchar("document_url", { length: 500 }),
    status: varchar("status", { length: 20 }).notNull().default("valid"),
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
    index("crm_ct_tenant_id_idx").on(table.tenantId),
    uniqueIndex("crm_ct_tenant_ref_idx").on(table.tenantId, table.certificateRef),
    index("crm_ct_crew_member_idx").on(table.crewMemberName),
    index("crm_ct_certificate_type_idx").on(table.certificateType),
    index("crm_ct_certificate_name_idx").on(table.certificateName),
    index("crm_ct_expiry_date_idx").on(table.expiryDate),
    index("crm_ct_issuing_country_idx").on(table.issuingCountry),
    index("crm_ct_status_idx").on(table.status),
    index("crm_ct_created_at_idx").on(table.createdAt),
  ]
);

// ==========================================
// FEAT-020-1-003: Crew Payroll & Allotment Processing
// ==========================================

export const crmPayrollAllotments = pgTable(
  "crm_payroll_allotments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    allotmentRef: varchar("allotment_ref", { length: 50 }).notNull(),
    crewMemberName: varchar("crew_member_name", { length: 255 }).notNull(),
    rank: varchar("rank", { length: 100 }),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    payrollMonth: integer("payroll_month").notNull(),
    payrollYear: integer("payroll_year").notNull(),
    baseSalary: integer("base_salary").notNull().default(0),
    overtimeHours: integer("overtime_hours").notNull().default(0),
    overtimeRate: integer("overtime_rate").notNull().default(0),
    overtimeAmount: integer("overtime_amount").notNull().default(0),
    leavePay: integer("leave_pay").notNull().default(0),
    bonuses: integer("bonuses").notNull().default(0),
    deductions: integer("deductions").notNull().default(0),
    netPay: integer("net_pay").notNull().default(0),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    allotmentAmount: integer("allotment_amount").notNull().default(0),
    allotmentBeneficiary: varchar("allotment_beneficiary", { length: 255 }),
    allotmentBank: varchar("allotment_bank", { length: 255 }),
    allotmentAccount: varchar("allotment_account", { length: 100 }),
    paymentDate: timestamp("payment_date", { withTimezone: true }),
    paymentMethod: varchar("payment_method", { length: 50 }),
    taxWithheld: integer("tax_withheld").notNull().default(0),
    socialSecurity: integer("social_security").notNull().default(0),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
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
    index("crm_pa_tenant_id_idx").on(table.tenantId),
    uniqueIndex("crm_pa_tenant_ref_idx").on(table.tenantId, table.allotmentRef),
    index("crm_pa_crew_member_idx").on(table.crewMemberName),
    index("crm_pa_vessel_name_idx").on(table.vesselName),
    index("crm_pa_payroll_period_idx").on(table.payrollYear, table.payrollMonth),
    index("crm_pa_payment_date_idx").on(table.paymentDate),
    index("crm_pa_status_idx").on(table.status),
    index("crm_pa_created_at_idx").on(table.createdAt),
  ]
);

// ==========================================
// FEAT-020-1-004: Flag State & Port State Compliance
// ==========================================

export const crmFlagStateCompliance = pgTable(
  "crm_flag_state_compliance",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    complianceRef: varchar("compliance_ref", { length: 50 }).notNull(),
    vesselId: uuid("vessel_id"),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    flagState: varchar("flag_state", { length: 100 }).notNull(),
    inspectionType: varchar("inspection_type", { length: 30 }).notNull(),
    inspectionDate: timestamp("inspection_date", { withTimezone: true }).notNull(),
    inspectorName: varchar("inspector_name", { length: 255 }),
    inspectionPort: varchar("inspection_port", { length: 255 }),
    deficienciesFound: integer("deficiencies_found").notNull().default(0),
    detainable: boolean("detainable").default(false),
    observations: jsonb("observations"),
    findings: jsonb("findings"),
    correctiveActions: jsonb("corrective_actions"),
    rectificationDeadline: timestamp("rectification_deadline", { withTimezone: true }),
    rectifiedDate: timestamp("rectified_date", { withTimezone: true }),
    reportNumber: varchar("report_number", { length: 100 }),
    nextInspectionDate: timestamp("next_inspection_date", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("scheduled"),
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
    index("crm_fsc_tenant_id_idx").on(table.tenantId),
    uniqueIndex("crm_fsc_tenant_ref_idx").on(table.tenantId, table.complianceRef),
    index("crm_fsc_vessel_id_idx").on(table.vesselId),
    index("crm_fsc_vessel_name_idx").on(table.vesselName),
    index("crm_fsc_flag_state_idx").on(table.flagState),
    index("crm_fsc_inspection_type_idx").on(table.inspectionType),
    index("crm_fsc_inspection_date_idx").on(table.inspectionDate),
    index("crm_fsc_status_idx").on(table.status),
    index("crm_fsc_created_at_idx").on(table.createdAt),
  ]
);

// ==========================================
// FEAT-020-2-001: Manning Agency Management
// ==========================================

export const crmManningAgencies = pgTable(
  "crm_manning_agencies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    agencyRef: varchar("agency_ref", { length: 50 }).notNull(),
    agencyName: varchar("agency_name", { length: 255 }).notNull(),
    country: varchar("country", { length: 100 }).notNull(),
    city: varchar("city", { length: 100 }),
    address: text("address"),
    contactPerson: varchar("contact_person", { length: 255 }),
    contactEmail: varchar("contact_email", { length: 255 }),
    contactPhone: varchar("contact_phone", { length: 50 }),
    licenseNumber: varchar("license_number", { length: 100 }),
    licenseExpiry: timestamp("license_expiry", { withTimezone: true }),
    flagStates: jsonb("flag_states"),
    specializations: jsonb("specializations"),
    activeCrewCount: integer("active_crew_count").notNull().default(0),
    performanceRating: integer("performance_rating"),
    contractStartDate: timestamp("contract_start_date", { withTimezone: true }),
    contractEndDate: timestamp("contract_end_date", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
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
    index("crm_ma_tenant_id_idx").on(table.tenantId),
    uniqueIndex("crm_ma_tenant_ref_idx").on(table.tenantId, table.agencyRef),
    index("crm_ma_agency_name_idx").on(table.agencyName),
    index("crm_ma_country_idx").on(table.country),
    index("crm_ma_license_expiry_idx").on(table.licenseExpiry),
    index("crm_ma_status_idx").on(table.status),
    index("crm_ma_created_at_idx").on(table.createdAt),
  ]
);

// ==========================================
// FEAT-020-2-002: Visa Travel & Repatriation Management
// ==========================================

export const crmVisaTravelRecords = pgTable(
  "crm_visa_travel_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    recordRef: varchar("record_ref", { length: 50 }).notNull(),
    crewMemberName: varchar("crew_member_name", { length: 255 }).notNull(),
    nationality: varchar("nationality", { length: 100 }),
    recordType: varchar("record_type", { length: 30 }).notNull(),
    visaType: varchar("visa_type", { length: 50 }),
    visaCountry: varchar("visa_country", { length: 100 }),
    visaNumber: varchar("visa_number", { length: 100 }),
    visaIssueDate: timestamp("visa_issue_date", { withTimezone: true }),
    visaExpiryDate: timestamp("visa_expiry_date", { withTimezone: true }),
    travelDate: timestamp("travel_date", { withTimezone: true }),
    travelFrom: varchar("travel_from", { length: 255 }),
    travelTo: varchar("travel_to", { length: 255 }),
    flightNumber: varchar("flight_number", { length: 50 }),
    airline: varchar("airline", { length: 100 }),
    ticketNumber: varchar("ticket_number", { length: 100 }),
    ticketCost: integer("ticket_cost"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    repatriationReason: varchar("repatriation_reason", { length: 255 }),
    repatriationPort: varchar("repatriation_port", { length: 255 }),
    arrangedByName: varchar("arranged_by_name", { length: 255 }),
    approvedByName: varchar("approved_by_name", { length: 255 }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
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
    index("crm_vtr_tenant_id_idx").on(table.tenantId),
    uniqueIndex("crm_vtr_tenant_ref_idx").on(table.tenantId, table.recordRef),
    index("crm_vtr_crew_member_idx").on(table.crewMemberName),
    index("crm_vtr_record_type_idx").on(table.recordType),
    index("crm_vtr_visa_country_idx").on(table.visaCountry),
    index("crm_vtr_visa_expiry_idx").on(table.visaExpiryDate),
    index("crm_vtr_travel_date_idx").on(table.travelDate),
    index("crm_vtr_status_idx").on(table.status),
    index("crm_vtr_created_at_idx").on(table.createdAt),
  ]
);

// ==========================================
// FEAT-020-2-003: Crew Welfare & Medical Management
// ==========================================

export const crmWelfareMedicalRecords = pgTable(
  "crm_welfare_medical_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    recordRef: varchar("record_ref", { length: 50 }).notNull(),
    crewMemberName: varchar("crew_member_name", { length: 255 }).notNull(),
    rank: varchar("rank", { length: 100 }),
    vesselName: varchar("vessel_name", { length: 255 }),
    recordType: varchar("record_type", { length: 30 }).notNull(),
    description: text("description"),
    diagnosis: text("diagnosis"),
    medicalProviderName: varchar("medical_provider_name", { length: 255 }),
    hospitalName: varchar("hospital_name", { length: 255 }),
    examinationDate: timestamp("examination_date", { withTimezone: true }),
    treatmentStartDate: timestamp("treatment_start_date", { withTimezone: true }),
    treatmentEndDate: timestamp("treatment_end_date", { withTimezone: true }),
    fitForDuty: boolean("fit_for_duty").default(true),
    restrictionNotes: text("restriction_notes"),
    costAmount: integer("cost_amount"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    insuranceClaim: boolean("insurance_claim").default(false),
    claimNumber: varchar("claim_number", { length: 100 }),
    prescriptions: jsonb("prescriptions"),
    followUpDate: timestamp("follow_up_date", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("scheduled"),
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
    index("crm_wmr_tenant_id_idx").on(table.tenantId),
    uniqueIndex("crm_wmr_tenant_ref_idx").on(table.tenantId, table.recordRef),
    index("crm_wmr_crew_member_idx").on(table.crewMemberName),
    index("crm_wmr_vessel_name_idx").on(table.vesselName),
    index("crm_wmr_record_type_idx").on(table.recordType),
    index("crm_wmr_examination_date_idx").on(table.examinationDate),
    index("crm_wmr_follow_up_idx").on(table.followUpDate),
    index("crm_wmr_status_idx").on(table.status),
    index("crm_wmr_created_at_idx").on(table.createdAt),
  ]
);

// ==========================================
// FEAT-020-2-004: MLC 2006 Compliance Tracking
// ==========================================

export const crmMlcCompliance = pgTable(
  "crm_mlc_compliance",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    complianceRef: varchar("compliance_ref", { length: 50 }).notNull(),
    vesselId: uuid("vessel_id"),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    flagState: varchar("flag_state", { length: 100 }).notNull(),
    mlcStandard: varchar("mlc_standard", { length: 100 }).notNull(),
    complianceArea: varchar("compliance_area", { length: 30 }).notNull(),
    dmlcPartI: boolean("dmlc_part_i").default(false),
    dmlcPartII: boolean("dmlc_part_ii").default(false),
    lastInspectionDate: timestamp("last_inspection_date", { withTimezone: true }),
    nextInspectionDate: timestamp("next_inspection_date", { withTimezone: true }),
    inspectorName: varchar("inspector_name", { length: 255 }),
    findings: jsonb("findings"),
    correctiveActions: jsonb("corrective_actions"),
    closureDeadline: timestamp("closure_deadline", { withTimezone: true }),
    certificateNumber: varchar("certificate_number", { length: 100 }),
    certificateIssueDate: timestamp("certificate_issue_date", { withTimezone: true }),
    certificateExpiryDate: timestamp("certificate_expiry_date", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("compliant"),
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
    index("crm_mlc_tenant_id_idx").on(table.tenantId),
    uniqueIndex("crm_mlc_tenant_ref_idx").on(table.tenantId, table.complianceRef),
    index("crm_mlc_vessel_id_idx").on(table.vesselId),
    index("crm_mlc_vessel_name_idx").on(table.vesselName),
    index("crm_mlc_flag_state_idx").on(table.flagState),
    index("crm_mlc_compliance_area_idx").on(table.complianceArea),
    index("crm_mlc_next_inspection_idx").on(table.nextInspectionDate),
    index("crm_mlc_certificate_expiry_idx").on(table.certificateExpiryDate),
    index("crm_mlc_status_idx").on(table.status),
    index("crm_mlc_created_at_idx").on(table.createdAt),
  ]
);
