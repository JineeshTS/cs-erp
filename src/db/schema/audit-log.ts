import {
  pgTable,
  varchar,
  text,
  jsonb,
  timestamp,
  inet,
  index,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const authAuditLog = pgTable("auth_audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id"),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  ipAddress: inet("ip_address"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata").default({}),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}, (table) => [
  index("auth_audit_log_tenant_id_idx").on(table.tenantId),
  index("auth_audit_log_user_id_idx").on(table.userId),
  index("auth_audit_log_event_type_idx").on(table.eventType),
  index("auth_audit_log_created_at_idx").on(table.createdAt),
]);
