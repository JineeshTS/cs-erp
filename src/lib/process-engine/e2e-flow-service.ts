/**
 * E2E Flow Orchestration — Service Layer
 *
 * CRUD + lifecycle operations for E2E flow instances, step instances,
 * human gates, and event triggers. All queries are tenant-isolated
 * with cursor-based pagination.
 */

import { db } from "@/lib/db";
import {
  peE2eFlowInstances,
  peE2eStepInstances,
  peHumanGates,
  peFlowEvents,
  peEventTriggers,
} from "@/db/schema";
import { eq, and, isNull, desc, gt, sql } from "drizzle-orm";

// Note: Step executor import is deferred to avoid circular deps.
// Gate resolution triggers execution via the API layer or bridge.

// ═══════════════════════════════════════════════════════════
// E2E FLOW INSTANCES
// ═══════════════════════════════════════════════════════════

interface ListFlowInstancesParams {
  tenantId: string;
  status?: string;
  e2eFlowId?: string;
  entityType?: string;
  entityId?: string;
  cursor?: string;
  limit?: number;
}

export async function listFlowInstances({
  tenantId,
  status,
  e2eFlowId,
  entityType,
  entityId,
  cursor,
  limit = 50,
}: ListFlowInstancesParams) {
  const conditions = [
    eq(peE2eFlowInstances.tenantId, tenantId),
    isNull(peE2eFlowInstances.deletedAt),
  ];
  if (status) conditions.push(eq(peE2eFlowInstances.status, status));
  if (e2eFlowId) conditions.push(eq(peE2eFlowInstances.e2eFlowId, e2eFlowId));
  if (entityType) conditions.push(eq(peE2eFlowInstances.entityType, entityType));
  if (entityId) conditions.push(eq(peE2eFlowInstances.entityId, entityId));
  if (cursor) conditions.push(gt(peE2eFlowInstances.createdAt, new Date(cursor)));

  const results = await db
    .select()
    .from(peE2eFlowInstances)
    .where(and(...conditions))
    .orderBy(desc(peE2eFlowInstances.createdAt))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = data.length > 0 ? data[data.length - 1].createdAt.toISOString() : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getFlowInstance(id: string, tenantId: string) {
  const [instance] = await db
    .select()
    .from(peE2eFlowInstances)
    .where(
      and(
        eq(peE2eFlowInstances.id, id),
        eq(peE2eFlowInstances.tenantId, tenantId),
        isNull(peE2eFlowInstances.deletedAt)
      )
    )
    .limit(1);
  return instance ?? null;
}

export async function getFlowInstanceWithSteps(id: string, tenantId: string) {
  const instance = await getFlowInstance(id, tenantId);
  if (!instance) return null;

  const steps = await db
    .select()
    .from(peE2eStepInstances)
    .where(
      and(
        eq(peE2eStepInstances.flowInstanceId, id),
        eq(peE2eStepInstances.tenantId, tenantId)
      )
    )
    .orderBy(peE2eStepInstances.stepNumber);

  const gates = await db
    .select()
    .from(peHumanGates)
    .where(
      and(
        eq(peHumanGates.flowInstanceId, id),
        eq(peHumanGates.tenantId, tenantId)
      )
    )
    .orderBy(peHumanGates.createdAt);

  return { ...instance, steps, gates };
}

interface CreateFlowInstanceParams {
  tenantId: string;
  e2eFlowId: string;
  entityType: string;
  entityId: string;
  triggerEvent: string;
  parentFlowInstanceId?: string;
  metadata?: Record<string, unknown>;
  steps: Array<{
    stepNumber: number;
    processRef?: string;
    stepName: string;
    executorType: string;
    agentId?: string;
  }>;
}

export async function createFlowInstance(params: CreateFlowInstanceParams) {
  const [instance] = await db
    .insert(peE2eFlowInstances)
    .values({
      tenantId: params.tenantId,
      e2eFlowId: params.e2eFlowId,
      entityType: params.entityType,
      entityId: params.entityId,
      triggerEvent: params.triggerEvent,
      status: "active",
      currentStepNumber: 1,
      totalSteps: params.steps.length,
      parentFlowInstanceId: params.parentFlowInstanceId,
      metadata: params.metadata ?? {},
    })
    .returning();

  if (params.steps.length > 0) {
    await db.insert(peE2eStepInstances).values(
      params.steps.map((step) => ({
        tenantId: params.tenantId,
        flowInstanceId: instance.id,
        stepNumber: step.stepNumber,
        processRef: step.processRef,
        stepName: step.stepName,
        executorType: step.executorType,
        agentId: step.agentId,
        status: step.stepNumber === 1 ? "in_progress" : "pending",
        startedAt: step.stepNumber === 1 ? new Date() : undefined,
      }))
    );
  }

  // Log flow_started event
  await logFlowEvent({
    tenantId: params.tenantId,
    flowInstanceId: instance.id,
    eventType: "flow_started",
    metadata: {
      e2eFlowId: params.e2eFlowId,
      triggerEvent: params.triggerEvent,
      entityType: params.entityType,
      entityId: params.entityId,
      totalSteps: params.steps.length,
    },
  });

  return instance;
}

export async function updateFlowStatus(
  id: string,
  tenantId: string,
  status: string,
  completedAt?: Date
) {
  const [updated] = await db
    .update(peE2eFlowInstances)
    .set({ status, completedAt })
    .where(
      and(
        eq(peE2eFlowInstances.id, id),
        eq(peE2eFlowInstances.tenantId, tenantId)
      )
    )
    .returning();
  return updated ?? null;
}

export async function advanceFlowStep(
  flowInstanceId: string,
  tenantId: string,
  output?: Record<string, unknown>
) {
  const instance = await getFlowInstance(flowInstanceId, tenantId);
  if (!instance || instance.status === "completed" || instance.status === "failed") {
    return null;
  }

  const currentStepNum = instance.currentStepNumber;
  const now = new Date();

  // Complete current step
  const [completedStep] = await db
    .update(peE2eStepInstances)
    .set({
      status: "completed",
      completedAt: now,
      outputData: output ?? {},
      durationMs: sql<number>`EXTRACT(EPOCH FROM (${now.toISOString()}::timestamptz - "started_at")) * 1000`,
    })
    .where(
      and(
        eq(peE2eStepInstances.flowInstanceId, flowInstanceId),
        eq(peE2eStepInstances.stepNumber, currentStepNum),
        eq(peE2eStepInstances.tenantId, tenantId)
      )
    )
    .returning();

  await logFlowEvent({
    tenantId,
    flowInstanceId,
    stepInstanceId: completedStep?.id,
    eventType: "step_completed",
    metadata: { stepNumber: currentStepNum, output },
  });

  const nextStep = currentStepNum + 1;

  if (nextStep > instance.totalSteps) {
    // Flow complete
    const [updated] = await db
      .update(peE2eFlowInstances)
      .set({
        status: "completed",
        currentStepNumber: instance.totalSteps,
        completedAt: now,
      })
      .where(
        and(
          eq(peE2eFlowInstances.id, flowInstanceId),
          eq(peE2eFlowInstances.tenantId, tenantId)
        )
      )
      .returning();

    await logFlowEvent({
      tenantId,
      flowInstanceId,
      eventType: "flow_completed",
    });

    return updated;
  }

  // Start next step
  await db
    .update(peE2eStepInstances)
    .set({ status: "in_progress", startedAt: now })
    .where(
      and(
        eq(peE2eStepInstances.flowInstanceId, flowInstanceId),
        eq(peE2eStepInstances.stepNumber, nextStep),
        eq(peE2eStepInstances.tenantId, tenantId)
      )
    );

  const [updated] = await db
    .update(peE2eFlowInstances)
    .set({ currentStepNumber: nextStep })
    .where(
      and(
        eq(peE2eFlowInstances.id, flowInstanceId),
        eq(peE2eFlowInstances.tenantId, tenantId)
      )
    )
    .returning();

  return updated;
}

// ═══════════════════════════════════════════════════════════
// HUMAN GATES
// ═══════════════════════════════════════════════════════════

interface CreateHumanGateParams {
  tenantId: string;
  stepInstanceId: string;
  flowInstanceId: string;
  gateType: string;
  assignedToRole: string;
  assignedToUserId?: string;
  aiRecommendation?: Record<string, unknown>;
  presentedInfo?: Record<string, unknown>;
  slaDeadline: Date;
  escalationToRole?: string;
  priority?: string;
}

export async function createHumanGate(params: CreateHumanGateParams) {
  const [gate] = await db
    .insert(peHumanGates)
    .values({
      tenantId: params.tenantId,
      stepInstanceId: params.stepInstanceId,
      flowInstanceId: params.flowInstanceId,
      gateType: params.gateType,
      assignedToRole: params.assignedToRole,
      assignedToUserId: params.assignedToUserId,
      aiRecommendation: params.aiRecommendation ?? {},
      presentedInfo: params.presentedInfo ?? {},
      slaDeadline: params.slaDeadline,
      escalationToRole: params.escalationToRole,
      priority: params.priority ?? "normal",
    })
    .returning();

  // Pause flow at gate
  await db
    .update(peE2eFlowInstances)
    .set({ status: "paused_at_gate" })
    .where(
      and(
        eq(peE2eFlowInstances.id, params.flowInstanceId),
        eq(peE2eFlowInstances.tenantId, params.tenantId)
      )
    );

  await logFlowEvent({
    tenantId: params.tenantId,
    flowInstanceId: params.flowInstanceId,
    stepInstanceId: params.stepInstanceId,
    eventType: "gate_created",
    metadata: {
      gateType: params.gateType,
      assignedToRole: params.assignedToRole,
      slaDeadline: params.slaDeadline.toISOString(),
      priority: params.priority ?? "normal",
    },
  });

  return gate;
}

export async function resolveHumanGate(
  gateId: string,
  tenantId: string,
  decision: string,
  decidedBy: string,
  decisionData?: Record<string, unknown>
) {
  const [updated] = await db
    .update(peHumanGates)
    .set({
      decision,
      decidedBy,
      decidedAt: new Date(),
      decisionData: decisionData ?? null,
    })
    .where(
      and(
        eq(peHumanGates.id, gateId),
        eq(peHumanGates.tenantId, tenantId),
        isNull(peHumanGates.decision)
      )
    )
    .returning();

  if (updated) {
    // Resume flow
    await db
      .update(peE2eFlowInstances)
      .set({ status: "active" })
      .where(
        and(
          eq(peE2eFlowInstances.id, updated.flowInstanceId),
          eq(peE2eFlowInstances.tenantId, tenantId)
        )
      );

    await logFlowEvent({
      tenantId,
      flowInstanceId: updated.flowInstanceId,
      stepInstanceId: updated.stepInstanceId,
      eventType: "gate_resolved",
      metadata: { gateId, decision, decidedBy },
    });
  }

  return updated ?? null;
}

export async function listPendingGates(tenantId: string, userId?: string) {
  const conditions = [
    eq(peHumanGates.tenantId, tenantId),
    isNull(peHumanGates.decision),
  ];
  if (userId) conditions.push(eq(peHumanGates.assignedToUserId, userId));

  return db
    .select()
    .from(peHumanGates)
    .where(and(...conditions))
    .orderBy(peHumanGates.slaDeadline);
}

// ═══════════════════════════════════════════════════════════
// FLOW EVENTS (IMMUTABLE LOG)
// ═══════════════════════════════════════════════════════════

async function logFlowEvent(params: {
  tenantId: string;
  flowInstanceId: string;
  stepInstanceId?: string;
  eventType: string;
  metadata?: Record<string, unknown>;
  cascadedFlowIds?: string[];
}) {
  await db.insert(peFlowEvents).values({
    tenantId: params.tenantId,
    flowInstanceId: params.flowInstanceId,
    stepInstanceId: params.stepInstanceId,
    eventType: params.eventType,
    metadata: params.metadata ?? {},
    cascadedFlowIds: params.cascadedFlowIds ?? null,
  });
}

// ═══════════════════════════════════════════════════════════
// EVENT TRIGGERS (CRUD)
// ═══════════════════════════════════════════════════════════

export async function listEventTriggers(tenantId: string, eventType?: string) {
  const conditions = [eq(peEventTriggers.tenantId, tenantId)];
  if (eventType) conditions.push(eq(peEventTriggers.eventType, eventType));

  return db
    .select()
    .from(peEventTriggers)
    .where(and(...conditions))
    .orderBy(desc(peEventTriggers.priority));
}

export async function getActiveTriggersForEvent(tenantId: string, eventType: string) {
  return db
    .select()
    .from(peEventTriggers)
    .where(
      and(
        eq(peEventTriggers.tenantId, tenantId),
        eq(peEventTriggers.eventType, eventType),
        eq(peEventTriggers.isActive, true)
      )
    )
    .orderBy(desc(peEventTriggers.priority));
}

interface CreateEventTriggerParams {
  tenantId: string;
  eventType: string;
  e2eFlowId: string;
  conditions?: Record<string, unknown>;
  entityType: string;
  priority?: number;
}

export async function createEventTrigger(params: CreateEventTriggerParams) {
  const [trigger] = await db
    .insert(peEventTriggers)
    .values({
      tenantId: params.tenantId,
      eventType: params.eventType,
      e2eFlowId: params.e2eFlowId,
      conditions: params.conditions ?? {},
      entityType: params.entityType,
      isActive: true,
      priority: params.priority ?? 0,
    })
    .returning();
  return trigger;
}

export async function updateEventTrigger(
  id: string,
  tenantId: string,
  updates: {
    eventType?: string;
    e2eFlowId?: string;
    conditions?: Record<string, unknown>;
    entityType?: string;
    isActive?: boolean;
    priority?: number;
  }
) {
  const [updated] = await db
    .update(peEventTriggers)
    .set(updates)
    .where(
      and(
        eq(peEventTriggers.id, id),
        eq(peEventTriggers.tenantId, tenantId)
      )
    )
    .returning();
  return updated ?? null;
}

export async function deleteEventTrigger(id: string, tenantId: string) {
  const [deleted] = await db
    .update(peEventTriggers)
    .set({ isActive: false })
    .where(
      and(
        eq(peEventTriggers.id, id),
        eq(peEventTriggers.tenantId, tenantId)
      )
    )
    .returning();
  return deleted ?? null;
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD AGGREGATES
// ═══════════════════════════════════════════════════════════

export async function getFlowDashboard(tenantId: string) {
  const [stats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where ${peE2eFlowInstances.status} = 'active')::int`,
      pausedAtGate: sql<number>`count(*) filter (where ${peE2eFlowInstances.status} = 'paused_at_gate')::int`,
      completed: sql<number>`count(*) filter (where ${peE2eFlowInstances.status} = 'completed')::int`,
      failed: sql<number>`count(*) filter (where ${peE2eFlowInstances.status} = 'failed')::int`,
      cancelled: sql<number>`count(*) filter (where ${peE2eFlowInstances.status} = 'cancelled')::int`,
    })
    .from(peE2eFlowInstances)
    .where(
      and(
        eq(peE2eFlowInstances.tenantId, tenantId),
        isNull(peE2eFlowInstances.deletedAt)
      )
    );

  const [gateStats] = await db
    .select({ pendingGates: sql<number>`count(*)::int` })
    .from(peHumanGates)
    .where(
      and(
        eq(peHumanGates.tenantId, tenantId),
        isNull(peHumanGates.decision)
      )
    );

  return {
    ...stats,
    pendingGates: gateStats?.pendingGates ?? 0,
  };
}
