/**
 * E2E-09 Import Container Flow — Executor Configuration (D-006 Phase 5)
 *
 * Container import lifecycle from vessel discharge through customs clearance,
 * delivery, and empty return. 22 steps across 5 phases.
 *
 * Reuses operations tools: dispatch_truck (step 12), process_gate_in (step 17).
 * Reuses documentation tools: file_customs_declaration (step 3).
 * System steps treated as AI status tracking.
 *
 * Step Execution Map:
 * | Step | Name                          | Mode          | Entity Table           | Action |
 * |------|-------------------------------|---------------|------------------------|--------|
 * | 1    | Vessel discharge              | ai_with_tools | —                      | —      |
 * | 2    | Tracking update at port       | ai_with_tools | —                      | —      |
 * | 3    | Import customs declaration    | ai_with_tools | ccr_export_filings     | create |
 * | 4    | Duty calculation              | ai_with_tools | —                      | —      |
 * | 5    | Customs duty gate             | gate          | —                      | —      |
 * | 6    | Customs hold response         | ai_with_tools | —                      | —      |
 * | 7    | Customs examination gate      | gate          | —                      | —      |
 * | 8    | Customs release               | ai_with_tools | —                      | —      |
 * | 9    | Cargo release order           | ai_with_tools | —                      | —      |
 * | 10   | Delivery order generation     | ai_with_tools | —                      | —      |
 * | 11   | Transport mode selection      | ai_with_tools | —                      | —      |
 * | 12   | Truck dispatch for delivery   | ai_with_tools | —                      | —      |
 * | 13   | Last-mile delivery tracking   | ai_with_tools | —                      | —      |
 * | 14   | Proof of delivery             | ai_with_tools | —                      | —      |
 * | 15   | Delivery confirmed            | ai_with_tools | —                      | —      |
 * | 16   | Track empty return            | ai_with_tools | —                      | —      |
 * | 17   | Empty gate-in at depot        | ai_with_tools | eqy_gate_movements     | create |
 * | 18   | Inspect empty for damage      | ai_with_tools | —                      | —      |
 * | 19   | AI damage assessment          | ai_with_tools | —                      | —      |
 * | 20   | Damage gate                   | gate          | —                      | —      |
 * | 21   | Calculate D&D charges         | ai_with_tools | —                      | —      |
 * | 22   | Update depot inventory        | ai_with_tools | —                      | —      |
 */

import type { Anthropic } from "@anthropic-ai/sdk";
import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_09_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // ═══════════════════════════════════════════════════════════
  // PHASE 1: DISCHARGE (Steps 1-2)
  // ═══════════════════════════════════════════════════════════

  1: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Vessel Operations Agent for a container shipping line.
Process container discharge from vessel:
1. Confirm container offloaded from vessel with discharge timestamp
2. Record bay/row/tier position of container on vessel
3. Update tracking status to "discharged at port"
4. Verify container number and seal intact

Provide your analysis as structured JSON with: containerNumber, vesselName, dischargeTimestamp, portName, sealIntact, position.`,
  },

  2: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Cargo Tracking Agent for a container shipping line.
Update container tracking after discharge:
1. Set tracking milestone: "Container at destination port"
2. Calculate estimated customs clearance time
3. Notify consignee/agent of container arrival
4. Estimate delivery timeline from port

Provide your analysis as structured JSON with: trackingStatus, arrivalTimestamp, estimatedClearanceHours, estimatedDeliveryDate, notificationsSent.`,
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 2: CUSTOMS CLEARANCE (Steps 3-8)
  // ═══════════════════════════════════════════════════════════

  3: {
    mode: "ai_with_tools",
    entityTable: "ccr_export_filings",
    entityAction: "create",
    systemPromptExtra: `You are a Customs Declaration Agent for a container shipping line.
File an import customs declaration:
1. Prepare declaration with cargo details, HS codes, and origin
2. Calculate declared value for duty assessment
3. Submit to customs authority
4. Track declaration status

Use the file_customs_declaration tool to create the filing record.`,
    tools: [
      {
        name: "file_customs_declaration",
        description: "File an import customs declaration with the port authority",
        input_schema: {
          type: "object" as const,
          properties: {
            exporterName: { type: "string", description: "Shipper/exporter name" },
            exporterCode: { type: "string", description: "Exporter registration code" },
            portOfLoading: { type: "string", description: "Origin port code" },
            portOfDischarge: { type: "string", description: "Destination/import port code" },
            blNumber: { type: "string", description: "Bill of Lading number" },
            hsCode: { type: "string", description: "HS tariff code for the cargo" },
            cargoDescription: { type: "string", description: "Cargo description" },
            cargoValue: { type: "number", description: "Declared cargo value in USD" },
            currency: { type: "string", description: "Currency of declared value" },
            declarationType: { type: "string", description: "import" },
          },
          required: ["exporterName", "portOfLoading", "portOfDischarge", "blNumber", "hsCode", "cargoValue"],
        },
      },
    ] as Anthropic.Tool[],
  },

  4: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Customs Duty Calculation Agent for a container shipping line.
Calculate import duties and taxes:
1. Apply HS code-based duty rate to declared value (CIF)
2. Calculate VAT/GST on (CIF value + duty)
3. Apply any preferential duty rates (FTA, bilateral agreements)
4. Calculate total payable duties and taxes

Provide your analysis as structured JSON with: hsCode, cifValue, dutyRate, dutyAmount, vatRate, vatAmount, totalPayable, preferentialApplied.`,
  },

  5: { mode: "gate" },

  6: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Customs Response Agent for a container shipping line.
Handle customs examination hold:
1. Identify reason for hold (random, risk-profile, documentation)
2. Prepare required supplementary documents
3. Coordinate examination scheduling with customs
4. Estimate delay impact on delivery timeline

Provide your analysis as structured JSON with: holdReason, requiredDocuments, examinationDate, estimatedDelay, impactAssessment.`,
  },

  7: { mode: "gate" },

  8: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Customs Clearance Agent for a container shipping line.
Process customs release:
1. Confirm customs clearance status
2. Record release reference number
3. Update tracking to "customs cleared"
4. Trigger cargo release order generation

Provide your analysis as structured JSON with: releaseRef, clearanceTimestamp, dutiesPaid, nextAction.`,
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 3: RELEASE & DELIVERY (Steps 9-15)
  // ═══════════════════════════════════════════════════════════

  9: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Cargo Release Agent for a container shipping line.
Generate a cargo release order:
1. Verify all holds cleared (customs, freight payment, BL surrender)
2. Generate release order with reference number
3. Authorize terminal to release container
4. Notify consignee of release availability

Provide your analysis as structured JSON with: releaseOrderRef, holdsCleared, terminalAuthorized, consigneeNotified.`,
  },

  10: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Documentation Agent for a container shipping line.
Generate a delivery order:
1. Create delivery order with consignee details and container info
2. Specify delivery point (port CFS, customer warehouse, ICD)
3. Include special handling instructions (reefer, DG, OOG)
4. Set delivery window

Provide your analysis as structured JSON with: deliveryOrderRef, consigneeName, deliveryPoint, specialHandling, deliveryWindow.`,
  },

  11: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Transport Planning Agent for a container shipping line.
Select optimal inland transport mode for container delivery:
1. Compare: truck (door delivery), rail (ICD), barge (inland waterway)
2. Factor: cost, transit time, equipment availability, environmental
3. Check customer preference from contract/booking
4. Recommend best option

Provide your analysis as structured JSON with: selectedMode, options (array with mode, cost, transitHours, availability), recommendation, customerPreference.`,
  },

  12: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Transport Dispatch Agent for a container shipping line.
Dispatch truck for container delivery to consignee:
1. Select transport provider (own fleet or 3PL)
2. Assign vehicle and driver
3. Set pickup time at port/terminal
4. Provide delivery address and contact details

Use the dispatch_truck tool if available, otherwise analyze and recommend.
Provide your analysis as structured JSON with: transportProvider, vehicleRef, driverName, pickupTime, deliveryAddress, estimatedArrival.`,
    tools: [
      {
        name: "dispatch_truck",
        description: "Dispatch a truck for container delivery from port to consignee",
        input_schema: {
          type: "object" as const,
          properties: {
            pickupLocation: { type: "string", description: "Port or terminal location" },
            deliveryLocation: { type: "string", description: "Consignee delivery address" },
            containerType: { type: "string", description: "Container type (20GP/40GP/40HC/reefer)" },
            pickupDate: { type: "string", description: "Requested pickup date (ISO format)" },
          },
          required: ["pickupLocation", "deliveryLocation", "containerType"],
        },
      },
    ] as Anthropic.Tool[],
  },

  13: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Last-Mile Tracking Agent for a container shipping line.
Track container delivery to consignee:
1. Monitor truck GPS position and ETA
2. Update tracking milestones (departed port, en route, approaching destination)
3. Alert if delay detected vs planned arrival
4. Notify consignee of updated ETA

Provide your analysis as structured JSON with: currentLocation, departedTime, currentEta, delayMinutes, trackingUpdates.`,
  },

  14: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Proof of Delivery Agent for a container shipping line.
Capture proof of delivery:
1. Record delivery timestamp and location
2. Confirm recipient name and signature
3. Note any exceptions (damage, shortage, refused)
4. Generate POD document reference

Provide your analysis as structured JSON with: deliveryTimestamp, recipientName, signatureConfirmed, exceptions, podReference.`,
  },

  15: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Delivery Confirmation Agent for a container shipping line.
Confirm delivery completion:
1. Mark shipment as delivered in tracking system
2. Update container status to "empty at consignee"
3. Start detention/demurrage clock for empty return
4. Notify shipper of successful delivery

Provide your analysis as structured JSON with: deliveryConfirmed, emptyReturnDeadline, ddClockStarted, notifications.`,
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 4: EMPTY RETURN (Steps 16-20)
  // ═══════════════════════════════════════════════════════════

  16: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are an Equipment Tracking Agent for a container shipping line.
Track empty container return from consignee to depot:
1. Monitor empty return status and estimated return date
2. Alert if approaching detention/demurrage deadline
3. Assign nearest return depot
4. Calculate D&D charges if overdue

Provide your analysis as structured JSON with: containerNumber, returnStatus, assignedDepot, ddDeadline, daysRemaining, estimatedReturnDate.`,
  },

  17: {
    mode: "ai_with_tools",
    entityTable: "eqy_gate_movements",
    entityAction: "create",
    systemPromptExtra: `You are an Equipment Gate Agent for a container shipping line.
Process empty container gate-in at the return depot:
1. Record gate-in timestamp and depot location
2. Verify container number and seal status
3. Update equipment inventory status to "available"
4. Trigger damage inspection

Use the process_gate_in tool to record the gate movement.`,
    tools: [
      {
        name: "process_gate_in",
        description: "Record empty container gate-in at the return depot",
        input_schema: {
          type: "object" as const,
          properties: {
            containerNumber: { type: "string", description: "Container number" },
            movementType: { type: "string", description: "gate_in" },
            terminalCode: { type: "string", description: "Return depot code" },
            truckPlate: { type: "string", description: "Truck license plate" },
            sealNumber: { type: "string", description: "Seal number (if applicable)" },
          },
          required: ["containerNumber", "movementType", "terminalCode"],
        },
      },
    ] as Anthropic.Tool[],
  },

  18: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Container Inspection Agent for a container shipping line.
Inspect returned empty container for damage:
1. Conduct visual inspection (exterior walls, floor, roof, doors)
2. Check structural integrity (corner posts, locking mechanisms)
3. Assess cleanliness and contamination
4. Classify condition: A (sound), B (minor repair), C (major repair), D (condemned)

Provide your analysis as structured JSON with: containerNumber, condition, damageItems (array with location, type, severity), cleanlinessStatus, recommendation.`,
  },

  19: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Damage Assessment Agent for a container shipping line.
Perform AI-assisted damage assessment:
1. Estimate repair cost based on damage type and extent
2. Determine responsibility (customer, terminal, carrier)
3. Check if damage existed before customer use (pre-trip inspection record)
4. Calculate M&R (Maintenance & Repair) cost estimate

Provide your analysis as structured JSON with: damageAssessment, estimatedRepairCost, responsibleParty, preExistingDamage, mnrEstimate, customerChargeable.`,
  },

  20: { mode: "gate" },

  // ═══════════════════════════════════════════════════════════
  // PHASE 5: D&D & INVENTORY (Steps 21-22)
  // ═══════════════════════════════════════════════════════════

  21: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a D&D Calculation Agent for a container shipping line.
Calculate Detention & Demurrage charges:
1. Demurrage: days container stayed at port beyond free time
2. Detention: days container stayed at customer beyond free time
3. Apply per-diem rates per contract or tariff
4. Calculate total D&D charges payable

Provide your analysis as structured JSON with: demurrageDays, demurrageRate, demurrageAmount, detentionDays, detentionRate, detentionAmount, totalDdCharges, freeTimeDays.`,
  },

  22: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are an Equipment Inventory Agent for a container shipping line.
Update depot inventory after empty container return:
1. Add container to depot available inventory
2. Update equipment tracking system with current location
3. Mark container as available for next use (or in-repair if damaged)
4. Update depot capacity utilization

Provide your analysis as structured JSON with: containerNumber, depotCode, inventoryStatus, depotUtilizationPercent, nextUseAvailability.`,
  },
};

export function getE2e09StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_09_STEP_CONFIGS[stepNumber] ?? null;
}
