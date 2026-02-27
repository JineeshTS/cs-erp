import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  wneWorkflows,
  wneWorkflowSteps,
  wneWorkflowInstances,
  wneWorkflowStepInstances,
  wneSlaDefinitions,
  wneSlaInstances,
  wneNotifications,
} from "@/db/schema";

// Start a workflow instance for a given entity
export async function startWorkflowInstance(
  tenantId: string,
  workflowId: string,
  entityType: string,
  entityId: string,
  initiatedBy: string
) {
  // Get the first step
  const steps = await db
    .select()
    .from(wneWorkflowSteps)
    .where(
      and(
        eq(wneWorkflowSteps.workflowId, workflowId),
        eq(wneWorkflowSteps.tenantId, tenantId),
        isNull(wneWorkflowSteps.deletedAt)
      )
    )
    .orderBy(wneWorkflowSteps.stepOrder);

  if (steps.length === 0) return null;

  const [instance] = await db
    .insert(wneWorkflowInstances)
    .values({
      tenantId,
      workflowId,
      entityType,
      entityId,
      currentStepId: steps[0].id,
      status: "in_progress",
      initiatedBy,
    })
    .returning();

  // Create step instance for the first step
  await db.insert(wneWorkflowStepInstances).values({
    tenantId,
    instanceId: instance.id,
    stepId: steps[0].id,
    status: "pending",
  });

  return instance;
}

// Start an SLA instance
export async function startSlaInstance(
  tenantId: string,
  slaDefinitionId: string,
  entityType: string,
  entityId: string,
  assignedTo?: string
) {
  const [slaDef] = await db
    .select()
    .from(wneSlaDefinitions)
    .where(
      and(
        eq(wneSlaDefinitions.id, slaDefinitionId),
        eq(wneSlaDefinitions.tenantId, tenantId),
        isNull(wneSlaDefinitions.deletedAt)
      )
    )
    .limit(1);

  if (!slaDef) return null;

  const now = new Date();
  const dueAt = new Date(now.getTime() + slaDef.targetHours * 3600000);
  const warningAt = new Date(now.getTime() + slaDef.warningHours * 3600000);

  const [instance] = await db
    .insert(wneSlaInstances)
    .values({
      tenantId,
      slaDefinitionId,
      entityType,
      entityId,
      status: "on_track",
      startedAt: now,
      dueAt,
      warningAt,
      assignedTo,
    })
    .returning();

  return instance;
}

// Get workflow overview counts for a tenant
export async function getWorkflowOverview(tenantId: string) {
  const [workflows, activeInstances, slaDefinitions, breachedSlas, notifications] =
    await Promise.all([
      db
        .select()
        .from(wneWorkflows)
        .where(
          and(eq(wneWorkflows.tenantId, tenantId), isNull(wneWorkflows.deletedAt))
        ),
      db
        .select()
        .from(wneWorkflowInstances)
        .where(
          and(
            eq(wneWorkflowInstances.tenantId, tenantId),
            eq(wneWorkflowInstances.status, "in_progress"),
            isNull(wneWorkflowInstances.deletedAt)
          )
        ),
      db
        .select()
        .from(wneSlaDefinitions)
        .where(
          and(
            eq(wneSlaDefinitions.tenantId, tenantId),
            isNull(wneSlaDefinitions.deletedAt)
          )
        ),
      db
        .select()
        .from(wneSlaInstances)
        .where(
          and(
            eq(wneSlaInstances.tenantId, tenantId),
            eq(wneSlaInstances.status, "breached"),
            isNull(wneSlaInstances.deletedAt)
          )
        ),
      db
        .select()
        .from(wneNotifications)
        .where(
          and(
            eq(wneNotifications.tenantId, tenantId),
            eq(wneNotifications.status, "pending"),
            isNull(wneNotifications.deletedAt)
          )
        ),
    ]);

  return {
    workflows: workflows.length,
    activeInstances: activeInstances.length,
    slaDefinitions: slaDefinitions.length,
    breachedSlas: breachedSlas.length,
    pendingNotifications: notifications.length,
  };
}
