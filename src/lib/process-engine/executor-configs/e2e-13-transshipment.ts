/**
 * E2E-13 Transshipment Flow — Executor Configuration (D-006 Phase 5)
 *
 * Container transshipment from mother vessel discharge through hub yard
 * to connecting vessel loading. 18 steps, 2 human gates.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_13_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  1: { mode: "ai_with_tools", systemPromptExtra: `You are a TS Manifest Matching Agent. Match inbound TS containers to outbound connecting vessel bookings. Provide JSON with: matchedContainers, unmatchedContainers, connectionVessel, connectionEta.` },
  2: { mode: "ai_with_tools", systemPromptExtra: `You are a Discharge Operations Agent. Process TS container discharge from mother vessel. Provide JSON with: containersDischarged, dischargeTimestamp, yardPositions.` },
  3: { mode: "ai_with_tools", systemPromptExtra: `You are a Yard Optimization Agent. Optimize yard slot assignments for TS containers based on connecting vessel departure. Provide JSON with: yardSlots, prioritization, estimatedDwellTime.` },
  4: { mode: "ai_with_tools", systemPromptExtra: `You are a Connection Risk Monitor. Assess risk of TS containers missing their connecting vessel. Calculate connection time buffer. Provide JSON with: atRiskContainers, bufferHours, riskLevel, mitigationOptions.` },
  5: { mode: "ai_with_tools", systemPromptExtra: `You are a Delay Impact Agent. Assess the impact of delays on TS connections — cost of rollover, customer SLA breach, next available vessel. Provide JSON with: delayHours, rolloverCost, slaImpact, nextVesselOption.` },
  6: { mode: "gate" },
  7: { mode: "ai_with_tools", systemPromptExtra: `You are a TS Yard Tracking Agent. Track container movements within the transshipment yard. Provide JSON with: containerPositions, movementLog, readyForLoading.` },
  8: { mode: "ai_with_tools", systemPromptExtra: `You are a TS Stowage Agent. Plan stowage positions on the connecting vessel for TS containers. Provide JSON with: stowagePlan, weightDistribution, dischargePorts.` },
  9: { mode: "ai_with_tools", systemPromptExtra: `You are a Loading Agent. Confirm TS containers loaded onto connecting vessel. Provide JSON with: containersLoaded, loadingTimestamp, missedContainers.` },
  10: { mode: "gate" },
  11: { mode: "ai_with_tools", systemPromptExtra: `You are a Tracking Agent. Update tracking milestones for TS containers — now on connecting vessel. Provide JSON with: trackingUpdates, vesselName, nextPort.` },
  12: { mode: "ai_with_tools", systemPromptExtra: `You are a BL Update Agent. Update through Bill of Lading with transshipment details — hub port, connecting vessel, revised ETA. Provide JSON with: blUpdated, tsHub, connectingVessel, revisedEta.` },
  13: { mode: "ai_with_tools", systemPromptExtra: `You are an ETA Agent. Calculate revised ETA at final destination after transshipment. Provide JSON with: revisedEta, transitTimeRemaining, delayVsOriginal.` },
  14: { mode: "ai_with_tools", systemPromptExtra: `You are a Notification Agent. Notify customers of transshipment completion and updated ETA. Provide JSON with: notificationsSent, customerCount, etaUpdate.` },
  15: { mode: "ai_with_tools", systemPromptExtra: `You are a TS Execution Monitor. Analyze transshipment execution performance — dwell time, connection reliability. Provide JSON with: dwellTimeHours, connectionSuccess, executionScore.` },
  16: { mode: "ai_with_tools", systemPromptExtra: `You are a TS Charge Agent. Calculate transshipment handling charges per container. Provide JSON with: thcPerContainer, totalCharges, chargeBreakdown.` },
  17: { mode: "ai_with_tools", systemPromptExtra: `You are a Cost Allocation Agent. Allocate TS handling costs to appropriate trade lanes and voyages. Provide JSON with: costAllocations, perLaneCost, totalAllocated.` },
  18: { mode: "ai_with_tools", systemPromptExtra: `You are a TS Performance Agent. Update transshipment KPIs — connection reliability, dwell time, rollover rate. Provide JSON with: connectionReliability, avgDwellTime, rolloverRate, trendVsPrior.` },
};

export function getE2e13StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_13_STEP_CONFIGS[stepNumber] ?? null;
}
