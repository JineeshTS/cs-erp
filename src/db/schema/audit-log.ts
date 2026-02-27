import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  timestamp,
  inet,
} from "drizzle-orm/pg-core";

export const authAuditLog = pgTable("auth_audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id"),
  userId: uuid("user_id"),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  ipAddress: inet("ip_address"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
