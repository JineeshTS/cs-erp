/**
 * E2E-37 Fleet Strategy & Renewal — Executor Configuration (D-006 Phase 5)
 *
 * Fleet strategy from analysis through S&P evaluation,
 * acquisition/disposal decision, and post-transaction setup. 12 steps, 2 gates.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_37_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // PHASE 1: ANALYSIS
  1: { mode: "ai_with_tools", systemPromptExtra: `You are a Fleet Age Agent. Analyze fleet age profile and capacity — vessel ages, remaining economic life, class renewal costs. Provide JSON with: fleetProfile, avgAge, oldestVessel, capacityGap, renewalUrgency.` },
  2: { mode: "ai_with_tools", systemPromptExtra: `You are a Fleet Needs Agent. Assess fleet deployment needs — trade growth, network gaps, vessel type requirements. Provide JSON with: deploymentGaps, requiredCapacity, vesselTypes, timeline.` },
  3: { mode: "ai_with_tools", systemPromptExtra: `You are a Demand Forecast Agent. Forecast demand for fleet sizing — market growth, seasonal patterns, trade shifts. Provide JSON with: demandForecast, optimalFleetSize, capacityBuffer, growthScenarios.` },
  4: { mode: "ai_with_tools", systemPromptExtra: `You are an S&P Market Agent. Evaluate sale & purchase market — vessel prices, availability, market cycle position. Provide JSON with: marketValues, priceIndex, availability, cyclePosition, outlook.` },
  // PHASE 2: STRATEGY DECISION
  5: { mode: "gate" },
  // PHASE 3: TRANSACTION EXECUTION
  6: { mode: "ai_with_tools", systemPromptExtra: `You are a Newbuilding Spec Agent. Prepare newbuilding specification — capacity, speed, fuel type, emissions compliance. Provide JSON with: vesselSpec, capacity, fuelType, eediCompliance, estimatedCost, deliveryDate.` },
  7: { mode: "ai_with_tools", systemPromptExtra: `You are a Vessel Valuation Agent. Perform vessel valuation for buy/sell — comparable sales, charter market, scrap value. Provide JSON with: marketValue, charterfreeValue, scrapValue, recommendedPrice.` },
  8: { mode: "gate" },
  // PHASE 4: POST-TRANSACTION
  9: { mode: "ai_with_tools", systemPromptExtra: `You are a Marine Insurance Agent. Arrange insurance for new/acquired vessel — H&M, P&I, loss of hire. Provide JSON with: hmPremium, piEntry, lohPremium, coverageStart.` },
  10: { mode: "ai_with_tools", systemPromptExtra: `You are a Premium Calculator. Calculate total insurance premium for the vessel. Provide JSON with: totalPremium, premiumBreakdown, deductibles, insuredValue.` },
  11: { mode: "ai_with_tools", systemPromptExtra: `You are an Asset Accounting Agent. Process asset accounting — capitalize acquisition or dispose of sold vessel. Provide JSON with: assetAction, bookValue, acquisitionCost, depreciationSchedule, gainLoss.` },
  12: { mode: "ai_with_tools", systemPromptExtra: `You are a Fleet Deployment Agent. Update fleet deployment plan with new/removed vessel. Provide JSON with: updatedDeployment, tradeLaneChanges, capacityImpact, effectiveDate.` },
};

export function getE2e37StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_37_STEP_CONFIGS[stepNumber] ?? null;
}
