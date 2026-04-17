import { and, eq, isNull, desc, or, sql, count, ilike, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  peProcessDefinitions,
  peProcessTaskLinks,
  peTaskDefinitions,
  peTaskStepDefinitions,
} from "@/db/schema";
import {
  parseCompoundCursor,
  cursorCondition,
  encodeCompoundCursor,
} from "@/lib/pagination";
import { escapeIlike } from "@/lib/validation";
import type {
  CreateProcessDefinitionData,
  UpdateProcessDefinitionData,
} from "./validation";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

interface ListProcessDefinitionsParams {
  tenantId?: string;
  source?: string;
  domain?: string;
  automationLevel?: string;
  search?: string;
  cursor?: string;
  limit?: number;
}

type ProcessDefinition = typeof peProcessDefinitions.$inferSelect;
type ProcessTaskLink = typeof peProcessTaskLinks.$inferSelect;
type TaskDefinition = typeof peTaskDefinitions.$inferSelect;

interface LinkedTask {
  link: ProcessTaskLink;
  task: TaskDefinition;
}

interface ProcessWithTasks extends ProcessDefinition {
  tasks: LinkedTask[];
}

// ──────────────────────────────────────────────────────────
// listProcessDefinitions — system + tenant's own, with search
// ──────────────────────────────────────────────────────────

export async function listProcessDefinitions({
  tenantId,
  source,
  domain,
  automationLevel,
  search,
  cursor,
  limit = 50,
}: ListProcessDefinitionsParams) {
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  const conditions: ReturnType<typeof eq>[] = [
    isNull(peProcessDefinitions.deletedAt),
  ];

  // Show system definitions (tenantId=null) + tenant's own
  if (tenantId) {
    conditions.push(
      or(
        eq(peProcessDefinitions.tenantId, tenantId),
        isNull(peProcessDefinitions.tenantId)
      )!
    );
  }

  if (source) {
    conditions.push(eq(peProcessDefinitions.source, source));
  }
  if (domain) {
    conditions.push(eq(peProcessDefinitions.domain, domain));
  }
  if (automationLevel) {
    conditions.push(
      eq(peProcessDefinitions.automationLevel, automationLevel)
    );
  }
  if (search) {
    const escaped = escapeIlike(search);
    conditions.push(
      or(
        ilike(peProcessDefinitions.name, `%${escaped}%`),
        ilike(peProcessDefinitions.processCode, `%${escaped}%`)
      )!
    );
  }
  if (cursor) {
    const cc = parseCompoundCursor(cursor);
    if (cc) {
      conditions.push(
        cursorCondition(
          peProcessDefinitions.createdAt,
          peProcessDefinitions.id,
          cc
        )
      );
    }
  }

  const results = await db
    .select()
    .from(peProcessDefinitions)
    .where(and(...conditions))
    .orderBy(
      desc(peProcessDefinitions.createdAt),
      desc(peProcessDefinitions.id)
    )
    .limit(safeLimit + 1);

  const hasMore = results.length > safeLimit;
  const data = hasMore ? results.slice(0, safeLimit) : results;

  return {
    data,
    meta: {
      cursor: hasMore
        ? encodeCompoundCursor(
            data[data.length - 1].createdAt,
            data[data.length - 1].id
          )
        : undefined,
      hasMore,
    },
  };
}

// ──────────────────────────────────────────────────────────
// getProcessDefinition — single process with linked tasks
// ──────────────────────────────────────────────────────────

export async function getProcessDefinition(
  tenantId: string,
  processId: string
): Promise<ProcessWithTasks | null> {
  // Fetch the process. Must be system (tenantId=null) or belong to the tenant.
  const [process] = await db
    .select()
    .from(peProcessDefinitions)
    .where(
      and(
        eq(peProcessDefinitions.id, processId),
        or(
          eq(peProcessDefinitions.tenantId, tenantId),
          isNull(peProcessDefinitions.tenantId)
        ),
        isNull(peProcessDefinitions.deletedAt)
      )
    )
    .limit(1);

  if (!process) return null;

  // Fetch linked tasks with their definitions (JOIN to avoid N+1)
  const links = await db
    .select({
      link: peProcessTaskLinks,
      task: peTaskDefinitions,
    })
    .from(peProcessTaskLinks)
    .innerJoin(
      peTaskDefinitions,
      eq(peProcessTaskLinks.taskDefinitionId, peTaskDefinitions.id)
    )
    .where(
      and(
        eq(peProcessTaskLinks.processDefinitionId, processId),
        isNull(peProcessTaskLinks.deletedAt),
        isNull(peTaskDefinitions.deletedAt)
      )
    )
    .orderBy(peProcessTaskLinks.taskOrder);

  return {
    ...process,
    tasks: links,
  };
}

// ──────────────────────────────────────────────────────────
// createProcessDefinition
// ──────────────────────────────────────────────────────────

export async function createProcessDefinition(
  tenantId: string,
  userId: string,
  data: CreateProcessDefinitionData
): Promise<ProcessDefinition> {
  const [created] = await db
    .insert(peProcessDefinitions)
    .values({
      tenantId,
      processCode: data.processCode,
      name: data.name,
      description: data.description ?? null,
      domain: data.domain ?? null,
      automationLevel: data.automationLevel ?? null,
      triggerType: data.triggerType ?? null,
      agentName: data.agentName ?? null,
      agentType: data.agentType ?? null,
      inputDescription: data.inputDescription ?? null,
      outputDescription: data.outputDescription ?? null,
      sla: data.sla ?? null,
      connectedModules: data.connectedModules ?? null,
      crossDependencies: data.crossDependencies ?? null,
      source: "custom",
      version: 1,
      isPublished: false,
      metadata: data.metadata ?? null,
      createdBy: userId,
      updatedBy: userId,
    })
    .returning();

  return created;
}

// ──────────────────────────────────────────────────────────
// cloneProcessDefinition — deep copy process + tasks + links
// ──────────────────────────────────────────────────────────

export async function cloneProcessDefinition(
  tenantId: string,
  userId: string,
  processId: string
): Promise<ProcessDefinition> {
  // Fetch the source process
  const [source] = await db
    .select()
    .from(peProcessDefinitions)
    .where(
      and(
        eq(peProcessDefinitions.id, processId),
        isNull(peProcessDefinitions.deletedAt)
      )
    )
    .limit(1);

  if (!source) {
    throw new ProcessNotFoundError("Process definition not found");
  }

  // Generate clone code: e.g. "PRC-001-C1", incrementing if clones exist
  const existingClones = await db
    .select({ count: count() })
    .from(peProcessDefinitions)
    .where(
      and(
        eq(peProcessDefinitions.tenantId, tenantId),
        eq(peProcessDefinitions.clonedFromId, processId),
        isNull(peProcessDefinitions.deletedAt)
      )
    );

  const cloneNum = Number(existingClones[0]?.count ?? 0) + 1;
  const cloneCode = `${source.processCode}-C${cloneNum}`.slice(0, 20);

  // Insert the cloned process definition
  const [cloned] = await db
    .insert(peProcessDefinitions)
    .values({
      tenantId,
      processCode: cloneCode,
      name: `${source.name} (Copy)`,
      description: source.description,
      domain: source.domain,
      agentName: source.agentName,
      agentType: source.agentType,
      automationLevel: source.automationLevel,
      triggerType: source.triggerType,
      inputDescription: source.inputDescription,
      outputDescription: source.outputDescription,
      sla: source.sla,
      connectedModules: source.connectedModules,
      crossDependencies: source.crossDependencies,
      source: "cloned",
      clonedFromId: source.id,
      version: 1,
      isPublished: false,
      metadata: source.metadata,
      createdBy: userId,
      updatedBy: userId,
    })
    .returning();

  // Fetch linked tasks from the source process
  const sourceLinks = await db
    .select({
      link: peProcessTaskLinks,
      task: peTaskDefinitions,
    })
    .from(peProcessTaskLinks)
    .innerJoin(
      peTaskDefinitions,
      eq(peProcessTaskLinks.taskDefinitionId, peTaskDefinitions.id)
    )
    .where(
      and(
        eq(peProcessTaskLinks.processDefinitionId, processId),
        isNull(peProcessTaskLinks.deletedAt),
        isNull(peTaskDefinitions.deletedAt)
      )
    )
    .orderBy(peProcessTaskLinks.taskOrder);

  if (sourceLinks.length > 0) {
    // Clone each task definition and create new links
    for (const { link, task } of sourceLinks) {
      // Clone the task definition
      const [clonedTask] = await db
        .insert(peTaskDefinitions)
        .values({
          tenantId,
          taskCode: task.taskCode,
          name: task.name,
          description: task.description,
          domain: task.domain,
          executorType: task.executorType,
          executorMode: task.executorMode,
          entityTable: task.entityTable,
          entityAction: task.entityAction,
          executorConfig: task.executorConfig,
          gateType: task.gateType,
          assignedRole: task.assignedRole,
          slaHours: task.slaHours,
          aiAssistable: task.aiAssistable,
          approvalWorkflowId: task.approvalWorkflowId,
          approvalTrigger: task.approvalTrigger,
          source: "cloned",
          clonedFromId: task.id,
          version: 1,
          isPublished: false,
          inputFields: task.inputFields,
          outputFields: task.outputFields,
          validations: task.validations,
          metadata: task.metadata,
          createdBy: userId,
          updatedBy: userId,
        })
        .returning();

      // Clone the task's step definitions
      const sourceSteps = await db
        .select()
        .from(peTaskStepDefinitions)
        .where(
          and(
            eq(peTaskStepDefinitions.taskDefinitionId, task.id),
            isNull(peTaskStepDefinitions.deletedAt)
          )
        )
        .orderBy(peTaskStepDefinitions.stepOrder);

      if (sourceSteps.length > 0) {
        const clonedStepValues = sourceSteps.map((step) => ({
          tenantId,
          taskDefinitionId: clonedTask.id,
          stepOrder: step.stepOrder,
          name: step.name,
          description: step.description,
          type: step.type,
          role: step.role,
          isOptional: step.isOptional,
          estimatedDurationMinutes: step.estimatedDurationMinutes,
          metadata: step.metadata,
          createdBy: userId,
          updatedBy: userId,
        }));

        await db.insert(peTaskStepDefinitions).values(clonedStepValues);
      }

      // Create the process-task link
      await db.insert(peProcessTaskLinks).values({
        tenantId,
        processDefinitionId: cloned.id,
        taskDefinitionId: clonedTask.id,
        taskOrder: link.taskOrder,
        phase: link.phase,
        condition: link.condition,
        isParallel: link.isParallel,
        parallelGroup: link.parallelGroup,
        dependencyRefs: link.dependencyRefs,
        metadata: link.metadata,
        createdBy: userId,
        updatedBy: userId,
      });
    }
  }

  return cloned;
}

// ──────────────────────────────────────────────────────────
// updateProcessDefinition — only non-system defs
// ──────────────────────────────────────────────────────────

export async function updateProcessDefinition(
  tenantId: string,
  processId: string,
  userId: string,
  data: UpdateProcessDefinitionData
): Promise<ProcessDefinition | null> {
  // Verify exists and is not system
  const [existing] = await db
    .select()
    .from(peProcessDefinitions)
    .where(
      and(
        eq(peProcessDefinitions.id, processId),
        eq(peProcessDefinitions.tenantId, tenantId),
        isNull(peProcessDefinitions.deletedAt)
      )
    )
    .limit(1);

  if (!existing) return null;

  if (existing.source === "system") {
    throw new SystemProcessReadOnlyError(
      "System process definitions are read-only"
    );
  }

  // Build the set object dynamically
  const setData: Record<string, unknown> = {
    updatedBy: userId,
    updatedAt: new Date(),
  };

  if (data.processCode !== undefined) setData.processCode = data.processCode;
  if (data.name !== undefined) setData.name = data.name;
  if (data.description !== undefined) setData.description = data.description;
  if (data.domain !== undefined) setData.domain = data.domain;
  if (data.automationLevel !== undefined)
    setData.automationLevel = data.automationLevel;
  if (data.triggerType !== undefined) setData.triggerType = data.triggerType;
  if (data.agentName !== undefined) setData.agentName = data.agentName;
  if (data.agentType !== undefined) setData.agentType = data.agentType;
  if (data.inputDescription !== undefined)
    setData.inputDescription = data.inputDescription;
  if (data.outputDescription !== undefined)
    setData.outputDescription = data.outputDescription;
  if (data.sla !== undefined) setData.sla = data.sla;
  if (data.connectedModules !== undefined)
    setData.connectedModules = data.connectedModules;
  if (data.crossDependencies !== undefined)
    setData.crossDependencies = data.crossDependencies;
  if (data.metadata !== undefined) setData.metadata = data.metadata;

  const [updated] = await db
    .update(peProcessDefinitions)
    .set(setData)
    .where(
      and(
        eq(peProcessDefinitions.id, processId),
        eq(peProcessDefinitions.tenantId, tenantId),
        isNull(peProcessDefinitions.deletedAt)
      )
    )
    .returning();

  return updated ?? null;
}

// ──────────────────────────────────────────────────────────
// deleteProcessDefinition — soft delete, only non-system
// ──────────────────────────────────────────────────────────

export async function deleteProcessDefinition(
  tenantId: string,
  processId: string,
  userId: string
): Promise<ProcessDefinition | null> {
  // Verify exists and is not system
  const [existing] = await db
    .select()
    .from(peProcessDefinitions)
    .where(
      and(
        eq(peProcessDefinitions.id, processId),
        eq(peProcessDefinitions.tenantId, tenantId),
        isNull(peProcessDefinitions.deletedAt)
      )
    )
    .limit(1);

  if (!existing) return null;

  if (existing.source === "system") {
    throw new SystemProcessReadOnlyError(
      "System process definitions cannot be deleted"
    );
  }

  const [deleted] = await db
    .update(peProcessDefinitions)
    .set({
      deletedAt: new Date(),
      updatedBy: userId,
    })
    .where(
      and(
        eq(peProcessDefinitions.id, processId),
        eq(peProcessDefinitions.tenantId, tenantId),
        isNull(peProcessDefinitions.deletedAt)
      )
    )
    .returning();

  return deleted ?? null;
}

// ──────────────────────────────────────────────────────────
// getProcessStats — counts for the template library
// ──────────────────────────────────────────────────────────

interface ProcessStats {
  systemTotal: number;
  customTotal: number;
  domainsCovered: number;
}

export async function getProcessStats(
  tenantId: string
): Promise<ProcessStats> {
  const [systemRow] = await db
    .select({ count: count() })
    .from(peProcessDefinitions)
    .where(
      and(
        eq(peProcessDefinitions.source, "system"),
        isNull(peProcessDefinitions.tenantId),
        isNull(peProcessDefinitions.deletedAt)
      )
    );

  const [customRow] = await db
    .select({ count: count() })
    .from(peProcessDefinitions)
    .where(
      and(
        eq(peProcessDefinitions.tenantId, tenantId),
        isNull(peProcessDefinitions.deletedAt)
      )
    );

  const domainRows = await db
    .select({ domain: peProcessDefinitions.domain })
    .from(peProcessDefinitions)
    .where(
      and(
        isNull(peProcessDefinitions.deletedAt),
        sql`${peProcessDefinitions.domain} IS NOT NULL`
      )
    )
    .groupBy(peProcessDefinitions.domain);

  return {
    systemTotal: Number(systemRow?.count ?? 0),
    customTotal: Number(customRow?.count ?? 0),
    domainsCovered: domainRows.length,
  };
}

// ──────────────────────────────────────────────────────────
// getTaskCountsByProcess — batch count of linked tasks
// ──────────────────────────────────────────────────────────

export async function getTaskCountsByProcess(
  processIds: string[]
): Promise<Record<string, number>> {
  if (processIds.length === 0) return {};

  const rows = await db
    .select({
      processDefinitionId: peProcessTaskLinks.processDefinitionId,
      count: count(),
    })
    .from(peProcessTaskLinks)
    .where(
      and(
        inArray(peProcessTaskLinks.processDefinitionId, processIds),
        isNull(peProcessTaskLinks.deletedAt)
      )
    )
    .groupBy(peProcessTaskLinks.processDefinitionId);

  const result: Record<string, number> = {};
  for (const row of rows) {
    result[row.processDefinitionId] = Number(row.count);
  }
  return result;
}

// ──────────────────────────────────────────────────────────
// Error classes
// ──────────────────────────────────────────────────────────

export class ProcessNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProcessNotFoundError";
  }
}

export class SystemProcessReadOnlyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SystemProcessReadOnlyError";
  }
}
