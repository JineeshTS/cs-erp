/**
 * E2E-21 Port Call Management — Executor Configuration (D-006 Phase 5)
 *
 * Port call lifecycle from pre-arrival through cargo ops, port services,
 * and settlement. 20 steps, 4 gates.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_21_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  1: { mode: "ai_with_tools", systemPromptExtra: `You are a Port Congestion Agent. Check port congestion levels and estimate waiting time. Provide JSON with: congestionLevel, waitingVessels, estimatedWaitHours, alternatives.` },
  2: { mode: "ai_with_tools", systemPromptExtra: `You are a Pre-Arrival Agent. Prepare pre-arrival notifications — crew list, cargo manifest, DG summary, stores. Provide JSON with: documents, recipients, submissionDeadline.` },
  3: { mode: "ai_with_tools", systemPromptExtra: `You are a Berth Allocation Agent. Request berth allocation from terminal. Provide JSON with: berthRequested, berthAssigned, windowStart, windowEnd.` },
  4: { mode: "ai_with_tools", systemPromptExtra: `You are a PSC Prep Agent. Prepare checklist for Port State Control inspection. Provide JSON with: checklistItems, deficiencies, readiness.` },
  5: { mode: "ai_with_tools", systemPromptExtra: `You are an ISPS Agent. Submit ISPS security notification. Provide JSON with: ispsNotification, securityLevel, submitted.` },
  6: { mode: "ai_with_tools", systemPromptExtra: `You are a Clearance Agent. Process vessel clearance — immigration, customs, health. Provide JSON with: clearanceStatus, holds, clearedBy.` },
  7: { mode: "gate" },
  8: { mode: "ai_with_tools", systemPromptExtra: `You are a Husbandry Agent. Coordinate husbandry services — pilot, tug, mooring, launch. Provide JSON with: pilotBooked, tugsRequired, mooringArranged, estimatedCost.` },
  9: { mode: "ai_with_tools", systemPromptExtra: `You are a Discharge Ops Agent. Track cargo discharge operations. Provide JSON with: containersDischarged, craneCount, productivity, completionEta.` },
  10: { mode: "ai_with_tools", systemPromptExtra: `You are a Loading Ops Agent. Track cargo loading operations. Provide JSON with: containersLoaded, craneCount, productivity, completionEta.` },
  11: { mode: "gate" },
  12: { mode: "gate" },
  13: { mode: "ai_with_tools", systemPromptExtra: `You are a PDA Agent. Estimate proforma disbursement account for this port call. Provide JSON with: portDues, pilotage, towage, berthHire, agencyFee, totalPda.` },
  14: { mode: "ai_with_tools", systemPromptExtra: `You are a Departure Agent. Process departure clearance. Provide JSON with: clearanceGranted, departureTime, nextPort.` },
  15: { mode: "ai_with_tools", systemPromptExtra: `You are a PDA Reconciliation Agent. Reconcile proforma vs actual disbursement. Provide JSON with: proformaTotal, actualTotal, variance, variancePercent, disputedItems.` },
  16: { mode: "gate" },
  17: { mode: "ai_with_tools", systemPromptExtra: `You are a Payment Agent. Process disbursement payment. Provide JSON with: paymentAmount, paymentDate, agentRef.` },
  18: { mode: "ai_with_tools", systemPromptExtra: `You are a Turnaround Analyst. Analyze port turnaround performance. Provide JSON with: turnaroundHours, targetHours, efficiency, bottlenecks.` },
  19: { mode: "ai_with_tools", systemPromptExtra: `You are a Tariff Verification Agent. Verify port tariffs were applied correctly. Provide JSON with: tariffVerified, discrepancies, overcharges.` },
  20: { mode: "ai_with_tools", systemPromptExtra: `You are a THC Reconciliation Agent. Reconcile terminal handling charges. Provide JSON with: thcCharged, thcExpected, variance.` },
};

export function getE2e21StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_21_STEP_CONFIGS[stepNumber] ?? null;
}
