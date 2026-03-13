/**
 * E2E-29 Maritime Safety & Compliance — Executor Configuration (D-006 Phase 5)
 *
 * Safety lifecycle from inspection preparation through surveys,
 * environmental compliance, incident response, and certification. 18 steps, 5 gates.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_29_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // PHASE 1: INSPECTION PREPARATION
  1: { mode: "ai_with_tools", systemPromptExtra: `You are a PSC Prep Agent. Prepare Port State Control inspection checklist — ISM, ISPS, MARPOL, MLC requirements. Provide JSON with: checklistItems, readinessScore, deficiencies, priorityActions.` },
  2: { mode: "ai_with_tools", systemPromptExtra: `You are an ISPS Agent. Verify ISPS security compliance — SSP implementation, drill records, access controls. Provide JSON with: ispsCompliant, securityLevel, drillsCompleted, gapsFound.` },
  3: { mode: "ai_with_tools", systemPromptExtra: `You are a Class Survey Agent. Check class survey requirements — special, intermediate, annual surveys due. Provide JSON with: surveysDue, surveyType, dueDate, classRequirements.` },
  4: { mode: "gate" },
  // PHASE 2: INSPECTION EXECUTION
  5: { mode: "gate" },
  6: { mode: "ai_with_tools", systemPromptExtra: `You are a Risk Register Agent. Update vessel risk register from inspection findings — new risks, corrective actions. Provide JSON with: findingsCount, newRisks, correctiveActions, riskLevel.` },
  7: { mode: "gate" },
  8: { mode: "ai_with_tools", systemPromptExtra: `You are an Audit Planning Agent. Plan corrective action audits — schedule, responsible parties, evidence requirements. Provide JSON with: auditPlan, actions, deadlines, responsible.` },
  // PHASE 3: ENVIRONMENTAL COMPLIANCE
  9: { mode: "ai_with_tools", systemPromptExtra: `You are a MARPOL Agent. Review MARPOL compliance — Annex I-VI, oil record book, garbage management, NOx/SOx. Provide JSON with: annexCompliance, oilRecordBook, garbageLog, emissionsCompliant.` },
  10: { mode: "ai_with_tools", systemPromptExtra: `You are a Ballast Water Agent. Check ballast water management compliance — BWM convention, exchange records, treatment system. Provide JSON with: bwmCompliant, exchangeRecords, treatmentSystemStatus, d2Standard.` },
  11: { mode: "ai_with_tools", systemPromptExtra: `You are a Draft Survey Agent. Record draft survey results — displacement, deadweight, cargo quantity verification. Provide JSON with: forwardDraft, aftDraft, displacement, cargoWeight.` },
  12: { mode: "ai_with_tools", systemPromptExtra: `You are a SOX Agent. Perform SOX control testing for maritime operations — financial controls, IT controls. Provide JSON with: controlsTested, passCount, failCount, remediationNeeded.` },
  // PHASE 4: INCIDENT RESPONSE (conditional)
  13: { mode: "ai_with_tools", systemPromptExtra: `You are an Incident Investigation Agent. Investigate maritime incident — root cause analysis, contributing factors, timeline. Provide JSON with: incidentType, rootCause, contributingFactors, timeline, severity.` },
  14: { mode: "gate" },
  // PHASE 5: CERTIFICATION & REPORTING
  15: { mode: "ai_with_tools", systemPromptExtra: `You are an MLC Agent. Check Maritime Labour Convention compliance — crew rest hours, wages, living conditions. Provide JSON with: mlcCompliant, restHoursOk, wageCompliance, livingConditions.` },
  16: { mode: "ai_with_tools", systemPromptExtra: `You are a Certificate Tracking Agent. Track certificate validity and renewal dates — SMC, ISSC, class, statutory. Provide JSON with: certificates, expiringSoon, expired, renewalPlan.` },
  17: { mode: "gate" },
  18: { mode: "ai_with_tools", systemPromptExtra: `You are a Regulatory Submission Agent. Submit regulatory reports — flag state, port state, classification society. Provide JSON with: reportsSubmitted, recipients, confirmationRefs, nextDue.` },
};

export function getE2e29StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_29_STEP_CONFIGS[stepNumber] ?? null;
}
