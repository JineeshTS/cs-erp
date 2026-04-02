/**
 * Entity Binding Service (D-006 Phase 1)
 *
 * Manages the link between E2E flow steps and real database entities.
 * Each step that creates/updates/reads an entity gets a binding record
 * in pe_step_entity_bindings + inline fields on pe_e2e_step_instances.
 *
 * Cross-step resolution: "Give me the lead created earlier in this flow"
 * → query bindings for flow where entity_table = "scm_leads".
 */

import { db } from "@/lib/db";
import {
  peStepEntityBindings,
  peE2eStepInstances,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

// ═══════════════════════════════════════════════════════════
// CREATE BINDING
// ═══════════════════════════════════════════════════════════

interface CreateBindingParams {
  tenantId: string;
  stepInstanceId: string;
  flowInstanceId: string;
  entityTable: string;
  entityId: string;
  entityAction: "create" | "update" | "read";
  entityData?: Record<string, unknown>;
}

/**
 * Create an entity binding for a step and update the step instance's
 * inline entity fields for quick lookups.
 */
export async function createEntityBinding(params: CreateBindingParams) {
  // Insert binding record
  const [binding] = await db
    .insert(peStepEntityBindings)
    .values({
      tenantId: params.tenantId,
      stepInstanceId: params.stepInstanceId,
      flowInstanceId: params.flowInstanceId,
      entityTable: params.entityTable,
      entityId: params.entityId,
      entityAction: params.entityAction,
      entityData: params.entityData ?? null,
    })
    .returning();

  // Update step instance with inline entity refs
  await db
    .update(peE2eStepInstances)
    .set({
      entityTable: params.entityTable,
      entityId: params.entityId,
      entityAction: params.entityAction,
    })
    .where(
      and(
        eq(peE2eStepInstances.id, params.stepInstanceId),
        eq(peE2eStepInstances.tenantId, params.tenantId)
      )
    );

  return binding;
}

// ═══════════════════════════════════════════════════════════
// QUERY BINDINGS
// ═══════════════════════════════════════════════════════════

/**
 * Get all entity bindings for a flow instance, ordered by creation time.
 */
export async function getBindingsForFlow(flowInstanceId: string, tenantId: string) {
  return db
    .select()
    .from(peStepEntityBindings)
    .where(
      and(
        eq(peStepEntityBindings.flowInstanceId, flowInstanceId),
        eq(peStepEntityBindings.tenantId, tenantId)
      )
    )
    .orderBy(peStepEntityBindings.createdAt);
}

/**
 * Get all entity bindings for a specific step instance.
 */
export async function getBindingsForStep(stepInstanceId: string, tenantId: string) {
  return db
    .select()
    .from(peStepEntityBindings)
    .where(
      and(
        eq(peStepEntityBindings.stepInstanceId, stepInstanceId),
        eq(peStepEntityBindings.tenantId, tenantId)
      )
    )
    .orderBy(peStepEntityBindings.createdAt);
}

/**
 * Cross-step entity resolution: find the most recent binding for a given
 * entity table within a flow. E.g., "get the lead created earlier in this flow".
 *
 * Returns the most recent binding (by created_at desc) for that entity table.
 */
export async function resolveEntityInFlow(
  flowInstanceId: string,
  tenantId: string,
  entityTable: string
) {
  const [binding] = await db
    .select()
    .from(peStepEntityBindings)
    .where(
      and(
        eq(peStepEntityBindings.flowInstanceId, flowInstanceId),
        eq(peStepEntityBindings.tenantId, tenantId),
        eq(peStepEntityBindings.entityTable, entityTable)
      )
    )
    .orderBy(desc(peStepEntityBindings.createdAt))
    .limit(1);

  return binding ?? null;
}

/**
 * Resolve multiple entity tables in a flow at once.
 * Returns a map: { "scm_leads": binding, "scm_opportunities": binding, ... }
 */
export async function resolveEntitiesInFlow(
  flowInstanceId: string,
  tenantId: string,
  entityTables: string[]
): Promise<Record<string, typeof peStepEntityBindings.$inferSelect>> {
  if (entityTables.length === 0) return {};

  const allBindings = await db
    .select()
    .from(peStepEntityBindings)
    .where(
      and(
        eq(peStepEntityBindings.flowInstanceId, flowInstanceId),
        eq(peStepEntityBindings.tenantId, tenantId)
      )
    )
    .orderBy(desc(peStepEntityBindings.createdAt));

  // For each requested table, return the most recent binding
  const result: Record<string, typeof peStepEntityBindings.$inferSelect> = {};
  for (const table of entityTables) {
    const binding = allBindings.find((b) => b.entityTable === table);
    if (binding) result[table] = binding;
  }
  return result;
}

/**
 * Get a single binding by ID.
 */
export async function getBinding(bindingId: string, tenantId: string) {
  const [binding] = await db
    .select()
    .from(peStepEntityBindings)
    .where(
      and(
        eq(peStepEntityBindings.id, bindingId),
        eq(peStepEntityBindings.tenantId, tenantId)
      )
    )
    .limit(1);

  return binding ?? null;
}
