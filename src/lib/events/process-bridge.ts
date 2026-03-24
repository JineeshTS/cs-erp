/**
 * Event-to-Process Bridge
 *
 * Listens to domain events and auto-creates pe_process_instances
 * with their steps, linking real operations to the Process Hub.
 *
 * Each mapping defines:
 * - Which PRC-xxx process is triggered
 * - What steps the process follows
 * - How to extract context from the event
 */

import { eventBus } from "./event-bus";
import { createProcessInstance, logEvent, listProcessInstances } from "../process-engine/service";
import type { EventType, EventOfType } from "./event-types";

interface ProcessMapping {
  processId: string;
  processName: string;
  triggerType: "event";
  entityType: string;
  steps: Array<{
    stepNumber: number;
    stepName: string;
    executorType: "ai" | "human" | "system";
  }>;
}

/**
 * Maps each event type to the ACTUAL process definitions from operational-processes.ts.
 * PRC IDs, names, and steps are taken directly from the source data.
 *
 * Verified mapping:
 * Sales: PRC-001 Lead Capture, PRC-002 Lead Scoring, PRC-003 Opportunity Qualification,
 *   PRC-004 Quote Generation, PRC-006 Contract Creation, PRC-008 Customer Onboarding,
 *   PRC-009 KYC Verification, PRC-010 Credit Scoring
 * Booking: PRC-021 Booking Creation, PRC-023 Booking Cancellation, PRC-026 BL Generation,
 *   PRC-038 Shipping Instruction Processing
 * Operations: PRC-064 Gate Processing, PRC-224 Container Damage Assessment,
 *   PRC-039 Cargo Release Order
 * Financial: PRC-121 Freight Invoice Generation, PRC-126 Cash Application
 * Compliance: PRC-161 Customs Declaration Filing, PRC-170 Cargo Claims Registration
 * Vessel: PRC-221 Vessel Arrival Notification, PRC-082 Vessel Clearance,
 *   PRC-060 Voyage Settlement
 * Platform: PRC-205 Workflow Creation
 */
const EVENT_PROCESS_MAP: Partial<Record<EventType, ProcessMapping[]>> = {
  // ── Sales & CRM Events ──
  LEAD_CREATED: [
    {
      processId: "PRC-001",
      processName: "Lead Capture",
      triggerType: "event",
      entityType: "lead",
      steps: [
        { stepNumber: 1, stepName: "Parse and extract company details, trade lanes, and cargo requirements from inquiry", executorType: "ai" },
        { stepNumber: 2, stepName: "Enrich lead with external data sources (company registry, credit bureau, shipping volumes)", executorType: "ai" },
        { stepNumber: 3, stepName: "Deduplicate against existing CRM contacts and assign to sales territory", executorType: "system" },
        { stepNumber: 4, stepName: "Score initial lead quality and route to appropriate sales representative", executorType: "ai" },
      ],
    },
    {
      processId: "PRC-002",
      processName: "Lead Scoring",
      triggerType: "event",
      entityType: "lead",
      steps: [
        { stepNumber: 1, stepName: "Analyze firmographic data against ideal customer profile model", executorType: "ai" },
        { stepNumber: 2, stepName: "Score trade lane alignment with current network coverage and capacity", executorType: "ai" },
        { stepNumber: 3, stepName: "Evaluate engagement signals (email opens, portal visits, quote requests)", executorType: "ai" },
        { stepNumber: 4, stepName: "Generate composite score with confidence interval and recommended next action", executorType: "ai" },
      ],
    },
  ],
  LEAD_CONVERTED: [
    {
      processId: "PRC-008",
      processName: "Customer Onboarding",
      triggerType: "event",
      entityType: "lead",
      steps: [
        { stepNumber: 1, stepName: "Create customer master record with validated business details", executorType: "system" },
        { stepNumber: 2, stepName: "Initiate KYC verification and credit assessment workflows in parallel", executorType: "system" },
        { stepNumber: 3, stepName: "Provision customer portal access and configure notification preferences", executorType: "system" },
        { stepNumber: 4, stepName: "Generate onboarding checklist and assign relationship manager", executorType: "system" },
      ],
    },
  ],
  OPPORTUNITY_CREATED: [
    {
      processId: "PRC-003",
      processName: "Opportunity Qualification",
      triggerType: "event",
      entityType: "opportunity",
      steps: [
        { stepNumber: 1, stepName: "Validate cargo type, volume, and frequency against operational capabilities", executorType: "ai" },
        { stepNumber: 2, stepName: "Assess route feasibility and available capacity on target trade lanes", executorType: "ai" },
        { stepNumber: 3, stepName: "Analyze competitive positioning and historical win rates for similar deals", executorType: "ai" },
      ],
    },
  ],
  QUOTATION_CREATED: [
    {
      processId: "PRC-004",
      processName: "Quote Generation",
      triggerType: "event",
      entityType: "rate_quotation",
      steps: [
        { stepNumber: 1, stepName: "Retrieve base tariff rates and applicable surcharges for the trade lane", executorType: "system" },
        { stepNumber: 2, stepName: "Apply dynamic pricing adjustments based on capacity utilization and market rates", executorType: "ai" },
        { stepNumber: 3, stepName: "Calculate volume discounts, loyalty adjustments, and competitive positioning", executorType: "ai" },
        { stepNumber: 4, stepName: "Generate formatted quotation document with validity period and terms", executorType: "system" },
      ],
    },
  ],
  CONTRACT_CREATED: [
    {
      processId: "PRC-006",
      processName: "Contract Creation",
      triggerType: "event",
      entityType: "contract",
      steps: [
        { stepNumber: 1, stepName: "Assemble contract template with negotiated rates, routes, and volume tiers", executorType: "system" },
        { stepNumber: 2, stepName: "Validate terms against compliance rules and company rate policies", executorType: "ai" },
        { stepNumber: 3, stepName: "Generate contract document with digital signature workflow", executorType: "system" },
        { stepNumber: 4, stepName: "Set up automated rate loading into booking system upon execution", executorType: "system" },
      ],
    },
  ],
  CUSTOMER_CREATED: [
    {
      processId: "PRC-009",
      processName: "KYC Verification",
      triggerType: "event",
      entityType: "customer",
      steps: [
        { stepNumber: 1, stepName: "Screen entity and principals against OFAC, EU, and UN sanctions lists", executorType: "ai" },
        { stepNumber: 2, stepName: "Verify business registration documents using OCR and registry lookups", executorType: "ai" },
        { stepNumber: 3, stepName: "Analyze beneficial ownership structure for PEP and adverse media flags", executorType: "ai" },
        { stepNumber: 4, stepName: "Generate risk classification (low/medium/high) with supporting evidence", executorType: "ai" },
      ],
    },
    {
      processId: "PRC-010",
      processName: "Credit Scoring",
      triggerType: "event",
      entityType: "customer",
      steps: [
        { stepNumber: 1, stepName: "Extract financial ratios from submitted statements using document AI", executorType: "ai" },
        { stepNumber: 2, stepName: "Query external credit bureaus and aggregate scoring data", executorType: "system" },
        { stepNumber: 3, stepName: "Apply internal credit scoring model with industry-specific weightings", executorType: "ai" },
        { stepNumber: 4, stepName: "Calculate recommended credit limit with payment terms", executorType: "ai" },
      ],
    },
  ],
  // ── Booking & Documentation Events ──
  BOOKING_CREATED: [
    {
      processId: "PRC-021",
      processName: "Booking Creation",
      triggerType: "event",
      entityType: "booking",
      steps: [
        { stepNumber: 1, stepName: "Validate cargo details against vessel capabilities and DG/OOG restrictions", executorType: "ai" },
        { stepNumber: 2, stepName: "Check space availability on requested voyage and allocate capacity", executorType: "system" },
        { stepNumber: 3, stepName: "Apply contracted or spot rates with applicable surcharges", executorType: "system" },
        { stepNumber: 4, stepName: "Generate booking confirmation with equipment release instructions", executorType: "system" },
      ],
    },
  ],
  BOOKING_CONFIRMED: [
    {
      processId: "PRC-038",
      processName: "Shipping Instruction Processing",
      triggerType: "event",
      entityType: "booking",
      steps: [
        { stepNumber: 1, stepName: "Parse shipping instructions from multiple input formats (EDI, PDF, structured form)", executorType: "ai" },
        { stepNumber: 2, stepName: "Validate SI fields against original booking data and identify discrepancies", executorType: "ai" },
        { stepNumber: 3, stepName: "Check party details against sanctions and denied party lists", executorType: "ai" },
        { stepNumber: 4, stepName: "Stage validated SI for BL generation with discrepancy flags", executorType: "system" },
      ],
    },
  ],
  BOOKING_CANCELLED: [
    {
      processId: "PRC-023",
      processName: "Booking Cancellation",
      triggerType: "event",
      entityType: "booking",
      steps: [
        { stepNumber: 1, stepName: "Calculate cancellation penalty based on timing and contract terms", executorType: "ai" },
        { stepNumber: 2, stepName: "Release allocated space back to available inventory", executorType: "system" },
        { stepNumber: 3, stepName: "De-allocate reserved equipment and update availability", executorType: "system" },
        { stepNumber: 4, stepName: "Generate cancellation confirmation and update capacity forecasts", executorType: "system" },
      ],
    },
  ],
  BL_ISSUED: [
    {
      processId: "PRC-026",
      processName: "Bill of Lading Generation",
      triggerType: "event",
      entityType: "bill_of_lading",
      steps: [
        { stepNumber: 1, stepName: "Validate all BL fields against booking data and shipping instructions", executorType: "ai" },
        { stepNumber: 2, stepName: "Check party names against sanctions lists and trade compliance databases", executorType: "ai" },
        { stepNumber: 3, stepName: "Apply correct terms, clauses, and notations based on trade lane and cargo type", executorType: "system" },
        { stepNumber: 4, stepName: "Generate BL document with unique number and digital signature", executorType: "system" },
      ],
    },
  ],
  BL_SURRENDERED: [
    {
      processId: "PRC-039",
      processName: "Cargo Release Order",
      triggerType: "event",
      entityType: "bill_of_lading",
      steps: [
        { stepNumber: 1, stepName: "Verify payment receipt against outstanding invoices for the shipment", executorType: "system" },
        { stepNumber: 2, stepName: "Confirm customs clearance status from regulatory gateway", executorType: "system" },
        { stepNumber: 3, stepName: "Check for holds (customs, shipping line, court order) before release", executorType: "ai" },
        { stepNumber: 4, stepName: "Generate release order with pickup authorization and validity period", executorType: "system" },
      ],
    },
  ],
  CONTAINER_GATE_IN: [
    {
      processId: "PRC-064",
      processName: "Gate Processing",
      triggerType: "event",
      entityType: "container",
      steps: [
        { stepNumber: 1, stepName: "Read container number and ISO code via OCR camera system", executorType: "ai" },
        { stepNumber: 2, stepName: "Validate against pre-advised booking and release authorization", executorType: "system" },
        { stepNumber: 3, stepName: "Check container condition via damage detection imaging AI", executorType: "ai" },
        { stepNumber: 4, stepName: "Process gate transaction and update container status", executorType: "system" },
      ],
    },
  ],
  CONTAINER_GATE_OUT: [
    {
      processId: "PRC-064",
      processName: "Gate Processing",
      triggerType: "event",
      entityType: "container",
      steps: [
        { stepNumber: 1, stepName: "Read container number and ISO code via OCR camera system", executorType: "ai" },
        { stepNumber: 2, stepName: "Validate against pre-advised booking and release authorization", executorType: "system" },
        { stepNumber: 3, stepName: "Check container condition via damage detection imaging AI", executorType: "ai" },
        { stepNumber: 4, stepName: "Process gate transaction and update container status", executorType: "system" },
      ],
    },
  ],
  CONTAINER_DAMAGED: [
    {
      processId: "PRC-224",
      processName: "Container Damage Assessment — AI Image",
      triggerType: "event",
      entityType: "container",
      steps: [
        { stepNumber: 1, stepName: "Process container images using computer vision to detect damage types (dents, rust, holes, structural)", executorType: "ai" },
        { stepNumber: 2, stepName: "Classify damage severity per IICL standards with location mapping on container diagram", executorType: "ai" },
        { stepNumber: 3, stepName: "Estimate repair costs using damage classification and current repair rate tables", executorType: "ai" },
        { stepNumber: 4, stepName: "Generate damage report with photographic evidence and recommended repair/reject decision", executorType: "system" },
      ],
    },
  ],
  INVOICE_GENERATED: [
    {
      processId: "PRC-121",
      processName: "Freight Invoice Generation",
      triggerType: "event",
      entityType: "invoice",
      steps: [
        { stepNumber: 1, stepName: "Compile all freight charges, surcharges, and ancillary fees from the shipment", executorType: "system" },
        { stepNumber: 2, stepName: "Apply applicable taxes (VAT, GST) based on origin, destination, and customer tax status", executorType: "ai" },
        { stepNumber: 3, stepName: "Convert charges to billing currency using contracted or spot exchange rates", executorType: "system" },
        { stepNumber: 4, stepName: "Generate invoice document with regulatory-compliant format and e-invoice submission", executorType: "system" },
      ],
    },
  ],
  PAYMENT_RECEIVED: [
    {
      processId: "PRC-126",
      processName: "Cash Application",
      triggerType: "event",
      entityType: "payment",
      steps: [
        { stepNumber: 1, stepName: "Parse remittance advice to extract invoice references and amounts", executorType: "ai" },
        { stepNumber: 2, stepName: "Match payments against outstanding invoices using multi-criteria matching", executorType: "ai" },
        { stepNumber: 3, stepName: "Handle partial payments, overpayments, and unidentified receipts", executorType: "system" },
        { stepNumber: 4, stepName: "Post cash application entries and update customer balance", executorType: "system" },
      ],
    },
  ],
  CUSTOMS_CLEARED: [
    {
      processId: "PRC-161",
      processName: "Customs Declaration Filing",
      triggerType: "event",
      entityType: "customs_filing",
      steps: [
        { stepNumber: 1, stepName: "Classify commodities using HS code lookup with AI-assisted description matching", executorType: "ai" },
        { stepNumber: 2, stepName: "Calculate applicable duties, taxes, and trade preference eligibility", executorType: "system" },
        { stepNumber: 3, stepName: "Compile declaration data in customs authority required format", executorType: "system" },
        { stepNumber: 4, stepName: "Submit declaration electronically and track assessment status", executorType: "system" },
      ],
    },
  ],
  CUSTOMS_HELD: [
    {
      processId: "PRC-161",
      processName: "Customs Declaration Filing — Hold Resolution",
      triggerType: "event",
      entityType: "customs_filing",
      steps: [
        { stepNumber: 1, stepName: "Analyze hold reason and identify required documentation", executorType: "ai" },
        { stepNumber: 2, stepName: "Prepare and compile required documents for customs authority", executorType: "human" },
        { stepNumber: 3, stepName: "Submit resolution documents to customs and track assessment", executorType: "system" },
        { stepNumber: 4, stepName: "Monitor clearance status and escalate if SLA at risk", executorType: "system" },
      ],
    },
  ],
  CARGO_CLAIM_FILED: [
    {
      processId: "PRC-170",
      processName: "Cargo Claims Registration",
      triggerType: "event",
      entityType: "cargo_claim",
      steps: [
        { stepNumber: 1, stepName: "Register claim with unique reference and link to shipment records", executorType: "system" },
        { stepNumber: 2, stepName: "Assess liability based on BL terms, convention applicability, and evidence", executorType: "ai" },
        { stepNumber: 3, stepName: "Calculate claim reserve based on damage extent and cargo value", executorType: "ai" },
        { stepNumber: 4, stepName: "Initiate documentation collection and survey appointment if required", executorType: "human" },
      ],
    },
  ],
  CARGO_RELEASED: [
    {
      processId: "PRC-039",
      processName: "Cargo Release Order",
      triggerType: "event",
      entityType: "delivery_order",
      steps: [
        { stepNumber: 1, stepName: "Verify payment receipt against outstanding invoices for the shipment", executorType: "system" },
        { stepNumber: 2, stepName: "Confirm customs clearance status from regulatory gateway", executorType: "system" },
        { stepNumber: 3, stepName: "Check for holds (customs, shipping line, court order) before release", executorType: "ai" },
        { stepNumber: 4, stepName: "Generate release order with pickup authorization and validity period", executorType: "system" },
      ],
    },
  ],
  VESSEL_ARRIVED: [
    {
      processId: "PRC-221",
      processName: "Vessel Arrival Notification",
      triggerType: "event",
      entityType: "vessel",
      steps: [
        { stepNumber: 1, stepName: "Monitor vessel position and calculate updated ETA using AIS and weather data", executorType: "ai" },
        { stepNumber: 2, stepName: "Compile arrival notification with vessel particulars, cargo summary, and special requirements", executorType: "system" },
        { stepNumber: 3, stepName: "Identify all required recipients per port and regulatory requirements", executorType: "system" },
        { stepNumber: 4, stepName: "Distribute notifications via EDI, email, and port community system integration", executorType: "system" },
      ],
    },
  ],
  VESSEL_DEPARTED: [
    {
      processId: "PRC-082",
      processName: "Vessel Clearance",
      triggerType: "event",
      entityType: "vessel",
      steps: [
        { stepNumber: 1, stepName: "Prepare and submit FAL forms (IMO Convention) electronically to port authority", executorType: "system" },
        { stepNumber: 2, stepName: "Screen crew list against immigration and security databases", executorType: "ai" },
        { stepNumber: 3, stepName: "Verify health declarations and maritime health compliance", executorType: "system" },
        { stepNumber: 4, stepName: "Track clearance status from all authorities and flag delays", executorType: "system" },
      ],
    },
  ],
  VOYAGE_COMPLETED: [
    {
      processId: "PRC-060",
      processName: "Voyage Settlement",
      triggerType: "event",
      entityType: "voyage",
      steps: [
        { stepNumber: 1, stepName: "Reconcile all revenue entries against bookings and invoices", executorType: "system" },
        { stepNumber: 2, stepName: "Verify all cost entries with supporting documentation", executorType: "ai" },
        { stepNumber: 3, stepName: "Calculate inter-company allocations for shared voyages", executorType: "system" },
        { stepNumber: 4, stepName: "Finalize voyage P&L and generate settlement report", executorType: "system" },
      ],
    },
  ],
  APPROVAL_REQUESTED: [
    {
      processId: "PRC-205",
      processName: "Workflow Creation",
      triggerType: "event",
      entityType: "approval",
      steps: [
        { stepNumber: 1, stepName: "Design workflow from requirements using process template library", executorType: "system" },
        { stepNumber: 2, stepName: "Configure approval rules, thresholds, and escalation timers", executorType: "system" },
        { stepNumber: 3, stepName: "Set up notification templates and delivery channels per workflow step", executorType: "system" },
        { stepNumber: 4, stepName: "Validate workflow logic and simulate test scenarios", executorType: "human" },
      ],
    },
  ],
};

/**
 * Register event-to-process bridge handlers.
 * Called from register-handlers.ts during app startup.
 */
export function registerProcessBridge(): void {
  const eventTypes = Object.keys(EVENT_PROCESS_MAP) as EventType[];

  for (const eventType of eventTypes) {
    eventBus.on(eventType, async (event: EventOfType<typeof eventType>) => {
      const mappings = EVENT_PROCESS_MAP[eventType];
      if (!mappings) return;

      for (const mapping of mappings) {
        try {
          // Idempotency check: skip if active process already exists for this entity + processId
          const existing = await listProcessInstances({
            tenantId: event.tenantId,
            processId: mapping.processId,
            entityType: mapping.entityType,
            status: "in_progress",
            limit: 1,
          });
          if (existing.data.length > 0 && existing.data.some((p) => p.entityId === event.entityId)) {
            console.log(
              `[ProcessBridge] Skipping duplicate ${mapping.processId} for entity ${event.entityId}`
            );
            continue;
          }

          // Create process instance
          await createProcessInstance({
            tenantId: event.tenantId,
            processId: mapping.processId,
            processName: mapping.processName,
            triggerType: mapping.triggerType,
            triggeredBy: event.userId,
            entityType: mapping.entityType,
            entityId: event.entityId,
            contextJson: {
              eventType: event.type,
              eventData: event.data,
              triggeredAt: event.timestamp.toISOString(),
            },
            steps: mapping.steps,
          });

          // Log event in process engine event log
          await logEvent({
            tenantId: event.tenantId,
            eventType: event.type,
            entityType: event.entityType,
            entityId: event.entityId,
            userId: event.userId,
            payload: event.data as Record<string, unknown>,
          });

          console.log(
            `[ProcessBridge] ${event.type} → created ${mapping.processId} (${mapping.processName}) for entity ${event.entityId}`
          );
        } catch (err) {
          console.error(
            `[ProcessBridge] Failed to create process ${mapping.processId} from ${event.type}:`,
            err
          );
        }
      }
    });
  }

  console.log(
    `[ProcessBridge] Registered ${eventTypes.length} event-to-process mappings`
  );
}
