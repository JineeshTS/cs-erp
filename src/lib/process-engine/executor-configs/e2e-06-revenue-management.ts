/**
 * E2E-06 Revenue Management & Yield Optimization — Executor Configuration (D-006 Phase 5)
 *
 * Continuous revenue optimization: demand/capacity forecasting, competitive
 * analysis, dynamic pricing, surcharge management, and rebate settlement.
 * 15 steps across 5 phases. Triggered weekly.
 *
 * All AI steps are pure analytics — they analyze market/operational data
 * and produce structured insights (no DB entity creation).
 *
 * Step Execution Map:
 * | Step | Name                          | Mode          | Entity Table | Action |
 * |------|-------------------------------|---------------|--------------|--------|
 * | 1    | Capacity forecasting          | ai_with_tools | —            | —      |
 * | 2    | Demand forecasting            | ai_with_tools | —            | —      |
 * | 3    | Competitive rate monitoring   | ai_with_tools | —            | —      |
 * | 4    | Freight rate benchmarking     | ai_with_tools | —            | —      |
 * | 5    | Pricing optimization          | ai_with_tools | —            | —      |
 * | 6    | Yield optimization            | ai_with_tools | —            | —      |
 * | 7    | Pricing gate                  | gate          | —            | —      |
 * | 8    | Surcharge calculation         | ai_with_tools | —            | —      |
 * | 9    | Seasonal rate adjustment      | ai_with_tools | —            | —      |
 * | 10   | Seasonal gate                 | gate          | —            | —      |
 * | 11   | Revenue integrity check       | ai_with_tools | —            | —      |
 * | 12   | Volume commitment tracking    | ai_with_tools | —            | —      |
 * | 13   | Rebate calculation            | ai_with_tools | —            | —      |
 * | 14   | Rebate settlement             | ai_with_tools | —            | —      |
 * | 15   | Rebate gate                   | gate          | —            | —      |
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

// ═══════════════════════════════════════════════════════════
// E2E-06 STEP CONFIGS (15 Steps, 5 Phases)
// ═══════════════════════════════════════════════════════════

export const E2E_06_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // ═══════════════════════════════════════════════════════════
  // PHASE 1: DEMAND & MARKET INTELLIGENCE (Steps 1-4)
  // ═══════════════════════════════════════════════════════════

  // ── Step 1: Capacity Forecasting (AI analysis) ──
  1: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Capacity Forecasting Agent for a container shipping line.
Generate a weekly capacity forecast across all active trade lanes:
1. Project available TEU per sailing for the next 8 weeks
2. Factor: confirmed bookings, forecast demand, equipment availability, vessel utilization
3. Identify capacity constraints (overbooked legs) and surplus (underutilized backhaul)
4. Calculate utilization percentage per trade lane per week

Provide your analysis as structured JSON with: forecastPeriodWeeks, tradeLaneForecasts (array with lane, availableTeu, bookedTeu, utilizationPercent), constraints, surplusLanes, overallUtilization.`,
  },

  // ── Step 2: Demand Forecasting (AI analysis) ──
  2: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Demand Forecasting Agent for a container shipping line.
Generate a rolling demand forecast per trade lane:
1. Analyze booking run-rate trends (4-week and 12-week moving averages)
2. Factor economic indicators (PMI, export orders, manufacturing output)
3. Apply seasonal adjustment factors (Chinese New Year, Christmas, produce seasons)
4. Incorporate customer pipeline data (LOIs, contract renewals)

Provide your analysis as structured JSON with: forecastPeriod, tradeLaneForecasts (array with lane, demandTeu, confidencePercent, seasonalFactor), growthTrend, keyDrivers.`,
  },

  // ── Step 3: Competitive Rate Monitoring (AI analysis) ──
  3: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Market Intelligence Agent for a container shipping line.
Monitor competitor freight rates across all active trade lanes:
1. Track rates by competitor, trade lane, equipment type, and contract vs spot
2. Identify rate movements (increases, decreases, new promotions)
3. Calculate our position vs market average and vs key competitors
4. Flag trade lanes where we are significantly above or below market

Provide your analysis as structured JSON with: monitoringDate, tradeLaneRates (array with lane, ourRate, marketAvg, competitorRates, positionVsMarket), rateAlerts, recommendations.`,
  },

  // ── Step 4: Freight Rate Benchmarking (AI analysis) ──
  4: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Rate Benchmarking Analyst for a container shipping line.
Perform deep-dive benchmarking comparing our rates against market by:
1. Trade lane and corridor direction (headhaul vs backhaul)
2. Equipment type (20GP, 40GP, 40HC, reefer)
3. Contract vs spot market
4. Customer segment (Platinum/Gold/Silver/Bronze)
5. Time-period trends (week-over-week, month-over-month)

Provide your analysis as structured JSON with: benchmarkDate, segmentAnalysis, corridorAnalysis, equipmentAnalysis, contractVsSpot, trendAnalysis, actionableInsights.`,
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 2: PRICING OPTIMIZATION (Steps 5-7)
  // ═══════════════════════════════════════════════════════════

  // ── Step 5: Pricing Optimization (AI analysis) ──
  5: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Pricing Optimization Agent for a container shipping line.
Generate optimal rate recommendations based on:
1. Demand/supply balance from capacity and demand forecasts (Steps 1-2)
2. Competitive positioning from market intelligence (Steps 3-4)
3. Yield targets per trade lane and overall fleet
4. Customer segment pricing strategy

For each trade lane, recommend: target rate, acceptable range (floor to ceiling),
and adjustment direction (increase/hold/decrease).

Provide your analysis as structured JSON with: recommendations (array with lane, currentRate, recommendedRate, floor, ceiling, adjustmentDirection, rationale), expectedRevenueImpact, yieldProjection.`,
  },

  // ── Step 6: Yield Optimization (AI analysis) ──
  6: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Yield Optimization Agent for a container shipping line.
Optimize revenue yield per voyage and per TEU across the fleet:
1. Calculate current yield per voyage, per TEU, per trade lane
2. Identify yield improvement opportunities (cargo mix, premium cargo allocation)
3. Model cargo mix scenarios (high-value vs volume cargo, DG premiums, reefer mix)
4. Recommend optimal cargo acceptance priorities per sailing

Provide your analysis as structured JSON with: currentYieldPerTeu, optimizedYieldPerTeu, improvementPercent, voyageAnalysis, cargoMixRecommendations, priorityMatrix.`,
  },

  // ── Step 7: Pricing Gate — approve rate changes ──
  7: {
    mode: "gate",
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 3: SURCHARGES & SEASONAL (Steps 8-10)
  // ═══════════════════════════════════════════════════════════

  // ── Step 8: Surcharge Calculation (AI analysis) ──
  8: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Surcharge Calculation Agent for a container shipping line.
Recalculate surcharges based on current cost inputs:
1. BAF (Bunker Adjustment Factor): calculate from current fuel prices vs base
2. CAF (Currency Adjustment Factor): calculate from FX rate movements
3. THC (Terminal Handling Charges): review per port/terminal
4. ISPS (Security surcharge): review per port
5. LSS (Low Sulphur Surcharge): calculate from VLSFO vs base

Compare new surcharge levels vs current published rates.
Flag surcharges that need adjustment (> 5% change from current).

Provide your analysis as structured JSON with: surcharges (array with type, currentRate, calculatedRate, changePercent, effectiveDate), adjustmentsNeeded, totalImpactPerTeu.`,
  },

  // ── Step 9: Seasonal Rate Adjustment (AI analysis) ──
  9: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Seasonal Rate Adjustment Agent for a container shipping line.
Evaluate and recommend seasonal rate actions:
1. GRI (General Rate Increase) timing and quantum during market upturn
2. PSS (Peak Season Surcharge) for predictable demand peaks
3. Emergency rate restoration if rates eroded below sustainable levels
4. Off-peak promotional rates to stimulate demand on underutilized lanes

Consider: current market conditions, demand forecast, competitor actions,
customer contract terms, and regulatory requirements (FMC filing for US trades).

Provide your analysis as structured JSON with: seasonalActions (array with type, tradeLanes, amount, effectiveDate, rationale), marketCondition, competitorActions, regulatoryConsiderations.`,
  },

  // ── Step 10: Seasonal Gate — approve seasonal rates ──
  10: {
    mode: "gate",
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 4: REVENUE INTEGRITY (Steps 11-12)
  // ═══════════════════════════════════════════════════════════

  // ── Step 11: Revenue Integrity Check (AI analysis) ──
  11: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Revenue Integrity Agent for a container shipping line.
Audit revenue integrity by checking:
1. Bookings at below-tariff rates without authorization
2. Missing surcharges on invoices
3. Rate guideline compliance by sales team
4. Unauthorized discounts or rebates
5. Freight collection completeness (invoiced vs collected)

Quantify revenue leakage and flag violations.

Provide your analysis as structured JSON with: auditPeriod, leakageAmount, violations (array with type, description, amount, bookingRef), complianceScore, remediationActions.`,
  },

  // ── Step 12: Volume Commitment Tracking (AI analysis) ──
  12: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Volume Commitment Tracking Agent for a container shipping line.
Track customer volume commitments against freight contracts (MQC):
1. Calculate actual vs committed volume per customer per period
2. Identify customers below minimum commitment
3. Calculate shortfall penalties per contract clause
4. Identify customers exceeding commitment (rebate eligibility)
5. Project year-end achievement per customer

Provide your analysis as structured JSON with: customers (array with name, committedTeu, actualTeu, achievementPercent, shortfallTeu, penaltyAmount, rebateEligible), aggregateSummary, riskCustomers.`,
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 5: REBATE SETTLEMENT (Steps 13-15)
  // ═══════════════════════════════════════════════════════════

  // ── Step 13: Rebate Calculation (AI analysis) ──
  13: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Rebate Calculation Agent for a container shipping line.
Calculate rebates owed to customers based on contractual terms:
1. Apply volume-based rebate tiers per contract
2. Calculate rebate amount per trade lane and overall
3. Verify against actual booking and invoice records
4. Net off any outstanding shortfall penalties

Provide your analysis as structured JSON with: rebates (array with customerName, contractRef, achievedTeu, rebateTier, rebatePerTeu, totalRebateAmount, netAfterPenalties), totalRebateObligation.`,
  },

  // ── Step 14: Rebate Settlement (AI analysis) ──
  14: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Rebate Settlement Agent for a container shipping line.
Process rebate payments at contract anniversary or agreed settlement date:
1. Verify rebate calculations from Step 13
2. Prepare credit notes for approved rebates
3. Apply rebates as credits to customer accounts or process refunds
4. Update contract tracking with settlement records

Provide your analysis as structured JSON with: settlements (array with customerName, rebateAmount, settlementMethod, creditNoteRef), totalSettled, pendingApproval.`,
  },

  // ── Step 15: Rebate Gate — approve settlements ──
  15: {
    mode: "gate",
  },
};

/**
 * Get the executor config for a specific step in E2E-06.
 */
export function getE2e06StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_06_STEP_CONFIGS[stepNumber] ?? null;
}
