/**
 * E2E-31 ESG Reporting — Executor Configuration (D-006 Phase 5)
 *
 * ESG lifecycle from data collection through CII calculation,
 * regulatory submissions (IMO DCS, EU MRV), and stakeholder reporting. 12 steps, 2 gates.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_31_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // PHASE 1: DATA COLLECTION
  1: { mode: "ai_with_tools", systemPromptExtra: `You are a Fuel Data Agent. Collect fuel consumption data from noon reports across the fleet. Provide JSON with: vesselsReported, totalFuelMt, fuelByType, reportingPeriod.` },
  2: { mode: "ai_with_tools", systemPromptExtra: `You are a Transport Work Agent. Collect cargo volume and transport work data — TEU-miles, DWT-miles. Provide JSON with: totalTeuMiles, totalDwtMiles, voyageCount, cargoVolume.` },
  3: { mode: "ai_with_tools", systemPromptExtra: `You are a Data Quality Agent. Validate collected data — anomaly detection, gap analysis, consistency checks. Provide JSON with: dataQualityScore, anomalies, gaps, corrections.` },
  4: { mode: "gate" },
  // PHASE 2: CII & EFFICIENCY
  5: { mode: "ai_with_tools", systemPromptExtra: `You are a CII Calculator. Calculate Carbon Intensity Indicator rating per vessel — attained CII vs required CII. Provide JSON with: vesselCii (array with vessel, attainedCii, requiredCii, rating, trend).` },
  6: { mode: "ai_with_tools", systemPromptExtra: `You are a Fleet Efficiency Agent. Analyze fleet-wide efficiency — EEXI compliance, EEDI reference lines, improvement trajectories. Provide JSON with: fleetAvgCii, bestPerformers, worstPerformers, improvementPlan.` },
  // PHASE 3: REGULATORY COMPLIANCE
  7: { mode: "ai_with_tools", systemPromptExtra: `You are a MARPOL Summary Agent. Generate MARPOL compliance summary for the reporting period. Provide JSON with: annexCompliance, violations, correctiveActions, overallStatus.` },
  8: { mode: "ai_with_tools", systemPromptExtra: `You are an IMO DCS Agent. Prepare IMO Data Collection System submission — fuel consumption, distance, hours. Provide JSON with: dcsData, submissionReady, verifierAssigned, deadline.` },
  9: { mode: "ai_with_tools", systemPromptExtra: `You are an EU MRV Agent. Prepare EU Monitoring Reporting Verification submission. Provide JSON with: mrvData, co2Emissions, transportWork, emissionsIntensity, verifierStatus.` },
  10: { mode: "ai_with_tools", systemPromptExtra: `You are a CII Reporting Agent. Prepare annual CII report for IMO submission. Provide JSON with: annualReport, vesselRatings, correctiveActionPlan, submissionDate.` },
  // PHASE 4: STAKEHOLDER REPORTING
  11: { mode: "ai_with_tools", systemPromptExtra: `You are an ESG Report Agent. Generate stakeholder ESG report — environmental metrics, social indicators, governance summary. Provide JSON with: environmentalMetrics, socialIndicators, governanceSummary, materialityMatrix.` },
  12: { mode: "gate" },
};

export function getE2e31StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_31_STEP_CONFIGS[stepNumber] ?? null;
}
