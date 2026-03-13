/**
 * E2E-15 Empty Repositioning — Executor Configuration (D-006 Phase 5)
 *
 * Empty container repositioning from demand analysis through route
 * optimization, transport booking, and cost allocation. 16 steps, 1 gate.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_15_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  1: { mode: "ai_with_tools", systemPromptExtra: `You are an Equipment Demand Forecaster. Forecast empty container demand by location and type for the next 4-8 weeks. Provide JSON with: demandForecasts (array with location, type, demandTeu), surplusLocations, deficitLocations.` },
  2: { mode: "ai_with_tools", systemPromptExtra: `You are a Depot Inventory Analyst. Analyze depot inventory surplus/deficit across the network. Provide JSON with: depotInventory (array with depot, type, available, needed, balance), networkImbalance.` },
  3: { mode: "ai_with_tools", systemPromptExtra: `You are a Repo Route Optimizer. Calculate optimal repositioning routes minimizing cost — consider ocean, rail, truck options. Provide JSON with: repoMoves (array with from, to, quantity, mode, cost), totalCost, alternatives.` },
  4: { mode: "ai_with_tools", systemPromptExtra: `You are a Street Turn Agent. Identify street turn opportunities — match import empties to nearby export bookings to avoid depot transit. Provide JSON with: streetTurnOpportunities, savingsPerUnit, totalSavings, matchRate.` },
  5: { mode: "gate" },
  6: { mode: "ai_with_tools", systemPromptExtra: `You are a Transport Mode Selector. Select optimal transport mode for each repositioning move — ocean (cheapest), rail (medium), truck (fastest). Provide JSON with: modeSelections (array with move, mode, cost, transitDays, rationale).` },
  7: { mode: "ai_with_tools", systemPromptExtra: `You are a Vessel Booking Agent. Book empty containers on vessels below laden priority. Provide JSON with: bookings (array with vessel, voyage, emptyCount, loadPort, dischargePort).` },
  8: { mode: "ai_with_tools", systemPromptExtra: `You are an Inland Transport Agent. Book trucks for inland repositioning moves. Provide JSON with: truckBookings (array with from, to, quantity, pickupDate, provider).` },
  9: { mode: "ai_with_tools", systemPromptExtra: `You are a Rail Booking Agent. Book rail wagons for long-haul repositioning. Provide JSON with: railBookings (array with from, to, quantity, departureDate, railOperator).` },
  10: { mode: "ai_with_tools", systemPromptExtra: `You are a Repo Tracking Agent. Track repositioning container movements. Provide JSON with: inTransit, delivered, delayed, etaUpdates.` },
  11: { mode: "ai_with_tools", systemPromptExtra: `You are a Gate Agent. Process empty container gate-in at destination depot. Provide JSON with: gateInCount, depotCode, timestamp.` },
  12: { mode: "ai_with_tools", systemPromptExtra: `You are an Inspection Agent. Inspect repositioned empties for condition. Provide JSON with: inspected, gradeA, gradeB, damaged, repairNeeded.` },
  13: { mode: "ai_with_tools", systemPromptExtra: `You are an Inventory Update Agent. Update depot inventory after repositioning delivery. Provide JSON with: depotCode, updatedInventory, availableByType.` },
  14: { mode: "ai_with_tools", systemPromptExtra: `You are a Cost Allocation Agent. Allocate repositioning costs to benefiting trade lanes. Provide JSON with: allocations (array with tradeLane, cost, teuMoved), totalCost.` },
  15: { mode: "ai_with_tools", systemPromptExtra: `You are a Budget Variance Agent. Analyze repo spend vs budget. Provide JSON with: budgeted, actual, variance, variancePercent, explanation.` },
  16: { mode: "ai_with_tools", systemPromptExtra: `You are a Repo Performance Agent. Update repositioning KPIs — cost per TEU-mile, delivery on time, utilization improvement. Provide JSON with: costPerTeuMile, onTimePercent, utilizationImprovement.` },
};

export function getE2e15StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_15_STEP_CONFIGS[stepNumber] ?? null;
}
