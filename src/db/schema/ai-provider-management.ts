import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  decimal,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// AI Provider Registry
// ==========================================

export const aiProviders = pgTable(
  "ai_providers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    providerName: varchar("provider_name", { length: 50 }).notNull(),
    displayName: varchar("display_name", { length: 100 }).notNull(),
    apiKeyEncrypted: text("api_key_encrypted"),
    apiEndpoint: varchar("api_endpoint", { length: 500 }),
    isActive: boolean("is_active").notNull().default(true),
    isDefault: boolean("is_default").notNull().default(false),
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
    index("ai_providers_tenant_id_idx").on(table.tenantId),
    index("ai_providers_provider_name_idx").on(table.providerName),
  ]
);

// ==========================================
// AI Models per Provider
// ==========================================

export const aiModels = pgTable(
  "ai_models",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => aiProviders.id, { onDelete: "cascade" }),
    modelId: varchar("model_id", { length: 100 }).notNull(),
    displayName: varchar("display_name", { length: 150 }).notNull(),
    modelType: varchar("model_type", { length: 30 }).notNull().default("chat"),
    maxTokens: integer("max_tokens"),
    contextWindow: integer("context_window"),
    costPer1kInput: decimal("cost_per_1k_input", { precision: 10, scale: 6 }),
    costPer1kOutput: decimal("cost_per_1k_output", { precision: 10, scale: 6 }),
    isActive: boolean("is_active").notNull().default(true),
    capabilities: jsonb("capabilities"),
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
    index("ai_models_tenant_id_idx").on(table.tenantId),
    index("ai_models_provider_id_idx").on(table.providerId),
    index("ai_models_model_id_idx").on(table.modelId),
  ]
);

// ==========================================
// Agent-Model Assignments
// ==========================================

export const aiAgentModelAssignments = pgTable(
  "ai_agent_model_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id").notNull(),
    modelId: uuid("model_id")
      .notNull()
      .references(() => aiModels.id, { onDelete: "cascade" }),
    fallbackModelId: uuid("fallback_model_id").references(() => aiModels.id),
    temperature: decimal("temperature", { precision: 3, scale: 2 })
      .notNull()
      .default("0.70"),
    maxOutputTokens: integer("max_output_tokens"),
    systemPrompt: text("system_prompt"),
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
    index("ai_agent_model_assignments_tenant_id_idx").on(table.tenantId),
    index("ai_agent_model_assignments_agent_id_idx").on(table.agentId),
    index("ai_agent_model_assignments_model_id_idx").on(table.modelId),
  ]
);

// ==========================================
// AI Usage Logs
// ==========================================

export const aiUsageLogs = pgTable(
  "ai_usage_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id"),
    modelId: uuid("model_id"),
    providerId: uuid("provider_id"),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    costUsd: decimal("cost_usd", { precision: 10, scale: 6 }),
    latencyMs: integer("latency_ms"),
    status: varchar("status", { length: 30 }).notNull().default("success"),
    errorMessage: text("error_message"),
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
    index("ai_usage_logs_tenant_id_idx").on(table.tenantId),
    index("ai_usage_logs_agent_id_idx").on(table.agentId),
    index("ai_usage_logs_model_id_idx").on(table.modelId),
    index("ai_usage_logs_provider_id_idx").on(table.providerId),
    index("ai_usage_logs_created_at_idx").on(table.createdAt),
    index("ai_usage_logs_status_idx").on(table.status),
  ]
);
