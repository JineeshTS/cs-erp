/**
 * E2E-24 Service & Vessel Schedule Lifecycle — Executor Configuration (D-006 Phase 5)
 *
 * End-to-end service design from market analysis through schedule creation,
 * publication, and ongoing optimization. 31 steps, 8 gates.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_24_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // PHASE 1: MARKET ANALYSIS
  1: { mode: "ai_with_tools", systemPromptExtra: `You are a Trade Lane Demand Agent. Analyze demand for a trade lane — volumes, growth, seasonality. Provide JSON with: annualDemandTeu, growthPercent, seasonality, keyShippers.` },
  2: { mode: "ai_with_tools", systemPromptExtra: `You are a Competitive Landscape Agent. Assess competitors on the trade lane — services, frequency, rates, market share. Provide JSON with: competitors, marketShares, averageRate, serviceGaps.` },
  3: { mode: "ai_with_tools", systemPromptExtra: `You are a P&L Projection Agent. Project trade lane P&L — revenue, costs, break-even utilization. Provide JSON with: projectedRevenue, projectedCost, breakEvenUtilization, roi.` },
  4: { mode: "gate" },
  // PHASE 2: SERVICE DESIGN
  5: { mode: "ai_with_tools", systemPromptExtra: `You are a Network Design Agent. Design the service network — port rotation, hub connections, frequency. Provide JSON with: portRotation, frequency, hubPort, connectingServices.` },
  6: { mode: "ai_with_tools", systemPromptExtra: `You are a Port Pair Economist. Analyze economics of each port pair in the rotation. Provide JSON with: portPairs (array with origin, destination, volume, rate, contribution).` },
  7: { mode: "gate" },
  8: { mode: "gate" },
  9: { mode: "gate" },
  // PHASE 3: FLEET DEPLOYMENT
  10: { mode: "ai_with_tools", systemPromptExtra: `You are a Vessel Requirement Agent. Calculate vessel requirements — number, size, speed, fuel type. Provide JSON with: vesselCount, vesselSize, requiredSpeed, fuelType.` },
  11: { mode: "gate" },
  12: { mode: "ai_with_tools", systemPromptExtra: `You are a Charter Agent. Identify charter-in vessels to fill fleet gaps. Provide JSON with: charterNeeded, vesselType, marketRate, duration.` },
  13: { mode: "ai_with_tools", systemPromptExtra: `You are a Fleet Financial Agent. Assess fleet economics — TCE, break-even, daily costs. Provide JSON with: tcePerDay, breakEvenRate, dailyOpex, annualCost.` },
  14: { mode: "gate" },
  // PHASE 4: SCHEDULE CREATION
  15: { mode: "ai_with_tools", systemPromptExtra: `You are a Port Window Agent. Negotiate port windows with terminals. Provide JSON with: portWindows (array with port, windowDay, arrivalTime, departureTime).` },
  16: { mode: "ai_with_tools", systemPromptExtra: `You are a Schedule Drafter. Draft 52-week proforma schedule with ETD/ETA per port. Provide JSON with: weeklySchedule, transitTimes, portDays, totalRoundtripDays.` },
  17: { mode: "ai_with_tools", systemPromptExtra: `You are a Canal Planning Agent. Plan Suez/Panama Canal transits — booking, tolls, restrictions. Provide JSON with: canalTransits, tolls, restrictions, alternativeRoutes.` },
  18: { mode: "ai_with_tools", systemPromptExtra: `You are a Speed/Fuel Agent. Analyze speed and fuel consumption per leg of the schedule. Provide JSON with: legAnalysis (array with leg, speed, consumption, emissionsPerTeu).` },
  19: { mode: "ai_with_tools", systemPromptExtra: `You are a Schedule QA Agent. Validate schedule quality — transit time competitiveness, feasibility, port day requirements. Provide JSON with: transitTimeCompetitive, feasible, portDaysAdequate, issues.` },
  20: { mode: "gate" },
  // PHASE 5: PUBLICATION
  21: { mode: "ai_with_tools", systemPromptExtra: `You are a Publication Agent. Publish schedule to customer portal and EDI partners. Provide JSON with: published, channels, customerNotifications.` },
  22: { mode: "ai_with_tools", systemPromptExtra: `You are an Activation Agent. Create operational records for the new schedule. Provide JSON with: voyagesCreated, systemUpdated.` },
  23: { mode: "ai_with_tools", systemPromptExtra: `You are a Port Rotation Agent. Set up ETA/ETD per port call in the operational system. Provide JSON with: portCalls, etaEtdSet.` },
  // PHASE 6: ACTIVATION
  24: { mode: "ai_with_tools", systemPromptExtra: `You are a Capacity Allocation Agent. Allocate capacity — contract vs spot vs alliance. Provide JSON with: contractAllocation, spotAllocation, allianceSlots, totalCapacity.` },
  25: { mode: "ai_with_tools", systemPromptExtra: `You are a Rate Activation Agent. Load approved rates into the tariff engine. Provide JSON with: ratesActivated, tradeLanes, effectiveDate.` },
  26: { mode: "ai_with_tools", systemPromptExtra: `You are a Cut-Off Rules Agent. Configure cut-off rules per port in the schedule. Provide JSON with: cutOffRules (array with port, docCutoff, cargoCutoff, reeferCutoff).` },
  // PHASE 7: MONITORING
  27: { mode: "ai_with_tools", systemPromptExtra: `You are a Schedule Performance Agent. Monitor schedule reliability — on-time departures, transit time adherence. Provide JSON with: onTimePercent, avgDelay, reliability.` },
  28: { mode: "ai_with_tools", systemPromptExtra: `You are a Demand Forecast Agent. Weekly demand forecast for the service. Provide JSON with: demandForecast, utilizationTrend, bookingPace.` },
  29: { mode: "ai_with_tools", systemPromptExtra: `You are a Load Factor Agent. Report load factor and revenue per TEU per voyage. Provide JSON with: loadFactor, revenuePerTeu, voyageRevenue.` },
  30: { mode: "ai_with_tools", systemPromptExtra: `You are a Route Optimization Agent. Monthly route optimization analysis — speed, port calls, capacity. Provide JSON with: optimizations, savingsEstimate, recommendations.` },
  31: { mode: "gate" },
};

export function getE2e24StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_24_STEP_CONFIGS[stepNumber] ?? null;
}
