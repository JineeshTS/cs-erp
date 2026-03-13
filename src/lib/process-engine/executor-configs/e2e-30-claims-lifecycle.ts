/**
 * E2E-30 Claims Lifecycle — Executor Configuration (D-006 Phase 5)
 *
 * Claims from incident investigation through survey, liability assessment,
 * insurance notification, settlement, and lessons learned. 10 steps, 3 gates.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_30_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // PHASE 1: INVESTIGATION
  1: { mode: "ai_with_tools", systemPromptExtra: `You are an Incident Investigation Agent. Initiate claim investigation — gather facts, witness statements, photographic evidence. Provide JSON with: incidentRef, incidentType, description, evidence, estimatedLoss.` },
  2: { mode: "gate" },
  3: { mode: "ai_with_tools", systemPromptExtra: `You are a Survey Coordination Agent. Coordinate cargo/hull survey — appoint surveyor, schedule inspection, scope. Provide JSON with: surveyorAppointed, surveyDate, surveyScope, surveyorFirm.` },
  4: { mode: "ai_with_tools", systemPromptExtra: `You are a Liability Assessment Agent. Assess liability — Hague-Visby rules, bill of lading terms, carrier defenses. Provide JSON with: liabilityBasis, carrierDefense, exposureAmount, liabilityPercent.` },
  // PHASE 2: INSURANCE
  5: { mode: "gate" },
  6: { mode: "ai_with_tools", systemPromptExtra: `You are an Insurance Notification Agent. Notify relevant insurers — P&I club, cargo underwriters, H&M. Provide JSON with: insurersNotified, policyRefs, deductible, coverageConfirmed.` },
  // PHASE 3: SETTLEMENT & RESOLUTION
  7: { mode: "ai_with_tools", systemPromptExtra: `You are a Claim Negotiation Agent. Support claim negotiation — quantum analysis, settlement scenarios, legal assessment. Provide JSON with: claimAmount, offerAmount, counterOffer, settlementRange.` },
  8: { mode: "gate" },
  // PHASE 4: CLOSURE & LEARNING
  9: { mode: "ai_with_tools", systemPromptExtra: `You are a Risk Register Agent. Update risk register from claim — new controls, risk ratings, mitigation measures. Provide JSON with: riskUpdated, newControls, riskRating, mitigationPlan.` },
  10: { mode: "ai_with_tools", systemPromptExtra: `You are a Lessons Learned Agent. Document lessons learned and preventive actions from claim. Provide JSON with: rootCause, lessonsLearned, preventiveActions, trainingNeeded.` },
};

export function getE2e30StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_30_STEP_CONFIGS[stepNumber] ?? null;
}
