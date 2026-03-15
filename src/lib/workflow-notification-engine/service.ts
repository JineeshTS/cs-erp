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
  users,
} from "@/db/schema";
import { sendNotificationEmail } from "@/lib/email";

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

// Dispatch pending email notifications
export async function dispatchEmailNotifications(tenantId: string) {
  const pending = await db
    .select({
      id: wneNotifications.id,
      userId: wneNotifications.userId,
      title: wneNotifications.title,
      body: wneNotifications.body,
    })
    .from(wneNotifications)
    .where(
      and(
        eq(wneNotifications.tenantId, tenantId),
        eq(wneNotifications.channel, "email"),
        eq(wneNotifications.status, "pending"),
        isNull(wneNotifications.deletedAt)
      )
    )
    .limit(50);

  for (const notif of pending) {
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, notif.userId))
      .limit(1);

    if (!user?.email) {
      await db
        .update(wneNotifications)
        .set({ status: "failed", failedAt: new Date(), failureReason: "No user email" })
        .where(eq(wneNotifications.id, notif.id));
      continue;
    }

    const sent = await sendNotificationEmail(
      user.email,
      `CS-ERP — ${notif.title}`,
      `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;"><h3>${notif.title}</h3><p>${notif.body}</p></div>`
    );

    await db
      .update(wneNotifications)
      .set(sent
        ? { status: "sent", sentAt: new Date() }
        : { status: "failed", failedAt: new Date(), failureReason: "SMTP delivery failed" }
      )
      .where(eq(wneNotifications.id, notif.id));
  }
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
