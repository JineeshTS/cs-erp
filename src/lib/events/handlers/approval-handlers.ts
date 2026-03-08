/**
 * Event handlers for approval workflow cross-module wiring.
 *
 * APPROVAL_REQUESTED → triggers notification to approver
 * APPROVAL_DECIDED → triggers downstream action based on decision
 */

import { eventBus } from "../event-bus";
import { db } from "@/lib/db";
import { wneNotifications } from "@/db/schema";

eventBus.on("APPROVAL_REQUESTED", async (event) => {
  console.log(`[ApprovalHandler] REQUESTED: ${event.data.approvalType} for ${event.data.referenceType}:${event.data.referenceId}`);

  // Notify the assigned approver
  await db.insert(wneNotifications).values({
    tenantId: event.tenantId,
    userId: event.data.assignedToId,
    channel: "in_app",
    title: `Approval Required: ${event.data.approvalType}`,
    body: `You have a pending ${event.data.approvalType} approval for ${event.data.referenceType}. Please review and decide.`,
    entityType: event.data.referenceType,
    entityId: event.data.referenceId,
    priority: "high",
    status: "pending",
  });
});

eventBus.on("APPROVAL_DECIDED", async (event) => {
  console.log(`[ApprovalHandler] DECIDED: ${event.data.decision} by ${event.data.decidedById} for ${event.data.referenceType}:${event.data.referenceId}`);

  // Notify the original requester
  await db.insert(wneNotifications).values({
    tenantId: event.tenantId,
    userId: event.userId,
    channel: "in_app",
    title: `Approval ${event.data.decision === "approved" ? "Approved" : "Rejected"}: ${event.data.approvalType}`,
    body: `Your ${event.data.approvalType} request has been ${event.data.decision}.${event.data.comment ? ` Comment: ${event.data.comment}` : ""}`,
    entityType: event.data.referenceType,
    entityId: event.data.referenceId,
    priority: "normal",
    status: "pending",
  });
});
