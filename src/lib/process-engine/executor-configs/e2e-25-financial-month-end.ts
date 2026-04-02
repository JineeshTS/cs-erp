/**
 * E2E-25 Financial Month-End — Executor Configuration (D-006 Phase 5)
 *
 * Period close from revenue accruals through bank reconciliation,
 * GL consolidation, and management reporting. 8 steps, 2 gates.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_25_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // PHASE 1: ACCRUALS & ALLOCATIONS
  1: { mode: "ai_with_tools", systemPromptExtra: `You are a Revenue Accruals Agent. Calculate revenue accruals for in-transit cargo using percentage-of-completion method. Provide JSON with: accruedRevenue, inTransitShipments, completionPercent, adjustments.` },
  2: { mode: "ai_with_tools", systemPromptExtra: `You are a Cost Allocation Agent. Allocate costs and perform FX revaluation on open balances. Provide JSON with: costAllocations, fxGainLoss, revaluedBalances, baseCurrency.` },
  // PHASE 2: BANK & CASH RECONCILIATION
  3: { mode: "ai_with_tools", systemPromptExtra: `You are a Bank Reconciliation Agent. Reconcile bank statements against GL — match transactions, identify discrepancies. Provide JSON with: matchedTransactions, unmatchedBank, unmatchedGL, reconciledBalance.` },
  4: { mode: "gate" },
  // PHASE 3: PERIOD CLOSE
  5: { mode: "ai_with_tools", systemPromptExtra: `You are a Journal Entry Agent. Generate period-end journal entries and consolidate GL across entities. Provide JSON with: journalEntries, consolidationAdjustments, intercompanyEliminations.` },
  6: { mode: "ai_with_tools", systemPromptExtra: `You are a Period Close Agent. Execute period close — generate trial balance, P&L, balance sheet. Provide JSON with: trialBalance, pnlSummary, balanceSheet, periodStatus.` },
  7: { mode: "gate" },
  // PHASE 4: REPORTING
  8: { mode: "ai_with_tools", systemPromptExtra: `You are a Management Reporting Agent. Generate management reports and KPI dashboard — revenue per TEU, cost per voyage, margin analysis. Provide JSON with: kpis, revenuePerTeu, costPerVoyage, marginPercent, dashboardData.` },
};

export function getE2e25StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_25_STEP_CONFIGS[stepNumber] ?? null;
}
