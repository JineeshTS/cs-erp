/**
 * E2E-26 Procure-to-Pay — Executor Configuration (D-006 Phase 5)
 *
 * Full P2P cycle from requisition through vendor sourcing, PO,
 * goods receipt, three-way match, and payment. 18 steps, 6 gates.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_26_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // PHASE 1: REQUISITION
  1: { mode: "gate" },
  2: { mode: "gate" },
  // PHASE 2: SOURCING
  3: { mode: "ai_with_tools", systemPromptExtra: `You are a Vendor Onboarding Agent. Check if vendor exists; if new, initiate onboarding — KYC, banking details, compliance. Provide JSON with: vendorExists, onboardingRequired, kycStatus, complianceCheck.` },
  4: { mode: "ai_with_tools", systemPromptExtra: `You are a Vendor Sourcing Agent. Compare vendor quotations — price, lead time, quality, terms. Provide JSON with: quotations, rankedVendors, recommendation, savingsPercent.` },
  5: { mode: "ai_with_tools", systemPromptExtra: `You are a Supplier Scoring Agent. Score suppliers on delivery performance, quality, pricing, compliance. Provide JSON with: supplierScores, weightedScore, riskLevel, recommendation.` },
  6: { mode: "gate" },
  // PHASE 3: PURCHASE ORDER
  7: { mode: "ai_with_tools", systemPromptExtra: `You are a PO Generation Agent. Generate purchase order from approved requisition and selected vendor. Provide JSON with: poNumber, lineItems, totalAmount, deliveryDate, terms.` },
  8: { mode: "gate" },
  // PHASE 4: RECEIPT
  9: { mode: "gate" },
  10: { mode: "ai_with_tools", systemPromptExtra: `You are an Inventory Update Agent. Update inventory records from goods receipt — quantities, locations, lot tracking. Provide JSON with: itemsReceived, inventoryUpdated, locations, discrepancies.` },
  // PHASE 5: INVOICE PROCESSING
  11: { mode: "ai_with_tools", systemPromptExtra: `You are an Invoice Receipt Agent. Capture vendor invoice details — OCR extraction, line matching. Provide JSON with: invoiceNumber, vendorId, lineItems, totalAmount, dueDate.` },
  12: { mode: "ai_with_tools", systemPromptExtra: `You are a Three-Way Match Agent. Match PO → goods receipt → invoice. Flag discrepancies in quantity, price, or amount. Provide JSON with: matchStatus, poAmount, receiptAmount, invoiceAmount, discrepancies.` },
  13: { mode: "ai_with_tools", systemPromptExtra: `You are an Invoice Validation Agent. Validate invoice — tax calculations, duplicate check, GL coding. Provide JSON with: validated, taxCorrect, duplicateCheck, glCodes.` },
  14: { mode: "gate" },
  // PHASE 6: PAYMENT
  15: { mode: "ai_with_tools", systemPromptExtra: `You are a WHT Agent. Calculate withholding tax for foreign vendor payments per treaty rates. Provide JSON with: whtApplicable, whtRate, whtAmount, treatyCountry, netPayable.` },
  16: { mode: "ai_with_tools", systemPromptExtra: `You are a Payment Scheduler. Schedule payment per vendor terms — early payment discount, cash flow optimization. Provide JSON with: paymentDate, discountAvailable, discountAmount, cashFlowImpact.` },
  17: { mode: "ai_with_tools", systemPromptExtra: `You are an FX Hedging Agent. Assess FX exposure for foreign currency payments and recommend hedging. Provide JSON with: exposureAmount, currency, spotRate, forwardRate, hedgingRecommendation.` },
  18: { mode: "ai_with_tools", systemPromptExtra: `You are a Payment Execution Agent. Execute payment and generate remittance advice. Provide JSON with: paymentRef, amount, currency, bankRef, remittanceSent.` },
};

export function getE2e26StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_26_STEP_CONFIGS[stepNumber] ?? null;
}
