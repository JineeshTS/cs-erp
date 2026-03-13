/**
 * E2E-32 Emergency & Salvage — Executor Configuration (D-006 Phase 5)
 *
 * Emergency response from incident activation through notifications,
 * salvage coordination, general average, and closure. 12 steps, 4 gates.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_32_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // PHASE 1: EMERGENCY RESPONSE
  1: { mode: "ai_with_tools", systemPromptExtra: `You are an Emergency Response Agent. Activate emergency response — assess severity, classify incident (grounding, collision, fire, piracy). Provide JSON with: incidentType, severity, location, vesselStatus, crewSafe.` },
  2: { mode: "gate" },
  3: { mode: "ai_with_tools", systemPromptExtra: `You are a Notification Agent. Notify all affected parties — customers with cargo onboard, port agents, charterers. Provide JSON with: partiesNotified, customerCount, cargoAtRisk, communicationsSent.` },
  4: { mode: "ai_with_tools", systemPromptExtra: `You are an Insurance Alert Agent. Notify insurers — P&I club for liability, H&M for hull damage. Provide JSON with: piNotified, hmNotified, policyRefs, initialReserve.` },
  // PHASE 2: SALVAGE & INVESTIGATION
  5: { mode: "gate" },
  6: { mode: "ai_with_tools", systemPromptExtra: `You are an Incident Investigation Agent. Conduct incident investigation — evidence collection, witness statements, timeline reconstruction. Provide JSON with: investigation, rootCause, contributingFactors, evidenceLog.` },
  // PHASE 3: GENERAL AVERAGE
  7: { mode: "ai_with_tools", systemPromptExtra: `You are a General Average Agent. Assess whether General Average should be declared — extraordinary sacrifice/expenditure for common safety. Provide JSON with: gaJustified, sacrificeType, estimatedCost, partiesAffected.` },
  8: { mode: "gate" },
  9: { mode: "ai_with_tools", systemPromptExtra: `You are a GA Declaration Agent. Execute GA declaration — appoint average adjuster, issue GA bond requirements. Provide JSON with: gaRef, averageAdjuster, bondRequirements, securityDeadline.` },
  10: { mode: "gate" },
  // PHASE 4: CLOSURE & LEARNING
  11: { mode: "ai_with_tools", systemPromptExtra: `You are a Corrective Action Agent. Define post-incident corrective actions and implementation plan. Provide JSON with: correctiveActions, responsible, deadlines, verificationMethod.` },
  12: { mode: "ai_with_tools", systemPromptExtra: `You are a Safety Culture Agent. Update risk register and safety management system from incident learnings. Provide JSON with: riskRegisterUpdated, smsRevisions, trainingRequired, safetyBulletin.` },
};

export function getE2e32StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_32_STEP_CONFIGS[stepNumber] ?? null;
}
