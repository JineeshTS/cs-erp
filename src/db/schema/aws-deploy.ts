import {
  pgTable,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { users } from "./users";

// ==========================================
// AWS Deployment: Credentials & Deployments
// ==========================================

export const awsCredentials = pgTable(
  "aws_credentials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 255 }).notNull(),
    encryptedAccessKeyId: text("encrypted_access_key_id").notNull(),
    encryptedSecretAccessKey: text("encrypted_secret_access_key").notNull(),
    region: varchar("region", { length: 30 }).notNull(),
    isValid: boolean("is_valid").notNull().default(false),
    lastValidatedAt: timestamp("last_validated_at", { withTimezone: true }),
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
  },
  (table) => [
    index("aws_credentials_tenant_id_idx").on(table.tenantId),
    uniqueIndex("aws_credentials_tenant_label_idx").on(
      table.tenantId,
      table.label
    ),
  ]
);

export const awsDeployments = pgTable(
  "aws_deployments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    credentialId: uuid("credential_id")
      .notNull()
      .references(() => awsCredentials.id, { onDelete: "restrict" }),
    stackName: varchar("stack_name", { length: 255 }).notNull(),
    stackId: varchar("stack_id", { length: 500 }),
    region: varchar("region", { length: 30 }).notNull(),
    instanceSize: varchar("instance_size", { length: 30 }).notNull(),
    customDomain: varchar("custom_domain", { length: 255 }),
    enableBackups: boolean("enable_backups").notNull().default(true),
    enableMonitoring: boolean("enable_monitoring").notNull().default(true),
    status: varchar("status", { length: 30 })
      .notNull()
      .default("pending"),
    statusReason: text("status_reason"),
    outputs: jsonb("outputs"),
    deployedUrl: varchar("deployed_url", { length: 500 }),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    initiatedBy: uuid("initiated_by")
      .references(() => users.id, { onDelete: "set null" }),
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
  },
  (table) => [
    index("aws_deployments_tenant_id_idx").on(table.tenantId),
    index("aws_deployments_credential_id_idx").on(table.credentialId),
    index("aws_deployments_status_idx").on(table.status),
    index("aws_deployments_initiated_by_idx").on(table.initiatedBy),
  ]
);
