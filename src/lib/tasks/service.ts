import { and, eq, isNull, desc, or, sql, count } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  peTaskInstances,
  peTaskStepInstances,
  peTaskDefinitions,
  peTaskStepDefinitions,
} from "@/db/schema";
import {
  parseCompoundCursor,
  cursorCondition,
  encodeCompoundCursor,
} from "@/lib/pagination";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

interface ListTasksParams {
  tenantId: string;
  status?: string;
  assignedTo?: string;
  priority?: string;
  cursor?: string;
  limit?: number;
}

interface ListDefinitionsParams {
  tenantId?: string;
  source?: string;
  domain?: string;
  cursor?: string;
  limit?: number;
}

interface CreateTaskData {
  name: string;
  taskDefinitionId?: string;
  priority?: string;
  assignedRole?: string;
  assignedTo?: string;
  dueAt?: string;
  inputData?: Record<string, unknown>;
  metadata?: Record<string, unknown> | null;
}

interface UpdateTaskData {
  name?: string;
  status?: string;
  priority?: string;
  assignedRole?: string;
  assignedTo?: string | null;
  dueAt?: string | null;
  inputData?: Record<string, unknown>;
  errorMessage?: string | null;
  metadata?: Record<string, unknown> | null;
}

interface CompleteStepData {
  outputData?: Record<string, unknown>;
  notes?: string;
}

type TaskInstance = typeof peTaskInstances.$inferSelect;
type TaskStepInstance = typeof peTaskStepInstances.$inferSelect;

interface TaskWithSteps extends TaskInstance {
  definitionName: string | null;
  steps: TaskStepInstance[];
}

interface TaskStats {
  pending: number;
  in_progress: number;
  completed: number;
  failed: number;
  blocked: number;
  cancelled: number;
  total: number;
}

// ──────────────────────────────────────────────────────────
// listTasks — cursor-paginated, with joined definition name
// ──────────────────────────────────────────────────────────

export async function listTasks({
  tenantId,
  status,
  assignedTo,
  priority,
  cursor,
  limit = 50,
}: ListTasksParams) {
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  const conditions: ReturnType<typeof eq>[] = [
    eq(peTaskInstances.tenantId, tenantId),
    isNull(peTaskInstances.deletedAt),
  ];

  if (status) {
    conditions.push(eq(peTaskInstances.status, status));
  }
  if (assignedTo) {
    conditions.push(eq(peTaskInstances.assignedTo, assignedTo));
  }
  if (priority) {
    conditions.push(eq(peTaskInstances.priority, priority));
  }
  if (cursor) {
    const cc = parseCompoundCursor(cursor);
    if (cc) {
      conditions.push(
        cursorCondition(peTaskInstances.createdAt, peTaskInstances.id, cc)
      );
    }
  }

  const results = await db
    .select({
      id: peTaskInstances.id,
      tenantId: peTaskInstances.tenantId,
      taskDefinitionId: peTaskInstances.taskDefinitionId,
      processInstanceId: peTaskInstances.processInstanceId,
      flowStepInstanceId: peTaskInstances.flowStepInstanceId,
      taskCode: peTaskInstances.taskCode,
      name: peTaskInstances.name,
      status: peTaskInstances.status,
      priority: peTaskInstances.priority,
      assignedTo: peTaskInstances.assignedTo,
      assignedRole: peTaskInstances.assignedRole,
      dueAt: peTaskInstances.dueAt,
      inputData: peTaskInstances.inputData,
      outputData: peTaskInstances.outputData,
      errorMessage: peTaskInstances.errorMessage,
      startedAt: peTaskInstances.startedAt,
      completedAt: peTaskInstances.completedAt,
      durationMs: peTaskInstances.durationMs,
      metadata: peTaskInstances.metadata,
      deletedAt: peTaskInstances.deletedAt,
      createdBy: peTaskInstances.createdBy,
      updatedBy: peTaskInstances.updatedBy,
      createdAt: peTaskInstances.createdAt,
      updatedAt: peTaskInstances.updatedAt,
      definitionName: peTaskDefinitions.name,
    })
    .from(peTaskInstances)
    .leftJoin(
      peTaskDefinitions,
      eq(peTaskInstances.taskDefinitionId, peTaskDefinitions.id)
    )
    .where(and(...conditions))
    .orderBy(desc(peTaskInstances.createdAt), desc(peTaskInstances.id))
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
// getTask — single task with steps array
// ──────────────────────────────────────────────────────────

export async function getTask(
  tenantId: string,
  taskId: string
): Promise<TaskWithSteps | null> {
  const results = await db
    .select({
      id: peTaskInstances.id,
      tenantId: peTaskInstances.tenantId,
      taskDefinitionId: peTaskInstances.taskDefinitionId,
      processInstanceId: peTaskInstances.processInstanceId,
      flowStepInstanceId: peTaskInstances.flowStepInstanceId,
      taskCode: peTaskInstances.taskCode,
      name: peTaskInstances.name,
      status: peTaskInstances.status,
      priority: peTaskInstances.priority,
      assignedTo: peTaskInstances.assignedTo,
      assignedRole: peTaskInstances.assignedRole,
      dueAt: peTaskInstances.dueAt,
      inputData: peTaskInstances.inputData,
      outputData: peTaskInstances.outputData,
      errorMessage: peTaskInstances.errorMessage,
      startedAt: peTaskInstances.startedAt,
      completedAt: peTaskInstances.completedAt,
      durationMs: peTaskInstances.durationMs,
      metadata: peTaskInstances.metadata,
      deletedAt: peTaskInstances.deletedAt,
      createdBy: peTaskInstances.createdBy,
      updatedBy: peTaskInstances.updatedBy,
      createdAt: peTaskInstances.createdAt,
      updatedAt: peTaskInstances.updatedAt,
      definitionName: peTaskDefinitions.name,
    })
    .from(peTaskInstances)
    .leftJoin(
      peTaskDefinitions,
      eq(peTaskInstances.taskDefinitionId, peTaskDefinitions.id)
    )
    .where(
      and(
        eq(peTaskInstances.id, taskId),
        eq(peTaskInstances.tenantId, tenantId),
        isNull(peTaskInstances.deletedAt)
      )
    )
    .limit(1);

  if (results.length === 0) return null;

  const task = results[0];

  // Fetch steps
  const steps = await db
    .select()
    .from(peTaskStepInstances)
    .where(
      and(
        eq(peTaskStepInstances.taskInstanceId, taskId),
        eq(peTaskStepInstances.tenantId, tenantId),
        isNull(peTaskStepInstances.deletedAt)
      )
    )
    .orderBy(peTaskStepInstances.stepOrder);

  return { ...task, steps } as TaskWithSteps;
}

// ──────────────────────────────────────────────────────────
// createTask — creates instance + copies steps from definition
// ──────────────────────────────────────────────────────────

export async function createTask(
  tenantId: string,
  userId: string,
  data: CreateTaskData
): Promise<TaskInstance> {
  let taskCode: string | null = null;
  let definitionSteps: (typeof peTaskStepDefinitions.$inferSelect)[] = [];

  // If a definition is referenced, load its code and steps
  if (data.taskDefinitionId) {
    const [definition] = await db
      .select()
      .from(peTaskDefinitions)
      .where(
        and(
          eq(peTaskDefinitions.id, data.taskDefinitionId),
          or(
            eq(peTaskDefinitions.tenantId, tenantId),
            isNull(peTaskDefinitions.tenantId)
          ),
          isNull(peTaskDefinitions.deletedAt)
        )
      )
      .limit(1);

    if (!definition) {
      throw new TaskNotFoundError("Task definition not found");
    }

    taskCode = definition.taskCode;

    definitionSteps = await db
      .select()
      .from(peTaskStepDefinitions)
      .where(
        and(
          eq(peTaskStepDefinitions.taskDefinitionId, data.taskDefinitionId),
          isNull(peTaskStepDefinitions.deletedAt)
        )
      )
      .orderBy(peTaskStepDefinitions.stepOrder);
  }

  // Insert the task instance
  const [task] = await db
    .insert(peTaskInstances)
    .values({
      tenantId,
      taskDefinitionId: data.taskDefinitionId ?? null,
      taskCode,
      name: data.name,
      priority: data.priority ?? "normal",
      assignedRole: data.assignedRole ?? null,
      assignedTo: data.assignedTo ?? null,
      dueAt: data.dueAt ? new Date(data.dueAt) : null,
      inputData: data.inputData ?? null,
      metadata: data.metadata ?? null,
      status: "pending",
      createdBy: userId,
      updatedBy: userId,
    })
    .returning();

  // Copy definition steps into step instances
  if (definitionSteps.length > 0) {
    const stepValues = definitionSteps.map((step) => ({
      tenantId,
      taskInstanceId: task.id,
      taskStepDefinitionId: step.id,
      stepOrder: step.stepOrder,
      name: step.name,
      type: step.type,
      status: "pending" as const,
      createdBy: userId,
      updatedBy: userId,
    }));

    await db.insert(peTaskStepInstances).values(stepValues);
  }

  return task;
}

// ──────────────────────────────────────────────────────────
// updateTask — updates status, priority, assignee, etc.
// ──────────────────────────────────────────────────────────

export async function updateTask(
  tenantId: string,
  taskId: string,
  userId: string,
  data: UpdateTaskData
): Promise<TaskInstance | null> {
  // Build the set object dynamically to avoid overwriting with undefined
  const setData: Record<string, unknown> = {
    updatedBy: userId,
    updatedAt: new Date(),
  };

  if (data.name !== undefined) setData.name = data.name;
  if (data.status !== undefined) {
    setData.status = data.status;
    // Auto-set startedAt when transitioning to in_progress
    if (data.status === "in_progress") {
      setData.startedAt = new Date();
    }
  }
  if (data.priority !== undefined) setData.priority = data.priority;
  if (data.assignedRole !== undefined) setData.assignedRole = data.assignedRole;
  if (data.assignedTo !== undefined) setData.assignedTo = data.assignedTo;
  if (data.dueAt !== undefined)
    setData.dueAt = data.dueAt ? new Date(data.dueAt) : null;
  if (data.inputData !== undefined) setData.inputData = data.inputData;
  if (data.errorMessage !== undefined) setData.errorMessage = data.errorMessage;
  if (data.metadata !== undefined) setData.metadata = data.metadata;

  const [updated] = await db
    .update(peTaskInstances)
    .set(setData)
    .where(
      and(
        eq(peTaskInstances.id, taskId),
        eq(peTaskInstances.tenantId, tenantId),
        isNull(peTaskInstances.deletedAt)
      )
    )
    .returning();

  return updated ?? null;
}

// ──────────────────────────────────────────────────────────
// completeTask — marks completed, sets timestamps + duration
// ──────────────────────────────────────────────────────────

export async function completeTask(
  tenantId: string,
  taskId: string,
  userId: string
): Promise<TaskInstance | null> {
  // Get the task to compute duration
  const [existing] = await db
    .select()
    .from(peTaskInstances)
    .where(
      and(
        eq(peTaskInstances.id, taskId),
        eq(peTaskInstances.tenantId, tenantId),
        isNull(peTaskInstances.deletedAt)
      )
    )
    .limit(1);

  if (!existing) return null;

  if (existing.status === "completed") {
    throw new TaskAlreadyCompletedError("Task is already completed");
  }

  const now = new Date();
  const startedAt = existing.startedAt ?? existing.createdAt;
  const durationMs = now.getTime() - startedAt.getTime();

  const [completed] = await db
    .update(peTaskInstances)
    .set({
      status: "completed",
      completedAt: now,
      durationMs,
      startedAt: existing.startedAt ?? now,
      updatedBy: userId,
      updatedAt: now,
    })
    .where(
      and(
        eq(peTaskInstances.id, taskId),
        eq(peTaskInstances.tenantId, tenantId),
        isNull(peTaskInstances.deletedAt)
      )
    )
    .returning();

  return completed ?? null;
}

// ──────────────────────────────────────────────────────────
// completeStep — marks step completed, auto-advances task
// ──────────────────────────────────────────────────────────

export async function completeStep(
  tenantId: string,
  taskId: string,
  stepId: string,
  userId: string,
  data: CompleteStepData
): Promise<{ step: TaskStepInstance; taskCompleted: boolean }> {
  // Verify the step belongs to the task and tenant
  const [step] = await db
    .select()
    .from(peTaskStepInstances)
    .where(
      and(
        eq(peTaskStepInstances.id, stepId),
        eq(peTaskStepInstances.taskInstanceId, taskId),
        eq(peTaskStepInstances.tenantId, tenantId),
        isNull(peTaskStepInstances.deletedAt)
      )
    )
    .limit(1);

  if (!step) {
    throw new StepNotFoundError("Task step not found");
  }

  if (step.status === "completed") {
    throw new StepAlreadyCompletedError("Step is already completed");
  }

  const now = new Date();

  // Mark the step completed
  const [updatedStep] = await db
    .update(peTaskStepInstances)
    .set({
      status: "completed",
      outputData: data.outputData ?? null,
      notes: data.notes ?? null,
      completedAt: now,
      startedAt: step.startedAt ?? now,
      updatedBy: userId,
      updatedAt: now,
    })
    .where(
      and(
        eq(peTaskStepInstances.id, stepId),
        eq(peTaskStepInstances.tenantId, tenantId)
      )
    )
    .returning();

  // Check if all required steps are now completed
  const allSteps = await db
    .select({
      status: peTaskStepInstances.status,
    })
    .from(peTaskStepInstances)
    .where(
      and(
        eq(peTaskStepInstances.taskInstanceId, taskId),
        eq(peTaskStepInstances.tenantId, tenantId),
        isNull(peTaskStepInstances.deletedAt)
      )
    );

  const allDone = allSteps.every(
    (s) => s.status === "completed" || s.status === "skipped"
  );

  let taskCompleted = false;

  if (allDone) {
    // Auto-complete the parent task
    const result = await completeTask(tenantId, taskId, userId);
    taskCompleted = result !== null;
  }

  return { step: updatedStep, taskCompleted };
}

// ──────────────────────────────────────────────────────────
// listTaskDefinitions — system + tenant's custom definitions
// ──────────────────────────────────────────────────────────

export async function listTaskDefinitions({
  tenantId,
  source,
  domain,
  cursor,
  limit = 50,
}: ListDefinitionsParams) {
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  // Show system definitions (tenantId=null) + tenant's own
  const conditions: ReturnType<typeof eq>[] = [
    isNull(peTaskDefinitions.deletedAt),
  ];

  if (tenantId) {
    conditions.push(
      or(
        eq(peTaskDefinitions.tenantId, tenantId),
        isNull(peTaskDefinitions.tenantId)
      )!
    );
  }

  if (source) {
    conditions.push(eq(peTaskDefinitions.source, source));
  }
  if (domain) {
    conditions.push(eq(peTaskDefinitions.domain, domain));
  }
  if (cursor) {
    const cc = parseCompoundCursor(cursor);
    if (cc) {
      conditions.push(
        cursorCondition(
          peTaskDefinitions.createdAt,
          peTaskDefinitions.id,
          cc
        )
      );
    }
  }

  const results = await db
    .select()
    .from(peTaskDefinitions)
    .where(and(...conditions))
    .orderBy(desc(peTaskDefinitions.createdAt), desc(peTaskDefinitions.id))
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
// cloneDefinition — deep copies a system definition for tenant
// ──────────────────────────────────────────────────────────

export async function cloneDefinition(
  tenantId: string,
  userId: string,
  definitionId: string
): Promise<typeof peTaskDefinitions.$inferSelect> {
  // Fetch the source definition
  const [source] = await db
    .select()
    .from(peTaskDefinitions)
    .where(
      and(
        eq(peTaskDefinitions.id, definitionId),
        isNull(peTaskDefinitions.deletedAt)
      )
    )
    .limit(1);

  if (!source) {
    throw new TaskNotFoundError("Task definition not found");
  }

  // Insert the cloned definition
  const [cloned] = await db
    .insert(peTaskDefinitions)
    .values({
      tenantId,
      taskCode: source.taskCode,
      name: `${source.name} (Copy)`,
      description: source.description,
      domain: source.domain,
      executorType: source.executorType,
      executorMode: source.executorMode,
      entityTable: source.entityTable,
      entityAction: source.entityAction,
      executorConfig: source.executorConfig,
      gateType: source.gateType,
      assignedRole: source.assignedRole,
      slaHours: source.slaHours,
      aiAssistable: source.aiAssistable,
      approvalWorkflowId: source.approvalWorkflowId,
      approvalTrigger: source.approvalTrigger,
      source: "cloned",
      clonedFromId: source.id,
      version: 1,
      isPublished: false,
      inputFields: source.inputFields,
      outputFields: source.outputFields,
      validations: source.validations,
      metadata: source.metadata,
      createdBy: userId,
      updatedBy: userId,
    })
    .returning();

  // Clone the step definitions
  const sourceSteps = await db
    .select()
    .from(peTaskStepDefinitions)
    .where(
      and(
        eq(peTaskStepDefinitions.taskDefinitionId, definitionId),
        isNull(peTaskStepDefinitions.deletedAt)
      )
    )
    .orderBy(peTaskStepDefinitions.stepOrder);

  if (sourceSteps.length > 0) {
    const clonedStepValues = sourceSteps.map((step) => ({
      tenantId,
      taskDefinitionId: cloned.id,
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

  return cloned;
}

// ──────────────────────────────────────────────────────────
// getTaskStats — counts by status for dashboard
// ──────────────────────────────────────────────────────────

export async function getTaskStats(tenantId: string): Promise<TaskStats> {
  const rows = await db
    .select({
      status: peTaskInstances.status,
      count: count(),
    })
    .from(peTaskInstances)
    .where(
      and(
        eq(peTaskInstances.tenantId, tenantId),
        isNull(peTaskInstances.deletedAt)
      )
    )
    .groupBy(peTaskInstances.status);

  const stats: TaskStats = {
    pending: 0,
    in_progress: 0,
    completed: 0,
    failed: 0,
    blocked: 0,
    cancelled: 0,
    total: 0,
  };

  for (const row of rows) {
    const key = row.status as keyof Omit<TaskStats, "total">;
    if (key in stats) {
      stats[key] = Number(row.count);
    }
    stats.total += Number(row.count);
  }

  return stats;
}

// ──────────────────────────────────────────────────────────
// Error classes
// ──────────────────────────────────────────────────────────

export class TaskNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TaskNotFoundError";
  }
}

export class TaskAlreadyCompletedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TaskAlreadyCompletedError";
  }
}

export class StepNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StepNotFoundError";
  }
}

export class StepAlreadyCompletedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StepAlreadyCompletedError";
  }
}
