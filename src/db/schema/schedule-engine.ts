import { pgTable, uuid, varchar, integer, numeric, boolean, text, date, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { ports, vessels } from "./master-data-management";
import { ltrServiceLoops } from "./liner-trade-route-management";

// ── Proforma Templates ───────────────────────────────────────────

export const proformaTemplates = pgTable("proforma_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  serviceLoopId: uuid("service_loop_id").references(() => ltrServiceLoops.id),
  serviceName: varchar("service_name", { length: 100 }).notNull(),
  serviceCode: varchar("service_code", { length: 20 }).notNull(),
  frequencyDays: integer("frequency_days").notNull().default(7),
  totalRotationDays: integer("total_rotation_days").notNull().default(14),
  direction: varchar("direction", { length: 20 }).notNull().default("outbound"),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  notes: text("notes"),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_proforma_templates_tenant").on(table.tenantId),
  index("idx_proforma_templates_status").on(table.status),
  uniqueIndex("idx_proforma_templates_tenant_code").on(table.tenantId, table.serviceCode),
]);

// ── Proforma Port Calls ──────────────────────────────────────────

export const proformaPortCalls = pgTable("proforma_port_calls", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  templateId: uuid("template_id").notNull().references(() => proformaTemplates.id, { onDelete: "cascade" }),
  sequence: integer("sequence").notNull(),
  portId: uuid("port_id").references(() => ports.id),
  portCode: varchar("port_code", { length: 10 }).notNull(),
  portName: varchar("port_name", { length: 100 }).notNull(),
  distanceNm: numeric("distance_nm", { precision: 10, scale: 1 }),
  plannedSpeedKnots: numeric("planned_speed_knots", { precision: 5, scale: 1 }),
  steamingHours: numeric("steaming_hours", { precision: 8, scale: 2 }),
  portStayHours: numeric("port_stay_hours", { precision: 8, scale: 2 }).notNull().default("24"),
  dayOffset: numeric("day_offset", { precision: 8, scale: 2 }).notNull().default("0"),
  cargoCutoffHours: integer("cargo_cutoff_hours").default(48),
  vgmCutoffHours: integer("vgm_cutoff_hours").default(24),
  docCutoffHours: integer("doc_cutoff_hours").default(24),
  callPurpose: varchar("call_purpose", { length: 30 }).default("both"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_proforma_port_calls_template").on(table.templateId),
  index("idx_proforma_port_calls_tenant").on(table.tenantId),
  uniqueIndex("idx_proforma_port_calls_template_seq").on(table.templateId, table.sequence),
]);

// ── Generated Voyages ────────────────────────────────────────────

export const generatedVoyages = pgTable("generated_voyages", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  templateId: uuid("template_id").notNull().references(() => proformaTemplates.id),
  vesselId: uuid("vessel_id").references(() => vessels.id),
  voyageNumber: varchar("voyage_number", { length: 20 }).notNull(),
  cycleNumber: integer("cycle_number"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  status: varchar("status", { length: 20 }).notNull().default("planned"),
  isExtraLoader: boolean("is_extra_loader").default(false),
  isBlankSailing: boolean("is_blank_sailing").default(false),
  delayRemarks: text("delay_remarks"),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_generated_voyages_tenant").on(table.tenantId),
  index("idx_generated_voyages_template").on(table.templateId),
  index("idx_generated_voyages_vessel").on(table.vesselId),
  index("idx_generated_voyages_status").on(table.status),
  index("idx_generated_voyages_start").on(table.startDate),
  uniqueIndex("idx_generated_voyages_tenant_number").on(table.tenantId, table.voyageNumber),
]);

// ── Voyage Port Calls ────────────────────────────────────────────

export const voyagePortCalls = pgTable("voyage_port_calls", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  voyageId: uuid("voyage_id").notNull().references(() => generatedVoyages.id, { onDelete: "cascade" }),
  proformaPortCallId: uuid("proforma_port_call_id").references(() => proformaPortCalls.id),
  sequence: integer("sequence").notNull(),
  portId: uuid("port_id").references(() => ports.id),
  portCode: varchar("port_code", { length: 10 }).notNull(),
  portName: varchar("port_name", { length: 100 }).notNull(),
  plannedArrival: timestamp("planned_arrival", { withTimezone: true }).notNull(),
  plannedDeparture: timestamp("planned_departure", { withTimezone: true }).notNull(),
  actualArrival: timestamp("actual_arrival", { withTimezone: true }),
  actualDeparture: timestamp("actual_departure", { withTimezone: true }),
  cargoCutoff: timestamp("cargo_cutoff", { withTimezone: true }),
  vgmCutoff: timestamp("vgm_cutoff", { withTimezone: true }),
  docCutoff: timestamp("doc_cutoff", { withTimezone: true }),
  delayHours: numeric("delay_hours", { precision: 8, scale: 2 }).default("0"),
  delayReason: varchar("delay_reason", { length: 100 }),
  status: varchar("status", { length: 20 }).notNull().default("scheduled"),
  callPurpose: varchar("call_purpose", { length: 30 }).default("both"),
  terminalName: varchar("terminal_name", { length: 100 }),
  berthName: varchar("berth_name", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_voyage_port_calls_voyage").on(table.voyageId),
  index("idx_voyage_port_calls_tenant").on(table.tenantId),
  index("idx_voyage_port_calls_status").on(table.status),
  index("idx_voyage_port_calls_planned_arr").on(table.plannedArrival),
  index("idx_voyage_port_calls_port").on(table.portId),
  uniqueIndex("idx_voyage_port_calls_voyage_seq").on(table.voyageId, table.sequence),
]);
