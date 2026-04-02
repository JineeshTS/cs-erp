/**
 * Definition Resolver — DB-First Step Resolution
 *
 * Resolves E2E flow step configurations from the database (pe_flow_definitions,
 * pe_flow_process_links, pe_process_definitions, pe_task_definitions).
 *
 * This bridges the existing TypeScript-based executor configs with the new
 * DB-driven definition layer. The executor-config-registry calls this FIRST,
 * then falls back to the static FLOW_CONFIGS if no DB match is found.
 *
 * Resolution logic:
 * 1. Find flow definition by flowCode (tenant-first, fallback to system)
 * 2. Find flow_process_link by flow_definition_id + step_order
 * 3. If process_definition_id: get process + first task via process_task_links
 * 4. If task_definition_id: get standalone task directly
 * 5. Return task's executor_config JSONB as StepExecutorConfig
 */

import { db } from "@/lib/db";
import {
  peFlowDefinitions,
  peFlowProcessLinks,
  peProcessDefinitions,
  peProcessTaskLinks,
  peTaskDefinitions,
} from "@/db/schema";
import { eq, and, or, isNull, asc } from "drizzle-orm";
import type { StepExecutorConfig } from "./executor-configs/e2e-01-lead-to-quote";

export interface ResolvedStepFromDb {
  taskDef: {
    id: string;
    taskCode: string;
    name: string;
    executorType: string | null;
    executorMode: string | null;
    entityTable: string | null;
    entityAction: string | null;
    gateType: string | null;
    assignedRole: string | null;
    slaHours: string | null;
  } | null;
  processDef: {
    id: string;
    processCode: string;
    name: string;
    domain: string | null;
    agentName: string | null;
    automationLevel: string | null;
  } | null;
  executorConfig: StepExecutorConfig | null;
}

/**
 * Resolve a step's executor config from the database.
 *
 * @param e2eFlowId - The flow code (e.g., "E2E-01")
 * @param stepNumber - The 1-based step number
 * @param tenantId - Optional tenant ID (checks tenant-specific first, then system)
 * @returns Resolved step data with executor config, or null if not found in DB
 */
export async function resolveStepFromDb(
  e2eFlowId: string,
  stepNumber: number,
  tenantId?: string
): Promise<ResolvedStepFromDb | null> {
  try {
    // 1. Find flow definition: tenant-specific first, then system
    let flow: { id: string } | undefined;

    if (tenantId) {
      // Try tenant-specific first
      const [tenantFlow] = await db
        .select({ id: peFlowDefinitions.id })
        .from(peFlowDefinitions)
        .where(
          and(
            eq(peFlowDefinitions.flowCode, e2eFlowId),
            eq(peFlowDefinitions.tenantId, tenantId),
            isNull(peFlowDefinitions.deletedAt)
          )
        )
        .limit(1);

      flow = tenantFlow;
    }

    if (!flow) {
      // Fallback to system definition
      const [systemFlow] = await db
        .select({ id: peFlowDefinitions.id })
        .from(peFlowDefinitions)
        .where(
          and(
            eq(peFlowDefinitions.flowCode, e2eFlowId),
            isNull(peFlowDefinitions.tenantId),
            isNull(peFlowDefinitions.deletedAt)
          )
        )
        .limit(1);

      flow = systemFlow;
    }

    if (!flow) return null;

    // 2. Find the flow-process link for this step
    const [link] = await db
      .select()
      .from(peFlowProcessLinks)
      .where(
        and(
          eq(peFlowProcessLinks.flowDefinitionId, flow.id),
          eq(peFlowProcessLinks.stepOrder, stepNumber),
          isNull(peFlowProcessLinks.deletedAt)
        )
      )
      .limit(1);

    if (!link) return null;

    let taskDef: ResolvedStepFromDb["taskDef"] = null;
    let processDef: ResolvedStepFromDb["processDef"] = null;
    let executorConfig: StepExecutorConfig | null = null;

    // 3. If linked to a process definition, get process + first task
    if (link.processDefinitionId) {
      const [proc] = await db
        .select({
          id: peProcessDefinitions.id,
          processCode: peProcessDefinitions.processCode,
          name: peProcessDefinitions.name,
          domain: peProcessDefinitions.domain,
          agentName: peProcessDefinitions.agentName,
          automationLevel: peProcessDefinitions.automationLevel,
        })
        .from(peProcessDefinitions)
        .where(
          and(
            eq(peProcessDefinitions.id, link.processDefinitionId),
            isNull(peProcessDefinitions.deletedAt)
          )
        )
        .limit(1);

      if (proc) {
        processDef = proc;

        // Get the first task via process-task links (ordered by task_order)
        const [firstTaskLink] = await db
          .select({ taskDefinitionId: peProcessTaskLinks.taskDefinitionId })
          .from(peProcessTaskLinks)
          .where(
            and(
              eq(peProcessTaskLinks.processDefinitionId, proc.id),
              isNull(peProcessTaskLinks.deletedAt)
            )
          )
          .orderBy(asc(peProcessTaskLinks.taskOrder))
          .limit(1);

        if (firstTaskLink) {
          const [task] = await db
            .select({
              id: peTaskDefinitions.id,
              taskCode: peTaskDefinitions.taskCode,
              name: peTaskDefinitions.name,
              executorType: peTaskDefinitions.executorType,
              executorMode: peTaskDefinitions.executorMode,
              entityTable: peTaskDefinitions.entityTable,
              entityAction: peTaskDefinitions.entityAction,
              executorConfig: peTaskDefinitions.executorConfig,
              gateType: peTaskDefinitions.gateType,
              assignedRole: peTaskDefinitions.assignedRole,
              slaHours: peTaskDefinitions.slaHours,
            })
            .from(peTaskDefinitions)
            .where(
              and(
                eq(peTaskDefinitions.id, firstTaskLink.taskDefinitionId),
                isNull(peTaskDefinitions.deletedAt)
              )
            )
            .limit(1);

          if (task) {
            taskDef = {
              id: task.id,
              taskCode: task.taskCode,
              name: task.name,
              executorType: task.executorType,
              executorMode: task.executorMode,
              entityTable: task.entityTable,
              entityAction: task.entityAction,
              gateType: task.gateType,
              assignedRole: task.assignedRole,
              slaHours: task.slaHours,
            };
            executorConfig = task.executorConfig as StepExecutorConfig | null;
          }
        }
      }
    }

    // 4. If linked to a standalone task definition (gate), get it directly
    if (link.taskDefinitionId) {
      const [task] = await db
        .select({
          id: peTaskDefinitions.id,
          taskCode: peTaskDefinitions.taskCode,
          name: peTaskDefinitions.name,
          executorType: peTaskDefinitions.executorType,
          executorMode: peTaskDefinitions.executorMode,
          entityTable: peTaskDefinitions.entityTable,
          entityAction: peTaskDefinitions.entityAction,
          executorConfig: peTaskDefinitions.executorConfig,
          gateType: peTaskDefinitions.gateType,
          assignedRole: peTaskDefinitions.assignedRole,
          slaHours: peTaskDefinitions.slaHours,
        })
        .from(peTaskDefinitions)
        .where(
          and(
            eq(peTaskDefinitions.id, link.taskDefinitionId),
            isNull(peTaskDefinitions.deletedAt)
          )
        )
        .limit(1);

      if (task) {
        taskDef = {
          id: task.id,
          taskCode: task.taskCode,
          name: task.name,
          executorType: task.executorType,
          executorMode: task.executorMode,
          entityTable: task.entityTable,
          entityAction: task.entityAction,
          gateType: task.gateType,
          assignedRole: task.assignedRole,
          slaHours: task.slaHours,
        };
        executorConfig = task.executorConfig as StepExecutorConfig | null;
      }
    }

    // 5. Return null if we found no task/process data at all
    if (!taskDef && !processDef) return null;

    return { taskDef, processDef, executorConfig };
  } catch (err) {
    // Log but don't crash — caller will fall back to TypeScript configs
    console.error(
      `[definition-resolver] Error resolving step ${e2eFlowId}#${stepNumber}:`,
      err
    );
    return null;
  }
}
