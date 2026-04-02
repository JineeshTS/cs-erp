/**
 * Flow Definition Service
 *
 * CRUD + clone operations for pe_flow_definitions and linked entities.
 * System definitions (source='system', tenant_id IS NULL) are read-only templates.
 * Tenants can clone system templates and create custom definitions.
 */

import { db } from "@/lib/db";
import {
  peFlowDefinitions,
  peFlowProcessLinks,
  peProcessDefinitions,
  peProcessTaskLinks,
  peTaskDefinitions,
} from "@/db/schema";
import { eq, and, or, isNull, ilike, sql, asc, gt, desc } from "drizzle-orm";

// ── Types ──

export interface FlowDefinitionListItem {
  id: string;
  flowCode: string;
  name: string;
  description: string | null;
  category: string | null;
  triggerEvent: string | null;
  entityType: string | null;
  source: string;
  version: number;
  stepsCount: number;
  participatingModules: string[] | null;
  aiAgents: string[] | null;
  typicalTimeline: string | null;
  createdAt: Date;
}

export interface FlowDefinitionDetail {
  id: string;
  flowCode: string;
  name: string;
  description: string | null;
  category: string | null;
  triggerEvent: string | null;
  entityType: string | null;
  source: string;
  version: number;
  isPublished: boolean;
  participatingModules: string[] | null;
  aiAgents: string[] | null;
  handoffPoints: string[] | null;
  typicalTimeline: string | null;
  kpis: string[] | null;
  humanGates: string[] | null;
  conditionalBranches: string[] | null;
  childFlows: string[] | null;
  clonedFromId: string | null;
  createdAt: Date;
  updatedAt: Date;
  steps: FlowStep[];
}

export interface FlowStep {
  id: string;
  stepOrder: number;
  stepName: string | null;
  phase: string | null;
  module: string | null;
  moduleUrl: string | null;
  condition: string | null;
  isParallel: boolean;
  parallelGroup: string | null;
  // Linked process (if any)
  process: {
    id: string;
    processCode: string;
    name: string;
    domain: string | null;
    agentName: string | null;
    agentType: string | null;
    automationLevel: string | null;
    tasks: FlowStepTask[];
  } | null;
  // Standalone task (if any — for gates)
  task: {
    id: string;
    taskCode: string;
    name: string;
    executorType: string | null;
    executorMode: string | null;
    gateType: string | null;
    assignedRole: string | null;
    slaHours: string | null;
  } | null;
}

export interface FlowStepTask {
  id: string;
  taskCode: string;
  name: string;
  taskOrder: number;
  executorType: string | null;
  executorMode: string | null;
  gateType: string | null;
  assignedRole: string | null;
}

// ── List Flow Definitions ──

export async function listFlowDefinitions(params: {
  tenantId?: string;
  source?: string;
  category?: string;
  search?: string;
  cursor?: string;
  limit?: number;
}): Promise<{ data: FlowDefinitionListItem[]; meta: { cursor: string | null } }> {
  const limit = Math.min(params.limit ?? 50, 50);

  // Build conditions: system (tenant_id IS NULL) + tenant's own
  const conditions = [];

  // Visibility: system definitions (no tenant) + tenant's own
  if (params.tenantId) {
    conditions.push(
      or(
        isNull(peFlowDefinitions.tenantId),
        eq(peFlowDefinitions.tenantId, params.tenantId)
      )
    );
  } else {
    conditions.push(isNull(peFlowDefinitions.tenantId));
  }

  // Soft delete filter
  conditions.push(isNull(peFlowDefinitions.deletedAt));

  // Source filter
  if (params.source) {
    conditions.push(eq(peFlowDefinitions.source, params.source));
  }

  // Category filter
  if (params.category) {
    conditions.push(eq(peFlowDefinitions.category, params.category));
  }

  // Search filter
  if (params.search) {
    const pattern = `%${params.search}%`;
    conditions.push(
      or(
        ilike(peFlowDefinitions.name, pattern),
        ilike(peFlowDefinitions.flowCode, pattern),
        ilike(peFlowDefinitions.description, pattern)
      )
    );
  }

  // Cursor pagination
  if (params.cursor) {
    conditions.push(gt(peFlowDefinitions.id, params.cursor));
  }

  // Count steps per flow via subquery
  const stepsCountSq = db
    .select({
      flowId: peFlowProcessLinks.flowDefinitionId,
      count: sql<number>`count(*)`.as("steps_count"),
    })
    .from(peFlowProcessLinks)
    .where(isNull(peFlowProcessLinks.deletedAt))
    .groupBy(peFlowProcessLinks.flowDefinitionId)
    .as("steps_sq");

  const rows = await db
    .select({
      id: peFlowDefinitions.id,
      flowCode: peFlowDefinitions.flowCode,
      name: peFlowDefinitions.name,
      description: peFlowDefinitions.description,
      category: peFlowDefinitions.category,
      triggerEvent: peFlowDefinitions.triggerEvent,
      entityType: peFlowDefinitions.entityType,
      source: peFlowDefinitions.source,
      version: peFlowDefinitions.version,
      participatingModules: peFlowDefinitions.participatingModules,
      aiAgents: peFlowDefinitions.aiAgents,
      typicalTimeline: peFlowDefinitions.typicalTimeline,
      createdAt: peFlowDefinitions.createdAt,
      stepsCount: sql<number>`coalesce(${stepsCountSq.count}, 0)`,
    })
    .from(peFlowDefinitions)
    .leftJoin(stepsCountSq, eq(peFlowDefinitions.id, stepsCountSq.flowId))
    .where(and(...conditions))
    .orderBy(asc(peFlowDefinitions.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const data = rows.slice(0, limit).map((r) => ({
    id: r.id,
    flowCode: r.flowCode,
    name: r.name,
    description: r.description,
    category: r.category,
    triggerEvent: r.triggerEvent,
    entityType: r.entityType,
    source: r.source,
    version: r.version,
    stepsCount: Number(r.stepsCount),
    participatingModules: r.participatingModules as string[] | null,
    aiAgents: r.aiAgents as string[] | null,
    typicalTimeline: r.typicalTimeline,
    createdAt: r.createdAt,
  }));

  return {
    data,
    meta: {
      cursor: hasMore ? data[data.length - 1]?.id ?? null : null,
    },
  };
}

// ── Get Flow Definition with Steps ──

export async function getFlowDefinition(
  tenantId: string,
  id: string
): Promise<FlowDefinitionDetail | null> {
  // Fetch the flow definition (system or tenant-owned)
  const [flow] = await db
    .select()
    .from(peFlowDefinitions)
    .where(
      and(
        eq(peFlowDefinitions.id, id),
        isNull(peFlowDefinitions.deletedAt),
        or(
          isNull(peFlowDefinitions.tenantId),
          eq(peFlowDefinitions.tenantId, tenantId)
        )
      )
    )
    .limit(1);

  if (!flow) return null;

  // Fetch flow-process links ordered by step_order
  const links = await db
    .select()
    .from(peFlowProcessLinks)
    .where(
      and(
        eq(peFlowProcessLinks.flowDefinitionId, flow.id),
        isNull(peFlowProcessLinks.deletedAt)
      )
    )
    .orderBy(asc(peFlowProcessLinks.stepOrder));

  // Batch-fetch all linked process definitions
  const processIds = links
    .map((l) => l.processDefinitionId)
    .filter((pid): pid is string => pid !== null);

  const processes =
    processIds.length > 0
      ? await db
          .select()
          .from(peProcessDefinitions)
          .where(
            and(
              sql`${peProcessDefinitions.id} = ANY(${processIds})`,
              isNull(peProcessDefinitions.deletedAt)
            )
          )
      : [];
  const processMap = new Map(processes.map((p) => [p.id, p]));

  // Batch-fetch all tasks linked to those processes
  const taskLinksForProcesses =
    processIds.length > 0
      ? await db
          .select()
          .from(peProcessTaskLinks)
          .where(
            and(
              sql`${peProcessTaskLinks.processDefinitionId} = ANY(${processIds})`,
              isNull(peProcessTaskLinks.deletedAt)
            )
          )
          .orderBy(asc(peProcessTaskLinks.taskOrder))
      : [];

  // Batch-fetch standalone task definitions (for gates)
  const standaloneTaskIds = links
    .map((l) => l.taskDefinitionId)
    .filter((tid): tid is string => tid !== null);

  const allTaskIds = [
    ...standaloneTaskIds,
    ...taskLinksForProcesses.map((tl) => tl.taskDefinitionId),
  ];
  const uniqueTaskIds = [...new Set(allTaskIds)];

  const tasks =
    uniqueTaskIds.length > 0
      ? await db
          .select()
          .from(peTaskDefinitions)
          .where(
            and(
              sql`${peTaskDefinitions.id} = ANY(${uniqueTaskIds})`,
              isNull(peTaskDefinitions.deletedAt)
            )
          )
      : [];
  const taskMap = new Map(tasks.map((t) => [t.id, t]));

  // Group process-task links by process ID
  const processTaskMap = new Map<string, typeof taskLinksForProcesses>();
  for (const tl of taskLinksForProcesses) {
    const existing = processTaskMap.get(tl.processDefinitionId) ?? [];
    existing.push(tl);
    processTaskMap.set(tl.processDefinitionId, existing);
  }

  // Assemble steps
  const steps: FlowStep[] = links.map((link) => {
    let process: FlowStep["process"] = null;
    let task: FlowStep["task"] = null;

    if (link.processDefinitionId) {
      const proc = processMap.get(link.processDefinitionId);
      if (proc) {
        const procTaskLinks = processTaskMap.get(proc.id) ?? [];
        process = {
          id: proc.id,
          processCode: proc.processCode,
          name: proc.name,
          domain: proc.domain,
          agentName: proc.agentName,
          agentType: proc.agentType,
          automationLevel: proc.automationLevel,
          tasks: procTaskLinks
            .map((ptl) => {
              const t = taskMap.get(ptl.taskDefinitionId);
              if (!t) return null;
              return {
                id: t.id,
                taskCode: t.taskCode,
                name: t.name,
                taskOrder: ptl.taskOrder,
                executorType: t.executorType,
                executorMode: t.executorMode,
                gateType: t.gateType,
                assignedRole: t.assignedRole,
              };
            })
            .filter((t): t is FlowStepTask => t !== null),
        };
      }
    }

    if (link.taskDefinitionId) {
      const t = taskMap.get(link.taskDefinitionId);
      if (t) {
        task = {
          id: t.id,
          taskCode: t.taskCode,
          name: t.name,
          executorType: t.executorType,
          executorMode: t.executorMode,
          gateType: t.gateType,
          assignedRole: t.assignedRole,
          slaHours: t.slaHours,
        };
      }
    }

    return {
      id: link.id,
      stepOrder: link.stepOrder,
      stepName: link.stepName,
      phase: link.phase,
      module: link.module,
      moduleUrl: link.moduleUrl,
      condition: link.condition,
      isParallel: link.isParallel,
      parallelGroup: link.parallelGroup,
      process,
      task,
    };
  });

  return {
    id: flow.id,
    flowCode: flow.flowCode,
    name: flow.name,
    description: flow.description,
    category: flow.category,
    triggerEvent: flow.triggerEvent,
    entityType: flow.entityType,
    source: flow.source,
    version: flow.version,
    isPublished: flow.isPublished,
    participatingModules: flow.participatingModules as string[] | null,
    aiAgents: flow.aiAgents as string[] | null,
    handoffPoints: flow.handoffPoints as string[] | null,
    typicalTimeline: flow.typicalTimeline,
    kpis: flow.kpis as string[] | null,
    humanGates: flow.humanGates as string[] | null,
    conditionalBranches: flow.conditionalBranches as string[] | null,
    childFlows: flow.childFlows as string[] | null,
    clonedFromId: flow.clonedFromId,
    createdAt: flow.createdAt,
    updatedAt: flow.updatedAt,
    steps,
  };
}

// ── Create Flow Definition ──

export async function createFlowDefinition(
  tenantId: string,
  userId: string,
  data: {
    flowCode: string;
    name: string;
    description?: string;
    category?: string;
    triggerEvent?: string;
    entityType?: string;
  }
): Promise<{ id: string }> {
  const [row] = await db
    .insert(peFlowDefinitions)
    .values({
      tenantId,
      flowCode: data.flowCode,
      name: data.name,
      description: data.description ?? null,
      category: data.category ?? null,
      triggerEvent: data.triggerEvent ?? null,
      entityType: data.entityType ?? null,
      source: "custom",
      createdBy: userId,
      updatedBy: userId,
    })
    .returning({ id: peFlowDefinitions.id });

  return { id: row.id };
}

// ── Clone Flow Definition (Deep Copy) ──

export async function cloneFlowDefinition(
  tenantId: string,
  userId: string,
  flowId: string
): Promise<{ id: string } | null> {
  // 1. Get source flow
  const [sourceFlow] = await db
    .select()
    .from(peFlowDefinitions)
    .where(
      and(
        eq(peFlowDefinitions.id, flowId),
        isNull(peFlowDefinitions.deletedAt)
      )
    )
    .limit(1);

  if (!sourceFlow) return null;

  // 2. Create cloned flow definition
  const [clonedFlow] = await db
    .insert(peFlowDefinitions)
    .values({
      tenantId,
      flowCode: `${sourceFlow.flowCode}-CLN`,
      name: `${sourceFlow.name} (Clone)`,
      description: sourceFlow.description,
      category: sourceFlow.category,
      triggerEvent: sourceFlow.triggerEvent,
      entityType: sourceFlow.entityType,
      participatingModules: sourceFlow.participatingModules,
      aiAgents: sourceFlow.aiAgents,
      handoffPoints: sourceFlow.handoffPoints,
      typicalTimeline: sourceFlow.typicalTimeline,
      kpis: sourceFlow.kpis,
      humanGates: sourceFlow.humanGates,
      conditionalBranches: sourceFlow.conditionalBranches,
      childFlows: sourceFlow.childFlows,
      source: "cloned",
      clonedFromId: sourceFlow.id,
      version: 1,
      isPublished: false,
      createdBy: userId,
      updatedBy: userId,
    })
    .returning({ id: peFlowDefinitions.id });

  // 3. Get source flow-process links
  const sourceLinks = await db
    .select()
    .from(peFlowProcessLinks)
    .where(
      and(
        eq(peFlowProcessLinks.flowDefinitionId, sourceFlow.id),
        isNull(peFlowProcessLinks.deletedAt)
      )
    )
    .orderBy(asc(peFlowProcessLinks.stepOrder));

  if (sourceLinks.length === 0) return { id: clonedFlow.id };

  // 4. Deep copy linked processes and tasks
  // Maps: source process ID → cloned process ID, source task ID → cloned task ID
  const processIdMap = new Map<string, string>();
  const taskIdMap = new Map<string, string>();

  // Get unique process IDs that need cloning
  const processIds = [
    ...new Set(
      sourceLinks
        .map((l) => l.processDefinitionId)
        .filter((pid): pid is string => pid !== null)
    ),
  ];

  // Clone processes
  for (const procId of processIds) {
    const [sourceProc] = await db
      .select()
      .from(peProcessDefinitions)
      .where(
        and(
          eq(peProcessDefinitions.id, procId),
          isNull(peProcessDefinitions.deletedAt)
        )
      )
      .limit(1);

    if (!sourceProc) continue;

    const [clonedProc] = await db
      .insert(peProcessDefinitions)
      .values({
        tenantId,
        processCode: `${sourceProc.processCode}-CLN`,
        name: `${sourceProc.name} (Clone)`,
        description: sourceProc.description,
        domain: sourceProc.domain,
        agentName: sourceProc.agentName,
        agentType: sourceProc.agentType,
        automationLevel: sourceProc.automationLevel,
        triggerType: sourceProc.triggerType,
        inputDescription: sourceProc.inputDescription,
        outputDescription: sourceProc.outputDescription,
        sla: sourceProc.sla,
        connectedModules: sourceProc.connectedModules,
        crossDependencies: sourceProc.crossDependencies,
        source: "cloned",
        clonedFromId: sourceProc.id,
        version: 1,
        isPublished: false,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning({ id: peProcessDefinitions.id });

    processIdMap.set(procId, clonedProc.id);

    // Clone process-task links and their tasks
    const procTaskLinks = await db
      .select()
      .from(peProcessTaskLinks)
      .where(
        and(
          eq(peProcessTaskLinks.processDefinitionId, procId),
          isNull(peProcessTaskLinks.deletedAt)
        )
      )
      .orderBy(asc(peProcessTaskLinks.taskOrder));

    for (const ptl of procTaskLinks) {
      // Clone the task if not already cloned
      if (!taskIdMap.has(ptl.taskDefinitionId)) {
        const [sourceTask] = await db
          .select()
          .from(peTaskDefinitions)
          .where(
            and(
              eq(peTaskDefinitions.id, ptl.taskDefinitionId),
              isNull(peTaskDefinitions.deletedAt)
            )
          )
          .limit(1);

        if (sourceTask) {
          const [clonedTask] = await db
            .insert(peTaskDefinitions)
            .values({
              tenantId,
              taskCode: `${sourceTask.taskCode}-CLN`,
              name: `${sourceTask.name} (Clone)`,
              description: sourceTask.description,
              domain: sourceTask.domain,
              executorType: sourceTask.executorType,
              executorMode: sourceTask.executorMode,
              entityTable: sourceTask.entityTable,
              entityAction: sourceTask.entityAction,
              executorConfig: sourceTask.executorConfig,
              gateType: sourceTask.gateType,
              assignedRole: sourceTask.assignedRole,
              slaHours: sourceTask.slaHours,
              aiAssistable: sourceTask.aiAssistable,
              approvalWorkflowId: sourceTask.approvalWorkflowId,
              approvalTrigger: sourceTask.approvalTrigger,
              source: "cloned",
              clonedFromId: sourceTask.id,
              version: 1,
              isPublished: false,
              inputFields: sourceTask.inputFields,
              outputFields: sourceTask.outputFields,
              validations: sourceTask.validations,
              createdBy: userId,
              updatedBy: userId,
            })
            .returning({ id: peTaskDefinitions.id });

          taskIdMap.set(ptl.taskDefinitionId, clonedTask.id);
        }
      }

      const clonedTaskId = taskIdMap.get(ptl.taskDefinitionId);
      if (clonedTaskId) {
        await db.insert(peProcessTaskLinks).values({
          tenantId,
          processDefinitionId: clonedProc.id,
          taskDefinitionId: clonedTaskId,
          taskOrder: ptl.taskOrder,
          phase: ptl.phase,
          condition: ptl.condition,
          isParallel: ptl.isParallel,
          parallelGroup: ptl.parallelGroup,
          dependencyRefs: ptl.dependencyRefs,
          createdBy: userId,
          updatedBy: userId,
        });
      }
    }
  }

  // 5. Clone standalone task definitions (gates)
  const standaloneTaskIds = [
    ...new Set(
      sourceLinks
        .map((l) => l.taskDefinitionId)
        .filter((tid): tid is string => tid !== null)
    ),
  ];

  for (const taskId of standaloneTaskIds) {
    if (taskIdMap.has(taskId)) continue;

    const [sourceTask] = await db
      .select()
      .from(peTaskDefinitions)
      .where(
        and(
          eq(peTaskDefinitions.id, taskId),
          isNull(peTaskDefinitions.deletedAt)
        )
      )
      .limit(1);

    if (!sourceTask) continue;

    const [clonedTask] = await db
      .insert(peTaskDefinitions)
      .values({
        tenantId,
        taskCode: `${sourceTask.taskCode}-CLN`,
        name: `${sourceTask.name} (Clone)`,
        description: sourceTask.description,
        domain: sourceTask.domain,
        executorType: sourceTask.executorType,
        executorMode: sourceTask.executorMode,
        entityTable: sourceTask.entityTable,
        entityAction: sourceTask.entityAction,
        executorConfig: sourceTask.executorConfig,
        gateType: sourceTask.gateType,
        assignedRole: sourceTask.assignedRole,
        slaHours: sourceTask.slaHours,
        aiAssistable: sourceTask.aiAssistable,
        source: "cloned",
        clonedFromId: sourceTask.id,
        version: 1,
        isPublished: false,
        inputFields: sourceTask.inputFields,
        outputFields: sourceTask.outputFields,
        validations: sourceTask.validations,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning({ id: peTaskDefinitions.id });

    taskIdMap.set(taskId, clonedTask.id);
  }

  // 6. Create cloned flow-process links
  for (const link of sourceLinks) {
    await db.insert(peFlowProcessLinks).values({
      tenantId,
      flowDefinitionId: clonedFlow.id,
      processDefinitionId: link.processDefinitionId
        ? processIdMap.get(link.processDefinitionId) ?? null
        : null,
      taskDefinitionId: link.taskDefinitionId
        ? taskIdMap.get(link.taskDefinitionId) ?? null
        : null,
      stepOrder: link.stepOrder,
      stepName: link.stepName,
      phase: link.phase,
      module: link.module,
      moduleUrl: link.moduleUrl,
      condition: link.condition,
      isParallel: link.isParallel,
      parallelGroup: link.parallelGroup,
      dependencyRefs: link.dependencyRefs,
      createdBy: userId,
      updatedBy: userId,
    });
  }

  return { id: clonedFlow.id };
}

// ── Update Flow Definition ──

export async function updateFlowDefinition(
  tenantId: string,
  id: string,
  data: {
    flowCode?: string;
    name?: string;
    description?: string;
    category?: string;
    triggerEvent?: string;
    entityType?: string;
  }
): Promise<{ id: string } | null> {
  // Verify ownership and non-system
  const [existing] = await db
    .select({ id: peFlowDefinitions.id, source: peFlowDefinitions.source, tenantId: peFlowDefinitions.tenantId })
    .from(peFlowDefinitions)
    .where(
      and(
        eq(peFlowDefinitions.id, id),
        eq(peFlowDefinitions.tenantId, tenantId),
        isNull(peFlowDefinitions.deletedAt)
      )
    )
    .limit(1);

  if (!existing) return null;
  if (existing.source === "system") return null;

  const updateData: Record<string, unknown> = {};
  if (data.flowCode !== undefined) updateData.flowCode = data.flowCode;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.triggerEvent !== undefined) updateData.triggerEvent = data.triggerEvent;
  if (data.entityType !== undefined) updateData.entityType = data.entityType;

  if (Object.keys(updateData).length === 0) return { id };

  await db
    .update(peFlowDefinitions)
    .set(updateData)
    .where(eq(peFlowDefinitions.id, id));

  return { id };
}

// ── Delete Flow Definition (Soft Delete) ──

export async function deleteFlowDefinition(
  tenantId: string,
  id: string
): Promise<boolean> {
  // Verify ownership and non-system
  const [existing] = await db
    .select({ id: peFlowDefinitions.id, source: peFlowDefinitions.source })
    .from(peFlowDefinitions)
    .where(
      and(
        eq(peFlowDefinitions.id, id),
        eq(peFlowDefinitions.tenantId, tenantId),
        isNull(peFlowDefinitions.deletedAt)
      )
    )
    .limit(1);

  if (!existing) return false;
  if (existing.source === "system") return false;

  await db
    .update(peFlowDefinitions)
    .set({ deletedAt: new Date() })
    .where(eq(peFlowDefinitions.id, id));

  return true;
}
