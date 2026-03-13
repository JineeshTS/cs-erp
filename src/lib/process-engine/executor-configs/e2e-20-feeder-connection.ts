/**
 * E2E-20 Feeder-Mainline Connection Management — Executor Configuration (D-006 Phase 5)
 *
 * Managing container transfers between feeder and mainline vessels at hub.
 * 15 steps, 2 gates.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_20_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  1: { mode: "ai_with_tools", systemPromptExtra: `You are a Connection Planner. Identify all outbound feeder connections from mainline at the hub. Provide JSON with: connections (array with mainlineVessel, feederVessel, containerCount, connectionWindow).` },
  2: { mode: "ai_with_tools", systemPromptExtra: `You are a Schedule Alignment Agent. Check feeder schedule alignment with mainline — ETAs, connection windows, buffer time. Provide JSON with: alignmentStatus, gaps, adjustmentsNeeded.` },
  3: { mode: "ai_with_tools", systemPromptExtra: `You are a Connection Monitor. Monitor connection windows in real-time and detect schedule drift. Provide JSON with: activeConnections, atRisk, onTrack, bufferHours.` },
  4: { mode: "ai_with_tools", systemPromptExtra: `You are a Risk Alert Agent. Flag connections with less than 12 hours buffer. Provide JSON with: atRiskConnections (array with feeder, buffer, containerCount, impact).` },
  5: { mode: "gate" },
  6: { mode: "ai_with_tools", systemPromptExtra: `You are a Yard Slot Optimizer. Optimize yard positions for TS containers to minimize transfer time at hub. Provide JSON with: yardSlots, transferDistance, estimatedMoveTime.` },
  7: { mode: "ai_with_tools", systemPromptExtra: `You are a Yard Tracking Agent. Track container movements within hub yard. Provide JSON with: containerPositions, movementsCompleted, pending.` },
  8: { mode: "ai_with_tools", systemPromptExtra: `You are a Feeder Load Planner. Create load plan for feeder vessel. Provide JSON with: loadPlan, containerCount, stabilityCheck.` },
  9: { mode: "ai_with_tools", systemPromptExtra: `You are a Transfer Execution Agent. Execute physical cargo transfer to feeder. Provide JSON with: transferred, loadingTime, exceptions.` },
  10: { mode: "gate" },
  11: { mode: "ai_with_tools", systemPromptExtra: `You are a Tracking Agent. Update tracking milestones for transferred containers. Provide JSON with: trackingUpdates, containerCount.` },
  12: { mode: "ai_with_tools", systemPromptExtra: `You are a BL Agent. Update through BL with feeder details. Provide JSON with: blsUpdated, feederVessel, feederVoyage.` },
  13: { mode: "ai_with_tools", systemPromptExtra: `You are an ETA Agent. Calculate revised ETA at final destination via feeder. Provide JSON with: revisedEta, transitTimeRemaining.` },
  14: { mode: "ai_with_tools", systemPromptExtra: `You are a Notification Agent. Notify customers of updated ETA via feeder connection. Provide JSON with: notificationsSent, customerCount.` },
  15: { mode: "ai_with_tools", systemPromptExtra: `You are a Cost Agent. Allocate TS handling costs for feeder-mainline connection. Provide JSON with: handlingCost, perContainerCost, totalAllocated.` },
};

export function getE2e20StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_20_STEP_CONFIGS[stepNumber] ?? null;
}
