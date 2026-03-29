/**
 * ERP-042: Event-to-Workflow Bridge
 *
 * Listens to domain events and auto-triggers WNE workflows
 * based on the trigger_event configured on each workflow.
 */

import { eventBus } from "./event-bus";
import { db } from "@/lib/db";
import { wneWorkflows } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { startWorkflowInstance } from "../workflow-notification-engine/service";
import type { EventType } from "./event-types";

// Map domain event types to workflow trigger_event strings
const EVENT_TO_TRIGGER: Record<string, string> = {
  BOOKING_CREATED: "booking.created",
  BOOKING_CONFIRMED: "booking.confirmed",
  BOOKING_CANCELLED: "booking.cancelled",
  BL_GENERATED: "bl.generated",
  BL_RELEASED: "bl.released",
  CONTAINER_GATE_IN: "container.gate_in",
  CONTAINER_GATE_OUT: "container.gate_out",
  INVOICE_GENERATED: "invoice.generated",
  PAYMENT_RECEIVED: "payment.received",
  PAYMENT_OVERDUE: "payment.overdue",
  CUSTOMS_FILING_SUBMITTED: "customs.submitted",
  CUSTOMS_CLEARANCE_GRANTED: "customs.cleared",
  VESSEL_ARRIVAL: "vessel.arrival",
  VESSEL_DEPARTURE: "vessel.departure",
  APPROVAL_REQUESTED: "approval.requested",
  LEAD_CREATED: "lead.created",
  OPPORTUNITY_CREATED: "opportunity.created",
  OPPORTUNITY_WON: "opportunity.won",
  CONTRACT_CREATED: "contract.created",
  CUSTOMER_CREATED: "customer.created",
};

/**
 * Find and trigger all active workflows that match the event's trigger_event.
 */
async function triggerWorkflows(
  eventType: string,
  entityType: string,
  entityId: string,
  tenantId: string,
  userId: string
) {
  const triggerEvent = EVENT_TO_TRIGGER[eventType];
  if (!triggerEvent) return;

  const workflows = await db
    .select({ id: wneWorkflows.id })
    .from(wneWorkflows)
    .where(and(
      eq(wneWorkflows.tenantId, tenantId),
      eq(wneWorkflows.triggerEvent, triggerEvent),
      eq(wneWorkflows.isActive, true),
      isNull(wneWorkflows.deletedAt),
    ))
    .limit(10);

  for (const wf of workflows) {
    try {
      await startWorkflowInstance(tenantId, wf.id, entityType, entityId, userId);
      console.log(`[WorkflowBridge] Triggered workflow ${wf.id} for ${eventType} on ${entityType}/${entityId}`);
    } catch (err) {
      console.error(`[WorkflowBridge] Failed to trigger workflow ${wf.id}:`, err);
    }
  }
}

/**
 * Register the workflow bridge — subscribe to all mapped event types.
 */
export function registerWorkflowBridge() {
  for (const eventType of Object.keys(EVENT_TO_TRIGGER)) {
    eventBus.on(eventType as EventType, async (event) => {
      const { entityType, entityId, tenantId, userId } = event as {
        entityType: string;
        entityId: string;
        tenantId: string;
        userId: string;
      };
      if (!tenantId || !entityId) return;
      await triggerWorkflows(eventType, entityType || "unknown", entityId, tenantId, userId || "system");
    });
  }
  console.log(`[WorkflowBridge] Registered ${Object.keys(EVENT_TO_TRIGGER).length} event triggers`);
}
