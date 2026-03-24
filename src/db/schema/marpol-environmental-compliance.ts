import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// MARPOL Annex I to VI Compliance Tracking
// ==========================================
export const mecAnnexCompliances = pgTable("mec_annex_compliances", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  complianceRef: varchar("compliance_ref", { length: 100 }).notNull(),
  complianceType: varchar("compliance_type", { length: 50 }).notNull(), // annex_i_oil, annex_ii_nls, annex_iii_harmful, annex_iv_sewage, annex_v_garbage, annex_vi_air
  title: varchar("title", { length: 255 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  imoNumber: varchar("imo_number", { length: 20 }),
  inspectionDate: timestamp("inspection_date", { withTimezone: true }),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  certificateNumber: varchar("certificate_number", { length: 100 }),
  issuingAuthority: varchar("issuing_authority", { length: 255 }),
  isCompliant: boolean("is_compliant").default(true),
  findingsCount: integer("findings_count"),
  correctiveActions: text("corrective_actions"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Ballast Water Management BWM Convention
// ==========================================
export const mecBallastWaters = pgTable("mec_ballast_waters", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  ballastRef: varchar("ballast_ref", { length: 100 }).notNull(),
  ballastType: varchar("ballast_type", { length: 50 }).notNull(), // exchange, treatment, discharge, sampling, compliance_check
  title: varchar("title", { length: 255 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  imoNumber: varchar("imo_number", { length: 20 }),
  treatmentSystem: varchar("treatment_system", { length: 255 }),
  operationDate: timestamp("operation_date", { withTimezone: true }),
  portName: varchar("port_name", { length: 255 }),
  volumeCubicMeters: decimal("volume_cubic_meters", { precision: 12, scale: 2 }),
  exchangeLatitude: decimal("exchange_latitude", { precision: 10, scale: 6 }),
  exchangeLongitude: decimal("exchange_longitude", { precision: 10, scale: 6 }),
  isCompliant: boolean("is_compliant").default(true),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Anti-Fouling System AFS Compliance
// ==========================================
export const mecAntiFoulings = pgTable("mec_anti_foulings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  afsRef: varchar("afs_ref", { length: 100 }).notNull(),
  afsType: varchar("afs_type", { length: 50 }).notNull(), // initial_survey, renewal_survey, endorsement, declaration, compliance_check
  title: varchar("title", { length: 255 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  imoNumber: varchar("imo_number", { length: 20 }),
  coatingType: varchar("coating_type", { length: 255 }),
  applicationDate: timestamp("application_date", { withTimezone: true }),
  surveyDate: timestamp("survey_date", { withTimezone: true }),
  certificateNumber: varchar("certificate_number", { length: 100 }),
  issuingAuthority: varchar("issuing_authority", { length: 255 }),
  isTbtFree: boolean("is_tbt_free").default(true),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Vessel Waste Management MARPOL Annex V
// ==========================================
export const mecWasteManagements = pgTable("mec_waste_managements", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  wasteRef: varchar("waste_ref", { length: 100 }).notNull(),
  wasteType: varchar("waste_type", { length: 50 }).notNull(), // plastics, food_waste, domestic_waste, cooking_oil, operational_waste, cargo_residues
  title: varchar("title", { length: 255 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  imoNumber: varchar("imo_number", { length: 20 }),
  disposalMethod: varchar("disposal_method", { length: 100 }),
  disposalDate: timestamp("disposal_date", { withTimezone: true }),
  portName: varchar("port_name", { length: 255 }),
  quantityKg: decimal("quantity_kg", { precision: 10, scale: 2 }),
  receivingFacility: varchar("receiving_facility", { length: 255 }),
  receiptNumber: varchar("receipt_number", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// 0.5% Sulphur Fuel Cap Compliance
// ==========================================
export const mecSulphurCaps = pgTable("mec_sulphur_caps", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  sulphurRef: varchar("sulphur_ref", { length: 100 }).notNull(),
  sulphurType: varchar("sulphur_type", { length: 50 }).notNull(), // fuel_sample, scrubber_report, compliance_plan, bunker_note, eca_compliance
  title: varchar("title", { length: 255 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  imoNumber: varchar("imo_number", { length: 20 }),
  fuelType: varchar("fuel_type", { length: 100 }),
  sulphurContent: decimal("sulphur_content", { precision: 5, scale: 3 }),
  sampleDate: timestamp("sample_date", { withTimezone: true }),
  labReference: varchar("lab_reference", { length: 100 }),
  hasScrubber: boolean("has_scrubber").default(false),
  isCompliant: boolean("is_compliant").default(true),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// CII Rating Tracking & Improvement Planning
// ==========================================
export const mecCiiRatings = pgTable("mec_cii_ratings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  ciiRef: varchar("cii_ref", { length: 100 }).notNull(),
  ciiType: varchar("cii_type", { length: 50 }).notNull(), // annual_rating, quarterly_review, improvement_plan, corrective_action, forecast
  title: varchar("title", { length: 255 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  imoNumber: varchar("imo_number", { length: 20 }),
  reportingYear: integer("reporting_year"),
  attainedCii: decimal("attained_cii", { precision: 10, scale: 4 }),
  requiredCii: decimal("required_cii", { precision: 10, scale: 4 }),
  rating: varchar("rating", { length: 1 }),
  improvementTarget: decimal("improvement_target", { precision: 5, scale: 2 }),
  correctionPlan: text("correction_plan"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Sea Cargo Charter Annual Disclosure
// ==========================================
export const mecCargoCharters = pgTable("mec_cargo_charters", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  charterRef: varchar("charter_ref", { length: 100 }).notNull(),
  charterType: varchar("charter_type", { length: 50 }).notNull(), // annual_disclosure, voyage_report, alignment_assessment, trajectory_analysis, benchmark
  title: varchar("title", { length: 255 }),
  reportingYear: integer("reporting_year"),
  tradeLane: varchar("trade_lane", { length: 255 }),
  totalVoyages: integer("total_voyages"),
  totalCargoTonnes: decimal("total_cargo_tonnes", { precision: 14, scale: 2 }),
  totalCo2Tonnes: decimal("total_co2_tonnes", { precision: 14, scale: 2 }),
  carbonIntensity: decimal("carbon_intensity", { precision: 10, scale: 4 }),
  alignmentStatus: varchar("alignment_status", { length: 50 }),
  disclosureDate: timestamp("disclosure_date", { withTimezone: true }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Environmental Incident Reporting & Investigation
// ==========================================
export const mecEnvironmentalIncidents = pgTable("mec_environmental_incidents", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  incidentRef: varchar("incident_ref", { length: 100 }).notNull(),
  incidentType: varchar("incident_type", { length: 50 }).notNull(), // oil_spill, chemical_release, sewage_discharge, garbage_violation, air_emission, ballast_violation
  title: varchar("title", { length: 255 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  imoNumber: varchar("imo_number", { length: 20 }),
  incidentDate: timestamp("incident_date", { withTimezone: true }),
  locationDescription: varchar("location_description", { length: 255 }),
  severity: varchar("severity", { length: 20 }),
  quantitySpilled: decimal("quantity_spilled", { precision: 14, scale: 2 }),
  rootCause: text("root_cause"),
  correctiveActions: text("corrective_actions"),
  reportedToAuthority: boolean("reported_to_authority").default(false),
  fineAmount: decimal("fine_amount", { precision: 14, scale: 2 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
