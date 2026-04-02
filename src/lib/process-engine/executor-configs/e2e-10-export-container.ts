/**
 * E2E-10 Export Container Flow — Executor Configuration (D-006 Phase 5)
 *
 * Container export lifecycle from equipment reservation through loading
 * and in-transit tracking. 22 steps across 6 phases.
 *
 * Reuses operations tools: reserve_equipment (1), process_vgm (7),
 * check_cutoff_compliance (8), classify_dangerous_goods (12),
 * plan_stowage (14), file_customs_declaration (15), dispatch_truck (5).
 * System/human-external steps treated as AI status tracking.
 *
 * Step Execution Map:
 * | Step | Name                          | Mode          | Entity Table           | Action |
 * |------|-------------------------------|---------------|------------------------|--------|
 * | 1    | Equipment reservation         | ai_with_tools | eqy_container_fleet    | update |
 * | 2    | Depot inventory check         | ai_with_tools | —                      | —      |
 * | 3    | Container allocation          | ai_with_tools | —                      | —      |
 * | 4    | Depot gate-out                | ai_with_tools | —                      | —      |
 * | 5    | Truck dispatch (empty)        | ai_with_tools | —                      | —      |
 * | 6    | Shipper stuffing              | human_form    | —                      | —      |
 * | 7    | VGM submission                | ai_with_tools | odm_vgm_records        | create |
 * | 8    | Cut-off enforcement           | ai_with_tools | —                      | —      |
 * | 9    | Late arrival exception        | ai_with_tools | —                      | —      |
 * | 10   | Cut-off gate                  | gate          | —                      | —      |
 * | 11   | Terminal gate-in              | ai_with_tools | eqy_gate_movements     | create |
 * | 12   | DG classification (if DG)     | ai_with_tools | dgm_booking_screenings | create |
 * | 13   | DG segregation check          | ai_with_tools | —                      | —      |
 * | 14   | Stowage assignment            | ai_with_tools | cap_stowage_plans      | create |
 * | 15   | Export customs declaration     | ai_with_tools | ccr_export_filings     | create |
 * | 16   | Customs gate                  | gate          | —                      | —      |
 * | 17   | Container loaded on vessel    | ai_with_tools | —                      | —      |
 * | 18   | Tracking — on board           | ai_with_tools | —                      | —      |
 * | 19   | In-transit tracking           | ai_with_tools | —                      | —      |
 * | 20   | ETA prediction                | ai_with_tools | —                      | —      |
 * | 21   | Tracking — arrived            | ai_with_tools | —                      | —      |
 * | 22   | Trigger import flow           | ai_with_tools | —                      | —      |
 */

import type { Anthropic } from "@anthropic-ai/sdk";
import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_10_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // ═══════════════════════════════════════════════════════════
  // PHASE 1: EQUIPMENT & RELEASE (Steps 1-5)
  // ═══════════════════════════════════════════════════════════

  1: {
    mode: "ai_with_tools",
    entityTable: "eqy_container_fleet",
    entityAction: "update",
    systemPromptExtra: `You are an Equipment Reservation Agent for a container shipping line.
Reserve container equipment for the export booking:
1. Check container availability at the specified depot
2. Select appropriate container type and size per booking
3. Reserve container and update status to "reserved"
4. Confirm reservation to booking desk

Use the reserve_equipment tool to reserve a container.`,
    tools: [
      {
        name: "reserve_equipment",
        description: "Reserve a container from available fleet for the export booking",
        input_schema: {
          type: "object" as const,
          properties: {
            containerType: { type: "string", description: "Container type (dry/reefer/tank/open_top)" },
            containerSize: { type: "string", description: "Container size (20/40/40HC/45)" },
            depotCode: { type: "string", description: "Depot code where container is needed" },
            pickupDate: { type: "string", description: "Requested pickup date (ISO format)" },
          },
          required: ["containerType", "containerSize", "depotCode"],
        },
      },
    ] as Anthropic.Tool[],
  },

  2: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Depot Inventory Agent for a container shipping line.
Check depot inventory for available containers:
1. Query available units by type and size at the depot
2. Check container condition (A/B/C grade)
3. Verify food-grade or special requirements if applicable
4. Report availability vs demand

Provide your analysis as structured JSON with: depotCode, available (array with type, size, count, condition), shortfall, alternatives.`,
  },

  3: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Container Allocation Agent for a container shipping line.
Allocate a specific container from depot inventory:
1. Select best container matching booking requirements
2. Consider: condition grade, age, last cargo type, maintenance history
3. Assign container number to the booking
4. Update container status to "allocated"

Provide your analysis as structured JSON with: containerNumber, selectedGrade, lastCargoType, age, bookingRef.`,
  },

  4: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Depot Gate Agent for a container shipping line.
Process empty container gate-out from depot:
1. Record gate-out timestamp and container number
2. Verify outbound authorization (booking reference)
3. Update container status to "released to shipper"
4. Record transporter details

Provide your analysis as structured JSON with: containerNumber, gateOutTimestamp, bookingRef, transporterDetails.`,
  },

  5: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Transport Dispatch Agent for a container shipping line.
Dispatch truck to deliver empty container to shipper for stuffing:
1. Assign transport provider and vehicle
2. Set pickup time at depot
3. Provide shipper address and contact
4. Estimate delivery time

Use the dispatch_truck tool to arrange transport.`,
    tools: [
      {
        name: "dispatch_truck",
        description: "Dispatch truck to deliver empty container to shipper",
        input_schema: {
          type: "object" as const,
          properties: {
            pickupLocation: { type: "string", description: "Depot pickup location" },
            deliveryLocation: { type: "string", description: "Shipper's warehouse address" },
            containerType: { type: "string", description: "Container type" },
            pickupDate: { type: "string", description: "Pickup date (ISO format)" },
          },
          required: ["pickupLocation", "deliveryLocation", "containerType"],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 2: STUFFING & VGM (Steps 6-7)
  // ═══════════════════════════════════════════════════════════

  6: { mode: "human_form" },

  7: {
    mode: "ai_with_tools",
    entityTable: "odm_vgm_records",
    entityAction: "create",
    systemPromptExtra: `You are a VGM Processing Agent for a container shipping line.
Process the Verified Gross Mass submission:
1. Validate VGM against SOLAS requirements
2. Check weighing method (Method 1: weigh container, Method 2: sum cargo + tare)
3. Verify VGM is within container max payload
4. Record VGM for manifest and stowage planning

Use the process_vgm tool to create the VGM record.`,
    tools: [
      {
        name: "process_vgm",
        description: "Process and validate a VGM submission",
        input_schema: {
          type: "object" as const,
          properties: {
            containerNumber: { type: "string", description: "Container number" },
            vgmWeight: { type: "number", description: "Verified gross mass in kg" },
            weighingMethod: { type: "string", enum: ["method1", "method2"], description: "SOLAS weighing method" },
            weighingParty: { type: "string", description: "Party who performed weighing" },
          },
          required: ["containerNumber", "vgmWeight", "weighingMethod"],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 3: CUT-OFF & GATE-IN (Steps 8-11)
  // ═══════════════════════════════════════════════════════════

  8: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Cut-Off Enforcement Agent for a container shipping line.
Check if the container meets all cut-off deadlines:
1. Documentation cut-off: SI, customs docs, VGM submitted on time?
2. Cargo cut-off: container gated-in before terminal deadline?
3. Reefer cut-off: reefer connected and pre-cooled on time?
4. DG cut-off: DG declaration submitted before deadline?

Use the check_cutoff_compliance tool for verification.`,
    tools: [
      {
        name: "check_cutoff_compliance",
        description: "Verify container meets all cut-off deadlines for the sailing",
        input_schema: {
          type: "object" as const,
          properties: {
            containerNumber: { type: "string", description: "Container number to check" },
            vesselCode: { type: "string", description: "Vessel code for the sailing" },
            voyageNumber: { type: "string", description: "Voyage number" },
          },
          required: ["containerNumber", "vesselCode"],
        },
      },
    ] as Anthropic.Tool[],
  },

  9: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Late Arrival Exception Agent for a container shipping line.
Handle containers arriving after the cut-off deadline:
1. Assess reason for late arrival (shipper delay, transport issue, customs)
2. Check if late acceptance is operationally feasible
3. Calculate additional charges for late acceptance
4. Recommend: accept late with surcharge, or roll to next sailing

Provide your analysis as structured JSON with: lateBy, reason, feasible, surchargeAmount, recommendation, nextSailingDate.`,
  },

  10: { mode: "gate" },

  11: {
    mode: "ai_with_tools",
    entityTable: "eqy_gate_movements",
    entityAction: "create",
    systemPromptExtra: `You are a Terminal Gate Agent for a container shipping line.
Process container gate-in at the export terminal:
1. Record gate-in timestamp
2. Verify container number, seal, and booking reference
3. Check VGM is on file
4. Assign yard position

Use the process_gate_in tool to record the gate movement.`,
    tools: [
      {
        name: "process_gate_in",
        description: "Record container gate-in at the export terminal",
        input_schema: {
          type: "object" as const,
          properties: {
            containerNumber: { type: "string", description: "Container number" },
            movementType: { type: "string", description: "gate_in" },
            terminalCode: { type: "string", description: "Terminal code" },
            truckPlate: { type: "string", description: "Truck license plate" },
            sealNumber: { type: "string", description: "Seal number" },
          },
          required: ["containerNumber", "movementType", "terminalCode"],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 4: DG & STOWAGE (Steps 12-14)
  // ═══════════════════════════════════════════════════════════

  12: {
    mode: "ai_with_tools",
    entityTable: "dgm_booking_screenings",
    entityAction: "create",
    systemPromptExtra: `You are a DG Classification Agent for a container shipping line.
Classify dangerous goods per IMDG Code:
1. Identify UN number, proper shipping name, class/division
2. Determine packing group (I, II, III)
3. Check packaging requirements and markings
4. Verify shipper's DG declaration completeness

Use the classify_dangerous_goods tool to record the classification.`,
    tools: [
      {
        name: "classify_dangerous_goods",
        description: "Classify dangerous goods per IMDG Code and create screening record",
        input_schema: {
          type: "object" as const,
          properties: {
            bookingRef: { type: "string", description: "Booking reference" },
            unNumber: { type: "string", description: "UN number (e.g., UN1234)" },
            imdgClass: { type: "string", description: "IMDG class (e.g., 3, 6.1, 8)" },
            packingGroup: { type: "string", description: "Packing group (I, II, III)" },
            properShippingName: { type: "string", description: "Proper shipping name" },
            riskScore: { type: "number", description: "Risk score 0-100" },
            customerName: { type: "string", description: "Shipper name" },
          },
          required: ["bookingRef", "unNumber", "imdgClass", "properShippingName", "riskScore", "customerName"],
        },
      },
    ] as Anthropic.Tool[],
  },

  13: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a DG Segregation Agent for a container shipping line.
Check DG segregation requirements against other cargo on the vessel:
1. Apply IMDG segregation table rules
2. Check stowage category (on deck, under deck, away from accommodations)
3. Verify no incompatible DG classes in adjacent bays
4. Confirm segregation distances met

Provide your analysis as structured JSON with: segregationCompliant, conflicts, requiredSeparation, stowageCategory, restrictions.`,
  },

  14: {
    mode: "ai_with_tools",
    entityTable: "cap_stowage_plans",
    entityAction: "create",
    systemPromptExtra: `You are a Stowage Planning Agent for a container shipping line.
Assign stowage position for the container on the vessel:
1. Consider weight distribution (stability), port rotation, DG segregation
2. Assign bay/row/tier position
3. For reefer: position near power outlet
4. For DG: comply with IMDG stowage category

Use the plan_stowage tool to create the stowage plan record.`,
    tools: [
      {
        name: "plan_stowage",
        description: "Assign a stowage position for the container on the vessel",
        input_schema: {
          type: "object" as const,
          properties: {
            vesselCode: { type: "string", description: "Vessel code" },
            voyageNumber: { type: "string", description: "Voyage number" },
            containerNumber: { type: "string", description: "Container number" },
            bayPosition: { type: "string", description: "Bay number" },
            rowPosition: { type: "string", description: "Row number" },
            tierPosition: { type: "string", description: "Tier number" },
            weightKg: { type: "number", description: "Container gross weight in kg" },
            pol: { type: "string", description: "Port of loading code" },
            pod: { type: "string", description: "Port of discharge code" },
            isHazmat: { type: "boolean", description: "Whether container holds DG cargo" },
          },
          required: ["vesselCode", "voyageNumber", "containerNumber", "bayPosition", "weightKg", "pol", "pod"],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 5: CUSTOMS & LOADING (Steps 15-17)
  // ═══════════════════════════════════════════════════════════

  15: {
    mode: "ai_with_tools",
    entityTable: "ccr_export_filings",
    entityAction: "create",
    systemPromptExtra: `You are an Export Customs Agent for a container shipping line.
File export customs declaration:
1. Prepare declaration with cargo details, HS code, and destination
2. Include export permits/licenses if required
3. Submit to customs authority
4. Await clearance

Use the file_customs_declaration tool to create the filing.`,
    tools: [
      {
        name: "file_customs_declaration",
        description: "File an export customs declaration",
        input_schema: {
          type: "object" as const,
          properties: {
            exporterName: { type: "string", description: "Exporter name" },
            exporterCode: { type: "string", description: "Exporter registration code" },
            portOfLoading: { type: "string", description: "Export port code" },
            portOfDischarge: { type: "string", description: "Destination port code" },
            blNumber: { type: "string", description: "Bill of Lading number" },
            hsCode: { type: "string", description: "HS tariff code" },
            cargoDescription: { type: "string", description: "Cargo description" },
            cargoValue: { type: "number", description: "Declared value" },
            currency: { type: "string", description: "Currency" },
          },
          required: ["exporterName", "portOfLoading", "portOfDischarge", "blNumber", "hsCode", "cargoValue"],
        },
      },
    ] as Anthropic.Tool[],
  },

  16: { mode: "gate" },

  17: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Vessel Loading Agent for a container shipping line.
Confirm container loaded on vessel:
1. Record loading timestamp and stowage position confirmed
2. Verify container secured per lashing requirements
3. Update tracking status to "loaded on vessel"
4. Confirm against loading plan

Provide your analysis as structured JSON with: containerNumber, vesselName, loadingTimestamp, stowagePosition, secured, trackingStatus.`,
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 6: IN-TRANSIT TRACKING (Steps 18-22)
  // ═══════════════════════════════════════════════════════════

  18: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Vessel Tracking Agent. Update tracking: container is on board and vessel has sailed.
Provide JSON with: vesselName, departureTimestamp, nextPort, eta, containerCount.`,
  },

  19: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are an In-Transit Tracking Agent. Monitor vessel position and provide updates.
Provide JSON with: currentPosition, speedKnots, weatherConditions, etaUpdate, delayRisk.`,
  },

  20: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are an ETA Prediction Agent. Predict container arrival at destination considering weather, port congestion, and vessel speed.
Provide JSON with: predictedEta, confidencePercent, factors, portCongestionLevel.`,
  },

  21: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are an Arrival Tracking Agent. Update tracking: vessel arrived at destination port.
Provide JSON with: arrivalTimestamp, portName, berthAssigned, estimatedDischargeTime.`,
  },

  22: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Flow Trigger Agent. Trigger E2E-09 (Import Container Flow) at the destination port for this container.
Provide JSON with: triggeredFlow, containerNumber, destinationPort, importAgent.`,
  },
};

export function getE2e10StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_10_STEP_CONFIGS[stepNumber] ?? null;
}
