/**
 * E2E Flow Bridge
 *
 * Listens to domain events and auto-creates pe_e2e_flow_instances
 * with their step instances. Uses two sources for trigger matching:
 *
 * 1. Static flow definitions from e2e-process-flows.ts (triggerEvent field)
 * 2. Dynamic event triggers from pe_event_triggers table (tenant-configurable)
 *
 * When a domain event fires:
 * - Look up matching E2E flows by triggerEvent
 * - Evaluate conditional triggers (e.g. reefer → E2E-05, DG → E2E-06)
 * - Create flow instances with step instances pre-populated
 */

import { eventBus } from "./event-bus";
import type { EventType, EventOfType } from "./event-types";
import { E2E_PROCESS_FLOWS } from "@/data/e2e-process-flows";
import {
  createFlowInstance,
  getActiveTriggersForEvent,
} from "@/lib/process-engine/e2e-flow-service";
import { executeCurrentStep } from "@/lib/process-engine/step-executor";
import type { E2EProcessFlow, E2EFlowStep } from "@/types/processes";

/**
 * Maps EventBus event types to e2e-process-flows triggerEvent strings.
 * EventBus uses SCREAMING_SNAKE (BOOKING_CONFIRMED),
 * flow definitions use dot.notation (booking.confirmed).
 */
const EVENT_TYPE_TO_TRIGGER: Partial<Record<EventType, string>> = {
  BOOKING_CONFIRMED: "booking.confirmed",
  BOOKING_CREATED: "booking.created",
  VESSEL_ARRIVED: "vessel.eta_24h",
  VESSEL_DEPARTED: "vessel.departed",
  VOYAGE_COMPLETED: "voyage.completed",
  CONTAINER_GATE_IN: "container.gate_in",
  CONTAINER_GATE_OUT: "container.gate_out",
  CONTAINER_DAMAGED: "incident.reported",
  INVOICE_GENERATED: "invoice.generated",
  PAYMENT_OVERDUE: "invoice.overdue",
  PAYMENT_RECEIVED: "payment.received",
  LEAD_CREATED: "lead.created",
  CUSTOMS_CLEARED: "customs.cleared",
  CUSTOMS_HELD: "customs.held",
  CARGO_CLAIM_FILED: "incident.reported",
  CARGO_RELEASED: "cargo.released",
  BL_ISSUED: "bl.issued",
  BL_SURRENDERED: "bl.surrendered",
  CUSTOMER_CREATED: "customer.created",
};

/** Pre-index flows by triggerEvent for O(1) lookup */
const FLOWS_BY_TRIGGER = new Map<string, E2EProcessFlow[]>();
for (const flow of E2E_PROCESS_FLOWS) {
  if (flow.triggerEvent) {
    const existing = FLOWS_BY_TRIGGER.get(flow.triggerEvent) ?? [];
    existing.push(flow);
    FLOWS_BY_TRIGGER.set(flow.triggerEvent, existing);
  }
}

/**
 * Convert E2EFlowStep[] from static data into step params for createFlowInstance.
 */
function flowStepsToParams(steps: E2EFlowStep[]) {
  return steps.map((step, idx) => ({
    stepNumber: idx + 1,
    processRef: step.processRef,
    stepName: step.step,
    executorType: step.executorType ?? step.type, // prefer extended type, fallback to display type
    agentId: undefined,
  }));
}

/**
 * Evaluate conditions from pe_event_triggers against event data.
 * Conditions are simple key-value matches against event.data.
 * Empty conditions always match.
 */
function evaluateConditions(
  conditions: Record<string, unknown>,
  eventData: Record<string, unknown> | undefined
): boolean {
  if (!conditions || Object.keys(conditions).length === 0) return true;
  if (!eventData) return false;

  for (const [key, value] of Object.entries(conditions)) {
    if (eventData[key] !== value) return false;
  }
  return true;
}

/**
 * Handle a domain event: find matching E2E flows and spawn instances.
 */
async function handleDomainEvent(event: EventOfType<EventType>): Promise<void> {
  const triggerString = EVENT_TYPE_TO_TRIGGER[event.type as EventType];
  if (!triggerString) return;

  // 1. Static flow matches from e2e-process-flows.ts
  const staticFlows = FLOWS_BY_TRIGGER.get(triggerString) ?? [];

  for (const flow of staticFlows) {
    try {
      const instance = await createFlowInstance({
        tenantId: event.tenantId,
        e2eFlowId: flow.id,
        entityType: flow.entityType ?? event.entityType,
        entityId: event.entityId,
        triggerEvent: triggerString,
        metadata: {
          eventType: event.type,
          eventData: event.data,
          flowName: flow.name,
          triggeredAt: event.timestamp.toISOString(),
          triggeredBy: event.userId,
        },
        steps: flowStepsToParams(flow.steps),
      });

      // Execute step 1 (and auto-chain through AI/system steps)
      const execResult = await executeCurrentStep(instance.id, event.tenantId);

      console.log(
        `[E2EFlowBridge] ${event.type} → spawned ${flow.id} (${flow.name}) instance ${instance.id} for entity ${event.entityId} — ` +
        `${execResult.stepsExecuted} steps auto-executed, status: ${execResult.status}`
      );
    } catch (err) {
      console.error(
        `[E2EFlowBridge] Failed to spawn ${flow.id} from ${event.type}:`,
        err
      );
    }
  }

  // 2. Dynamic triggers from pe_event_triggers table
  try {
    const dynamicTriggers = await getActiveTriggersForEvent(
      event.tenantId,
      triggerString
    );

    for (const trigger of dynamicTriggers) {
      const conditions = (trigger.conditions ?? {}) as Record<string, unknown>;
      const eventData = (event.data ?? {}) as Record<string, unknown>;

      if (!evaluateConditions(conditions, eventData)) continue;

      // Find the flow definition for this trigger
      const flowDef = E2E_PROCESS_FLOWS.find((f) => f.id === trigger.e2eFlowId);
      if (!flowDef) {
        console.warn(
          `[E2EFlowBridge] Dynamic trigger ${trigger.id} references unknown flow ${trigger.e2eFlowId}`
        );
        continue;
      }

      // Don't duplicate — skip if already spawned in static pass
      if (staticFlows.some((f) => f.id === trigger.e2eFlowId)) continue;

      try {
        const instance = await createFlowInstance({
          tenantId: event.tenantId,
          e2eFlowId: trigger.e2eFlowId,
          entityType: trigger.entityType,
          entityId: event.entityId,
          triggerEvent: triggerString,
          metadata: {
            eventType: event.type,
            eventData,
            flowName: flowDef.name,
            triggerId: trigger.id,
            triggeredAt: event.timestamp.toISOString(),
            triggeredBy: event.userId,
          },
          steps: flowStepsToParams(flowDef.steps),
        });

        // Execute step 1 (and auto-chain)
        const execResult = await executeCurrentStep(instance.id, event.tenantId);

        console.log(
          `[E2EFlowBridge] Dynamic trigger → spawned ${trigger.e2eFlowId} (${flowDef.name}) instance ${instance.id} — ` +
          `${execResult.stepsExecuted} steps auto-executed, status: ${execResult.status}`
        );
      } catch (err) {
        console.error(
          `[E2EFlowBridge] Dynamic trigger ${trigger.id} failed for ${trigger.e2eFlowId}:`,
          err
        );
      }
    }
  } catch (err) {
    console.error(
      `[E2EFlowBridge] Failed to query dynamic triggers for ${triggerString}:`,
      err
    );
  }
}

/**
 * Register E2E flow bridge handlers on the event bus.
 * Called from register-handlers.ts during app startup.
 */
export function registerE2eFlowBridge(): void {
  const eventTypes = Object.keys(EVENT_TYPE_TO_TRIGGER) as EventType[];

  for (const eventType of eventTypes) {
    eventBus.on(eventType, async (event: EventOfType<typeof eventType>) => {
      await handleDomainEvent(event);
    });
  }

  console.log(
    `[E2EFlowBridge] Registered ${eventTypes.length} event-to-flow mappings, ` +
    `${FLOWS_BY_TRIGGER.size} static trigger strings, ` +
    `${E2E_PROCESS_FLOWS.length} total flow definitions`
  );
}
