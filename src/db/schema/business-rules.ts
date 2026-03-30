import {
  pgTable,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  uuid,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { users } from "./users";

// ==========================================
// ERP-038: Business Rules Engine
// ==========================================

export const businessRules = pgTable(
  "business_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    ruleName: varchar("rule_name", { length: 200 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    triggerEvent: varchar("trigger_event", { length: 50 })
      .notNull()
      .default("on_create"),
    ruleType: varchar("rule_type", { length: 30 })
      .notNull()
      .default("validation"),
    conditions: jsonb("conditions").notNull().default([]),
    actions: jsonb("actions").notNull().default([]),
    priority: integer("priority").notNull().default(50),
    isActive: boolean("is_active").notNull().default(true),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    description: text("description"),
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
    index("idx_br_tenant_entity").on(table.tenantId, table.entityType),
    index("idx_br_priority").on(table.priority),
  ]
);
