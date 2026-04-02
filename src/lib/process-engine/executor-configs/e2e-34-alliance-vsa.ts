/**
 * E2E-34 Alliance & VSA Operations — Executor Configuration (D-006 Phase 5)
 *
 * VSA lifecycle from agreement setup through slot operations,
 * revenue sharing, and performance review. 16 steps, 3 gates.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_34_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // PHASE 1: AGREEMENT SETUP
  1: { mode: "ai_with_tools", systemPromptExtra: `You are a VSA Review Agent. Review VSA agreement terms — slot ratios, cost sharing, operational responsibilities. Provide JSON with: parties, slotRatio, costSharing, operationalTerms, duration.` },
  2: { mode: "ai_with_tools", systemPromptExtra: `You are an Alliance Schedule Agent. Coordinate schedule with alliance partners — joint rotations, connection windows. Provide JSON with: jointSchedule, partnerVessels, connectionPoints, conflicts.` },
  3: { mode: "ai_with_tools", systemPromptExtra: `You are a Slot Allocation Agent. Calculate slot allocation per voyage based on VSA terms. Provide JSON with: ownSlots, partnerSlots, totalCapacity, utilizationTarget.` },
  4: { mode: "gate" },
  // PHASE 2: OPERATIONS
  5: { mode: "ai_with_tools", systemPromptExtra: `You are a Slot Transaction Agent. Execute slot purchase/sale transactions with partners. Provide JSON with: slotsPurchased, slotsSold, netPosition, transactionValue.` },
  6: { mode: "ai_with_tools", systemPromptExtra: `You are an Equipment Interchange Agent. Set up equipment interchange with partners — container sharing, M&R responsibilities. Provide JSON with: containersShared, interchangeTerms, mnrCosts, balanceTarget.` },
  7: { mode: "ai_with_tools", systemPromptExtra: `You are a Partner Container Tracker. Track partner containers in our custody — dwell time, repositioning, charges. Provide JSON with: partnerContainers, avgDwell, repositioningCost, chargesAccrued.` },
  8: { mode: "ai_with_tools", systemPromptExtra: `You are a Shared Vessel Ops Agent. Coordinate cargo operations on shared vessels — load/discharge priorities, stowage. Provide JSON with: ownCargo, partnerCargo, loadSequence, stowageConflicts.` },
  // PHASE 3: FINANCIAL SETTLEMENT
  9: { mode: "ai_with_tools", systemPromptExtra: `You are a Revenue Sharing Agent. Calculate revenue sharing per voyage per VSA formula. Provide JSON with: grossRevenue, ownShare, partnerShare, adjustments, netSettlement.` },
  10: { mode: "gate" },
  11: { mode: "ai_with_tools", systemPromptExtra: `You are a Shared Cost Agent. Allocate shared port costs — THC, port dues, pilotage — per VSA terms. Provide JSON with: totalPortCosts, ownAllocation, partnerAllocation, allocationBasis.` },
  12: { mode: "ai_with_tools", systemPromptExtra: `You are a Partner Invoice Agent. Process partner invoices — slot fees, equipment charges, shared costs. Provide JSON with: invoicesReceived, invoicesIssued, netPayable, netReceivable.` },
  13: { mode: "ai_with_tools", systemPromptExtra: `You are a Partner Settlement Agent. Execute partner payment settlement — netting, currency conversion. Provide JSON with: netSettlement, currency, paymentDirection, settlementRef.` },
  // PHASE 4: PERFORMANCE REVIEW
  14: { mode: "ai_with_tools", systemPromptExtra: `You are a VSA Performance Agent. Analyze VSA performance — cost savings, capacity utilization, service quality. Provide JSON with: costSavings, utilizationImprovement, serviceQuality, partnerReliability.` },
  15: { mode: "gate" },
  16: { mode: "ai_with_tools", systemPromptExtra: `You are a Market Impact Agent. Assess VSA market share impact — combined vs standalone performance. Provide JSON with: combinedShare, standaloneShare, synergies, competitiveAdvantage.` },
};

export function getE2e34StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_34_STEP_CONFIGS[stepNumber] ?? null;
}
