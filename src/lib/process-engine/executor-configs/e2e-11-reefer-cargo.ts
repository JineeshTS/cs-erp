/**
 * E2E-11 Reefer Cargo Flow — Executor Configuration (D-006 Phase 5)
 *
 * Refrigerated container lifecycle from PTI through cold chain monitoring
 * and temperature-controlled delivery. 18 steps across 5 phases.
 *
 * Most steps are system events or human actions with AI status tracking.
 * No reusable tools — all AI steps produce analytical output.
 *
 * Step Execution Map:
 * | Step | Name                          | Mode          | Entity Table | Action |
 * |------|-------------------------------|---------------|--------------|--------|
 * | 1    | PTI scheduling                | ai_with_tools | —            | —      |
 * | 2    | PTI execution & result        | ai_with_tools | —            | —      |
 * | 3    | PTI gate                      | gate          | —            | —      |
 * | 4    | Pre-cooling verification      | ai_with_tools | —            | —      |
 * | 5    | Shipper stuffing              | human_form    | —            | —      |
 * | 6    | Gate-in + reefer plug         | ai_with_tools | —            | —      |
 * | 7    | Temp monitoring activated     | ai_with_tools | —            | —      |
 * | 8    | Reefer stowage planning       | ai_with_tools | —            | —      |
 * | 9    | Loading + power connection    | ai_with_tools | —            | —      |
 * | 10   | Temperature alert detection   | ai_with_tools | —            | —      |
 * | 11   | Temp alert gate               | gate          | —            | —      |
 * | 12   | Power failure contingency     | ai_with_tools | —            | —      |
 * | 13   | Discharge at destination      | ai_with_tools | —            | —      |
 * | 14   | Cold chain verification       | ai_with_tools | —            | —      |
 * | 15   | Reefer delivery               | ai_with_tools | —            | —      |
 * | 16   | POD with temp log             | ai_with_tools | —            | —      |
 * | 17   | Damage trigger                | ai_with_tools | —            | —      |
 * | 18   | Reefer unit return            | ai_with_tools | —            | —      |
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_11_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // ═══════════════════════════════════════════════════════════
  // PHASE 1: PTI & PRE-COOLING (Steps 1-4)
  // ═══════════════════════════════════════════════════════════

  1: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a PTI Scheduling Agent for a container shipping line.
Schedule a Pre-Trip Inspection for the reefer container:
1. Check container maintenance history and last PTI date
2. Schedule PTI at the depot with technician availability
3. Verify temperature set-point matches booking requirements
4. Confirm power supply availability at depot

Provide your analysis as structured JSON with: containerNumber, scheduledDate, depot, technicianAssigned, requiredTempSetpoint, lastPtiDate.`,
  },

  2: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a PTI Results Agent for a container shipping line.
Process Pre-Trip Inspection results:
1. Record PTI pass/fail status with test details
2. If fail: identify fault (compressor, refrigerant, thermostat, power)
3. Estimate repair time and cost
4. If pass: confirm unit ready for pre-cooling

Provide your analysis as structured JSON with: ptiResult, testDetails (compressor, refrigerant, thermostat, insulation), faultDescription, repairEstimate, readyForUse.`,
  },

  3: { mode: "gate" },

  4: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Pre-Cooling Agent for a container shipping line.
Verify pre-cooling before shipper stuffing:
1. Confirm reefer unit reached target temperature
2. Record pre-cooling duration and temperature log
3. Verify temperature set-point matches commodity requirement
4. Approve for shipper stuffing

Provide your analysis as structured JSON with: targetTemp, achievedTemp, preCoolDuration, tempLog, approvedForStuffing.`,
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 2: STUFFING & GATE-IN (Steps 5-6)
  // ═══════════════════════════════════════════════════════════

  5: { mode: "human_form" },

  6: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Reefer Gate Agent for a container shipping line.
Process reefer container gate-in with power connection:
1. Record gate-in and verify reefer plug connected
2. Confirm temperature reading at gate-in
3. Verify set-point and ventilation settings per booking
4. Start continuous monitoring

Provide your analysis as structured JSON with: containerNumber, gateInTimestamp, plugConnected, tempAtGateIn, setPoint, ventilation.`,
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 3: MONITORING & LOADING (Steps 7-9)
  // ═══════════════════════════════════════════════════════════

  7: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Reefer Monitoring Agent for a container shipping line.
Activate continuous temperature monitoring:
1. Set monitoring interval (every 15 minutes)
2. Define alert thresholds (deviation > 2°C from set-point)
3. Configure alert recipients (operations, customer if requested)
4. Confirm monitoring system operational

Provide your analysis as structured JSON with: monitoringInterval, alertThresholds, alertRecipients, systemStatus.`,
  },

  8: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Reefer Stowage Agent for a container shipping line.
Plan stowage position for the reefer container:
1. Assign position near vessel power outlet
2. Ensure adequate airflow around reefer unit
3. Consider discharge port rotation (accessibility)
4. Verify power capacity at assigned bay

Provide your analysis as structured JSON with: bayPosition, nearestPowerOutlet, airflowClear, powerCapacityOk, dischargeAccessible.`,
  },

  9: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Reefer Loading Agent. Confirm container loaded and connected to vessel power.
Provide JSON with: containerNumber, loadedTimestamp, powerConnected, tempAtLoading.`,
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 4: AT-SEA MONITORING (Steps 10-12)
  // ═══════════════════════════════════════════════════════════

  10: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Temperature Alert Agent for a container shipping line.
Detect and analyze temperature anomalies during voyage:
1. Compare current reading vs set-point
2. Classify alert severity: warning (1-2°C deviation) or critical (> 2°C)
3. Identify possible cause (power fluctuation, door seal, defrost cycle)
4. Recommend crew action

Provide your analysis as structured JSON with: currentTemp, setPoint, deviation, severity, possibleCause, recommendedAction, alertTimestamp.`,
  },

  11: { mode: "gate" },

  12: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Power Failure Contingency Agent for a container shipping line.
Handle reefer power failure during voyage:
1. Assess cargo type and maximum temperature excursion tolerance
2. Calculate time until cargo damage threshold
3. Recommend: switch to genset, prioritize power allocation, or emergency discharge
4. Notify customer of situation

Provide your analysis as structured JSON with: failureTimestamp, cargoDamageTolerance, timeToThreshold, contingencyPlan, customerNotified.`,
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 5: DISCHARGE & DELIVERY (Steps 13-18)
  // ═══════════════════════════════════════════════════════════

  13: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Reefer Discharge Agent. Process reefer discharge maintaining cold chain.
Provide JSON with: dischargeTimestamp, tempAtDischarge, coldChainMaintained, nextPowerConnection.`,
  },

  14: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Cold Chain Verification Agent for a container shipping line.
Generate cold chain verification report:
1. Compile full temperature log from origin to destination
2. Identify any excursions beyond tolerance
3. Calculate total time above/below threshold
4. Certify cold chain integrity or flag potential damage

Provide your analysis as structured JSON with: coldChainIntact, totalExcursions, maxDeviation, excursionDuration, certificationStatus, tempLogSummary.`,
  },

  15: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Reefer Delivery Agent. Plan reefer delivery maintaining temperature.
Provide JSON with: deliveryPlan, reeferTruckRequired, transitTime, tempMonitoringContinued.`,
  },

  16: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a POD Agent. Capture proof of delivery with temperature log handover.
Provide JSON with: podTimestamp, recipientName, tempLogHandedOver, finalTemp, podReference.`,
  },

  17: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Damage Assessment Agent. If cold chain breach detected, trigger E2E-30 (Cargo Claims).
Provide JSON with: damageDetected, triggerClaim, claimType, estimatedDamageValue.`,
  },

  18: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are an Equipment Return Agent. Process reefer unit return and inspection.
Provide JSON with: returnTimestamp, unitCondition, defrosted, cleaningRequired, nextPtiDue.`,
  },
};

export function getE2e11StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_11_STEP_CONFIGS[stepNumber] ?? null;
}
