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
 * - Evaluate conditional triggers (e.g. reefer → E2E-11, DG → E2E-12)
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
  // Booking & Documentation
  BOOKING_CONFIRMED: "booking.confirmed",
  BOOKING_CREATED: "booking.created",
  BOOKING_CANCELLED: "booking.cancelled",
  BL_ISSUED: "bl.issued",
  BL_SURRENDERED: "bl.surrendered",
  // Container & Equipment
  CONTAINER_GATE_IN: "container.gate_in",
  CONTAINER_GATE_OUT: "container.gate_out",
  CONTAINER_DAMAGED: "incident.reported",
  // Vessel & Voyage
  VESSEL_ARRIVED: "vessel.arrived_destination",
  VESSEL_DEPARTED: "vessel.departed",
  VOYAGE_COMPLETED: "voyage.completed",
  // Customs & Compliance
  CUSTOMS_CLEARED: "customs.cleared",
  CUSTOMS_HELD: "customs.held",
  // Financial
  INVOICE_GENERATED: "invoice.generated",
  PAYMENT_OVERDUE: "invoice.overdue",
  PAYMENT_RECEIVED: "payment.received",
  // Cargo
  CARGO_RELEASED: "cargo.released",
  CARGO_CLAIM_FILED: "incident.reported",
  // Sales & CRM
  LEAD_CREATED: "lead.created",
  LEAD_QUALIFIED: "lead.qualified",
  LEAD_CONVERTED: "lead.converted",
  CUSTOMER_CREATED: "customer.created",
  OPPORTUNITY_CREATED: "opportunity.created",
  OPPORTUNITY_WON: "opportunity.won",
  QUOTATION_CREATED: "quotation.created",
  QUOTATION_ACCEPTED: "quote.accepted",
  QUOTATION_APPROVED: "quotation.approved",
  CONTRACT_CREATED: "contract.created",
  CONTRACT_ACTIVATED: "contract.activated",
  // Approval
  APPROVAL_REQUESTED: "approval.requested",
  APPROVAL_DECIDED: "approval.decided",
};

/**
 * Some flows use trigger strings that don't have dedicated EventBus types.
 * These are handled via dynamic pe_event_triggers or manual triggering.
 * For reference, unmapped trigger strings include:
 * - scheduled.weekly, scheduled.monthly, scheduled.quarterly, scheduled.annual (cron-driven)
 * - booking.lc_terms, lease.signed, container.free_time_expired (domain-specific)
 * - voyage.created, feeder_schedule.published, charter.fixture_confirmed (operations)
 * - dry_dock.planned, service.planning.initiated, vessel.inspection_due (maintenance)
 * - requisition.approved, bunker.requirement, sanctions_list.updated (procurement/compliance)
 * - trade_route.approved, vsa.period_start, agency.appointed (commercial)
 * - lcl_booking.confirmed, crew.rotation_due, tenant.signup (specialized)
 */

/**
 * H2 fix: Multiple event types may need to trigger the same flow.
 * VESSEL_ARRIVED maps to "vessel.arrived_destination" but flows also use
 * "vessel.eta_24h" and "vessel.arrived_hub". Handle these via secondary lookup.
 */
const SECONDARY_TRIGGERS: Partial<Record<EventType, string[]>> = {
  VESSEL_ARRIVED: ["vessel.eta_24h", "vessel.arrived_hub"],
  CONTAINER_DAMAGED: ["incident.reported"],
  CARGO_CLAIM_FILED: ["incident.reported"],
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

  // 1. Static flow matches — check primary trigger + secondary triggers
  const primaryFlows = FLOWS_BY_TRIGGER.get(triggerString) ?? [];
  const secondaryTriggers = SECONDARY_TRIGGERS[event.type as EventType] ?? [];
  const secondaryFlows = secondaryTriggers.flatMap(t => FLOWS_BY_TRIGGER.get(t) ?? []);
  // Deduplicate by flow ID
  const seenIds = new Set(primaryFlows.map(f => f.id));
  const staticFlows = [...primaryFlows];
  for (const f of secondaryFlows) {
    if (!seenIds.has(f.id)) {
      seenIds.add(f.id);
      staticFlows.push(f);
    }
  }

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
