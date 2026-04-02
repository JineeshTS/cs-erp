/**
 * E2E-28 Sanctions & Trade Compliance — Executor Configuration (D-006 Phase 5)
 *
 * Sanctions screening, export license management, AEO compliance,
 * and regulatory reporting. 12 steps, 2 gates.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_28_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // PHASE 1: SCREENING
  1: { mode: "ai_with_tools", systemPromptExtra: `You are a Customer Screening Agent. Screen all active customers against updated sanctions lists (OFAC, EU, UN). Provide JSON with: customersScreened, matchesFound, falsePositives, confirmed.` },
  2: { mode: "ai_with_tools", systemPromptExtra: `You are a Vendor Screening Agent. Screen all active vendors against updated sanctions lists. Provide JSON with: vendorsScreened, matchesFound, falsePositives, confirmed.` },
  3: { mode: "ai_with_tools", systemPromptExtra: `You are a Match Analysis Agent. Analyze potential matches — fuzzy name matching, alias checking, entity resolution. Provide JSON with: potentialMatches, matchScore, analysisResult, escalationNeeded.` },
  4: { mode: "gate" },
  // PHASE 2: INVESTIGATION
  5: { mode: "ai_with_tools", systemPromptExtra: `You are a Sanctions Response Agent. Execute response for confirmed sanctions match — freeze accounts, block shipments, notify compliance officer. Provide JSON with: actionsToken, accountsFrozen, shipmentsBlocked, notificationsSent.` },
  // PHASE 3: EXPORT CONTROLS
  6: { mode: "ai_with_tools", systemPromptExtra: `You are an Export License Agent. Check export license requirements for controlled goods — commodity classification, end-use, destination. Provide JSON with: licenseRequired, commodityCode, endUseCheck, destinationRisk.` },
  7: { mode: "ai_with_tools", systemPromptExtra: `You are a Dual-Use Agent. Manage dual-use license applications and tracking. Provide JSON with: licenseRef, status, expiryDate, usageRemaining, conditions.` },
  8: { mode: "gate" },
  // PHASE 4: ONGOING COMPLIANCE
  9: { mode: "ai_with_tools", systemPromptExtra: `You are an AEO Compliance Agent. Monitor AEO (Authorized Economic Operator) compliance — internal controls, audit readiness. Provide JSON with: aeoStatus, complianceScore, auditFindings, nextReviewDate.` },
  10: { mode: "ai_with_tools", systemPromptExtra: `You are a Regulatory Reporting Agent. Generate regulatory reports for sanctions findings — SAR filings, regulator notifications. Provide JSON with: reportsGenerated, filingRef, regulatorNotified, deadline.` },
  11: { mode: "ai_with_tools", systemPromptExtra: `You are an Audit Trail Agent. Update compliance audit trail — all screening actions, decisions, and evidence. Provide JSON with: auditEntries, traceabilityComplete, retentionPeriod.` },
  12: { mode: "ai_with_tools", systemPromptExtra: `You are a Risk Register Agent. Update compliance risk register with screening results and emerging risks. Provide JSON with: risksUpdated, newRisks, mitigationActions, overallRiskLevel.` },
};

export function getE2e28StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_28_STEP_CONFIGS[stepNumber] ?? null;
}
