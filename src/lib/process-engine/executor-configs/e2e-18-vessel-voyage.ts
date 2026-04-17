/**
 * E2E-18 Vessel Voyage Lifecycle — Executor Configuration
 *
 * Rebuilt to match the real business process (Process Owner: Vikas Bane).
 * 17 steps covering service creation, vessel planning, voyage scheduling,
 * capacity control, LTS reporting, noon reports, delays, and port modifications.
 *
 * Modes: 6 human_form, 2 crud (via gate), 7 ai_with_tools, 2 gates
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_18_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // ── PHASE 1: SERVICE & VESSEL SETUP ──

  // Step 1: Create Service — user defines trade route, ports, rotation, frequency
  1: {
    mode: "human_form",
    entityTable: "svp_service_schedules",
    entityAction: "create",
  },

  // Step 2: Plan Vessel — user maps vessel to the service
  2: {
    mode: "human_form",
    entityTable: "cap_vessel_schedules",
    entityAction: "create",
  },

  // Step 3: Update Vessel Profile — user provides IMO, certificates, capacity details
  3: {
    mode: "human_form",
    entityTable: "cap_vessel_schedules",
    entityAction: "update",
  },

  // Step 4: Vessel Ownership Type — gate for review/approval of vessel classification
  4: {
    mode: "gate",
  },

  // Step 5: Add Vessel — activate vessel for planning (status → active)
  5: {
    mode: "crud",
    entityTable: "cap_vessel_schedules",
    entityAction: "update",
    defaults: {
      status: "active",
    },
  },

  // ── PHASE 2: VOYAGE CREATION ──

  // Step 6: Create Voyage Plan — AI generates voyage number, creates port rotation
  6: {
    mode: "ai_with_tools",
    entityTable: "cap_port_rotations",
    entityAction: "create",
    systemPromptExtra: `You are a Voyage Planning Agent. The port rotation engine calculates ETAs automatically from nautical distances and vessel speed (14 knots economical).

Steps:
1. Call get_service_schedule to fetch the service definition.
2. Call generate_voyage_number to create the voyage reference.
3. Call create_port_rotation with the port sequence. Provide portCode and callPurpose for each port — ETAs are COMPUTED from reference distance data, not invented.

Port codes must be valid UN/LOCODEs. The engine validates all codes against the port master database.
Do NOT provide arrivalEta or departureEtd — the engine calculates them from port-to-port distances.`,
    tools: [
      {
        name: "get_service_schedule",
        description: "Fetch the service schedule created in step 1 to get trade route, ports, and frequency",
        input_schema: {
          type: "object" as const,
          properties: {
            serviceScheduleId: { type: "string", description: "UUID of the service schedule (resolved from flow context if omitted)" },
          },
          required: [],
        },
      },
      {
        name: "generate_voyage_number",
        description: "Generate a unique voyage reference number based on service code and vessel",
        input_schema: {
          type: "object" as const,
          properties: {
            serviceCode: { type: "string", description: "Service code (e.g., AGX, MEX)" },
            vesselName: { type: "string", description: "Vessel name" },
            cycleNumber: { type: "number", description: "Cycle number for sequential continuity" },
          },
          required: ["serviceCode", "vesselName"],
        },
      },
      {
        name: "create_port_rotation",
        description: "Create port rotation entries for the voyage. Each port in the rotation becomes a cap_port_rotations record.",
        input_schema: {
          type: "object" as const,
          properties: {
            vesselScheduleId: { type: "string", description: "UUID of the vessel schedule (resolved from flow context if omitted)" },
            ports: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  portCode: { type: "string", description: "UN/LOCODE port code (e.g., QADOH, AEJEA)" },
                  portName: { type: "string", description: "Full port name (e.g., Doha, Jebel Ali)" },
                  arrivalEta: { type: "string", description: "ETA in ISO 8601 format" },
                  departureEtd: { type: "string", description: "ETD in ISO 8601 format" },
                  terminalName: { type: "string", description: "Terminal name (optional)" },
                  callPurpose: { type: "string", description: "Purpose: loading, discharge, or both" },
                  timeZone: { type: "string", description: "Port timezone (e.g., Asia/Qatar)" },
                },
                required: ["portCode", "portName"],
              },
              description: "Ordered list of ports in the rotation",
            },
          },
          required: ["ports"],
        },
      },
    ],
  },

  // Step 7: Update Cycle No — user updates cycle number for partner slot allocation
  7: {
    mode: "human_form",
    entityTable: "cap_vessel_schedules",
    entityAction: "update",
  },

  // ── PHASE 3: CAPACITY & SCHEDULING ──

  // Step 8: Capacity Control — AI allocates slots per trade lane
  8: {
    mode: "ai_with_tools",
    entityTable: "cap_trade_allocations",
    entityAction: "create",
    systemPromptExtra: `You are a Capacity Control Agent. The allocation engine validates against vessel capacity — over-allocation is automatically rejected.

Steps:
1. Call get_vessel_capacity to check total TEU, allocated TEU, and remaining capacity.
2. Call get_port_rotation to understand the port sequence.
3. Call allocate_trade_capacity for each trade lane allocation. The engine checks remaining capacity and rejects if exceeded.

Allocation types: contract (committed customers), spot (ad-hoc bookings), vsa (vessel sharing agreement), soc (shipper-owned containers).
Always check remaining capacity before allocating. The engine enforces hard capacity limits.`,
    tools: [
      {
        name: "get_vessel_capacity",
        description: "Get vessel capacity details: total TEU, already allocated TEU, remaining capacity",
        input_schema: {
          type: "object" as const,
          properties: {
            vesselScheduleId: { type: "string", description: "UUID of the vessel schedule (resolved from flow context if omitted)" },
          },
          required: [],
        },
      },
      {
        name: "get_port_rotation",
        description: "Get the port rotation for the vessel schedule to understand trade lanes",
        input_schema: {
          type: "object" as const,
          properties: {
            vesselScheduleId: { type: "string", description: "UUID of the vessel schedule (resolved from flow context if omitted)" },
          },
          required: [],
        },
      },
      {
        name: "allocate_trade_capacity",
        description: "Allocate TEU capacity for a specific trade lane on this vessel schedule",
        input_schema: {
          type: "object" as const,
          properties: {
            vesselScheduleId: { type: "string", description: "UUID of the vessel schedule" },
            tradeLane: { type: "string", description: "Trade lane identifier (e.g., QADOH-AEJEA, AEJEA-INMUN)" },
            allocatedTeu: { type: "number", description: "TEU to allocate for this trade lane" },
            allocationType: { type: "string", description: "Type: contract, spot, partner, vsa, soc" },
            originRegion: { type: "string", description: "Origin region/country" },
            destinationRegion: { type: "string", description: "Destination region/country" },
            priority: { type: "number", description: "Allocation priority (0=highest)" },
            notes: { type: "string", description: "Notes about this allocation" },
          },
          required: ["tradeLane", "allocatedTeu"],
        },
      },
    ],
  },

  // Step 9: Generate LTS Report — AI compiles Long Term Schedule
  9: {
    mode: "ai_with_tools",
    entityTable: "svp_deployment_plans",
    entityAction: "create",
    systemPromptExtra: `You are an LTS (Long Term Schedule) Report Agent for a container shipping line.
Generate the Long Term Schedule report by:
1. Use get_service_schedule to get the service definition.
2. Use get_port_rotation to get the full port rotation with ETAs.
3. Use generate_lts_report to create the LTS deployment plan record.

The LTS report summarizes: vessel deployment, service, port calls with dates, frequency, and capacity.
This report will be shared with agents, partners, and key customers after approval.
You MUST call the tools — do not generate report data without using them.`,
    tools: [
      {
        name: "get_service_schedule",
        description: "Fetch the service schedule for the LTS report",
        input_schema: {
          type: "object" as const,
          properties: {
            serviceScheduleId: { type: "string", description: "UUID of the service schedule (resolved from flow context if omitted)" },
          },
          required: [],
        },
      },
      {
        name: "get_port_rotation",
        description: "Get the port rotation for the vessel schedule",
        input_schema: {
          type: "object" as const,
          properties: {
            vesselScheduleId: { type: "string", description: "UUID of the vessel schedule (resolved from flow context if omitted)" },
          },
          required: [],
        },
      },
      {
        name: "generate_lts_report",
        description: "Create the Long Term Schedule deployment plan record compiling all voyage data",
        input_schema: {
          type: "object" as const,
          properties: {
            serviceScheduleId: { type: "string", description: "UUID of the service schedule (resolved from flow context if omitted)" },
          },
          required: [],
        },
      },
    ],
  },

  // Step 10: Share LTS — gate for manager approval before sharing
  10: {
    mode: "gate",
  },

  // ── PHASE 4: LOCAL OPERATIONS ──

  // Step 11: Update Local Voyage Info — local agent provides cut-offs, gate info
  11: {
    mode: "human_form",
    entityTable: "cap_port_rotations",
    entityAction: "update",
  },

  // Step 12: Share Voyage Schedule with Cut-offs — AI creates ETA records for distribution
  12: {
    mode: "ai_with_tools",
    entityTable: "svp_eta_managements",
    entityAction: "create",
    systemPromptExtra: `You are a Voyage Schedule Distribution Agent for a container shipping line.
Create ETA management records for each port in the rotation:
1. Use get_port_rotation to get all ports and their current ETAs.
2. Use create_eta_records to create ETA management entries for each port.

These ETA records will be shared with customers along with cut-off information.
Each port gets an initial ETA record that can later be revised if delays occur.
You MUST call the tools — do not generate ETA data without using them.`,
    tools: [
      {
        name: "get_port_rotation",
        description: "Get port rotation to create ETA records for each port",
        input_schema: {
          type: "object" as const,
          properties: {
            vesselScheduleId: { type: "string", description: "UUID of the vessel schedule (resolved from flow context if omitted)" },
          },
          required: [],
        },
      },
      {
        name: "create_eta_records",
        description: "Create ETA management records for each port in the rotation",
        input_schema: {
          type: "object" as const,
          properties: {},
          required: [],
        },
      },
    ],
  },

  // ── PHASE 5: VOYAGE EXECUTION ──

  // Step 13: Receive Noon Report — operator enters noon report data from vessel master
  13: {
    mode: "human_form",
    entityTable: "vpe_noon_reports",
    entityAction: "create",
  },

  // Step 14: Capture Noon Report — AI analyzes and records performance data
  14: {
    mode: "ai_with_tools",
    entityTable: "vpe_speed_consumptions",
    entityAction: "create",
    systemPromptExtra: `You are a Vessel Performance Analyst. The performance engine validates all values against vessel physics.

Steps:
1. Call analyze_noon_report to get the full report (position, speed, consumption, weather).
2. Call update_speed_consumption with the values from the noon report.

The engine automatically:
- Validates speed is within vessel class range (container: 10-22 knots)
- Validates fuel consumption is plausible for the vessel type
- Checks distance/speed/time consistency
- Calculates performance index (distance per MT fuel)
- Returns warnings if any values are outside expected bounds

Use the ACTUAL values from the noon report — do not adjust or round them.`,
    tools: [
      {
        name: "analyze_noon_report",
        description: "Analyze the noon report data: compare actual vs planned performance",
        input_schema: {
          type: "object" as const,
          properties: {
            noonReportId: { type: "string", description: "UUID of the noon report (resolved from flow context if omitted)" },
          },
          required: [],
        },
      },
      {
        name: "update_speed_consumption",
        description: "Create a speed/consumption record from the noon report analysis",
        input_schema: {
          type: "object" as const,
          properties: {
            vesselName: { type: "string", description: "Vessel name" },
            voyageId: { type: "string", description: "Voyage reference" },
            speedActual: { type: "number", description: "Actual speed in knots" },
            fuelConsumedMt: { type: "number", description: "Fuel consumed in metric tons" },
            distanceTraveled: { type: "number", description: "Distance traveled in nautical miles" },
            fuelType: { type: "string", description: "Fuel type (VLSFO, LSMGO, HFO)" },
            seaState: { type: "string", description: "Sea state description" },
            windForce: { type: "number", description: "Wind force (Beaufort scale)" },
            consumptionType: { type: "string", description: "Type: laden, ballast, port, anchored" },
          },
          required: ["vesselName"],
        },
      },
    ],
  },

  // Step 15: Update Vessel Delays — AI calculates delay impact and cascades
  15: {
    mode: "ai_with_tools",
    entityTable: "svp_eta_managements",
    entityAction: "create",
    systemPromptExtra: `You are a Delay Management Agent for a container shipping line.
Calculate the delay impact and cascade to subsequent voyages:
1. Use calculate_delay_impact to record the delay and create a revised ETA.
2. Use cascade_eta_changes to propagate the delay to all downstream ports.

Delay reasons include: weather, congestion, ECA transit, WAR zone deviations, port operations.
The user can decide whether the delay cascades to all subsequent voyages or just the current one.
You MUST call the tools — do not calculate delays without using them.`,
    tools: [
      {
        name: "calculate_delay_impact",
        description: "Calculate delay impact at a port and create a revised ETA record",
        input_schema: {
          type: "object" as const,
          properties: {
            portCode: { type: "string", description: "Port code where delay occurred (UN/LOCODE)" },
            delayHours: { type: "number", description: "Delay in hours (positive = later)" },
            delayReason: { type: "string", description: "Reason: weather, congestion, eca_transit, war_zone, port_operations, mechanical" },
            vesselName: { type: "string", description: "Vessel name" },
          },
          required: ["portCode", "delayHours"],
        },
      },
      {
        name: "cascade_eta_changes",
        description: "Propagate delay to all downstream ports in the rotation",
        input_schema: {
          type: "object" as const,
          properties: {
            delayHours: { type: "number", description: "Delay hours to cascade" },
            afterSequenceNumber: { type: "number", description: "Sequence number of the delayed port — cascade to all ports after this" },
            cascadeToAll: { type: "boolean", description: "If true, cascade to all subsequent voyages too" },
          },
          required: ["delayHours", "afterSequenceNumber"],
        },
      },
    ],
  },

  // Step 16: Marine Traffic Integration — AI tracks vessel position and zone compliance
  16: {
    mode: "ai_with_tools",
    entityTable: "vpe_voyage_performances",
    entityAction: "create",
    systemPromptExtra: `You are a Marine Traffic Agent. The geofencing engine automatically determines ECA and WAR zone status from vessel coordinates.

Steps:
1. Call get_vessel_position to fetch the latest position from noon reports.
2. Call update_voyage_tracking with vesselName, latitude, and longitude.

The engine automatically:
- Checks position against ECA zone boundaries (North Sea, Baltic, North American, Singapore Strait, China Domestic)
- Checks position against War Risk zones (Red Sea/Houthi, Black Sea, Persian Gulf elevated)
- Determines fuel requirement (0.1% sulphur if in ECA, standard otherwise)
- Assesses insurance impact for war zones

Do NOT guess inEcaZone or inWarZone — the geofencing engine computes them from coordinates.`,
    tools: [
      {
        name: "get_vessel_position",
        description: "Get the latest vessel position from noon reports",
        input_schema: {
          type: "object" as const,
          properties: {
            vesselName: { type: "string", description: "Vessel name to look up" },
          },
          required: [],
        },
      },
      {
        name: "update_voyage_tracking",
        description: "Create a voyage tracking record. ECA and WAR zone status is automatically computed from coordinates by the geofencing engine.",
        input_schema: {
          type: "object" as const,
          properties: {
            vesselName: { type: "string", description: "Vessel name" },
            voyageId: { type: "string", description: "Voyage reference" },
            latitude: { type: "number", description: "Current latitude from noon report" },
            longitude: { type: "number", description: "Current longitude from noon report" },
          },
          required: ["vesselName", "latitude", "longitude"],
        },
      },
    ],
  },

  // Step 17: Skip/Add/Swap/Delete Port Call — AI handles operational modifications
  17: {
    mode: "ai_with_tools",
    entityTable: "cap_port_rotations",
    entityAction: "update",
    systemPromptExtra: `You are a Port Call Modification Agent for a container shipping line.
Handle operational port call modifications:
1. Use get_port_rotation to see the current rotation.
2. Use modify_port_call to execute the modification (skip, add, swap, or delete).

When a port is deleted, existing bookings must be noted for transfer.
Deleted calls remain in the system (soft-delete) for audit and are flagged visually.
When adding a port, calculate the sequence impact.
When swapping, preserve the sequence number.
You MUST call the tools — do not modify port data without using them.`,
    tools: [
      {
        name: "get_port_rotation",
        description: "Get the current port rotation to see available ports",
        input_schema: {
          type: "object" as const,
          properties: {
            vesselScheduleId: { type: "string", description: "UUID of the vessel schedule (resolved from flow context if omitted)" },
          },
          required: [],
        },
      },
      {
        name: "modify_port_call",
        description: "Execute a port call modification: skip, add, swap, or delete a port",
        input_schema: {
          type: "object" as const,
          properties: {
            vesselScheduleId: { type: "string", description: "UUID of the vessel schedule" },
            modificationType: { type: "string", description: "Type: skip, add, swap, delete" },
            portCode: { type: "string", description: "Port code to modify (or new port code for add)" },
            newPortCode: { type: "string", description: "New port code (for swap only)" },
            newPortName: { type: "string", description: "New port name (for swap/add)" },
            sequenceNumber: { type: "number", description: "Sequence number for add (where to insert)" },
            reason: { type: "string", description: "Reason for modification" },
          },
          required: ["modificationType", "portCode"],
        },
      },
    ],
  },
};

export function getE2e18StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_18_STEP_CONFIGS[stepNumber] ?? null;
}
