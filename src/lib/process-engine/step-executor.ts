/**
 * E2E Flow Step Executor
 *
 * The execution engine that drives E2E flow progression:
 * - AI/system steps: execute via Claude API (F-027) with contextual prompts
 * - Human gate steps: create pe_human_gates record, pause flow
 * - Auto-chains through consecutive AI/system steps
 * - Stops at human gates or flow completion
 *
 * Called after:
 * 1. Flow creation (to execute step 1)
 * 2. Gate resolution (to resume from next step)
 * 3. Manual step completion (via API)
 */

import { db } from "@/lib/db";
import { peE2eStepInstances, peE2eFlowInstances } from "@/db/schema";
import { eq, and, lt } from "drizzle-orm";
import {
  advanceFlowStep,
  createHumanGate,
  getFlowInstance,
} from "./e2e-flow-service";
import { notifyGateCreated } from "./human-gate-manager";
import { executeStepWithAi } from "./ai-step-executor";
import { enrichGateWithAiRecommendation, collectPreviousStepSummaries } from "./ai-gate-preparer";
import { E2E_PROCESS_FLOWS } from "@/data/e2e-process-flows";
import type { E2EFlowStep, GateType } from "@/types/processes";

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
    const instance = await getFlowInstance(flowInstanceId, tenantId);
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

    // ── AI/System Step: Auto-Execute via Claude API ──
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
