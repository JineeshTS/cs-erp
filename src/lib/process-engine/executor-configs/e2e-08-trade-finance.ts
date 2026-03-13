/**
 * E2E-08 Trade Finance & Letter of Credit — Executor Configuration (D-006 Phase 5)
 *
 * L/C lifecycle from receipt through document compliance, bank presentation,
 * and settlement. 15 steps across 4 phases.
 *
 * Reuses finance tools: apply_cash (step 13), recognize_revenue (step 15).
 * System steps (1, 9) treated as AI status tracking.
 *
 * Step Execution Map:
 * | Step | Name                          | Mode          | Entity Table           | Action |
 * |------|-------------------------------|---------------|------------------------|--------|
 * | 1    | L/C receipt                   | ai_with_tools | —                      | —      |
 * | 2    | L/C terms checking            | ai_with_tools | —                      | —      |
 * | 3    | L/C gate                      | gate          | —                      | —      |
 * | 4    | Track L/C expiry              | ai_with_tools | —                      | —      |
 * | 5    | BL compliance with L/C        | ai_with_tools | —                      | —      |
 * | 6    | Invoice matching L/C          | ai_with_tools | —                      | —      |
 * | 7    | Document set preparation      | ai_with_tools | —                      | —      |
 * | 8    | Document gate                 | gate          | —                      | —      |
 * | 9    | Present to bank               | ai_with_tools | —                      | —      |
 * | 10   | Handle discrepancies          | ai_with_tools | —                      | —      |
 * | 11   | Discrepancy gate              | gate          | —                      | —      |
 * | 12   | Track bank acceptance         | ai_with_tools | —                      | —      |
 * | 13   | Cash application              | ai_with_tools | arcc_cash_applications | create |
 * | 14   | FX gain/loss                  | ai_with_tools | —                      | —      |
 * | 15   | Revenue recognition           | ai_with_tools | cfm_revenue_recognitions| create |
 */

import type { Anthropic } from "@anthropic-ai/sdk";
import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_08_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // ── Step 1: L/C Receipt (system/tracking) ──
  1: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Trade Finance Agent for a container shipping line.
Process the receipt of a Letter of Credit from the advising bank:
1. Verify L/C authenticity and advising bank details
2. Extract key terms: amount, currency, expiry date, latest shipment date
3. Log receipt with timestamp and reference number
4. Identify the related booking or contract

Provide your analysis as structured JSON with: lcReference, issuingBank, advisingBank, amount, currency, expiryDate, latestShipmentDate, relatedBooking.`,
  },

  // ── Step 2: L/C Terms Checking ──
  2: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Trade Finance Compliance Agent for a container shipping line.
Check L/C terms against the booking and contract:
1. Verify amount covers expected freight charges plus surcharges
2. Check latest shipment date allows sufficient time
3. Verify document requirements are achievable (BL type, certificates)
4. Identify any non-standard or onerous conditions
5. Flag discrepancies between L/C terms and contract

Provide your analysis as structured JSON with: termsCompliant, discrepancies (array), riskItems, recommendations, documentRequirements.`,
  },

  3: { mode: "gate" },

  // ── Step 4: Track L/C Expiry & Deadlines ──
  4: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Trade Finance Tracking Agent for a container shipping line.
Monitor L/C deadlines:
1. Days until latest shipment date
2. Days until L/C expiry date
3. Days until document presentation deadline (typically 21 days after shipment)
4. Alert if any deadline is within 7 days

Provide your analysis as structured JSON with: lcReference, latestShipmentDate, expiryDate, presentationDeadline, daysRemaining, alerts.`,
  },

  // ── Step 5: BL Compliance with L/C Terms ──
  5: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Document Compliance Agent for a container shipping line.
Verify the Bill of Lading complies with L/C requirements:
1. Check consignee/notify party match L/C requirements
2. Verify port names match exactly (SWIFT spelling)
3. Confirm cargo description matches L/C commodity description
4. Verify BL is "clean on board" as typically required
5. Check "shipped on board" date is before latest shipment date

Provide your analysis as structured JSON with: blCompliant, discrepancies, correctiveActions.`,
  },

  // ── Step 6: Invoice Matching L/C ──
  6: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Trade Finance Invoice Agent for a container shipping line.
Verify the commercial invoice matches L/C requirements:
1. Invoice amount does not exceed L/C amount
2. Currency matches L/C currency
3. Goods description matches exactly (UCP 600 Article 18)
4. Incoterms are consistent
5. No charges that conflict with L/C terms

Provide your analysis as structured JSON with: invoiceCompliant, invoiceAmount, lcAmount, discrepancies, correctiveActions.`,
  },

  // ── Step 7: Document Set Preparation ──
  7: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Document Preparation Agent for a container shipping line.
Prepare the complete document set for bank presentation:
1. Compile required documents per L/C (BL, invoice, packing list, certificates)
2. Verify document count (e.g., 3/3 original BLs)
3. Check all documents are dated and signed correctly
4. Prepare covering letter for negotiating bank

Provide your analysis as structured JSON with: documentsComplete, documentList (array with type, count, status), missingDocuments, coveringLetter.`,
  },

  8: { mode: "gate" },

  // ── Step 9: Present Documents to Bank (system/tracking) ──
  9: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Trade Finance Agent for a container shipping line.
Log the document presentation to the negotiating bank:
1. Record presentation date and time
2. Track document receipt confirmation
3. Note the 5 banking-day examination period (UCP 600)
4. Set follow-up reminder for bank response

Provide your analysis as structured JSON with: presentationDate, bankName, receiptConfirmed, examinationDeadline, followUpDate.`,
  },

  // ── Step 10: Handle Discrepancies ──
  10: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Trade Finance Discrepancy Agent for a container shipping line.
Handle document discrepancies raised by the bank:
1. Classify each discrepancy (typographical, substantive, timing)
2. Assess if discrepancy can be corrected by amending documents
3. Determine if L/C amendment is needed
4. Estimate cost and time impact of each resolution option

Provide your analysis as structured JSON with: discrepancies (array with description, severity, resolution, cost), recommendedAction, timeImpact.`,
  },

  11: { mode: "gate" },

  // ── Step 12: Track Bank Acceptance ──
  12: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Trade Finance Settlement Agent for a container shipping line.
Track bank acceptance and payment timeline:
1. Confirm documents accepted without discrepancy (or with waiver)
2. Calculate payment due date (sight L/C: immediate; usance: maturity date)
3. Track SWIFT payment messages
4. Flag if payment is overdue

Provide your analysis as structured JSON with: accepted, acceptanceDate, paymentTerms, paymentDueDate, paymentStatus, swiftRef.`,
  },

  // ── Step 13: Cash Application on L/C Payment ──
  13: {
    mode: "ai_with_tools",
    entityTable: "arcc_cash_applications",
    entityAction: "create",
    systemPromptExtra: `You are a Cash Application Agent for a container shipping line.
Apply L/C payment received to the freight invoice:
1. Match SWIFT payment to the L/C and related invoice
2. Verify amount received matches expected (net of bank charges)
3. Apply payment to outstanding invoice
4. Handle partial payment or overpayment if applicable

Use the apply_cash tool to create the cash application record.`,
    tools: [
      {
        name: "apply_cash",
        description: "Apply L/C payment to the freight invoice",
        input_schema: {
          type: "object" as const,
          properties: {
            invoiceId: { type: "string", description: "UUID of the freight invoice" },
            paymentAmount: { type: "number", description: "Amount received in USD" },
            paymentReference: { type: "string", description: "SWIFT payment reference" },
            paymentMethod: {
              type: "string",
              enum: ["wire_transfer", "check", "credit_card", "lc"],
              description: "Payment method",
            },
          },
          required: ["invoiceId", "paymentAmount", "paymentReference", "paymentMethod"],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 14: FX Gain/Loss Calculation ──
  14: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Treasury Agent for a container shipping line.
Calculate FX gain or loss if L/C is in foreign currency:
1. Compare booking rate (at invoice date) vs settlement rate (at payment date)
2. Calculate realized FX gain or loss
3. Determine accounting treatment (P&L vs balance sheet)
4. Prepare journal entry for FX difference

Provide your analysis as structured JSON with: invoiceCurrency, invoiceAmount, bookingRate, settlementRate, fxGainLoss, accountingEntry.`,
  },

  // ── Step 15: Revenue Recognition ──
  15: {
    mode: "ai_with_tools",
    entityTable: "cfm_revenue_recognitions",
    entityAction: "create",
    systemPromptExtra: `You are a Revenue Recognition Agent for a container shipping line.
Recognize freight revenue upon completion of L/C settlement:
1. Determine revenue recognition point (BL date, delivery date, or payment date)
2. Allocate revenue to appropriate period
3. Split revenue across performance obligations if applicable
4. Create revenue recognition entry

Use the recognize_revenue tool to create the record.`,
    tools: [
      {
        name: "recognize_revenue",
        description: "Create a revenue recognition entry for L/C-settled freight",
        input_schema: {
          type: "object" as const,
          properties: {
            invoiceId: { type: "string", description: "UUID of the freight invoice" },
            revenueAmount: { type: "number", description: "Revenue amount to recognize in USD" },
            recognitionDate: { type: "string", description: "ISO date for revenue recognition" },
            voyageId: { type: "string", description: "Related voyage ID (optional)" },
          },
          required: ["invoiceId", "revenueAmount", "recognitionDate"],
        },
      },
    ] as Anthropic.Tool[],
  },
};

export function getE2e08StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_08_STEP_CONFIGS[stepNumber] ?? null;
}
