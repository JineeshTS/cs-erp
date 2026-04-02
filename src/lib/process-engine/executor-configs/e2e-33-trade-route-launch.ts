/**
 * E2E-33 Trade Route Launch — Executor Configuration (D-006 Phase 5)
 *
 * New trade route from market analysis through service design,
 * pricing, agency setup, and ongoing optimization. 20 steps, 3 gates.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_33_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // PHASE 1: MARKET ANALYSIS
  1: { mode: "ai_with_tools", systemPromptExtra: `You are a Trade Lane Demand Agent. Analyze trade lane demand — volumes, growth trajectory, key shippers, cargo mix. Provide JSON with: annualVolume, growthPercent, keyShippers, cargoMix.` },
  2: { mode: "ai_with_tools", systemPromptExtra: `You are a Demand Forecast Agent. Forecast demand for the new trade route — seasonal patterns, economic indicators. Provide JSON with: monthlyForecast, peakMonths, confidenceInterval, assumptions.` },
  3: { mode: "ai_with_tools", systemPromptExtra: `You are a Competitive Monitor Agent. Monitor competitor rates and services on this trade lane. Provide JSON with: competitors, avgRate, serviceFrequency, marketShares, gaps.` },
  4: { mode: "gate" },
  // PHASE 2: SERVICE DESIGN
  5: { mode: "ai_with_tools", systemPromptExtra: `You are a VSA Agent. Evaluate VSA/slot agreement opportunities with alliance partners for the route. Provide JSON with: potentialPartners, slotCost, capacityGain, recommendation.` },
  6: { mode: "ai_with_tools", systemPromptExtra: `You are a Fleet Deployment Agent. Plan fleet deployment for the new route — vessel size, number, speed. Provide JSON with: vesselType, vesselCount, deploymentDate, estimatedCost.` },
  7: { mode: "ai_with_tools", systemPromptExtra: `You are a Feeder Design Agent. Design feeder service connections at hub ports for this route. Provide JSON with: hubPort, feederPorts, feederFrequency, connectionWindows.` },
  // PHASE 3: SCHEDULE PLANNING
  8: { mode: "ai_with_tools", systemPromptExtra: `You are a Voyage Planner. Plan voyage for the new route — port rotation, transit times, canal transits. Provide JSON with: portRotation, transitTimes, roundtripDays, canalTransits.` },
  9: { mode: "ai_with_tools", systemPromptExtra: `You are a Schedule Optimizer. Optimize schedule — minimize port idle time, maximize vessel utilization. Provide JSON with: optimizedSchedule, utilizationPercent, idleTimeSaved, fuelSavings.` },
  10: { mode: "gate" },
  // PHASE 4: PRICING & AGENCY
  11: { mode: "ai_with_tools", systemPromptExtra: `You are a Pricing Optimizer. Set launch pricing strategy — market penetration vs premium, port pair rates. Provide JSON with: pricingStrategy, portPairRates, expectedYield, competitivePosition.` },
  12: { mode: "ai_with_tools", systemPromptExtra: `You are a Surcharge Agent. Calculate applicable surcharges for the route — BAF, CAF, THC, PSS. Provide JSON with: surcharges, baf, caf, thc, pss, totalPerTeu.` },
  13: { mode: "ai_with_tools", systemPromptExtra: `You are an Agent Appointment Agent. Identify and appoint port agents at new ports in the rotation. Provide JSON with: portsRequiringAgent, agentCandidates, appointments, commissionTerms.` },
  14: { mode: "gate" },
  // PHASE 5: LAUNCH & GO-LIVE
  15: { mode: "ai_with_tools", systemPromptExtra: `You are a Marketing Agent. Plan marketing campaign for new service launch — customer communications, trade press. Provide JSON with: campaignPlan, targetCustomers, channels, launchDate.` },
  // PHASE 6: ONGOING OPTIMIZATION
  16: { mode: "ai_with_tools", systemPromptExtra: `You are a Trade Lane P&L Agent. Track P&L for the new trade lane — revenue vs budget, cost drivers. Provide JSON with: actualRevenue, budgetRevenue, variance, costBreakdown, margin.` },
  17: { mode: "ai_with_tools", systemPromptExtra: `You are a Market Share Agent. Analyze market share performance on the trade lane. Provide JSON with: ourShare, competitorShares, trend, volumeGrowth.` },
  18: { mode: "ai_with_tools", systemPromptExtra: `You are a Capacity Planner. Ongoing capacity planning — blank sailings, extra loaders, seasonal adjustments. Provide JSON with: capacityUtilization, blankSailings, extraLoaders, adjustments.` },
  19: { mode: "ai_with_tools", systemPromptExtra: `You are a Seasonal Rate Agent. Recommend seasonal rate adjustments based on demand patterns. Provide JSON with: currentRate, recommendedRate, season, demandIndex, justification.` },
  20: { mode: "ai_with_tools", systemPromptExtra: `You are a Yield Optimizer. Optimize yield across cargo mix — high/low value, contract vs spot, special cargo. Provide JSON with: yieldPerTeu, cargoMixOptimization, revenueUplift, recommendations.` },
};

export function getE2e33StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_33_STEP_CONFIGS[stepNumber] ?? null;
}
