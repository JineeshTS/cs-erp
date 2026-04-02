/**
 * E2E Flow Step Executor
 *
 * The execution engine that drives E2E flow progression:
 * - CRUD steps: create/update real entities via entity-step-executor (D-006)
 * - AI-with-tools steps: Claude + function calling via ai-tool-executor (D-006)
 * - Human gate steps: create pe_human_gates record, pause flow
 * - Human form steps: mark waiting_human, don't auto-execute
 * - Legacy AI/system steps: execute via Claude API (F-027) — fallback
 * - Auto-chains through consecutive auto-execute steps
 * - Stops at human gates/forms or flow completion
 *
 * Called after:
 * 1. Flow creation (to execute step 1)
 * 2. Gate resolution (to resume from next step)
 * 3. Manual step completion (via API — step-complete route)
 */

import { db } from "@/lib/db";
import { peE2eStepInstances, peE2eFlowInstances, peHumanGates } from "@/db/schema";
import { eq, and, lt, isNull, sql } from "drizzle-orm";
import {
  advanceFlowStep,
  createHumanGate,
  getFlowInstance,
  resolveHumanGate,
} from "./e2e-flow-service";
import { notifyGateCreated } from "./human-gate-manager";
import { executeStepWithAi } from "./ai-step-executor";
import { enrichGateWithAiRecommendation, collectPreviousStepSummaries } from "./ai-gate-preparer";
import { E2E_PROCESS_FLOWS } from "@/data/e2e-process-flows";
import type { E2EFlowStep, GateType } from "@/types/processes";
// D-006 Phase 2: New executors
import { executeCrudStep } from "./entity-step-executor";
import { executeAiToolStep } from "./ai-tool-executor";
import { getExecutorConfig } from "./executor-config-registry";
import { resolveStepContext } from "./flow-context-service";

// ── SLA defaults by priority (from D-005 Section 6) ──

const SLA_HOURS: Record<string, number> = {
  critical: 1,
  high: 2,
  normal: 4,
  low: 24,
};

const ESCALATION_ROLES: Record<string, string> = {
  critical: "operations_director",
  high: "department_head",
  normal: "direct_manager",
  low: "direct_manager",
};

// ── Gate type → default role mapping ──

const GATE_ROLE_DEFAULTS: Record<string, string> = {
  approval: "department_head",
  decision: "operations_manager",
  input: "field_operator",
  exception: "operations_director",
};

// ── Gate type → default priority ──

const GATE_PRIORITY_DEFAULTS: Record<string, string> = {
  approval: "normal",
  decision: "high",
  input: "normal",
  exception: "critical",
};

/**
 * Get the flow definition for an E2E flow ID.
 */
function getFlowDefinition(e2eFlowId: string) {
  return E2E_PROCESS_FLOWS.find((f) => f.id === e2eFlowId) ?? null;
}

/**
 * Get the E2EFlowStep definition for a given step number in a flow.
 */
function getStepDefinition(
  e2eFlowId: string,
  stepNumber: number
): E2EFlowStep | null {
  const flow = getFlowDefinition(e2eFlowId);
  if (!flow || stepNumber < 1 || stepNumber > flow.steps.length) return null;
  return flow.steps[stepNumber - 1];
}

/**
 * Determine if a step should auto-execute (AI/system) or create a gate (human).
 */
function isAutoExecuteStep(stepDef: E2EFlowStep): boolean {
  const executorType = stepDef.executorType ?? stepDef.type;
  return executorType === "ai_agent" || executorType === "ai" || executorType === "system";
}

/**
 * Collect output data from completed prior steps for AI context.
 */
async function getPreviousStepOutputs(
  flowInstanceId: string,
  tenantId: string,
  beforeStep: number
): Promise<Record<string, unknown>[]> {
  const steps = await db
    .select({ outputData: peE2eStepInstances.outputData, stepName: peE2eStepInstances.stepName })
    .from(peE2eStepInstances)
    .where(
      and(
        eq(peE2eStepInstances.flowInstanceId, flowInstanceId),
        eq(peE2eStepInstances.tenantId, tenantId),
        lt(peE2eStepInstances.stepNumber, beforeStep),
        eq(peE2eStepInstances.status, "completed")
      )
    )
    .orderBy(peE2eStepInstances.stepNumber)
    .limit(5);

  return steps.map((s) => ({
    stepName: s.stepName,
    ...(s.outputData as Record<string, unknown> | null ?? {}),
  }));
}

/**
 * Execute the current step of a flow instance.
 *
 * If the step is AI/system → auto-execute and advance.
 * If the step is human with gateType → create gate and pause.
 * If the step is human without gateType → mark in_progress and wait.
 *
 * Auto-chains: keeps executing consecutive AI/system steps.
 */
export async function executeCurrentStep(
  flowInstanceId: string,
  tenantId: string
): Promise<{ status: "advanced" | "paused_at_gate" | "completed" | "waiting_human" | "error"; stepsExecuted: number }> {
  let stepsExecuted = 0;
  const maxChain = 50; // safety: prevent infinite loops

  for (let i = 0; i < maxChain; i++) {
    // CSERP-004: Wrap FOR UPDATE in transaction so the lock actually holds
    const instance = await db.transaction(async (tx) => {
      const [row] = await tx
        .select()
        .from(peE2eFlowInstances)
        .where(
          and(
            eq(peE2eFlowInstances.id, flowInstanceId),
            eq(peE2eFlowInstances.tenantId, tenantId),
            isNull(peE2eFlowInstances.deletedAt)
          )
        )
        .for("update")
        .limit(1);
      return row ?? null;
    });
    if (!instance) return { status: "error", stepsExecuted };

    // Flow already finished
    if (instance.status === "completed" || instance.status === "failed" || instance.status === "cancelled") {
      return { status: "completed", stepsExecuted };
    }

    // Flow paused at gate — don't execute
    if (instance.status === "paused_at_gate") {
      return { status: "paused_at_gate", stepsExecuted };
    }

    const currentStepNum = instance.currentStepNumber;
    const stepDef = getStepDefinition(instance.e2eFlowId, currentStepNum);

    if (!stepDef) {
      console.error(
        `[StepExecutor] No step definition for ${instance.e2eFlowId} step ${currentStepNum}`
      );
      return { status: "error", stepsExecuted };
    }

    // Get the step instance record
    const [stepInstance] = await db
      .select()
      .from(peE2eStepInstances)
      .where(
        and(
          eq(peE2eStepInstances.flowInstanceId, flowInstanceId),
          eq(peE2eStepInstances.stepNumber, currentStepNum),
          eq(peE2eStepInstances.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!stepInstance) {
      console.error(
        `[StepExecutor] Step instance not found for flow ${flowInstanceId} step ${currentStepNum}`
      );
      return { status: "error", stepsExecuted };
    }

    // ── C6 fix: Evaluate step condition — skip step if condition is false ──
    if (stepDef.condition) {
      const conditionMet = await evaluateStepCondition(
        stepDef.condition,
        flowInstanceId,
        tenantId,
        currentStepNum
      );
      if (!conditionMet) {
        console.log(
          `[StepExecutor] Skipping step ${currentStepNum} (${stepDef.step}) — condition not met: "${stepDef.condition}"`
        );
        const advanced = await advanceFlowStep(flowInstanceId, tenantId, {
          skipped: true,
          skipReason: `Condition not met: ${stepDef.condition}`,
        });
        stepsExecuted++;
        if (!advanced) return { status: "error", stepsExecuted };
        if (advanced.status === "completed") return { status: "completed", stepsExecuted };
        continue;
      }
    }

    // ── D-006: Check for executor config (CRUD / AI-with-tools) ──
    // Phase 4: getExecutorConfig is now async (DB-first, then static fallback)
    const executorConfig = await getExecutorConfig(instance.e2eFlowId, currentStepNum, tenantId);

    if (executorConfig?.mode === "crud") {
      // CRUD step → create/update real entity via direct DB call
      console.log(`[StepExecutor] CRUD step ${currentStepNum}: ${stepDef.step}`);

      // Resolve context from prior steps for field pre-population
      const context = await resolveStepContext(flowInstanceId, tenantId, currentStepNum);

      const result = await executeCrudStep({
        tenantId,
        flowInstanceId,
        stepInstanceId: stepInstance.id,
        stepNumber: currentStepNum,
        config: executorConfig,
        inputData: {
          ...context?.resolvedInputs ?? {},
          ...(stepInstance.inputData as Record<string, unknown> ?? {}),
        },
        userId: (instance.metadata as Record<string, unknown>)?.triggeredBy as string ?? tenantId,
      });

      if (result.status === "failed") {
        console.error(`[StepExecutor] CRUD step ${currentStepNum} failed: ${result.error}`);
        // Mark step as failed but don't stop the flow — allow retry
        await db
          .update(peE2eStepInstances)
          .set({ status: "failed", outputData: { error: result.error } })
          .where(and(eq(peE2eStepInstances.id, stepInstance.id), eq(peE2eStepInstances.tenantId, tenantId)));
        return { status: "error", stepsExecuted };
      }

      // Advance flow with entity binding info
      const advanced = await advanceFlowStep(flowInstanceId, tenantId, {
        executorMode: "crud",
        entityTable: result.entityTable,
        entityId: result.entityId,
        entityAction: result.entityAction,
        entityData: result.entityData,
      });
      stepsExecuted++;

      if (!advanced) return { status: "error", stepsExecuted };
      if (advanced.status === "completed") {
        console.log(`[StepExecutor] Flow ${flowInstanceId} completed after ${stepsExecuted} steps`);
        return { status: "completed", stepsExecuted };
      }
      continue;
    }

    if (executorConfig?.mode === "ai_with_tools") {
      // AI-with-tools step → Claude with function calling, real DB operations
      console.log(`[StepExecutor] AI-with-tools step ${currentStepNum}: ${stepDef.step}`);
      const flowDef = getFlowDefinition(instance.e2eFlowId);

      // Gather context from prior step bindings
      const context = await resolveStepContext(flowInstanceId, tenantId, currentStepNum);

      const result = await executeAiToolStep({
        tenantId,
        flowInstanceId,
        stepInstanceId: stepInstance.id,
        stepNumber: currentStepNum,
        config: executorConfig,
        priorContext: {
          resolvedInputs: context?.resolvedInputs ?? {},
          entitySnapshots: context?.entitySnapshots ?? {},
          priorBindings: context?.priorBindings ?? {},
        },
        flowMeta: {
          flowId: instance.e2eFlowId,
          flowName: flowDef?.name ?? instance.e2eFlowId,
          entityType: instance.entityType,
          entityId: instance.entityId,
          totalSteps: instance.totalSteps,
        },
        userId: (instance.metadata as Record<string, unknown>)?.triggeredBy as string ?? tenantId,
      });

      if (result.status === "failed") {
        console.error(`[StepExecutor] AI-with-tools step ${currentStepNum} failed: ${result.error}`);
        await db
          .update(peE2eStepInstances)
          .set({ status: "failed", outputData: { error: result.error, aiAnalysis: result.aiAnalysis } })
          .where(and(eq(peE2eStepInstances.id, stepInstance.id), eq(peE2eStepInstances.tenantId, tenantId)));
        return { status: "error", stepsExecuted };
      }

      const advanced = await advanceFlowStep(flowInstanceId, tenantId, {
        executorMode: "ai_with_tools",
        entityTable: result.entityTable,
        entityId: result.entityId,
        entityAction: result.entityAction,
        aiAnalysis: result.aiAnalysis,
        toolCallsExecuted: result.toolCallsExecuted,
        tokensUsed: result.tokensUsed,
      });
      stepsExecuted++;

      if (!advanced) return { status: "error", stepsExecuted };
      if (advanced.status === "completed") {
        console.log(`[StepExecutor] Flow ${flowInstanceId} completed after ${stepsExecuted} steps`);
        return { status: "completed", stepsExecuted };
      }
      continue;
    }

    if (executorConfig?.mode === "human_form") {
      // Human form step → don't auto-execute, wait for step-complete API
      console.log(`[StepExecutor] Human form step ${currentStepNum}: ${stepDef.step} — waiting for input`);
      return { status: "waiting_human", stepsExecuted };
    }

    // ── Legacy AI/System Step: Auto-Execute via Claude API (fallback) ──
    if (isAutoExecuteStep(stepDef)) {
      const flowDef = getFlowDefinition(instance.e2eFlowId);
      const previousOutputs = await getPreviousStepOutputs(flowInstanceId, tenantId, currentStepNum);

      const output = await executeStepWithAi(stepDef, {
        flowId: instance.e2eFlowId,
        flowName: flowDef?.name ?? instance.e2eFlowId,
        flowInstanceId,
        stepNumber: currentStepNum,
        totalSteps: instance.totalSteps,
        stepName: stepDef.step,
        module: stepDef.module,
        processRef: stepDef.processRef ?? null,
        executorType: stepDef.executorType ?? stepDef.type,
        entityType: instance.entityType,
        entityId: instance.entityId,
        previousStepOutputs: previousOutputs,
      });

      // D-006: Don't advance if AI step failed
      if (output.status === "failed") {
        console.error(`[StepExecutor] AI step ${currentStepNum} failed: ${output.error}`);
        await db
          .update(peE2eStepInstances)
          .set({ status: "failed", outputData: output.result })
          .where(and(eq(peE2eStepInstances.id, stepInstance.id), eq(peE2eStepInstances.tenantId, tenantId)));
        return { status: "error", stepsExecuted };
      }

      const advanced = await advanceFlowStep(flowInstanceId, tenantId, { ...output });
      stepsExecuted++;

      if (!advanced) {
        return { status: "error", stepsExecuted };
      }

      // Check if flow completed
      if (advanced.status === "completed") {
        console.log(
          `[StepExecutor] Flow ${flowInstanceId} completed after ${stepsExecuted} auto-executed steps`
        );
        return { status: "completed", stepsExecuted };
      }

      // Continue chain — next iteration will process the next step
      continue;
    }

    // ── Human Step with Gate ──
    if (stepDef.gateType) {
      const gateType = stepDef.gateType as GateType;
      const priority = GATE_PRIORITY_DEFAULTS[gateType] ?? "normal";
      const slaHours = SLA_HOURS[priority] ?? 4;
      const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

      const assignedToRole = GATE_ROLE_DEFAULTS[gateType] ?? "operations_manager";

      const gate = await createHumanGate({
        tenantId,
        stepInstanceId: stepInstance.id,
        flowInstanceId,
        gateType,
        assignedToRole,
        slaDeadline,
        escalationToRole: ESCALATION_ROLES[priority],
        priority,
        presentedInfo: {
          flowId: instance.e2eFlowId,
          stepNumber: currentStepNum,
          stepName: stepDef.step,
          module: stepDef.module,
          processRef: stepDef.processRef ?? null,
          entityType: instance.entityType,
          entityId: instance.entityId,
        },
      });

      // Enrich gate with AI recommendation (fire-and-forget)
      const flowDefForGate = getFlowDefinition(instance.e2eFlowId);
      const stepSummaries = await collectPreviousStepSummaries(flowInstanceId, tenantId, currentStepNum);
      enrichGateWithAiRecommendation(gate.id, tenantId, {
        gateType,
        priority,
        assignedToRole,
        flowName: flowDefForGate?.name ?? instance.e2eFlowId,
        flowId: instance.e2eFlowId,
        stepName: stepDef.step,
        module: stepDef.module,
        processRef: stepDef.processRef ?? null,
        entityType: instance.entityType,
        entityId: instance.entityId,
        slaDeadlineHours: slaHours,
        previousStepSummaries: stepSummaries,
      }).catch((err) =>
        console.error(`[StepExecutor] AI gate enrichment failed:`, err)
      );

      // Dispatch notification for the gate
      await notifyGateCreated({
        tenantId,
        gateId: gate.id,
        gateType,
        assignedToRole,
        flowInstanceId,
        stepName: stepDef.step,
        priority,
        slaDeadline,
        entityType: instance.entityType,
        entityId: instance.entityId,
      });

      console.log(
        `[StepExecutor] Flow ${flowInstanceId} paused at gate — ` +
        `step ${currentStepNum} (${stepDef.step}), type: ${gateType}, ` +
        `SLA: ${slaHours}h`
      );

      return { status: "paused_at_gate", stepsExecuted };
    }

    // ── Human Step without Gate: mark in_progress and wait ──
    console.log(
      `[StepExecutor] Flow ${flowInstanceId} waiting for human — ` +
      `step ${currentStepNum} (${stepDef.step})`
    );
    return { status: "waiting_human", stepsExecuted };
  }

  console.error(
    `[StepExecutor] Chain limit reached for flow ${flowInstanceId} — possible infinite loop`
  );
  return { status: "error", stepsExecuted };
}

/**
 * Resume a flow after a human gate is resolved.
 * Advances past the gate step and continues executing.
 */
export async function resumeAfterGate(
  flowInstanceId: string,
  tenantId: string,
  gateDecision: string,
  gateDecisionData?: Record<string, unknown>
): Promise<{ status: string; stepsExecuted: number }> {
  // Advance past the gate step
  const advanced = await advanceFlowStep(flowInstanceId, tenantId, {
    gateDecision,
    gateDecisionData: gateDecisionData ?? {},
    resolvedAt: new Date().toISOString(),
  });

  if (!advanced) {
    return { status: "error", stepsExecuted: 0 };
  }

  if (advanced.status === "completed") {
    return { status: "completed", stepsExecuted: 1 };
  }

  // Continue executing from the new current step
  const result = await executeCurrentStep(flowInstanceId, tenantId);
  return {
    status: result.status,
    stepsExecuted: result.stepsExecuted + 1,
  };
}

// ═══════════════════════════════════════════════════════════
// AI ASSIST — Run AI on ANY step (including human/manual)
// ═══════════════════════════════════════════════════════════

/**
 * Generate AI output for a specific step without advancing the flow.
 * Works on any step type (AI, human, system) as long as it's the current step.
 * Stores the AI result in the step's inputData for user review.
 */
export async function aiAssistStep(
  flowInstanceId: string,
  tenantId: string,
  stepNumber: number
): Promise<{ status: "generated" | "error"; result?: Record<string, unknown>; error?: string }> {
  const instance = await getFlowInstance(flowInstanceId, tenantId);
  if (!instance) {
    return { status: "error", error: "Flow instance not found" };
  }

  if (instance.status === "completed" || instance.status === "failed" || instance.status === "cancelled") {
    return { status: "error", error: `Flow is ${instance.status}, cannot AI assist` };
  }

  if (stepNumber !== instance.currentStepNumber) {
    return { status: "error", error: `Step ${stepNumber} is not the current step (current: ${instance.currentStepNumber})` };
  }

  const stepDef = getStepDefinition(instance.e2eFlowId, stepNumber);
  if (!stepDef) {
    return { status: "error", error: `No step definition for step ${stepNumber}` };
  }

  // Check aiAssistable flag (defaults to true)
  if (stepDef.aiAssistable === false) {
    return { status: "error", error: "This step is not AI-assistable" };
  }

  // Get the step instance record
  const [stepInstance] = await db
    .select()
    .from(peE2eStepInstances)
    .where(
      and(
        eq(peE2eStepInstances.flowInstanceId, flowInstanceId),
        eq(peE2eStepInstances.stepNumber, stepNumber),
        eq(peE2eStepInstances.tenantId, tenantId)
      )
    )
    .limit(1);

  if (!stepInstance) {
    return { status: "error", error: "Step instance not found" };
  }

  // Execute AI on this step
  const flowDef = getFlowDefinition(instance.e2eFlowId);
  const previousOutputs = await getPreviousStepOutputs(flowInstanceId, tenantId, stepNumber);

  const aiResult = await executeStepWithAi(stepDef, {
    flowId: instance.e2eFlowId,
    flowName: flowDef?.name ?? instance.e2eFlowId,
    flowInstanceId,
    stepNumber,
    totalSteps: instance.totalSteps,
    stepName: stepDef.step,
    module: stepDef.module,
    processRef: stepDef.processRef ?? null,
    executorType: stepDef.executorType ?? stepDef.type,
    entityType: instance.entityType,
    entityId: instance.entityId,
    previousStepOutputs: previousOutputs,
  });

  // Store AI result in inputData as a preview (does NOT advance the flow)
  await db
    .update(peE2eStepInstances)
    .set({
      inputData: {
        ...(stepInstance.inputData as Record<string, unknown> | null ?? {}),
        aiAssistResult: aiResult.result,
        aiAssistModel: aiResult.aiModel,
        aiAssistTokens: aiResult.tokensUsed,
        aiAssistedAt: new Date().toISOString(),
      },
    })
    .where(
      and(
        eq(peE2eStepInstances.id, stepInstance.id),
        eq(peE2eStepInstances.tenantId, tenantId)
      )
    );

  console.log(
    `[StepExecutor] AI assist generated for flow ${flowInstanceId} step ${stepNumber} (${stepDef.step})`
  );

  return { status: "generated", result: aiResult.result as Record<string, unknown> };
}

/**
 * Accept AI assist output for a step — completes the step and resumes flow.
 * If the step has a pending gate, resolves it with the given decision.
 * If editedOutput is provided, uses that instead of the stored AI result.
 */
export async function acceptAiAssist(
  flowInstanceId: string,
  tenantId: string,
  stepNumber: number,
  userId: string,
  editedOutput?: Record<string, unknown>,
  gateDecision?: string
): Promise<{ status: string; stepsExecuted: number }> {
  const instance = await getFlowInstance(flowInstanceId, tenantId);
  if (!instance) {
    return { status: "error", stepsExecuted: 0 };
  }

  if (stepNumber !== instance.currentStepNumber) {
    return { status: "error", stepsExecuted: 0 };
  }

  // Get the step instance to read the stored AI result
  const [stepInstance] = await db
    .select()
    .from(peE2eStepInstances)
    .where(
      and(
        eq(peE2eStepInstances.flowInstanceId, flowInstanceId),
        eq(peE2eStepInstances.stepNumber, stepNumber),
        eq(peE2eStepInstances.tenantId, tenantId)
      )
    )
    .limit(1);

  if (!stepInstance) {
    return { status: "error", stepsExecuted: 0 };
  }

  const inputData = stepInstance.inputData as Record<string, unknown> | null;
  const storedResult = inputData?.aiAssistResult as Record<string, unknown> | undefined;
  const finalOutput = editedOutput ?? storedResult ?? {};

  // If flow is paused at a gate, resolve the gate first
  if (instance.status === "paused_at_gate") {
    const [pendingGate] = await db
      .select()
      .from(peHumanGates)
      .where(
        and(
          eq(peHumanGates.flowInstanceId, flowInstanceId),
          eq(peHumanGates.stepInstanceId, stepInstance.id),
          eq(peHumanGates.tenantId, tenantId),
          isNull(peHumanGates.decision)
        )
      )
      .limit(1);

    if (pendingGate) {
      const decision = gateDecision ?? "approved";
      await resolveHumanGate(
        pendingGate.id,
        tenantId,
        decision,
        userId,
        { aiAssisted: true, aiOutput: finalOutput }
      );

      // resumeAfterGate advances past the gate step and continues
      return resumeAfterGate(flowInstanceId, tenantId, decision, {
        aiAssisted: true,
        aiOutput: finalOutput,
        acceptedBy: userId,
        acceptedAt: new Date().toISOString(),
      });
    }
  }

  // Regular step (not at gate) — advance with AI output
  const advanced = await advanceFlowStep(flowInstanceId, tenantId, {
    ...finalOutput,
    aiAssisted: true,
    acceptedBy: userId,
    acceptedAt: new Date().toISOString(),
  });

  if (!advanced) {
    return { status: "error", stepsExecuted: 0 };
  }

  if (advanced.status === "completed") {
    return { status: "completed", stepsExecuted: 1 };
  }

  // Continue executing from the new current step (auto-chain AI/system steps)
  const result = await executeCurrentStep(flowInstanceId, tenantId);
  return {
    status: result.status,
    stepsExecuted: result.stepsExecuted + 1,
  };
}

/**
 * Reject AI assist — clear the stored AI result from the step.
 */
export async function rejectAiAssist(
  flowInstanceId: string,
  tenantId: string,
  stepNumber: number
): Promise<{ status: "cleared" | "error" }> {
  const instance = await getFlowInstance(flowInstanceId, tenantId);
  if (!instance) return { status: "error" };

  const [stepInstance] = await db
    .select()
    .from(peE2eStepInstances)
    .where(
      and(
        eq(peE2eStepInstances.flowInstanceId, flowInstanceId),
        eq(peE2eStepInstances.stepNumber, stepNumber),
        eq(peE2eStepInstances.tenantId, tenantId)
      )
    )
    .limit(1);

  if (!stepInstance) return { status: "error" };

  // Remove AI assist data from inputData
  const inputData = stepInstance.inputData as Record<string, unknown> | null ?? {};
  const { aiAssistResult: _r, aiAssistModel: _m, aiAssistTokens: _t, aiAssistedAt: _a, ...rest } = inputData;

  await db
    .update(peE2eStepInstances)
    .set({ inputData: rest })
    .where(
      and(
        eq(peE2eStepInstances.id, stepInstance.id),
        eq(peE2eStepInstances.tenantId, tenantId)
      )
    );

  console.log(
    `[StepExecutor] AI assist rejected for flow ${flowInstanceId} step ${stepNumber}`
  );

  return { status: "cleared" };
}

// ═══════════════════════════════════════════════════════════
// C6: CONDITION EVALUATION
// ═══════════════════════════════════════════════════════════

/**
 * Evaluate a step condition against data from prior completed steps.
 *
 * Conditions reference variables from prior step outputs using simple
 * JavaScript-like expressions. We evaluate them safely against a
 * flat context built from all prior step outputs.
 *
 * Examples:
 *   "leadScore >= 70" → auto-qualified leads skip the gate
 *   "screeningResult !== 'CLEAR'" → only fire when sanctions hit
 *   "hasDangerousGoods" → truthy check
 *
 * Security: uses a restricted evaluator — no eval(), no Function().
 */
async function evaluateStepCondition(
  condition: string,
  flowInstanceId: string,
  tenantId: string,
  beforeStep: number
): Promise<boolean> {
  // Build context from all prior completed step outputs
  const priorOutputs = await getPreviousStepOutputs(flowInstanceId, tenantId, beforeStep);
  const context: Record<string, unknown> = {};
  for (const output of priorOutputs) {
    for (const [key, value] of Object.entries(output)) {
      if (key !== "stepName") {
        context[key] = value;
      }
    }
  }

  try {
    return evaluateSimpleCondition(condition, context);
  } catch (err) {
    console.warn(
      `[StepExecutor] Condition evaluation failed for "${condition}":`,
      err instanceof Error ? err.message : err
    );
    // On evaluation error, execute the step (safe default)
    return true;
  }
}

/**
 * Simple condition evaluator — no eval/Function.
 * Supports: ==, !=, !==, ===, >=, <=, >, <, &&, ||, truthy checks.
 */
function evaluateSimpleCondition(
  condition: string,
  context: Record<string, unknown>
): boolean {
  // Handle && (all parts must be true)
  if (condition.includes("&&")) {
    return condition.split("&&").every((part) =>
      evaluateSimpleCondition(part.trim(), context)
    );
  }

  // Handle || (any part must be true)
  if (condition.includes("||")) {
    return condition.split("||").some((part) =>
      evaluateSimpleCondition(part.trim(), context)
    );
  }

  // Comparison operators
  const compMatch = condition.match(
    /^(\w+)\s*(===|!==|==|!=|>=|<=|>|<)\s*(.+)$/
  );
  if (compMatch) {
    const [, varName, operator, rawValue] = compMatch;
    const lhs = context[varName];
    const rhs = parseConditionValue(rawValue.trim());

    switch (operator) {
      case "===": return lhs === rhs;
      case "!==": return lhs !== rhs;
      case "==": return lhs == rhs;
      case "!=": return lhs != rhs;
      case ">=": return Number(lhs) >= Number(rhs);
      case "<=": return Number(lhs) <= Number(rhs);
      case ">": return Number(lhs) > Number(rhs);
      case "<": return Number(lhs) < Number(rhs);
      default: return true;
    }
  }

  // Negation: "!varName"
  if (condition.startsWith("!") && /^\!\w+$/.test(condition)) {
    return !context[condition.slice(1)];
  }

  // Simple truthy: "hasDangerousGoods"
  if (/^\w+$/.test(condition)) {
    return !!context[condition];
  }

  // Cannot parse — default to executing the step
  return true;
}

function parseConditionValue(raw: string): unknown {
  // String literal: 'CLEAR' or "CLEAR"
  if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"'))) {
    return raw.slice(1, -1);
  }
  // Boolean
  if (raw === "true") return true;
  if (raw === "false") return false;
  // Number
  const num = Number(raw);
  if (!isNaN(num)) return num;
  // Null
  if (raw === "null") return null;
  // Return as string
  return raw;
}
