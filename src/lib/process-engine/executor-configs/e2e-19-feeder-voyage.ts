/**
 * E2E-19 Feeder Voyage Lifecycle — Executor Configuration (D-006 Phase 5)
 *
 * Feeder vessel operations from schedule sync through spoke port calls
 * and hub connection. 20 steps, 3 gates.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_19_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  1: { mode: "ai_with_tools", systemPromptExtra: `You are a Feeder Schedule Agent. Sync feeder schedule with mainline vessel arrivals/departures at the hub. Provide JSON with: mainlineConnections, feederRotation, syncStatus.` },
  2: { mode: "ai_with_tools", systemPromptExtra: `You are a Cut-Off Agent. Set feeder-specific cut-off times aligned with hub connection windows. Provide JSON with: cutOffs (array with port, docCutoff, cargoCutoff).` },
  3: { mode: "ai_with_tools", systemPromptExtra: `You are a Fleet Deployment Agent. Deploy feeder vessel for the route considering draft restrictions, port capabilities. Provide JSON with: vesselAssigned, draftLimit, portCapabilities.` },
  4: { mode: "ai_with_tools", systemPromptExtra: `You are a Feeder Stowage Agent. Plan stowage for feeder vessel — smaller capacity, multiple port rotation. Provide JSON with: stowagePlan, portRotation, capacityUtilization.` },
  5: { mode: "ai_with_tools", systemPromptExtra: `You are a Hub Loading Agent. Load transshipment cargo from mainline onto feeder at hub. Provide JSON with: containersLoaded, connectionFrom, loadingTime.` },
  6: { mode: "gate" },
  7: { mode: "ai_with_tools", systemPromptExtra: `You are a Departure Agent. Confirm feeder departed hub. Provide JSON with: departureTime, nextPort, eta.` },
  8: { mode: "ai_with_tools", systemPromptExtra: `You are an ETA Agent for spoke ports. Predict arrival at each spoke port. Provide JSON with: spokePorts (array with port, eta, cargoToDischarge, cargoToLoad).` },
  9: { mode: "ai_with_tools", systemPromptExtra: `You are a Discharge Agent. Discharge cargo at spoke port 1. Provide JSON with: discharged, port, timestamp.` },
  10: { mode: "ai_with_tools", systemPromptExtra: `You are a Loading Agent. Load cargo at spoke port 1. Provide JSON with: loaded, port, timestamp.` },
  11: { mode: "ai_with_tools", systemPromptExtra: `You are a Discharge Agent. Discharge cargo at spoke port 2. Provide JSON with: discharged, port, timestamp.` },
  12: { mode: "ai_with_tools", systemPromptExtra: `You are a Loading Agent. Load cargo at spoke port 2. Provide JSON with: loaded, port, timestamp.` },
  13: { mode: "ai_with_tools", systemPromptExtra: `You are a Connection Risk Agent. Check if feeder will arrive at hub in time for mainline connection. Provide JSON with: connectionAtRisk, bufferHours, mainlineEtd, feederEta.` },
  14: { mode: "gate" },
  15: { mode: "ai_with_tools", systemPromptExtra: `You are a Hub Arrival Agent. Confirm feeder arrived at hub. Provide JSON with: arrivalTime, berthAssigned.` },
  16: { mode: "ai_with_tools", systemPromptExtra: `You are a Cargo Transfer Agent. Discharge cargo for mainline connection at hub. Provide JSON with: transferred, mainlineVessel, connectionMade.` },
  17: { mode: "gate" },
  18: { mode: "ai_with_tools", systemPromptExtra: `You are a Feeder BL Agent. Complete feeder bills of lading. Provide JSON with: blsCompleted, blCount.` },
  19: { mode: "ai_with_tools", systemPromptExtra: `You are a Feeder P&L Agent. Calculate feeder voyage profit & loss. Provide JSON with: revenue, costs, netProfit, marginPercent.` },
  20: { mode: "ai_with_tools", systemPromptExtra: `You are a Cost Allocation Agent. Allocate feeder costs to mainline voyages served. Provide JSON with: allocations (array with mainlineVoyage, cost), totalAllocated.` },
};

export function getE2e19StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_19_STEP_CONFIGS[stepNumber] ?? null;
}
