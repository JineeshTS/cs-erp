import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const tenantPlanEnum = pgEnum("tenant_plan", [
  "starter",
  "growth",
  "enterprise",
  "enterprise_plus",
]);

export const tenantRegionEnum = pgEnum("tenant_region", [
  "qa",
  "ae",
  "sa",
  "in",
  "global",
]);

export const tenantStatusEnum = pgEnum("tenant_status", [
  "active",
  "suspended",
  "trial",
  "churned",
]);

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  plan: tenantPlanEnum("plan").notNull().default("starter"),
  region: tenantRegionEnum("region").notNull().default("global"),
  status: tenantStatusEnum("status").notNull().default("trial"),
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
