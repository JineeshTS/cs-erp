/**
 * E2E-16 Container Leasing Lifecycle — Executor Configuration (D-006 Phase 5)
 *
 * Leased container lifecycle from lease-vs-buy analysis through
 * on-hire, fleet tracking, reconciliation, and off-hire. 15 steps, 6 gates.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_16_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  1: { mode: "ai_with_tools", systemPromptExtra: `You are a Lease Analysis Agent. Analyze lease vs buy economics for container fleet expansion — TCO, cash flow impact, fleet flexibility. Provide JSON with: leaseNpv, buyNpv, recommendation, assumptions, flexibilityScore.` },
  2: { mode: "gate" },
  3: { mode: "ai_with_tools", systemPromptExtra: `You are a Lease Agreement Agent. Evaluate lease terms — per-diem rate, lease duration, maintenance responsibility, insurance, drop-off locations. Provide JSON with: perDiem, duration, maintenanceTerms, dropOffFlexibility, totalCost.` },
  4: { mode: "gate" },
  5: { mode: "gate" },
  6: { mode: "ai_with_tools", systemPromptExtra: `You are a Fleet Inventory Agent. Add leased containers to fleet inventory system with lessor reference, on-hire date, and lease terms. Provide JSON with: containersAdded, lessorRef, onHireDate, leaseEndDate.` },
  7: { mode: "ai_with_tools", systemPromptExtra: `You are a Lease Tracking Agent. Track leased containers — current location, utilization, days on hire, remaining lease term. Provide JSON with: activeLeases, totalOnHire, utilizationPercent, expiringWithin90Days.` },
  8: { mode: "ai_with_tools", systemPromptExtra: `You are a Condition Monitor. Monitor leased container condition and maintenance requirements. Provide JSON with: conditionSummary, repairsNeeded, maintenanceCosts, lessorLiability.` },
  9: { mode: "ai_with_tools", systemPromptExtra: `You are a Lessor Reconciliation Agent. Reconcile monthly lease charges with lessor — on-hire/off-hire dates, per-diem calculations, M&R credits. Provide JSON with: lessorCharges, ourCalculation, variance, disputedItems.` },
  10: { mode: "gate" },
  11: { mode: "ai_with_tools", systemPromptExtra: `You are a Lease Payment Agent. Process monthly lease payments to lessors. Provide JSON with: paymentAmount, paymentDate, lessorRef, period.` },
  12: { mode: "gate" },
  13: { mode: "gate" },
  14: { mode: "ai_with_tools", systemPromptExtra: `You are an M&R Coordination Agent. Coordinate maintenance and repair for containers being returned to lessor. Provide JSON with: repairsRequired, estimatedCost, repairFacility, completionDate.` },
  15: { mode: "ai_with_tools", systemPromptExtra: `You are a Lease Settlement Agent. Calculate final settlement with lessor — outstanding charges, M&R costs, early return penalties. Provide JSON with: totalSettlement, breakdown, creditNotes, netPayable.` },
};

export function getE2e16StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_16_STEP_CONFIGS[stepNumber] ?? null;
}
