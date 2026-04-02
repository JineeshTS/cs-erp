/**
 * E2E-14 OOG & Special Cargo — Executor Configuration (D-006 Phase 5)
 *
 * Out-of-gauge and project cargo handling from assessment through
 * lashing, permits, loading, and delivery. 18 steps, 7 human gates.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_14_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  1: { mode: "ai_with_tools", systemPromptExtra: `You are an OOG Assessment Agent. Assess out-of-gauge cargo dimensions, weight, and special handling needs. Calculate flat-rack/open-top requirements and extra slot consumption. Provide JSON with: dimensions, weight, equipmentType, slotsConsumed, handlingRequirements, surchargeEstimate.` },
  2: { mode: "ai_with_tools", systemPromptExtra: `You are a Break-Bulk Assessment Agent. Evaluate break-bulk/project cargo for shipping feasibility — crane capacity, stowage requirements, weather restrictions. Provide JSON with: cargoType, liftingRequirements, craneCapacity, weatherRestrictions, feasible.` },
  3: { mode: "gate" },
  4: { mode: "ai_with_tools", systemPromptExtra: `You are a Project Cargo Planner. Plan the full logistics chain for special cargo — origin pickup, port handling, vessel loading, delivery. Provide JSON with: logisticsPlan, specialEquipment, milestones, riskAssessment.` },
  5: { mode: "ai_with_tools", systemPromptExtra: `You are a Lashing & Securing Agent. Design lashing and securing plan per CSS Code. Calculate material requirements and force calculations. Provide JSON with: lashingPlan, materials, forceCalculations, cssCompliant.` },
  6: { mode: "gate" },
  7: { mode: "ai_with_tools", systemPromptExtra: `You are a Permit Agent. Apply for special cargo permits from port authority. Provide JSON with: permitRequired, permitType, application, estimatedApproval.` },
  8: { mode: "gate" },
  9: { mode: "ai_with_tools", systemPromptExtra: `You are an OOG Stowage Agent. Plan stowage for OOG cargo considering height/width clearances, lashing points, and crane access. Provide JSON with: stowagePosition, clearances, lashingPoints, craneAccess.` },
  10: { mode: "ai_with_tools", systemPromptExtra: `You are a Gate Agent. Process OOG container gate-in with flat-rack/open-top. Provide JSON with: gateInTimestamp, equipmentType, dimensionsVerified.` },
  11: { mode: "gate" },
  12: { mode: "gate" },
  13: { mode: "ai_with_tools", systemPromptExtra: `You are an In-Transit Monitor for special cargo. Monitor deck cargo for weather exposure and lashing integrity. Provide JSON with: weatherConditions, lashingStatus, cargoCondition, alerts.` },
  14: { mode: "gate" },
  15: { mode: "gate" },
  16: { mode: "ai_with_tools", systemPromptExtra: `You are a Special Transport Agent. Coordinate delivery of OOG/project cargo — police escort, route survey, bridge clearances. Provide JSON with: transportPlan, routeSurvey, permits, escort.` },
  17: { mode: "ai_with_tools", systemPromptExtra: `You are a POD Agent. Capture proof of delivery with condition report for special cargo. Provide JSON with: delivered, conditionReport, damageNoted, podReference.` },
  18: { mode: "ai_with_tools", systemPromptExtra: `You are an OOG Invoice Agent. Generate invoice with premium rates for OOG handling — extra slot charges, special equipment, lashing. Provide JSON with: baseFreight, oogSurcharge, lashingCharge, equipmentCharge, totalInvoice.` },
};

export function getE2e14StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_14_STEP_CONFIGS[stepNumber] ?? null;
}
