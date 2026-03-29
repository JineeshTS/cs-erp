import {
  pgTable,
  varchar,
  text,
  timestamp,
  inet,
  index,
  uuid,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { users } from "./users";

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  refreshTokenHash: varchar("refresh_token_hash", { length: 64 }).notNull(),
  userAgent: text("user_agent"),
  ipAddress: inet("ip_address"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  revokedReason: varchar("revoked_reason", { length: 100 }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  index("sessions_user_id_idx").on(table.userId),
  index("sessions_tenant_id_idx").on(table.tenantId),
]);
