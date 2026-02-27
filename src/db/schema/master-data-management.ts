import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  numeric,
  timestamp,
  date,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// FEAT-032-1-001: Port & Terminal Master Data
// ==========================================

export const ports = pgTable(
  "mdm_ports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    unLocode: varchar("un_locode", { length: 10 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    country: varchar("country", { length: 2 }).notNull(),
    countryName: varchar("country_name", { length: 100 }),
    timezone: varchar("timezone", { length: 50 }),
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),
    portType: varchar("port_type", { length: 30 }).notNull().default("seaport"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    isMajorPort: boolean("is_major_port").notNull().default(false),
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
    index("mdm_ports_tenant_id_idx").on(table.tenantId),
    uniqueIndex("mdm_ports_tenant_unlocode_idx").on(
      table.tenantId,
      table.unLocode
    ),
    index("mdm_ports_country_idx").on(table.country),
    index("mdm_ports_status_idx").on(table.status),
  ]
);

export const terminals = pgTable(
  "mdm_terminals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    portId: uuid("port_id")
      .notNull()
      .references(() => ports.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 20 }),
    operatorName: varchar("operator_name", { length: 255 }),
    capacity: integer("capacity"),
    terminalType: varchar("terminal_type", { length: 30 })
      .notNull()
      .default("container"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
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
    index("mdm_terminals_tenant_id_idx").on(table.tenantId),
    index("mdm_terminals_port_id_idx").on(table.portId),
  ]
);

// ==========================================
// FEAT-032-1-002: Vessel Registry & Particulars
// ==========================================

export const vessels = pgTable(
  "mdm_vessels",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    imoNumber: varchar("imo_number", { length: 10 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    callSign: varchar("call_sign", { length: 20 }),
    mmsi: varchar("mmsi", { length: 15 }),
    flag: varchar("flag", { length: 2 }),
    vesselType: varchar("vessel_type", { length: 50 })
      .notNull()
      .default("container"),
    teuCapacity: integer("teu_capacity"),
    dwt: numeric("dwt", { precision: 12, scale: 2 }),
    grossTonnage: numeric("gross_tonnage", { precision: 12, scale: 2 }),
    netTonnage: numeric("net_tonnage", { precision: 12, scale: 2 }),
    loa: numeric("loa", { precision: 8, scale: 2 }),
    beam: numeric("beam", { precision: 8, scale: 2 }),
    draft: numeric("draft", { precision: 8, scale: 2 }),
    builtYear: integer("built_year"),
    builder: varchar("builder", { length: 255 }),
    ownerName: varchar("owner_name", { length: 255 }),
    operatorName: varchar("operator_name", { length: 255 }),
    classificationSociety: varchar("classification_society", { length: 100 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
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
    index("mdm_vessels_tenant_id_idx").on(table.tenantId),
    uniqueIndex("mdm_vessels_tenant_imo_idx").on(
      table.tenantId,
      table.imoNumber
    ),
    index("mdm_vessels_status_idx").on(table.status),
    index("mdm_vessels_type_idx").on(table.vesselType),
  ]
);

// ==========================================
// FEAT-032-1-003: Commodity & HS Code Master
// ==========================================

export const commodities = pgTable(
  "mdm_commodities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    hsCode: varchar("hs_code", { length: 12 }).notNull(),
    description: text("description").notNull(),
    shortDescription: varchar("short_description", { length: 255 }),
    category: varchar("category", { length: 100 }),
    chapter: varchar("chapter", { length: 10 }),
    hazardClass: varchar("hazard_class", { length: 10 }),
    unNumber: varchar("un_number", { length: 10 }),
    unitOfMeasure: varchar("unit_of_measure", { length: 20 })
      .notNull()
      .default("KG"),
    requiresFumigation: boolean("requires_fumigation").notNull().default(false),
    requiresInspection: boolean("requires_inspection").notNull().default(false),
    isRestricted: boolean("is_restricted").notNull().default(false),
    dutyRate: numeric("duty_rate", { precision: 8, scale: 4 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
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
    index("mdm_commodities_tenant_id_idx").on(table.tenantId),
    uniqueIndex("mdm_commodities_tenant_hs_idx").on(
      table.tenantId,
      table.hsCode
    ),
    index("mdm_commodities_category_idx").on(table.category),
    index("mdm_commodities_hazard_idx").on(table.hazardClass),
  ]
);

// ==========================================
// FEAT-032-1-004: Container Type & ISO Code Master
// ==========================================

export const containerTypes = pgTable(
  "mdm_container_types",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    isoCode: varchar("iso_code", { length: 10 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    sizeType: varchar("size_type", { length: 10 }).notNull(),
    lengthFt: numeric("length_ft", { precision: 6, scale: 2 }),
    widthFt: numeric("width_ft", { precision: 6, scale: 2 }),
    heightFt: numeric("height_ft", { precision: 6, scale: 2 }),
    tareWeightKg: numeric("tare_weight_kg", { precision: 10, scale: 2 }),
    maxPayloadKg: numeric("max_payload_kg", { precision: 10, scale: 2 }),
    cubicCapacityCbm: numeric("cubic_capacity_cbm", { precision: 10, scale: 2 }),
    isReefer: boolean("is_reefer").notNull().default(false),
    isOpenTop: boolean("is_open_top").notNull().default(false),
    isFlatRack: boolean("is_flat_rack").notNull().default(false),
    isTank: boolean("is_tank").notNull().default(false),
    status: varchar("status", { length: 20 }).notNull().default("active"),
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
    index("mdm_container_types_tenant_id_idx").on(table.tenantId),
    uniqueIndex("mdm_container_types_tenant_iso_idx").on(
      table.tenantId,
      table.isoCode
    ),
  ]
);

// ==========================================
// FEAT-032-2-001: Customer & Agent Hierarchy
// ==========================================

export const customers = pgTable(
  "mdm_customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id"),
    customerType: varchar("customer_type", { length: 30 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    shortName: varchar("short_name", { length: 100 }),
    taxId: varchar("tax_id", { length: 50 }),
    registrationNumber: varchar("registration_number", { length: 100 }),
    country: varchar("country", { length: 2 }),
    city: varchar("city", { length: 100 }),
    address: text("address"),
    postalCode: varchar("postal_code", { length: 20 }),
    phone: varchar("phone", { length: 30 }),
    email: varchar("email", { length: 255 }),
    website: varchar("website", { length: 255 }),
    creditLimitAmount: integer("credit_limit_amount"),
    creditLimitCurrency: varchar("credit_limit_currency", { length: 3 })
      .notNull()
      .default("USD"),
    paymentTermsDays: integer("payment_terms_days").notNull().default(30),
    contacts: jsonb("contacts").default([]),
    status: varchar("status", { length: 20 }).notNull().default("active"),
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
    index("mdm_customers_tenant_id_idx").on(table.tenantId),
    index("mdm_customers_parent_id_idx").on(table.parentId),
    index("mdm_customers_type_idx").on(table.customerType),
    index("mdm_customers_country_idx").on(table.country),
    index("mdm_customers_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-032-2-002: Freight Tariff Code Master
// ==========================================

export const tariffCodes = pgTable(
  "mdm_tariff_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 30 }).notNull(),
    description: text("description").notNull(),
    rateType: varchar("rate_type", { length: 20 }).notNull(),
    rateAmount: integer("rate_amount").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    perUnit: varchar("per_unit", { length: 20 }).notNull().default("TEU"),
    originPortId: uuid("origin_port_id").references(() => ports.id),
    destinationPortId: uuid("destination_port_id").references(() => ports.id),
    commodityId: uuid("commodity_id").references(() => commodities.id),
    containerTypeId: uuid("container_type_id").references(
      () => containerTypes.id
    ),
    effectiveFrom: date("effective_from").notNull(),
    effectiveTo: date("effective_to"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
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
    index("mdm_tariff_codes_tenant_id_idx").on(table.tenantId),
    uniqueIndex("mdm_tariff_codes_tenant_code_idx").on(
      table.tenantId,
      table.code
    ),
    index("mdm_tariff_codes_origin_idx").on(table.originPortId),
    index("mdm_tariff_codes_dest_idx").on(table.destinationPortId),
    index("mdm_tariff_codes_effective_idx").on(table.effectiveFrom),
  ]
);

// ==========================================
// FEAT-032-2-003: Live Exchange Rate Feed
// ==========================================

export const exchangeRates = pgTable(
  "mdm_exchange_rates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    baseCurrency: varchar("base_currency", { length: 3 }).notNull(),
    targetCurrency: varchar("target_currency", { length: 3 }).notNull(),
    rate: numeric("rate", { precision: 18, scale: 8 }).notNull(),
    inverseRate: numeric("inverse_rate", { precision: 18, scale: 8 }),
    source: varchar("source", { length: 50 }).notNull().default("manual"),
    effectiveDate: date("effective_date").notNull(),
    validUntil: date("valid_until"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
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
    index("mdm_exchange_rates_tenant_id_idx").on(table.tenantId),
    index("mdm_exchange_rates_pair_idx").on(
      table.baseCurrency,
      table.targetCurrency
    ),
    index("mdm_exchange_rates_effective_idx").on(table.effectiveDate),
  ]
);

// ==========================================
// FEAT-032-2-004: GL Account & Cost Centre
// ==========================================

export const glAccounts = pgTable(
  "mdm_gl_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    accountCode: varchar("account_code", { length: 20 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    accountType: varchar("account_type", { length: 20 }).notNull(),
    parentId: uuid("parent_id"),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    normalBalance: varchar("normal_balance", { length: 10 })
      .notNull()
      .default("debit"),
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
    index("mdm_gl_accounts_tenant_id_idx").on(table.tenantId),
    uniqueIndex("mdm_gl_accounts_tenant_code_idx").on(
      table.tenantId,
      table.accountCode
    ),
    index("mdm_gl_accounts_parent_id_idx").on(table.parentId),
    index("mdm_gl_accounts_type_idx").on(table.accountType),
  ]
);

export const costCentres = pgTable(
  "mdm_cost_centres",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 20 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    department: varchar("department", { length: 100 }),
    description: text("description"),
    parentId: uuid("parent_id"),
    isActive: boolean("is_active").notNull().default(true),
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
    index("mdm_cost_centres_tenant_id_idx").on(table.tenantId),
    uniqueIndex("mdm_cost_centres_tenant_code_idx").on(
      table.tenantId,
      table.code
    ),
    index("mdm_cost_centres_parent_id_idx").on(table.parentId),
  ]
);
