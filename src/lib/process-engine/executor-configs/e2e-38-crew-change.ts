/**
 * E2E-38 Crew Change — Executor Configuration (D-006 Phase 5)
 *
 * Crew change lifecycle from rotation planning through certification,
 * travel, medical, physical change, payroll, and repatriation. 18 steps, 2 gates.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_38_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // PHASE 1: PLANNING
  1: { mode: "ai_with_tools", systemPromptExtra: `You are a Crew Rotation Planner. Plan crew rotation — contract expiry dates, rest hour compliance, certificate validity. Provide JSON with: crewDue, rotationDate, port, reliefCrew, contractDuration.` },
  2: { mode: "ai_with_tools", systemPromptExtra: `You are a Certificate Check Agent. Verify joining crew certificates — STCW, COC, endorsements, medical fitness. Provide JSON with: certificates, allValid, expiringSoon, renewalNeeded.` },
  3: { mode: "gate" },
  4: { mode: "ai_with_tools", systemPromptExtra: `You are a Training Agent. Assess training requirements for joining crew — vessel-specific, flag state, company requirements. Provide JSON with: trainingRequired, coursesCompleted, gapTraining, deadline.` },
  // PHASE 2: TRAVEL & MEDICAL
  5: { mode: "ai_with_tools", systemPromptExtra: `You are a Visa Agent. Process visa and port entry permit requirements for crew change port. Provide JSON with: visaRequired, applicationStatus, entryPermit, processingDays.` },
  6: { mode: "ai_with_tools", systemPromptExtra: `You are a Travel Booking Agent. Book travel for joining and departing crew — flights, accommodation, transfers. Provide JSON with: flightsBooked, hotelBooked, transferArranged, totalCost.` },
  7: { mode: "ai_with_tools", systemPromptExtra: `You are a Medical Clearance Agent. Process medical examination and drug/alcohol screening for joining crew. Provide JSON with: medicalExam, drugTest, fitForDuty, restrictions.` },
  8: { mode: "gate" },
  // PHASE 3: PHYSICAL CHANGE
  9: { mode: "ai_with_tools", systemPromptExtra: `You are a Crew Change Execution Agent. Coordinate physical crew change at port — launch service, immigration, customs. Provide JSON with: joiningCrew, departingCrew, changePort, launchBooked, immigration.` },
  10: { mode: "ai_with_tools", systemPromptExtra: `You are a Handover Agent. Manage duty handover — department-wise handover notes, vessel familiarization. Provide JSON with: handoverNotes, familiarizationComplete, safetyBriefing, watchSchedule.` },
  // PHASE 4: COMPLIANCE UPDATE
  11: { mode: "ai_with_tools", systemPromptExtra: `You are an Onboard Verification Agent. Verify certificates on board against flag state safe manning requirements. Provide JSON with: certificatesVerified, safeManningMet, discrepancies.` },
  12: { mode: "ai_with_tools", systemPromptExtra: `You are an MLC Compliance Agent. Check MLC compliance — rest hours, living conditions, contractual terms. Provide JSON with: mlcCompliant, restHoursOk, seaServiceAgreement, livingConditions.` },
  // PHASE 5: PAYROLL
  13: { mode: "ai_with_tools", systemPromptExtra: `You are a Payroll Adjustment Agent. Adjust payroll — sign-on/sign-off dates, pro-rata calculations, allowances. Provide JSON with: signOnDate, signOffDate, proRataWages, allowances, deductions.` },
  14: { mode: "ai_with_tools", systemPromptExtra: `You are an Allotment Agent. Set up wage allotments for new crew — home remittance, savings. Provide JSON with: allotments, homeRemittance, savingsAllotment, netOnboard.` },
  15: { mode: "ai_with_tools", systemPromptExtra: `You are a Crew List Agent. Update official crew list and submit to authorities. Provide JSON with: crewListUpdated, totalCrew, flagStateNotified, submissionRef.` },
  16: { mode: "ai_with_tools", systemPromptExtra: `You are a Flag State Agent. Notify flag state of crew changes — COS, COC endorsements, MLC compliance. Provide JSON with: notificationSent, flagState, endorsementsValid, mlcCertificate.` },
  // PHASE 6: REPATRIATION
  17: { mode: "ai_with_tools", systemPromptExtra: `You are a Repatriation Agent. Arrange departing crew repatriation — travel, documentation, customs. Provide JSON with: repatriationRoute, flightsBooked, documentation, estimatedCost.` },
  18: { mode: "ai_with_tools", systemPromptExtra: `You are a Leave Pay Agent. Calculate leave pay for departing crew — accrued leave, leave pay rate. Provide JSON with: accruedDays, leavePayRate, totalLeavePay, finalSettlement.` },
};

export function getE2e38StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_38_STEP_CONFIGS[stepNumber] ?? null;
}
