/**
 * E2E-27 Bunker Procurement — Executor Configuration (D-006 Phase 5)
 *
 * Bunker lifecycle from ROB assessment through procurement, delivery,
 * quality testing, and settlement. 18 steps, 5 gates.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_27_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // PHASE 1: ROB ASSESSMENT
  1: { mode: "ai_with_tools", systemPromptExtra: `You are an ROB Assessment Agent. Assess current remaining-on-board fuel across all tanks — HFO, VLSFO, MDO. Provide JSON with: hfoRob, vlsfoRob, mdoRob, totalRobMt, lastSounding.` },
  2: { mode: "ai_with_tools", systemPromptExtra: `You are a Consumption Forecast Agent. Forecast fuel consumption for upcoming voyage legs based on speed, weather, and cargo. Provide JSON with: legForecasts, totalConsumption, safetyMargin, minimumRob.` },
  3: { mode: "ai_with_tools", systemPromptExtra: `You are a Bunkering Port Agent. Identify optimal bunkering port — price, availability, deviation cost, port charges. Provide JSON with: portOptions, recommendedPort, pricePerMt, deviationCost, totalCost.` },
  // PHASE 2: PROCUREMENT
  4: { mode: "gate" },
  5: { mode: "ai_with_tools", systemPromptExtra: `You are a Bunker Tender Agent. Issue tender to approved suppliers at selected port. Provide JSON with: suppliersContacted, tenderRef, quantityRequested, fuelGrade, deliveryWindow.` },
  6: { mode: "ai_with_tools", systemPromptExtra: `You are a Bid Evaluation Agent. Evaluate supplier bids — price, quality track record, delivery flexibility. Provide JSON with: bids, rankedSuppliers, recommendation, priceSpread.` },
  7: { mode: "gate" },
  8: { mode: "ai_with_tools", systemPromptExtra: `You are a Bunker PO Agent. Generate purchase order for bunker supply. Provide JSON with: poNumber, supplier, quantity, pricePerMt, totalAmount, deliveryDate.` },
  // PHASE 3: DELIVERY & QUALITY
  9: { mode: "gate" },
  10: { mode: "gate" },
  11: { mode: "ai_with_tools", systemPromptExtra: `You are a Fuel Quality Agent. Validate fuel quality against ISO 8217 specifications — viscosity, density, sulfur, water content. Provide JSON with: qualityResults, iso8217Compliant, sulfurPercent, issues.` },
  12: { mode: "gate" },
  13: { mode: "ai_with_tools", systemPromptExtra: `You are an ROB Update Agent. Update ROB records after bunker delivery — new quantities, tank allocation. Provide JSON with: updatedHfo, updatedVlsfo, updatedMdo, deliveredQuantity, bdnRef.` },
  // PHASE 4: INVOICE & SETTLEMENT
  14: { mode: "ai_with_tools", systemPromptExtra: `You are a Bunker Invoice Agent. Process bunker supplier invoice and validate against BDN quantities. Provide JSON with: invoiceAmount, bdnQuantity, invoiceQuantity, variance, approved.` },
  15: { mode: "ai_with_tools", systemPromptExtra: `You are a Bunker Match Agent. Three-way match: PO → BDN → invoice for bunker delivery. Provide JSON with: poAmount, bdnAmount, invoiceAmount, matched, discrepancies.` },
  16: { mode: "ai_with_tools", systemPromptExtra: `You are a Bunker Payment Agent. Schedule bunker payment per contract terms. Provide JSON with: paymentAmount, dueDate, currency, bankDetails.` },
  // PHASE 5: ONGOING ANALYSIS
  17: { mode: "ai_with_tools", systemPromptExtra: `You are a Consumption Analysis Agent. Analyze actual vs planned fuel consumption — speed deviation, weather impact. Provide JSON with: plannedConsumption, actualConsumption, variance, causes.` },
  18: { mode: "ai_with_tools", systemPromptExtra: `You are a Charter Bunker Agent. Calculate charter bunker clause settlement — delivery vs redelivery ROB difference. Provide JSON with: deliveryRob, redeliveryRob, differenceValue, settlementAmount.` },
};

export function getE2e27StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_27_STEP_CONFIGS[stepNumber] ?? null;
}
