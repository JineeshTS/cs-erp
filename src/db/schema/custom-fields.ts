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
import { users } from "./users";

// ==========================================
// ERP-035: Custom Fields System
// ==========================================

export const customFieldDefinitions = pgTable(
  "custom_field_definitions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    fieldName: varchar("field_name", { length: 100 }).notNull(),
    fieldLabel: varchar("field_label", { length: 200 }).notNull(),
    fieldType: varchar("field_type", { length: 30 }).notNull().default("text"),
    isRequired: boolean("is_required").notNull().default(false),
    validationRules: jsonb("validation_rules").default({}),
    options: jsonb("options").default([]),
    defaultValue: text("default_value"),
    sortOrder: integer("sort_order").notNull().default(0),
    sectionName: varchar("section_name", { length: 100 }),
    isActive: boolean("is_active").notNull().default(true),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => users.id),
    updatedBy: uuid("updated_by").references(() => users.id),
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
    index("idx_cfd_tenant_entity").on(table.tenantId, table.entityType),
    uniqueIndex("cfd_tenant_entity_field_uniq").on(
      table.tenantId,
      table.entityType,
      table.fieldName
    ),
  ]
);

export const customFieldValues = pgTable(
  "custom_field_values",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    entityId: uuid("entity_id").notNull(),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    fieldDefinitionId: uuid("field_definition_id")
      .notNull()
      .references(() => customFieldDefinitions.id, { onDelete: "cascade" }),
    valueText: text("value_text"),
    valueJson: jsonb("value_json"),
    createdBy: uuid("created_by").references(() => users.id),
    updatedBy: uuid("updated_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_cfv_entity").on(table.tenantId, table.entityType, table.entityId),
    index("idx_cfv_definition").on(table.fieldDefinitionId),
    uniqueIndex("cfv_tenant_entity_field_uniq").on(
      table.tenantId,
      table.entityId,
      table.fieldDefinitionId
    ),
  ]
);
