/**
 * Executor Config Registry (D-006 Phase 2)
 *
 * Central registry that maps E2E flow IDs + step numbers to executor configs.
 * Currently supports E2E-01 (Lead-to-Quote). New flows are registered by
 * adding their config modules here.
 *
 * Flows without registered configs fall back to the legacy AI step executor.
 */

import type { StepExecutorConfig } from "./executor-configs/e2e-01-lead-to-quote";
import { E2E_01_STEP_CONFIGS } from "./executor-configs/e2e-01-lead-to-quote";
import { E2E_02_STEP_CONFIGS } from "./executor-configs/e2e-02-quote-to-contract";
import { E2E_03_STEP_CONFIGS } from "./executor-configs/e2e-03-customer-onboarding";
import { E2E_04_STEP_CONFIGS } from "./executor-configs/e2e-04-booking-to-cash";

// ═══════════════════════════════════════════════════════════
// REGISTRY
// ═══════════════════════════════════════════════════════════

const FLOW_CONFIGS: Record<string, Record<number, StepExecutorConfig>> = {
  "E2E-01": E2E_01_STEP_CONFIGS,
  "E2E-02": E2E_02_STEP_CONFIGS,
  "E2E-03": E2E_03_STEP_CONFIGS,
  "E2E-04": E2E_04_STEP_CONFIGS,
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
