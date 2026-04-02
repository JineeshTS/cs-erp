/**
 * E2E-23 Vessel Dry Dock — Executor Configuration (D-006 Phase 5)
 *
 * Dry dock lifecycle from class survey planning through tendering,
 * execution, surveys, and cost settlement. 18 steps, 9 gates.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_23_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  1: { mode: "ai_with_tools", systemPromptExtra: `You are a Class Survey Agent. Schedule class surveys — special survey, intermediate, annual. Provide JSON with: surveyType, dueDate, scope, classRequirements.` },
  2: { mode: "gate" },
  3: { mode: "ai_with_tools", systemPromptExtra: `You are a Shipyard Tender Agent. Prepare tender documents and evaluate shipyard bids. Provide JSON with: tenderIssued, yardsContacted, bidsSummary, recommendation.` },
  4: { mode: "gate" },
  5: { mode: "ai_with_tools", systemPromptExtra: `You are a PO Agent. Generate purchase orders for dry dock works. Provide JSON with: purchaseOrders, totalBudget, categories.` },
  6: { mode: "ai_with_tools", systemPromptExtra: `You are a Schedule Agent. Plan vessel off-hire window to minimize commercial impact. Provide JSON with: offHireStart, offHireEnd, durationDays, commercialImpact, revenueForegone.` },
  7: { mode: "gate" },
  8: { mode: "ai_with_tools", systemPromptExtra: `You are an Insurance Notification Agent. Notify insurers of planned dry dock. Provide JSON with: notified, policyRef, requirements.` },
  9: { mode: "gate" },
  10: { mode: "gate" },
  11: { mode: "ai_with_tools", systemPromptExtra: `You are a Class Survey Agent. Track class survey and flag state inspection during dry dock. Provide JSON with: surveyStatus, findings, certificatesRenewed.` },
  12: { mode: "gate" },
  13: { mode: "gate" },
  14: { mode: "gate" },
  15: { mode: "ai_with_tools", systemPromptExtra: `You are a Cost Variance Agent. Analyze dry dock cost variance — budget vs actual by category. Provide JSON with: budgeted, actual, variance, varianceByCategory.` },
  16: { mode: "gate" },
  17: { mode: "ai_with_tools", systemPromptExtra: `You are an Invoice Agent. Process shipyard invoices. Provide JSON with: invoiceAmount, poMatched, approvalStatus.` },
  18: { mode: "ai_with_tools", systemPromptExtra: `You are a Three-Way Match Agent. Perform PO-receipt-invoice matching for dry dock costs. Provide JSON with: matched, discrepancies, approvalNeeded.` },
};

export function getE2e23StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_23_STEP_CONFIGS[stepNumber] ?? null;
}
