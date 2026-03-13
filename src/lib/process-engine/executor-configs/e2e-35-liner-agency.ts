/**
 * E2E-35 Liner Agency Operations — Executor Configuration (D-006 Phase 5)
 *
 * Liner agency from appointment through port call handling,
 * documentation, customer service, and commission settlement. 15 steps, 2 gates.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_35_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // PHASE 1: APPOINTMENT
  1: { mode: "ai_with_tools", systemPromptExtra: `You are an Agency Agreement Agent. Review agency appointment agreement — scope of services, commission rates, KPIs. Provide JSON with: principalName, scope, commissionRate, kpis, effectiveDate.` },
  2: { mode: "gate" },
  // PHASE 2: PORT CALL HANDLING
  3: { mode: "ai_with_tools", systemPromptExtra: `You are a Port Call Handler. Coordinate port call handling for principal's vessel — berth, pilot, tug, stevedore. Provide JSON with: vesselName, services, estimatedCost, timeline.` },
  4: { mode: "ai_with_tools", systemPromptExtra: `You are a Pre-Arrival Agent. Handle pre-arrival formalities on behalf of principal — customs, immigration, port health. Provide JSON with: documentsSubmitted, clearanceStatus, deadlinesMet.` },
  5: { mode: "ai_with_tools", systemPromptExtra: `You are a Husbandry Agent. Coordinate husbandry services — crew change, stores, repairs, provisions. Provide JSON with: servicesArranged, crewChanges, storesDelivered, repairsScheduled.` },
  6: { mode: "ai_with_tools", systemPromptExtra: `You are a Cargo Ops Agent. Coordinate cargo operations for principal — discharge, loading, transshipment. Provide JSON with: containersHandled, discharged, loaded, transshipped, productivity.` },
  // PHASE 3: DOCUMENTATION & DISBURSEMENT
  7: { mode: "ai_with_tools", systemPromptExtra: `You are a Documentation Agent. Handle BL issuance and documentation on behalf of principal. Provide JSON with: blsIssued, manifestFiled, customsCleared.` },
  8: { mode: "ai_with_tools", systemPromptExtra: `You are a DA Estimation Agent. Prepare proforma disbursement account for principal's vessel call. Provide JSON with: portDues, pilotage, towage, berthHire, agencyFee, totalPda.` },
  9: { mode: "ai_with_tools", systemPromptExtra: `You are a DA Reconciliation Agent. Reconcile actual vs proforma disbursement — variance analysis. Provide JSON with: proformaTotal, actualTotal, variance, varianceDetails.` },
  // PHASE 4: CUSTOMER SERVICE
  10: { mode: "ai_with_tools", systemPromptExtra: `You are a Customer Service Agent. Handle customer inquiries and complaints for principal's services at this port. Provide JSON with: inquiriesHandled, complaintsResolved, escalations, satisfaction.` },
  // PHASE 5: SETTLEMENT
  11: { mode: "ai_with_tools", systemPromptExtra: `You are a Commission Calculator. Calculate agency commission per vessel call — base commission plus extras. Provide JSON with: baseCommission, extras, totalCommission, commissionBasis.` },
  12: { mode: "ai_with_tools", systemPromptExtra: `You are a Monthly Settlement Agent. Prepare monthly commission settlement statement for principal. Provide JSON with: vesselCalls, totalCommission, disbursementsAdvanced, netDue, period.` },
  13: { mode: "gate" },
  14: { mode: "ai_with_tools", systemPromptExtra: `You are a Commission Invoice Agent. Generate commission invoice to principal. Provide JSON with: invoiceNumber, amount, currency, dueDate, vesselCallRefs.` },
  15: { mode: "ai_with_tools", systemPromptExtra: `You are a Cash Application Agent. Apply received commission payment to open invoices. Provide JSON with: paymentReceived, invoicesSettled, remainingBalance.` },
};

export function getE2e35StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_35_STEP_CONFIGS[stepNumber] ?? null;
}
