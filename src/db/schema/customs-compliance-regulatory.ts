import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  jsonb,
  index,
  uuid,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// Import Customs Clearance Management
// ==========================================
export const ccrImportClearances = pgTable(
  "ccr_import_clearances",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    clearanceRef: varchar("clearance_ref", { length: 50 }).notNull(),
    declarationType: varchar("declaration_type", { length: 30 }).notNull(), // import, temporary_import, re_import, warehousing
    declarationNumber: varchar("declaration_number", { length: 50 }),
    customsOffice: varchar("customs_office", { length: 255 }),
    importerName: varchar("importer_name", { length: 255 }).notNull(),
    importerCode: varchar("importer_code", { length: 50 }),
    importerTaxId: varchar("importer_tax_id", { length: 50 }),
    consignmentRef: varchar("consignment_ref", { length: 50 }),
    blNumber: varchar("bl_number", { length: 50 }),
    containerNumber: varchar("container_number", { length: 20 }),
    vesselName: varchar("vessel_name", { length: 255 }),
    voyageNumber: varchar("voyage_number", { length: 50 }),
    portOfOrigin: varchar("port_of_origin", { length: 255 }),
    portOfEntry: varchar("port_of_entry", { length: 255 }).notNull(),
    cargoDescription: text("cargo_description"),
    hsCode: varchar("hs_code", { length: 20 }),
    grossWeightKg: decimal("gross_weight_kg", { precision: 12, scale: 2 }),
    numberOfPackages: integer("number_of_packages"),
    invoiceValue: decimal("invoice_value", { precision: 14, scale: 2 }),
    invoiceCurrency: varchar("invoice_currency", { length: 3 }),
    customsValue: decimal("customs_value", { precision: 14, scale: 2 }),
    dutyAmount: decimal("duty_amount", { precision: 14, scale: 2 }),
    vatAmount: decimal("vat_amount", { precision: 14, scale: 2 }),
    totalTaxes: decimal("total_taxes", { precision: 14, scale: 2 }),
    paymentMethod: varchar("payment_method", { length: 30 }), // cash, bank_transfer, guarantee, deferred
    filedAt: timestamp("filed_at", { withTimezone: true }),
    clearedAt: timestamp("cleared_at", { withTimezone: true }),
    releaseOrderNumber: varchar("release_order_number", { length: 50 }),
    inspectionRequired: boolean("inspection_required").default(false),
    inspectionResult: varchar("inspection_result", { length: 20 }), // passed, failed, pending
    brokerName: varchar("broker_name", { length: 255 }),
    brokerLicense: varchar("broker_license", { length: 50 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("ccr_import_clear_tenant_idx").on(t.tenantId),
    index("ccr_import_clear_ref_idx").on(t.clearanceRef),
    index("ccr_import_clear_status_idx").on(t.status),
    index("ccr_import_clear_importer_idx").on(t.importerName),
    index("ccr_import_clear_hs_idx").on(t.hsCode),
    index("ccr_import_clear_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Export Customs Filing & Submission
// ==========================================
export const ccrExportFilings = pgTable(
  "ccr_export_filings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    filingRef: varchar("filing_ref", { length: 50 }).notNull(),
    declarationType: varchar("declaration_type", { length: 30 }).notNull(), // export, re_export, temporary_export
    declarationNumber: varchar("declaration_number", { length: 50 }),
    customsOffice: varchar("customs_office", { length: 255 }),
    exporterName: varchar("exporter_name", { length: 255 }).notNull(),
    exporterCode: varchar("exporter_code", { length: 50 }),
    exporterTaxId: varchar("exporter_tax_id", { length: 50 }),
    consigneeName: varchar("consignee_name", { length: 255 }),
    consigneeCountry: varchar("consignee_country", { length: 100 }),
    blNumber: varchar("bl_number", { length: 50 }),
    containerNumber: varchar("container_number", { length: 20 }),
    vesselName: varchar("vessel_name", { length: 255 }),
    voyageNumber: varchar("voyage_number", { length: 50 }),
    portOfLoading: varchar("port_of_loading", { length: 255 }).notNull(),
    portOfDischarge: varchar("port_of_discharge", { length: 255 }),
    cargoDescription: text("cargo_description"),
    hsCode: varchar("hs_code", { length: 20 }),
    grossWeightKg: decimal("gross_weight_kg", { precision: 12, scale: 2 }),
    numberOfPackages: integer("number_of_packages"),
    fobValue: decimal("fob_value", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }),
    exportLicenseRequired: boolean("export_license_required").default(false),
    exportLicenseNumber: varchar("export_license_number", { length: 50 }),
    filedAt: timestamp("filed_at", { withTimezone: true }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    brokerName: varchar("broker_name", { length: 255 }),
    brokerLicense: varchar("broker_license", { length: 50 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("ccr_export_filings_tenant_idx").on(t.tenantId),
    index("ccr_export_filings_ref_idx").on(t.filingRef),
    index("ccr_export_filings_status_idx").on(t.status),
    index("ccr_export_filings_exporter_idx").on(t.exporterName),
    index("ccr_export_filings_hs_idx").on(t.hsCode),
    index("ccr_export_filings_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Transit & Re-Export Procedures
// ==========================================
export const ccrTransitProcedures = pgTable(
  "ccr_transit_procedures",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    transitRef: varchar("transit_ref", { length: 50 }).notNull(),
    procedureType: varchar("procedure_type", { length: 30 }).notNull(), // transit, re_export, transshipment, bonded_movement
    declarationNumber: varchar("declaration_number", { length: 50 }),
    customsOfficeOrigin: varchar("customs_office_origin", { length: 255 }),
    customsOfficeDestination: varchar("customs_office_destination", { length: 255 }),
    principalName: varchar("principal_name", { length: 255 }).notNull(),
    principalCode: varchar("principal_code", { length: 50 }),
    guaranteeType: varchar("guarantee_type", { length: 30 }), // bank_guarantee, cash_deposit, customs_bond, waiver
    guaranteeAmount: decimal("guarantee_amount", { precision: 14, scale: 2 }),
    guaranteeCurrency: varchar("guarantee_currency", { length: 3 }),
    guaranteeReference: varchar("guarantee_reference", { length: 100 }),
    containerNumber: varchar("container_number", { length: 20 }),
    sealNumber: varchar("seal_number", { length: 30 }),
    cargoDescription: text("cargo_description"),
    hsCode: varchar("hs_code", { length: 20 }),
    grossWeightKg: decimal("gross_weight_kg", { precision: 12, scale: 2 }),
    originCountry: varchar("origin_country", { length: 100 }),
    destinationCountry: varchar("destination_country", { length: 100 }),
    routeDescription: text("route_description"),
    transitStartAt: timestamp("transit_start_at", { withTimezone: true }),
    transitDeadlineAt: timestamp("transit_deadline_at", { withTimezone: true }),
    transitCompletedAt: timestamp("transit_completed_at", { withTimezone: true }),
    discharged: boolean("discharged").default(false),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("ccr_transit_proc_tenant_idx").on(t.tenantId),
    index("ccr_transit_proc_ref_idx").on(t.transitRef),
    index("ccr_transit_proc_status_idx").on(t.status),
    index("ccr_transit_proc_principal_idx").on(t.principalName),
    index("ccr_transit_proc_type_idx").on(t.procedureType),
    index("ccr_transit_proc_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Customs Duty & Tax Calculation
// ==========================================
export const ccrDutyCalculations = pgTable(
  "ccr_duty_calculations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    calculationRef: varchar("calculation_ref", { length: 50 }).notNull(),
    clearanceRef: varchar("clearance_ref", { length: 50 }),
    hsCode: varchar("hs_code", { length: 20 }).notNull(),
    hsDescription: text("hs_description"),
    originCountry: varchar("origin_country", { length: 100 }),
    destinationCountry: varchar("destination_country", { length: 100 }),
    valuationMethod: varchar("valuation_method", { length: 30 }), // transaction_value, deductive, computed, fallback
    cifValue: decimal("cif_value", { precision: 14, scale: 2 }).notNull(),
    cifCurrency: varchar("cif_currency", { length: 3 }).notNull(),
    exchangeRate: decimal("exchange_rate", { precision: 12, scale: 6 }),
    dutyRate: decimal("duty_rate", { precision: 8, scale: 4 }),
    dutyAmount: decimal("duty_amount", { precision: 14, scale: 2 }),
    vatRate: decimal("vat_rate", { precision: 8, scale: 4 }),
    vatAmount: decimal("vat_amount", { precision: 14, scale: 2 }),
    exciseRate: decimal("excise_rate", { precision: 8, scale: 4 }),
    exciseAmount: decimal("excise_amount", { precision: 14, scale: 2 }),
    antidumpingDuty: decimal("antidumping_duty", { precision: 14, scale: 2 }),
    safeguardDuty: decimal("safeguard_duty", { precision: 14, scale: 2 }),
    totalDutyTax: decimal("total_duty_tax", { precision: 14, scale: 2 }),
    preferentialTariff: boolean("preferential_tariff").default(false),
    ftaReference: varchar("fta_reference", { length: 100 }),
    exemptionCode: varchar("exemption_code", { length: 30 }),
    exemptionReason: text("exemption_reason"),
    calculatedByName: varchar("calculated_by_name", { length: 255 }),
    calculatedAt: timestamp("calculated_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("ccr_duty_calc_tenant_idx").on(t.tenantId),
    index("ccr_duty_calc_ref_idx").on(t.calculationRef),
    index("ccr_duty_calc_status_idx").on(t.status),
    index("ccr_duty_calc_hs_idx").on(t.hsCode),
    index("ccr_duty_calc_clearance_idx").on(t.clearanceRef),
    index("ccr_duty_calc_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// AEO Authorized Economic Operator Compliance
// ==========================================
export const ccrAeoCompliances = pgTable(
  "ccr_aeo_compliances",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    aeoRef: varchar("aeo_ref", { length: 50 }).notNull(),
    aeoType: varchar("aeo_type", { length: 30 }).notNull(), // aeo_c, aeo_s, aeo_f, trusted_trader
    companyName: varchar("company_name", { length: 255 }).notNull(),
    companyRegistration: varchar("company_registration", { length: 100 }),
    authorityName: varchar("authority_name", { length: 255 }),
    certificateNumber: varchar("certificate_number", { length: 100 }),
    certificateIssuedAt: timestamp("certificate_issued_at", { withTimezone: true }),
    certificateExpiresAt: timestamp("certificate_expires_at", { withTimezone: true }),
    auditFrequency: varchar("audit_frequency", { length: 20 }), // annual, biannual, triennial
    lastAuditDate: timestamp("last_audit_date", { withTimezone: true }),
    nextAuditDate: timestamp("next_audit_date", { withTimezone: true }),
    auditResult: varchar("audit_result", { length: 20 }), // passed, conditional, failed
    complianceScore: decimal("compliance_score", { precision: 5, scale: 2 }),
    riskCategory: varchar("risk_category", { length: 20 }), // low, medium, high
    benefitsGranted: jsonb("benefits_granted"),
    correctiveActions: jsonb("corrective_actions"),
    contactName: varchar("contact_name", { length: 255 }),
    contactEmail: varchar("contact_email", { length: 255 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("ccr_aeo_compl_tenant_idx").on(t.tenantId),
    index("ccr_aeo_compl_ref_idx").on(t.aeoRef),
    index("ccr_aeo_compl_status_idx").on(t.status),
    index("ccr_aeo_compl_company_idx").on(t.companyName),
    index("ccr_aeo_compl_type_idx").on(t.aeoType),
    index("ccr_aeo_compl_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// ISPS Maritime Security Compliance
// ==========================================
export const ccrIspsCompliances = pgTable(
  "ccr_isps_compliances",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    ispsRef: varchar("isps_ref", { length: 50 }).notNull(),
    facilityType: varchar("facility_type", { length: 30 }).notNull(), // port_facility, vessel, terminal, offshore
    facilityName: varchar("facility_name", { length: 255 }).notNull(),
    facilityCode: varchar("facility_code", { length: 50 }),
    imoNumber: varchar("imo_number", { length: 20 }),
    securityLevel: varchar("security_level", { length: 10 }).notNull(), // 1, 2, 3
    pfsoName: varchar("pfso_name", { length: 255 }), // Port Facility Security Officer
    pfsoContact: varchar("pfso_contact", { length: 100 }),
    ssoName: varchar("sso_name", { length: 255 }), // Ship Security Officer
    securityPlanRef: varchar("security_plan_ref", { length: 100 }),
    securityPlanApprovedAt: timestamp("security_plan_approved_at", { withTimezone: true }),
    lastDrillDate: timestamp("last_drill_date", { withTimezone: true }),
    nextDrillDate: timestamp("next_drill_date", { withTimezone: true }),
    lastAuditDate: timestamp("last_audit_date", { withTimezone: true }),
    nextAuditDate: timestamp("next_audit_date", { withTimezone: true }),
    auditResult: varchar("audit_result", { length: 20 }), // compliant, non_compliant, observation
    isscNumber: varchar("issc_number", { length: 50 }), // International Ship Security Certificate
    isscExpiresAt: timestamp("issc_expires_at", { withTimezone: true }),
    declarationsOfSecurity: jsonb("declarations_of_security"),
    incidents: jsonb("incidents"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("ccr_isps_compl_tenant_idx").on(t.tenantId),
    index("ccr_isps_compl_ref_idx").on(t.ispsRef),
    index("ccr_isps_compl_status_idx").on(t.status),
    index("ccr_isps_compl_facility_idx").on(t.facilityName),
    index("ccr_isps_compl_level_idx").on(t.securityLevel),
    index("ccr_isps_compl_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// Port State Control PSC Preparation
// ==========================================
export const ccrPscPreparations = pgTable(
  "ccr_psc_preparations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    pscRef: varchar("psc_ref", { length: 50 }).notNull(),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    imoNumber: varchar("imo_number", { length: 20 }),
    flagState: varchar("flag_state", { length: 100 }),
    classificationSociety: varchar("classification_society", { length: 255 }),
    inspectionPort: varchar("inspection_port", { length: 255 }).notNull(),
    inspectionDate: timestamp("inspection_date", { withTimezone: true }),
    inspectorName: varchar("inspector_name", { length: 255 }),
    inspectionType: varchar("inspection_type", { length: 30 }), // initial, expanded, detailed, follow_up
    mouRegime: varchar("mou_regime", { length: 30 }), // paris_mou, tokyo_mou, indian_ocean_mou, riyadh_mou
    targetFactor: decimal("target_factor", { precision: 8, scale: 4 }),
    deficienciesFound: integer("deficiencies_found").default(0),
    deficiencyDetails: jsonb("deficiency_details"),
    detentionIssued: boolean("detention_issued").default(false),
    detentionReason: text("detention_reason"),
    correctiveActions: jsonb("corrective_actions"),
    rectifiedAt: timestamp("rectified_at", { withTimezone: true }),
    certificatesChecked: jsonb("certificates_checked"),
    overallResult: varchar("overall_result", { length: 20 }), // clear, deficiency, detention
    status: varchar("status", { length: 20 }).notNull().default("scheduled"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("ccr_psc_prep_tenant_idx").on(t.tenantId),
    index("ccr_psc_prep_ref_idx").on(t.pscRef),
    index("ccr_psc_prep_status_idx").on(t.status),
    index("ccr_psc_prep_vessel_idx").on(t.vesselName),
    index("ccr_psc_prep_port_idx").on(t.inspectionPort),
    index("ccr_psc_prep_deleted_idx").on(t.deletedAt),
  ]
);

// ==========================================
// IMO Circular & Regulation Tracking
// ==========================================
export const ccrImoRegulations = pgTable(
  "ccr_imo_regulations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    regulationRef: varchar("regulation_ref", { length: 50 }).notNull(),
    regulationType: varchar("regulation_type", { length: 30 }).notNull(), // circular, resolution, amendment, guideline, convention
    imoReference: varchar("imo_reference", { length: 100 }),
    title: varchar("title", { length: 500 }).notNull(),
    issuingBody: varchar("issuing_body", { length: 100 }), // MSC, MEPC, FAL, LEG, TC
    conventionName: varchar("convention_name", { length: 255 }), // SOLAS, MARPOL, STCW, MLC, BWM
    publishedAt: timestamp("published_at", { withTimezone: true }),
    effectiveAt: timestamp("effective_at", { withTimezone: true }),
    complianceDeadline: timestamp("compliance_deadline", { withTimezone: true }),
    applicableTo: jsonb("applicable_to"), // vessel types, flag states, etc.
    summary: text("summary"),
    impactAssessment: text("impact_assessment"),
    complianceActions: jsonb("compliance_actions"),
    implementationProgress: decimal("implementation_progress", { precision: 5, scale: 2 }),
    responsiblePerson: varchar("responsible_person", { length: 255 }),
    documentUrl: varchar("document_url", { length: 500 }),
    supersedes: varchar("supersedes", { length: 100 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("ccr_imo_reg_tenant_idx").on(t.tenantId),
    index("ccr_imo_reg_ref_idx").on(t.regulationRef),
    index("ccr_imo_reg_status_idx").on(t.status),
    index("ccr_imo_reg_type_idx").on(t.regulationType),
    index("ccr_imo_reg_effective_idx").on(t.effectiveAt),
    index("ccr_imo_reg_deadline_idx").on(t.complianceDeadline),
    index("ccr_imo_reg_deleted_idx").on(t.deletedAt),
  ]
);
