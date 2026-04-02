/**
 * Flow Context Service (D-006 Phase 1)
 *
 * Resolves step input data from prior entity bindings.
 * Uses the step's `inputFields` metadata and `providedBy` references
 * to pull real entity data from earlier steps in the same flow.
 *
 * Example: Step 4 (Opportunity Creation) has inputFields with
 * `providedBy: "step:1"` → resolves the entity binding from step 1,
 * returns the lead data as context for step 4's form.
 */

import { db } from "@/lib/db";
import { peE2eStepInstances, peStepEntityBindings } from "@/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { E2E_PROCESS_FLOWS } from "@/data/e2e-process-flows";
import type { E2EFlowStep, StepDataField } from "@/types/processes";
import { getFlowInstance } from "./e2e-flow-service";

// ═══════════════════════════════════════════════════════════
// STEP CONTEXT RESOLUTION
// ═══════════════════════════════════════════════════════════

interface StepContext {
  /** The step definition from e2e-process-flows.ts */
  stepDef: E2EFlowStep;
  /** Current step number */
  stepNumber: number;
  /** Entity bindings from prior steps, keyed by step number */
  priorBindings: Record<number, PriorStepBinding>;
  /** Resolved input field values from prior bindings */
  resolvedInputs: Record<string, unknown>;
  /** Fields that could not be resolved (need manual input) */
  unresolvedFields: StepDataField[];
  /** Entity data snapshots from prior steps (for form pre-fill) */
  entitySnapshots: Record<string, Record<string, unknown>>;
}

interface PriorStepBinding {
  stepNumber: number;
  stepName: string;
  entityTable: string | null;
  entityId: string | null;
  entityAction: string | null;
  entityData: Record<string, unknown> | null;
  outputData: Record<string, unknown> | null;
}

/**
 * Resolve the full context for a step, pulling data from prior step bindings.
 */
export async function resolveStepContext(
  flowInstanceId: string,
  tenantId: string,
  stepNumber: number
): Promise<StepContext | null> {
  const instance = await getFlowInstance(flowInstanceId, tenantId);
  if (!instance) return null;

  const flowDef = E2E_PROCESS_FLOWS.find((f) => f.id === instance.e2eFlowId);
  if (!flowDef || stepNumber < 1 || stepNumber > flowDef.steps.length) return null;

  const stepDef = flowDef.steps[stepNumber - 1];

  // Get all prior step instances with their bindings
  const priorSteps = await db
    .select()
    .from(peE2eStepInstances)
    .where(
      and(
        eq(peE2eStepInstances.flowInstanceId, flowInstanceId),
        eq(peE2eStepInstances.tenantId, tenantId),
        lte(peE2eStepInstances.stepNumber, stepNumber - 1)
      )
    )
    .orderBy(peE2eStepInstances.stepNumber);

  // Get entity bindings for all prior steps
  const bindings = await db
    .select()
    .from(peStepEntityBindings)
    .where(
      and(
        eq(peStepEntityBindings.flowInstanceId, flowInstanceId),
        eq(peStepEntityBindings.tenantId, tenantId)
      )
    )
    .orderBy(peStepEntityBindings.createdAt);

  // Build prior bindings map
  const priorBindings: Record<number, PriorStepBinding> = {};
  for (const step of priorSteps) {
    const stepBinding = bindings.find((b) => b.stepInstanceId === step.id);
    priorBindings[step.stepNumber] = {
      stepNumber: step.stepNumber,
      stepName: step.stepName,
      entityTable: stepBinding?.entityTable ?? step.entityTable ?? null,
      entityId: stepBinding?.entityId ?? step.entityId ?? null,
      entityAction: stepBinding?.entityAction ?? step.entityAction ?? null,
      entityData: (stepBinding?.entityData as Record<string, unknown>) ?? null,
      outputData: (step.outputData as Record<string, unknown>) ?? null,
    };
  }

  // Resolve input fields
  const resolvedInputs: Record<string, unknown> = {};
  const unresolvedFields: StepDataField[] = [];
  const entitySnapshots: Record<string, Record<string, unknown>> = {};

  if (stepDef.inputFields) {
    for (const field of stepDef.inputFields) {
      const resolved = resolveField(field, priorBindings);
      if (resolved !== undefined) {
        resolvedInputs[field.field] = resolved;
      } else if (field.required) {
        unresolvedFields.push(field);
      }
    }
  }

  // Collect entity snapshots from prior bindings
  for (const [stepNum, binding] of Object.entries(priorBindings)) {
    if (binding.entityData && binding.entityTable) {
      entitySnapshots[`step:${stepNum}:${binding.entityTable}`] = binding.entityData;
    }
  }

  return {
    stepDef,
    stepNumber,
    priorBindings,
    resolvedInputs,
    unresolvedFields,
    entitySnapshots,
  };
}

/**
 * Resolve a single input field from prior step bindings.
 *
 * `providedBy` formats:
 * - "step:1" → get entity data or output data from step 1
 * - "step:1:fieldName" → get a specific field from step 1's entity/output
 */
function resolveField(
  field: StepDataField,
  priorBindings: Record<number, PriorStepBinding>
): unknown {
  if (!field.providedBy) return undefined;

  const match = field.providedBy.match(/^step:(\d+)(?::(.+))?$/);
  if (!match) return undefined;

  const stepNum = parseInt(match[1], 10);
  const specificField = match[2];
  const binding = priorBindings[stepNum];
  if (!binding) return undefined;

  // If a specific field is requested, look in entity data then output data
  if (specificField) {
    if (binding.entityData && specificField in binding.entityData) {
      return binding.entityData[specificField];
    }
    if (binding.outputData && specificField in binding.outputData) {
      return binding.outputData[specificField];
    }
    // Try nested in data object
    const dataObj = binding.outputData?.data as Record<string, unknown> | undefined;
    if (dataObj && specificField in dataObj) {
      return dataObj[specificField];
    }
    return undefined;
  }

  // No specific field → return the full entity data or output data
  if (binding.entityData) return binding.entityData;
  if (binding.outputData) return binding.outputData;
  return undefined;
}

// ═══════════════════════════════════════════════════════════
// ENTITY LOOKUP ACROSS FLOW
// ═══════════════════════════════════════════════════════════

/**
 * Get all entities that have been created/updated in a flow,
 * grouped by table name. Useful for the flow detail page to show
 * "Real entities produced by this flow".
 */
export async function getFlowEntities(flowInstanceId: string, tenantId: string) {
  const bindings = await db
    .select()
    .from(peStepEntityBindings)
    .where(
      and(
        eq(peStepEntityBindings.flowInstanceId, flowInstanceId),
        eq(peStepEntityBindings.tenantId, tenantId)
      )
    )
    .orderBy(peStepEntityBindings.createdAt);

  // Group by entity table
  const grouped: Record<string, Array<{
    bindingId: string;
    entityId: string;
    entityAction: string;
    entityData: Record<string, unknown> | null;
    stepInstanceId: string;
    createdAt: Date;
  }>> = {};

  for (const b of bindings) {
    if (!grouped[b.entityTable]) grouped[b.entityTable] = [];
    grouped[b.entityTable].push({
      bindingId: b.id,
      entityId: b.entityId,
      entityAction: b.entityAction,
      entityData: b.entityData as Record<string, unknown> | null,
      stepInstanceId: b.stepInstanceId,
      createdAt: b.createdAt,
    });
  }

  return grouped;
}
