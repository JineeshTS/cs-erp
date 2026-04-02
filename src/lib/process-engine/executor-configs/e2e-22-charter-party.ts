/**
 * E2E-22 Charter Party Lifecycle — Executor Configuration (D-006 Phase 5)
 *
 * Charter party from market analysis through fixture, monitoring,
 * claims, and redelivery settlement. 18 steps, 7 gates.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_22_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  1: { mode: "ai_with_tools", systemPromptExtra: `You are a Charter Market Agent. Analyze TC/voyage charter market — rates, trends, available tonnage. Provide JSON with: tcRates, voyageRates, marketTrend, availableTonnage, recommendation.` },
  2: { mode: "gate" },
  3: { mode: "ai_with_tools", systemPromptExtra: `You are a Charter Negotiation Agent. Support charter negotiation — analyze fixture terms, calculate TCE, model scenarios. Provide JSON with: proposedTerms, tceEstimate, walkAwayRate, counterOffer.` },
  4: { mode: "gate" },
  5: { mode: "ai_with_tools", systemPromptExtra: `You are a Fixture Agent. Confirm fixture and create charter party record. Provide JSON with: fixtureRef, cpType, dailyRate, deliveryPort, redeliveryRange.` },
  6: { mode: "gate" },
  7: { mode: "ai_with_tools", systemPromptExtra: `You are a Bunker ROB Agent. Calculate bunker ROB at delivery for charter cost allocation. Provide JSON with: hfoRob, vlsfoRob, mdoRob, totalValue.` },
  8: { mode: "ai_with_tools", systemPromptExtra: `You are a Performance Monitor. Monitor vessel performance against CP warranty (speed, consumption). Provide JSON with: actualSpeed, warrantySpeed, actualConsumption, warrantyConsumption, claimPotential.` },
  9: { mode: "ai_with_tools", systemPromptExtra: `You are an Off-Hire Calculator. Calculate off-hire periods — breakdowns, dry dock, deviation. Provide JSON with: offHirePeriods, totalOffHireDays, deductionAmount.` },
  10: { mode: "gate" },
  11: { mode: "ai_with_tools", systemPromptExtra: `You are a Speed Claim Agent. Assess speed and consumption claims vs CP warranty. Provide JSON with: claimBasis, speedDeviation, consumptionDeviation, claimAmount.` },
  12: { mode: "ai_with_tools", systemPromptExtra: `You are a Weather Dispute Agent. Analyze weather routing disputes — was deviation justified? Provide JSON with: weatherData, routeDeviation, justification, claimValidity.` },
  13: { mode: "gate" },
  14: { mode: "gate" },
  15: { mode: "ai_with_tools", systemPromptExtra: `You are a Redelivery Bunker Agent. Calculate bunker ROB at redelivery. Provide JSON with: hfoRob, vlsfoRob, mdoRob, totalValue, differenceFromDelivery.` },
  16: { mode: "ai_with_tools", systemPromptExtra: `You are a Bunker Settlement Agent. Settle charter bunker clause — difference between delivery and redelivery ROB. Provide JSON with: deliveryValue, redeliveryValue, settlement.` },
  17: { mode: "ai_with_tools", systemPromptExtra: `You are a Charter Settlement Agent. Calculate final charter hire settlement — hire, off-hire deductions, bunker clause, performance claims. Provide JSON with: totalHire, offHireDeductions, bunkerSettlement, performanceClaims, netSettlement.` },
  18: { mode: "gate" },
};

export function getE2e22StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_22_STEP_CONFIGS[stepNumber] ?? null;
}
