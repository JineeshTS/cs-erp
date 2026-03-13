/**
 * E2E-12 DG Cargo Flow — Executor Configuration (D-006 Phase 5)
 *
 * Dangerous goods handling from IMDG classification through segregation,
 * documentation, transit safety, and delivery. 18 steps across 6 phases.
 *
 * Reuses operations tools: classify_dangerous_goods (1), plan_stowage (8).
 * Reuses documentation tools: file_customs_declaration (10).
 * Many steps involve human physical handling (external).
 *
 * Step Execution Map:
 * | Step | Name                          | Mode          | Entity Table           | Action |
 * |------|-------------------------------|---------------|------------------------|--------|
 * | 1    | IMDG classification           | ai_with_tools | dgm_booking_screenings | create |
 * | 2    | DG acceptance gate            | gate          | —                      | —      |
 * | 3    | Segregation check             | ai_with_tools | —                      | —      |
 * | 4    | Special cargo permit          | ai_with_tools | —                      | —      |
 * | 5    | Permit gate                   | gate          | —                      | —      |
 * | 6    | DG declaration validation     | ai_with_tools | —                      | —      |
 * | 7    | Documentation gate            | gate          | —                      | —      |
 * | 8    | DG stowage planning           | ai_with_tools | cap_stowage_plans      | create |
 * | 9    | DG manifest for port          | ai_with_tools | —                      | —      |
 * | 10   | Customs filing with DG        | ai_with_tools | ccr_export_filings     | create |
 * | 11   | DG gate-in                    | gate          | —                      | —      |
 * | 12   | DG loading                    | gate          | —                      | —      |
 * | 13   | Emergency response plan       | ai_with_tools | —                      | —      |
 * | 14   | At-sea monitoring             | ai_with_tools | —                      | —      |
 * | 15   | DG discharge                  | gate          | —                      | —      |
 * | 16   | Import customs with DG        | ai_with_tools | —                      | —      |
 * | 17   | DG delivery                   | gate          | —                      | —      |
 * | 18   | POD + DG certificate          | ai_with_tools | —                      | —      |
 */

import type { Anthropic } from "@anthropic-ai/sdk";
import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_12_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // ═══════════════════════════════════════════════════════════
  // PHASE 1: CLASSIFICATION & ACCEPTANCE (Steps 1-2)
  // ═══════════════════════════════════════════════════════════

  1: {
    mode: "ai_with_tools",
    entityTable: "dgm_booking_screenings",
    entityAction: "create",
    systemPromptExtra: `You are a DG Classification Agent for a container shipping line.
Classify dangerous goods per IMDG Code:
1. Identify UN number, proper shipping name, and hazard class/division
2. Determine packing group (I = great danger, II = medium, III = minor)
3. Check EmS (Emergency Schedule) fire/spillage procedures
4. Verify labeling, marking, and placard requirements
5. Assess overall risk and acceptance feasibility

Use the classify_dangerous_goods tool to create the screening record.`,
    tools: [
      {
        name: "classify_dangerous_goods",
        description: "Classify DG per IMDG Code and create booking screening record",
        input_schema: {
          type: "object" as const,
          properties: {
            bookingRef: { type: "string", description: "Booking reference" },
            unNumber: { type: "string", description: "UN number (e.g., UN1234)" },
            imdgClass: { type: "string", description: "IMDG class (e.g., 3, 6.1, 8)" },
            packingGroup: { type: "string", description: "Packing group (I, II, III)" },
            properShippingName: { type: "string", description: "Proper shipping name per IMDG" },
            riskScore: { type: "number", description: "Risk score 0-100" },
            customerName: { type: "string", description: "Shipper name" },
          },
          required: ["bookingRef", "unNumber", "imdgClass", "properShippingName", "riskScore", "customerName"],
        },
      },
    ] as Anthropic.Tool[],
  },

  2: { mode: "gate" },

  // ═══════════════════════════════════════════════════════════
  // PHASE 2: SEGREGATION & PERMITS (Steps 3-5)
  // ═══════════════════════════════════════════════════════════

  3: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a DG Segregation Agent for a container shipping line.
Check IMDG segregation requirements:
1. Apply IMDG segregation table (Chapter 7.2) for the cargo class
2. Check against all other DG cargo on the same vessel
3. Verify "away from", "separated from", "separated by an intervening hold" distances
4. Flag any incompatible cargo pairings

Provide your analysis as structured JSON with: segregationCompliant, incompatibleCargo, requiredSeparation, stowageCategory, notes.`,
  },

  4: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Cargo Permits Agent for a container shipping line.
Check if special cargo permits are required from the port authority:
1. Determine if cargo class requires port authority approval
2. Prepare permit application with cargo details
3. Check quantity limits per vessel/terminal
4. Verify insurance requirements for DG transit

Provide your analysis as structured JSON with: permitRequired, permitType, applicationPrepared, quantityWithinLimits, insuranceVerified.`,
  },

  5: { mode: "gate" },

  // ═══════════════════════════════════════════════════════════
  // PHASE 3: DOCUMENTATION (Steps 6-9)
  // ═══════════════════════════════════════════════════════════

  6: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a DG Documentation Agent for a container shipping line.
Validate DG declaration documents:
1. Check DG Note (Dangerous Goods Declaration) completeness
2. Verify MSDS (Material Safety Data Sheet) provided and current
3. Validate container packing certificate
4. Confirm emergency contact information provided

Provide your analysis as structured JSON with: dgNoteValid, msdsProvided, msdsCurrent, packingCertValid, emergencyContactProvided, missingDocs.`,
  },

  7: { mode: "gate" },

  8: {
    mode: "ai_with_tools",
    entityTable: "cap_stowage_plans",
    entityAction: "create",
    systemPromptExtra: `You are a DG Stowage Agent for a container shipping line.
Plan stowage position per IMDG segregation requirements:
1. Assign position per stowage category (on deck preferred for most DG)
2. Ensure segregation distances from incompatible cargo
3. Position away from accommodation and engine room
4. Ensure access for emergency response

Use the plan_stowage tool to create the stowage plan.`,
    tools: [
      {
        name: "plan_stowage",
        description: "Plan DG container stowage position per IMDG requirements",
        input_schema: {
          type: "object" as const,
          properties: {
            vesselCode: { type: "string", description: "Vessel code" },
            voyageNumber: { type: "string", description: "Voyage number" },
            containerNumber: { type: "string", description: "Container number" },
            bayPosition: { type: "string", description: "Bay number (on-deck preferred)" },
            rowPosition: { type: "string", description: "Row number" },
            tierPosition: { type: "string", description: "Tier number" },
            weightKg: { type: "number", description: "Container weight in kg" },
            pol: { type: "string", description: "Port of loading" },
            pod: { type: "string", description: "Port of discharge" },
            isHazmat: { type: "boolean", description: "true — this is DG cargo" },
          },
          required: ["vesselCode", "voyageNumber", "containerNumber", "bayPosition", "weightKg", "pol", "pod", "isHazmat"],
        },
      },
    ] as Anthropic.Tool[],
  },

  9: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a DG Manifest Agent for a container shipping line.
Prepare the DG manifest for the port authority:
1. Compile all DG cargo details for the vessel/voyage
2. Include stowage positions, UN numbers, classes, quantities
3. Include emergency procedures (EmS) per cargo
4. Submit to port authority before vessel arrival/departure

Provide your analysis as structured JSON with: manifestRef, dgContainers (array with containerNumber, unNumber, class, position), totalDgContainers, submittedToPort.`,
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 4: CUSTOMS & LOADING (Steps 10-12)
  // ═══════════════════════════════════════════════════════════

  10: {
    mode: "ai_with_tools",
    entityTable: "ccr_export_filings",
    entityAction: "create",
    systemPromptExtra: `You are a DG Customs Agent for a container shipping line.
File customs declaration with DG-specific details:
1. Include DG classification in customs filing
2. Attach DG declaration and MSDS references
3. Flag any export-restricted substances
4. Submit to customs authority

Use the file_customs_declaration tool.`,
    tools: [
      {
        name: "file_customs_declaration",
        description: "File customs declaration with DG cargo details",
        input_schema: {
          type: "object" as const,
          properties: {
            exporterName: { type: "string", description: "Exporter name" },
            exporterCode: { type: "string", description: "Exporter code" },
            portOfLoading: { type: "string", description: "Export port" },
            portOfDischarge: { type: "string", description: "Destination port" },
            blNumber: { type: "string", description: "BL number" },
            hsCode: { type: "string", description: "HS code for the DG cargo" },
            cargoDescription: { type: "string", description: "DG cargo description with UN number" },
            cargoValue: { type: "number", description: "Declared value" },
            currency: { type: "string", description: "Currency" },
          },
          required: ["exporterName", "portOfLoading", "portOfDischarge", "blNumber", "hsCode", "cargoValue"],
        },
      },
    ] as Anthropic.Tool[],
  },

  11: { mode: "gate" },
  12: { mode: "gate" },

  // ═══════════════════════════════════════════════════════════
  // PHASE 5: TRANSIT SAFETY (Steps 13-14)
  // ═══════════════════════════════════════════════════════════

  13: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are an Emergency Response Agent for a container shipping line.
Generate an emergency response plan for DG cargo during transit:
1. Identify applicable EmS (fire schedule, spillage schedule)
2. List required PPE and equipment for crew
3. Define evacuation procedures if cargo integrity compromised
4. Specify notification chain (coast guard, port authority, P&I club)

Provide your analysis as structured JSON with: emsFireSchedule, emsSpillageSchedule, requiredPpe, evacuationProcedure, notificationChain, crewBriefingRequired.`,
  },

  14: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a DG Monitoring Agent. Monitor DG cargo during transit for anomalies.
Provide JSON with: monitoringStatus, anomaliesDetected, crewAware, lastInspectionTime.`,
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 6: DISCHARGE & DELIVERY (Steps 15-18)
  // ═══════════════════════════════════════════════════════════

  15: { mode: "gate" },

  16: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a DG Import Customs Agent for a container shipping line.
File import customs declaration with DG details:
1. Include DG classification and MSDS in import filing
2. Check import permit requirements for the DG class at destination
3. Verify compliance with destination country DG regulations
4. Submit to customs

Provide your analysis as structured JSON with: importPermitRequired, destinationRegulations, filingStatus, complianceConfirmed.`,
  },

  17: { mode: "gate" },

  18: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a DG Delivery Agent. Confirm delivery with DG certificate handover.
Provide JSON with: deliveryConfirmed, dgCertificateHandedOver, recipientName, safetyBriefingCompleted, podReference.`,
  },
};

export function getE2e12StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_12_STEP_CONFIGS[stepNumber] ?? null;
}
