/**
 * Process Execution Engine — Service Layer
 *
 * Provides CRUD + lifecycle operations for process instances.
 * All queries are tenant-isolated and use cursor-based pagination.
 */

import { db } from "@/lib/db";
import {
  peProcessInstances,
  peStepInstances,
  peApprovals,
  peEventLog,
} from "@/db/schema";
import { eq, and, isNull, desc, lt, inArray, sql } from "drizzle-orm";
import { eventBus } from "@/lib/events/event-bus";

// ── Process Instance Operations ──

interface ListProcessInstancesParams {
  tenantId: string;
  status?: string;
  processId?: string;
  entityType?: string;
  cursor?: string;
  limit?: number;
}

export async function listProcessInstances({
  tenantId,
  status,
  processId,
  entityType,
  cursor,
  limit = 50,
}: ListProcessInstancesParams) {
  const conditions = [
    eq(peProcessInstances.tenantId, tenantId),
    isNull(peProcessInstances.deletedAt),
  ];
  if (status) conditions.push(eq(peProcessInstances.status, status));
  if (processId) conditions.push(eq(peProcessInstances.processId, processId));
  if (entityType) conditions.push(eq(peProcessInstances.entityType, entityType));
  if (cursor) conditions.push(lt(peProcessInstances.createdAt, new Date(cursor)));

  const results = await db
    .select()
    .from(peProcessInstances)
    .where(and(...conditions))
    .orderBy(desc(peProcessInstances.createdAt))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = data.length > 0 ? data[data.length - 1].createdAt.toISOString() : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getProcessInstance(id: string, tenantId: string) {
  const [instance] = await db
    .select()
    .from(peProcessInstances)
    .where(
      and(
        eq(peProcessInstances.id, id),
        eq(peProcessInstances.tenantId, tenantId),
        isNull(peProcessInstances.deletedAt)
      )
    )
    .limit(1);
  return instance ?? null;
}

export async function getProcessInstanceWithSteps(id: string, tenantId: string) {
  const instance = await getProcessInstance(id, tenantId);
  if (!instance) return null;

  const steps = await db
    .select()
    .from(peStepInstances)
    .where(
      and(
        eq(peStepInstances.processInstanceId, id),
        eq(peStepInstances.tenantId, tenantId),
        isNull(peStepInstances.deletedAt)
      )
    )
    .orderBy(peStepInstances.stepNumber);

  return { ...instance, steps };
}

interface CreateProcessInstanceParams {
  tenantId: string;
  processId: string;
  processName: string;
  triggerType: string;
  triggeredBy?: string;
  entityType?: string;
  entityId?: string;
  contextJson?: Record<string, unknown>;
  slaDeadline?: Date;
  steps: Array<{
    stepNumber: number;
    stepName: string;
    executorType: string;
    executorId?: string;
  }>;
}

export async function createProcessInstance(params: CreateProcessInstanceParams) {
  // Wrap in transaction — process instance + step instances must be atomic
  return db.transaction(async (tx) => {
    const [instance] = await tx
      .insert(peProcessInstances)
      .values({
        tenantId: params.tenantId,
        processId: params.processId,
        processName: params.processName,
        status: "pending",
        currentStep: 0,
        totalSteps: params.steps.length,
        triggerType: params.triggerType,
        triggeredBy: params.triggeredBy,
        entityType: params.entityType,
        entityId: params.entityId,
        contextJson: params.contextJson,
        slaDeadline: params.slaDeadline,
      })
      .returning();

    // Create step instances
    if (params.steps.length > 0) {
      await tx.insert(peStepInstances).values(
        params.steps.map((step) => ({
          tenantId: params.tenantId,
          processInstanceId: instance.id,
          stepNumber: step.stepNumber,
          stepName: step.stepName,
          executorType: step.executorType,
          executorId: step.executorId,
          status: "pending",
        }))
      );
    }

    return instance;
  });
}

// ── Step Lifecycle ──

export async function advanceProcessStep(
  processInstanceId: string,
  tenantId: string,
  output?: Record<string, unknown>
) {
  // M3 fix: wrap in transaction with FOR UPDATE to prevent race conditions
  return db.transaction(async (tx) => {
    const lockedRows = await tx
      .select()
      .from(peProcessInstances)
      .where(
        and(
          eq(peProcessInstances.id, processInstanceId),
          eq(peProcessInstances.tenantId, tenantId),
          isNull(peProcessInstances.deletedAt)
        )
      )
      .for("update");
    const instance = lockedRows[0];

    if (!instance || instance.status === "completed" || instance.status === "failed") {
      return null;
    }

    const currentStepNum = instance.currentStep;
    const now = new Date();

    if (currentStepNum > 0) {
      await tx
        .update(peStepInstances)
        .set({
          status: "completed",
          completedAt: now,
          outputJson: output,
        })
        .where(
          and(
            eq(peStepInstances.processInstanceId, processInstanceId),
            eq(peStepInstances.stepNumber, currentStepNum),
            eq(peStepInstances.tenantId, tenantId)
          )
        );
    }

    const nextStep = currentStepNum + 1;

    if (nextStep > instance.totalSteps) {
      const [updated] = await tx
        .update(peProcessInstances)
        .set({
          status: "completed",
          currentStep: instance.totalSteps,
          completedAt: now,
        })
        .where(
          and(
            eq(peProcessInstances.id, processInstanceId),
            eq(peProcessInstances.tenantId, tenantId)
          )
        )
        .returning();
      return updated;
    }

    await tx
      .update(peStepInstances)
      .set({ status: "in_progress", startedAt: now })
      .where(
        and(
          eq(peStepInstances.processInstanceId, processInstanceId),
          eq(peStepInstances.stepNumber, nextStep),
          eq(peStepInstances.tenantId, tenantId)
        )
      );

    const [updated] = await tx
      .update(peProcessInstances)
      .set({
        status: "in_progress",
        currentStep: nextStep,
        startedAt: instance.startedAt ?? now,
      })
      .where(
        and(
          eq(peProcessInstances.id, processInstanceId),
          eq(peProcessInstances.tenantId, tenantId)
        )
      )
      .returning();

    return updated;
  });
}

export async function failProcessInstance(
  processInstanceId: string,
  tenantId: string,
  reason: string
) {
  const [updated] = await db
    .update(peProcessInstances)
    .set({
      status: "failed",
      failureReason: reason,
      completedAt: new Date(),
    })
    .where(
      and(
        eq(peProcessInstances.id, processInstanceId),
        eq(peProcessInstances.tenantId, tenantId)
      )
    )
    .returning();
  return updated ?? null;
}

// ── Approval Operations ──

export async function createApproval(params: {
  tenantId: string;
  stepInstanceId: string;
  processInstanceId: string;
  approverId: string;
  requestedById?: string;
  dueAt?: Date;
}) {
  const [approval] = await db
    .insert(peApprovals)
    .values({
      tenantId: params.tenantId,
      stepInstanceId: params.stepInstanceId,
      processInstanceId: params.processInstanceId,
      approverId: params.approverId,
      dueAt: params.dueAt,
    })
    .returning();

  // Put process in waiting state
  await db
    .update(peProcessInstances)
    .set({ status: "waiting_approval" })
    .where(
      and(
        eq(peProcessInstances.id, params.processInstanceId),
        eq(peProcessInstances.tenantId, params.tenantId)
      )
    );

  // Emit APPROVAL_REQUESTED event
  eventBus.emit({
    type: "APPROVAL_REQUESTED",
    tenantId: params.tenantId,
    userId: params.approverId,
    entityId: approval.id,
    entityType: "approval",
    timestamp: new Date(),
    data: {
      approvalType: "process_step_approval",
      requestedById: params.requestedById ?? "system",
      assignedToId: params.approverId,
      referenceId: params.processInstanceId,
      referenceType: "process_instance",
    },
  });

  return approval;
}

export async function decideApproval(
  approvalId: string,
  tenantId: string,
  decision: "approved" | "rejected",
  comment?: string
) {
  // Only allow deciding approvals that haven't been decided yet
  const [updated] = await db
    .update(peApprovals)
    .set({ decision, comment, decidedAt: new Date() })
    .where(
      and(
        eq(peApprovals.id, approvalId),
        eq(peApprovals.tenantId, tenantId),
        isNull(peApprovals.decision)
      )
    )
    .returning();
  return updated ?? null;
}

export async function listPendingApprovals(tenantId: string, approverId: string) {
  return db
    .select()
    .from(peApprovals)
    .where(
      and(
        eq(peApprovals.tenantId, tenantId),
        eq(peApprovals.approverId, approverId),
        isNull(peApprovals.decision),
        isNull(peApprovals.deletedAt)
      )
    )
    .orderBy(desc(peApprovals.createdAt));
}

// ── Event Log ──

export async function logEvent(params: {
  tenantId: string;
  eventType: string;
  entityType: string;
  entityId: string;
  processInstanceId?: string;
  userId?: string;
  payload?: Record<string, unknown>;
}) {
  const [entry] = await db
    .insert(peEventLog)
    .values(params)
    .returning();
  return entry;
}

export async function listEventLog(
  tenantId: string,
  options?: {
    eventType?: string;
    entityType?: string;
    entityId?: string;
    cursor?: string;
    limit?: number;
  }
) {
  const limit = options?.limit ?? 50;
  const conditions = [eq(peEventLog.tenantId, tenantId)];
  if (options?.eventType) conditions.push(eq(peEventLog.eventType, options.eventType));
  if (options?.entityType) conditions.push(eq(peEventLog.entityType, options.entityType));
  if (options?.entityId) conditions.push(eq(peEventLog.entityId, options.entityId));
  if (options?.cursor) conditions.push(lt(peEventLog.createdAt, new Date(options.cursor)));

  const results = await db
    .select()
    .from(peEventLog)
    .where(and(...conditions))
    .orderBy(desc(peEventLog.createdAt))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;

  return { data, meta: { cursor: data[data.length - 1]?.createdAt.toISOString(), hasMore } };
}

// ── Dashboard Aggregates ──

export async function getProcessDashboard(tenantId: string) {
  const [stats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      pending: sql<number>`count(*) filter (where ${peProcessInstances.status} = 'pending')::int`,
      inProgress: sql<number>`count(*) filter (where ${peProcessInstances.status} = 'in_progress')::int`,
      waitingApproval: sql<number>`count(*) filter (where ${peProcessInstances.status} = 'waiting_approval')::int`,
      completed: sql<number>`count(*) filter (where ${peProcessInstances.status} = 'completed')::int`,
      failed: sql<number>`count(*) filter (where ${peProcessInstances.status} = 'failed')::int`,
    })
    .from(peProcessInstances)
    .where(
      and(
        eq(peProcessInstances.tenantId, tenantId),
        isNull(peProcessInstances.deletedAt)
      )
    );

  const pendingApprovals = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(peApprovals)
    .where(
      and(
        eq(peApprovals.tenantId, tenantId),
        isNull(peApprovals.decision),
        isNull(peApprovals.deletedAt)
      )
    );

  return {
    ...stats,
    pendingApprovals: pendingApprovals[0]?.count ?? 0,
  };
}
