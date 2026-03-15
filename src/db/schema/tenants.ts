import {
  pgTable,
  uuid,
  varchar,
  text,
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
  timezone: varchar("timezone", { length: 50 }).notNull().default("Asia/Qatar"),
  currency: varchar("currency", { length: 3 }).notNull().default("QAR"),
  country: varchar("country", { length: 2 }).notNull().default("QA"),
  logoUrl: text("logo_url"),
  onboardedAt: timestamp("onboarded_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
