/**
 * Executor Config Registry (D-006 Phase 5)
 *
 * Central registry that maps E2E flow IDs + step numbers to executor configs.
 * All 39 E2E flows registered — complete container shipping lifecycle.
 *
 * Flows without registered configs fall back to the legacy AI step executor.
 */

import type { StepExecutorConfig } from "./executor-configs/e2e-01-lead-to-quote";
import { E2E_01_STEP_CONFIGS } from "./executor-configs/e2e-01-lead-to-quote";
import { E2E_02_STEP_CONFIGS } from "./executor-configs/e2e-02-quote-to-contract";
import { E2E_03_STEP_CONFIGS } from "./executor-configs/e2e-03-customer-onboarding";
import { E2E_04_STEP_CONFIGS } from "./executor-configs/e2e-04-booking-to-cash";
import { E2E_05_STEP_CONFIGS } from "./executor-configs/e2e-05-customer-lifecycle";
import { E2E_06_STEP_CONFIGS } from "./executor-configs/e2e-06-revenue-management";
import { E2E_07_STEP_CONFIGS } from "./executor-configs/e2e-07-collections-credit";
import { E2E_08_STEP_CONFIGS } from "./executor-configs/e2e-08-trade-finance";
import { E2E_09_STEP_CONFIGS } from "./executor-configs/e2e-09-import-container";
import { E2E_10_STEP_CONFIGS } from "./executor-configs/e2e-10-export-container";
import { E2E_11_STEP_CONFIGS } from "./executor-configs/e2e-11-reefer-cargo";
import { E2E_12_STEP_CONFIGS } from "./executor-configs/e2e-12-dg-cargo";
import { E2E_13_STEP_CONFIGS } from "./executor-configs/e2e-13-transshipment";
import { E2E_14_STEP_CONFIGS } from "./executor-configs/e2e-14-oog-special-cargo";
import { E2E_15_STEP_CONFIGS } from "./executor-configs/e2e-15-empty-repositioning";
import { E2E_16_STEP_CONFIGS } from "./executor-configs/e2e-16-container-leasing";
import { E2E_17_STEP_CONFIGS } from "./executor-configs/e2e-17-demurrage-detention";
import { E2E_18_STEP_CONFIGS } from "./executor-configs/e2e-18-vessel-voyage";
import { E2E_19_STEP_CONFIGS } from "./executor-configs/e2e-19-feeder-voyage";
import { E2E_20_STEP_CONFIGS } from "./executor-configs/e2e-20-feeder-connection";
import { E2E_21_STEP_CONFIGS } from "./executor-configs/e2e-21-port-call";
import { E2E_22_STEP_CONFIGS } from "./executor-configs/e2e-22-charter-party";
import { E2E_23_STEP_CONFIGS } from "./executor-configs/e2e-23-vessel-dry-dock";
import { E2E_24_STEP_CONFIGS } from "./executor-configs/e2e-24-service-schedule";
import { E2E_25_STEP_CONFIGS } from "./executor-configs/e2e-25-financial-month-end";
import { E2E_26_STEP_CONFIGS } from "./executor-configs/e2e-26-procure-to-pay";
import { E2E_27_STEP_CONFIGS } from "./executor-configs/e2e-27-bunker-procurement";
import { E2E_28_STEP_CONFIGS } from "./executor-configs/e2e-28-sanctions-compliance";
import { E2E_29_STEP_CONFIGS } from "./executor-configs/e2e-29-maritime-safety";
import { E2E_30_STEP_CONFIGS } from "./executor-configs/e2e-30-claims-lifecycle";
import { E2E_31_STEP_CONFIGS } from "./executor-configs/e2e-31-esg-reporting";
import { E2E_32_STEP_CONFIGS } from "./executor-configs/e2e-32-emergency-salvage";
import { E2E_33_STEP_CONFIGS } from "./executor-configs/e2e-33-trade-route-launch";
import { E2E_34_STEP_CONFIGS } from "./executor-configs/e2e-34-alliance-vsa";
import { E2E_35_STEP_CONFIGS } from "./executor-configs/e2e-35-liner-agency";
import { E2E_36_STEP_CONFIGS } from "./executor-configs/e2e-36-nvocc-lcl";
import { E2E_37_STEP_CONFIGS } from "./executor-configs/e2e-37-fleet-strategy";
import { E2E_38_STEP_CONFIGS } from "./executor-configs/e2e-38-crew-change";
import { E2E_39_STEP_CONFIGS } from "./executor-configs/e2e-39-platform-admin";

// ═══════════════════════════════════════════════════════════
// REGISTRY — All 39 E2E Flows
// ═══════════════════════════════════════════════════════════

const FLOW_CONFIGS: Record<string, Record<number, StepExecutorConfig>> = {
  "E2E-01": E2E_01_STEP_CONFIGS,
  "E2E-02": E2E_02_STEP_CONFIGS,
  "E2E-03": E2E_03_STEP_CONFIGS,
  "E2E-04": E2E_04_STEP_CONFIGS,
  "E2E-05": E2E_05_STEP_CONFIGS,
  "E2E-06": E2E_06_STEP_CONFIGS,
  "E2E-07": E2E_07_STEP_CONFIGS,
  "E2E-08": E2E_08_STEP_CONFIGS,
  "E2E-09": E2E_09_STEP_CONFIGS,
  "E2E-10": E2E_10_STEP_CONFIGS,
  "E2E-11": E2E_11_STEP_CONFIGS,
  "E2E-12": E2E_12_STEP_CONFIGS,
  "E2E-13": E2E_13_STEP_CONFIGS,
  "E2E-14": E2E_14_STEP_CONFIGS,
  "E2E-15": E2E_15_STEP_CONFIGS,
  "E2E-16": E2E_16_STEP_CONFIGS,
  "E2E-17": E2E_17_STEP_CONFIGS,
  "E2E-18": E2E_18_STEP_CONFIGS,
  "E2E-19": E2E_19_STEP_CONFIGS,
  "E2E-20": E2E_20_STEP_CONFIGS,
  "E2E-21": E2E_21_STEP_CONFIGS,
  "E2E-22": E2E_22_STEP_CONFIGS,
  "E2E-23": E2E_23_STEP_CONFIGS,
  "E2E-24": E2E_24_STEP_CONFIGS,
  "E2E-25": E2E_25_STEP_CONFIGS,
  "E2E-26": E2E_26_STEP_CONFIGS,
  "E2E-27": E2E_27_STEP_CONFIGS,
  "E2E-28": E2E_28_STEP_CONFIGS,
  "E2E-29": E2E_29_STEP_CONFIGS,
  "E2E-30": E2E_30_STEP_CONFIGS,
  "E2E-31": E2E_31_STEP_CONFIGS,
  "E2E-32": E2E_32_STEP_CONFIGS,
  "E2E-33": E2E_33_STEP_CONFIGS,
  "E2E-34": E2E_34_STEP_CONFIGS,
  "E2E-35": E2E_35_STEP_CONFIGS,
  "E2E-36": E2E_36_STEP_CONFIGS,
  "E2E-37": E2E_37_STEP_CONFIGS,
  "E2E-38": E2E_38_STEP_CONFIGS,
  "E2E-39": E2E_39_STEP_CONFIGS,
};

/**
 * Get the executor config for a specific step in a specific flow.
 * Returns null if no config is registered (flow uses legacy executor).
 */
export function getExecutorConfig(
  e2eFlowId: string,
  stepNumber: number
): StepExecutorConfig | null {
  const flowConfig = FLOW_CONFIGS[e2eFlowId];
  if (!flowConfig) return null;
  return flowConfig[stepNumber] ?? null;
}

/**
 * Check if a flow has registered executor configs.
 */
export function hasExecutorConfigs(e2eFlowId: string): boolean {
  return e2eFlowId in FLOW_CONFIGS;
}

/**
 * Get all registered flow IDs that have executor configs.
 */
export function getRegisteredFlowIds(): string[] {
  return Object.keys(FLOW_CONFIGS);
}
