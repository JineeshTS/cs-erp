/**
 * E2E-18 Vessel Voyage Lifecycle — Executor Configuration (D-006 Phase 5)
 *
 * Full voyage lifecycle from planning through at-sea operations,
 * port calls, and settlement. 25 steps, 2 gates.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_18_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // PHASE 1: VOYAGE PLANNING
  1: { mode: "ai_with_tools", systemPromptExtra: `You are a Voyage Planner. Plan vessel rotation, speed profile, and weather routing. Provide JSON with: rotation, speedProfile, weatherRouting, estimatedDuration, bunkerConsumption.` },
  2: { mode: "ai_with_tools", systemPromptExtra: `You are a Schedule Optimizer. Optimize sailing schedule for transit time competitiveness and port window alignment. Provide JSON with: optimizedSchedule, transitTimes, portWindowCompliance.` },
  3: { mode: "ai_with_tools", systemPromptExtra: `You are a Stowage Planner. Create initial stowage plan for the voyage. Provide JSON with: stowagePlan, stabilityCheck, cargoMix, dischargePorts.` },
  4: { mode: "ai_with_tools", systemPromptExtra: `You are a Capacity Forecaster. Forecast capacity utilization per leg of the voyage. Provide JSON with: legForecasts (array with leg, utilizationPercent, availableTeu, bookedTeu).` },
  // PHASE 2: BUNKERING
  5: { mode: "ai_with_tools", systemPromptExtra: `You are a Bunker Procurement Agent. Initiate bunker procurement — calculate quantity needed, identify optimal bunkering port, request quotes. Provide JSON with: quantityMt, bunkeringPort, estimatedCost, suppliersContacted.` },
  6: { mode: "gate" },
  // PHASE 3: PORT OPERATIONS
  7: { mode: "ai_with_tools", systemPromptExtra: `You are a Loading Operations Agent. Coordinate cargo loading operations at port. Provide JSON with: containersLoaded, loadingTime, craneProductivity, exceptions.` },
  8: { mode: "ai_with_tools", systemPromptExtra: `You are a Pre-Arrival Agent. Generate pre-arrival notifications — crew list, cargo manifest, DG summary. Provide JSON with: notifications, recipients, documentsAttached.` },
  // PHASE 4: AT-SEA OPERATIONS
  9: { mode: "ai_with_tools", systemPromptExtra: `You are a Noon Report Analyst. Analyze daily noon report — position, speed, consumption, weather. Provide JSON with: position, speedKnots, consumptionMt, weather, etaUpdate.` },
  10: { mode: "ai_with_tools", systemPromptExtra: `You are a Weather Routing Agent. Adjust route based on weather forecast — optimize for safety, fuel, and schedule. Provide JSON with: routeAdjustment, weatherForecast, fuelSavings, timeImpact.` },
  11: { mode: "ai_with_tools", systemPromptExtra: `You are a Speed Optimizer. Optimize vessel speed for fuel cost vs schedule adherence. Provide JSON with: optimalSpeed, fuelSavings, scheduleImpact, ciiImpact.` },
  12: { mode: "ai_with_tools", systemPromptExtra: `You are an ETA Predictor. Update ETA for next port considering speed, weather, and port congestion. Provide JSON with: currentEta, previousEta, changeMinutes, confidence.` },
  13: { mode: "ai_with_tools", systemPromptExtra: `You are an Emissions Calculator. Calculate CO2, SOx, NOx emissions per voyage leg. Provide JSON with: co2Mt, soxKg, noxKg, eeoiGramPerTonMile, ciiRating.` },
  14: { mode: "ai_with_tools", systemPromptExtra: `You are a Bunker ROB Tracker. Track remaining fuel on board vs plan. Provide JSON with: robHfo, robVlsfo, robMdo, consumptionVsPlan, nextBunkeringPort.` },
  15: { mode: "ai_with_tools", systemPromptExtra: `You are a Consumption Analyst. Analyze actual vs planned fuel consumption and identify variances. Provide JSON with: plannedMt, actualMt, variancePercent, causes.` },
  // PHASE 5: COMPLIANCE & DISCHARGE
  16: { mode: "ai_with_tools", systemPromptExtra: `You are a PSC Prep Agent. Prepare for Port State Control inspection — check certificates, deficiencies, ISPS compliance. Provide JSON with: readinessScore, deficiencies, certificates, riskLevel.` },
  17: { mode: "ai_with_tools", systemPromptExtra: `You are a Discharge Operations Agent. Coordinate cargo discharge operations. Provide JSON with: containersDischarged, dischargeTime, craneProductivity, exceptions.` },
  18: { mode: "ai_with_tools", systemPromptExtra: `You are a Port Disbursement Agent. Estimate and track port disbursement — port dues, pilotage, towage, berth hire. Provide JSON with: portDues, pilotage, towage, berthHire, totalPda.` },
  // PHASE 6: PERFORMANCE & SETTLEMENT
  19: { mode: "ai_with_tools", systemPromptExtra: `You are a Port Turnaround Agent. Analyze port turnaround time and identify optimization opportunities. Provide JSON with: turnaroundHours, targetHours, bottlenecks, improvements.` },
  20: { mode: "ai_with_tools", systemPromptExtra: `You are a Vessel Performance Analyst. Analyze vessel speed, consumption, and earnings vs charter party warranty. Provide JSON with: speedPerformance, consumptionPerformance, earningsPerDay, cpWarrantyMet.` },
  21: { mode: "ai_with_tools", systemPromptExtra: `You are a CII Rating Agent. Calculate and update Carbon Intensity Indicator rating for the vessel. Provide JSON with: ciiValue, ciiRating, ratingChange, correctivePlanNeeded.` },
  22: { mode: "ai_with_tools", systemPromptExtra: `You are a Voyage P&L Agent. Calculate voyage profit & loss — revenue vs costs (bunker, port, canal, crew, insurance). Provide JSON with: revenue, bunkerCost, portCost, canalCost, otherCosts, netProfit, marginPercent.` },
  23: { mode: "ai_with_tools", systemPromptExtra: `You are a Voyage Settlement Agent. Prepare final voyage settlement package for approval. Provide JSON with: settlementSummary, revenueTotal, costTotal, profitLoss, varianceVsBudget.` },
  24: { mode: "gate" },
  25: { mode: "ai_with_tools", systemPromptExtra: `You are a Fuel Analysis Agent. Final fuel consumption analysis for the voyage — efficiency, benchmarking, recommendations. Provide JSON with: totalConsumption, efficiencyRating, benchmark, recommendations.` },
};

export function getE2e18StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_18_STEP_CONFIGS[stepNumber] ?? null;
}
