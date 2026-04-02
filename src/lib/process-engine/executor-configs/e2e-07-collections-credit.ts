/**
 * E2E-07 Collections & Credit Control — Executor Configuration (D-006 Phase 5)
 *
 * Progressive collections workflow from aging analysis through dunning,
 * enforcement, resolution, and settlement. 16 steps across 5 phases.
 * Triggered on invoice.overdue.
 *
 * Reuses finance tools: check_credit (step 2), apply_cash (step 14).
 * Step 4 is a system auto-escalation (no human or AI action).
 *
 * Step Execution Map:
 * | Step | Name                          | Mode          | Entity Table            | Action |
 * |------|-------------------------------|---------------|-------------------------|--------|
 * | 1    | AR aging analysis             | ai_with_tools | —                       | —      |
 * | 2    | Credit utilization check      | ai_with_tools | arcc_credit_limits      | read   |
 * | 3    | Dunning — level 1 reminder    | ai_with_tools | —                       | —      |
 * | 4    | Auto-escalate (7 days)        | ai_with_tools | —                       | —      |
 * | 5    | Dunning — level 2 warning     | ai_with_tools | —                       | —      |
 * | 6    | Collections gate              | gate          | —                       | —      |
 * | 7    | Credit limit suspension       | ai_with_tools | arcc_credit_limits      | update |
 * | 8    | Booking hold notification     | ai_with_tools | —                       | —      |
 * | 9    | Dunning — level 3 legal       | ai_with_tools | —                       | —      |
 * | 10   | Legal gate                    | gate          | —                       | —      |
 * | 11   | Credit insurance claim        | ai_with_tools | —                       | —      |
 * | 12   | Complaint handling            | ai_with_tools | —                       | —      |
 * | 13   | Payment plan gate             | gate          | —                       | —      |
 * | 14   | Cash application              | ai_with_tools | arcc_cash_applications  | create |
 * | 15   | Write-off gate                | gate          | —                       | —      |
 * | 16   | Bad debt journal entry        | ai_with_tools | —                       | —      |
 */

import type { Anthropic } from "@anthropic-ai/sdk";
import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

// ═══════════════════════════════════════════════════════════
// E2E-07 STEP CONFIGS (16 Steps, 5 Phases)
// ═══════════════════════════════════════════════════════════

export const E2E_07_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // ═══════════════════════════════════════════════════════════
  // PHASE 1: AGING ANALYSIS (Steps 1-2)
  // ═══════════════════════════════════════════════════════════

  // ── Step 1: AR Aging Analysis (AI analysis) ──
  1: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are an AR Aging Analysis Agent for a container shipping line.
Analyze accounts receivable aging to identify overdue invoices requiring collection:
1. Categorize outstanding invoices by aging bucket (current, 1-30, 31-60, 61-90, 90+)
2. Calculate total exposure per customer and per aging bucket
3. Prioritize collection effort by amount, aging, and customer risk rating
4. Flag invoices approaching credit limit breach

Provide your analysis as structured JSON with: agingBuckets (array with bucket, invoiceCount, totalAmount), customerExposures (array with customer, totalOverdue, oldestDays, riskRating), prioritizedActions, totalOverdueAmount.`,
  },

  // ── Step 2: Credit Utilization Check (AI → read arcc_credit_limits) ──
  2: {
    mode: "ai_with_tools",
    entityTable: "arcc_credit_limits",
    entityAction: "read",
    systemPromptExtra: `You are a Credit Utilization Agent for a container shipping line.
Check credit limit utilization for customers with overdue invoices:
1. Calculate current utilization (outstanding AR / credit limit)
2. Identify customers near or over credit limit
3. Assess impact of overdue amounts on available credit
4. Flag customers whose new bookings should be held

Use the check_credit tool to read the customer's credit limit data.`,
    tools: [
      {
        name: "check_credit",
        description: "Check a customer's credit limit utilization and available credit",
        input_schema: {
          type: "object" as const,
          properties: {
            customerId: { type: "string", description: "UUID of the customer to check" },
          },
          required: ["customerId"],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 2: PROGRESSIVE DUNNING (Steps 3-6)
  // ═══════════════════════════════════════════════════════════

  // ── Step 3: Dunning Level 1 — Friendly Reminder (AI analysis) ──
  3: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Collections Agent for a container shipping line.
Generate a level 1 dunning communication — friendly payment reminder:
1. Draft professional but friendly reminder email/letter
2. List overdue invoices with amounts and due dates
3. Include payment instructions and bank details
4. Set response deadline (7 days)

Tone: Polite, assumes oversight or processing delay.
Provide your analysis as structured JSON with: dunningLevel, invoices (array with invoiceRef, amount, dueDate, daysOverdue), communicationDraft, responseDeadline.`,
  },

  // ── Step 4: Auto-Escalate After 7 Days (system step) ──
  4: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Dunning Escalation System for a container shipping line.
This is an automatic escalation check:
1. Verify whether payment has been received since level 1 reminder
2. If unpaid after 7 days, escalate to level 2 dunning
3. Update collection status to "escalated"
4. Log escalation timestamp and reason

Provide your analysis as structured JSON with: escalated, daysSinceLevel1, paymentReceived, escalationReason, nextAction.`,
  },

  // ── Step 5: Dunning Level 2 — Formal Warning (AI analysis) ──
  5: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Collections Agent for a container shipping line.
Generate a level 2 dunning communication — formal payment demand:
1. Draft formal demand letter referencing prior reminder
2. State consequences: booking hold, credit suspension, late fees
3. Specify final payment deadline (7 days from this notice)
4. Include escalation path (collections manager contact)

Tone: Firm, professional, clear consequences.
Provide your analysis as structured JSON with: dunningLevel, totalOverdueAmount, invoices, communicationDraft, consequences, finalDeadline.`,
  },

  // ── Step 6: Collections Gate — review and decide action ──
  6: {
    mode: "gate",
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 3: ENFORCEMENT (Steps 7-10)
  // ═══════════════════════════════════════════════════════════

  // ── Step 7: Credit Limit Suspension (AI → update arcc_credit_limits) ──
  7: {
    mode: "ai_with_tools",
    entityTable: "arcc_credit_limits",
    entityAction: "update",
    systemPromptExtra: `You are a Credit Control Agent for a container shipping line.
Suspend or reduce credit limit for customers with persistent non-payment:
1. Determine appropriate action: full suspension, reduction, or conditional hold
2. Calculate revised credit limit based on payment behavior
3. Set conditions for reinstatement (full payment, payment plan)
4. Notify relevant parties (sales, operations, finance)

Use the check_credit tool to read current limits before making changes.
Provide your analysis as structured JSON with: action, previousLimit, revisedLimit, reason, reinstatementConditions, notificationsSent.`,
    tools: [
      {
        name: "check_credit",
        description: "Read current credit limit to determine suspension or reduction",
        input_schema: {
          type: "object" as const,
          properties: {
            customerId: { type: "string", description: "UUID of the customer" },
          },
          required: ["customerId"],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 8: Booking Hold Notification (AI analysis) ──
  8: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Notification Agent for a container shipping line.
Generate booking hold notifications for customers with suspended credit:
1. Draft notification to customer explaining booking hold status
2. Notify internal teams: booking desk, sales rep, account manager
3. Set booking system flag to block new bookings
4. Specify conditions for hold release

Provide your analysis as structured JSON with: customerName, holdReason, customerNotification, internalNotifications, holdConditions, estimatedResolutionDate.`,
  },

  // ── Step 9: Dunning Level 3 — Legal Notice (AI analysis) ──
  9: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Legal Collections Agent for a container shipping line.
Generate a level 3 dunning — formal legal notice (letter before action):
1. Draft formal legal notice citing contract terms and breach
2. State total amount due including late payment interest
3. Set final deadline (typically 14 days) before legal proceedings
4. Reference applicable jurisdiction and governing law

Tone: Strictly formal, legal language.
Provide your analysis as structured JSON with: dunningLevel, totalDueWithInterest, interestCalculation, legalNotice, jurisdiction, finalDeadline, nextSteps.`,
  },

  // ── Step 10: Legal Gate — authorize legal action ──
  10: {
    mode: "gate",
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 4: RESOLUTION (Steps 11-13)
  // ═══════════════════════════════════════════════════════════

  // ── Step 11: Credit Insurance Claim (AI analysis) ──
  11: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Credit Insurance Agent for a container shipping line.
File a credit insurance claim for non-payment (if customer is insured):
1. Verify credit insurance coverage for this customer/amount
2. Prepare claim documentation (invoices, dunning history, proof of delivery)
3. Calculate claimable amount (coverage percentage, deductible)
4. Submit claim to insurer with supporting documentation

Provide your analysis as structured JSON with: insured, coveragePercent, deductible, claimableAmount, claimDocuments, claimRef, submissionDate.`,
  },

  // ── Step 12: Complaint Handling (AI analysis) ──
  12: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Customer Service Agent for a container shipping line.
Handle customer complaints or disputes related to collection actions:
1. Classify the complaint type (billing error, service issue, rate dispute, damaged cargo)
2. Verify complaint validity against records
3. Recommend resolution (credit note, adjustment, rejection with explanation)
4. Determine if collection should be paused pending resolution

Provide your analysis as structured JSON with: complaintType, validity, disputedAmount, verificationResult, recommendedResolution, collectionPaused, resolutionDeadline.`,
  },

  // ── Step 13: Payment Plan Gate — approve installment terms ──
  13: {
    mode: "gate",
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 5: SETTLEMENT (Steps 14-16)
  // ═══════════════════════════════════════════════════════════

  // ── Step 14: Cash Application (AI → create arcc_cash_applications) ──
  14: {
    mode: "ai_with_tools",
    entityTable: "arcc_cash_applications",
    entityAction: "create",
    systemPromptExtra: `You are a Cash Application Agent for a container shipping line.
Apply received payments to outstanding overdue invoices:
1. Match payment to invoices (by reference, amount, or customer)
2. Apply payment in aging order (oldest first) or per customer instruction
3. Handle partial payments and overpayments
4. Update invoice status (paid, partial, overpaid)

Use the apply_cash tool to create the cash application record.`,
    tools: [
      {
        name: "apply_cash",
        description: "Apply a received payment to outstanding invoices and create a cash application record",
        input_schema: {
          type: "object" as const,
          properties: {
            invoiceId: { type: "string", description: "UUID of the invoice to apply payment against" },
            paymentAmount: { type: "number", description: "Amount of payment received in USD" },
            paymentReference: { type: "string", description: "Bank payment reference or transaction ID" },
            paymentMethod: {
              type: "string",
              enum: ["wire_transfer", "check", "credit_card", "lc"],
              description: "Payment method used",
            },
          },
          required: ["invoiceId", "paymentAmount", "paymentReference", "paymentMethod"],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 15: Write-Off Gate — approve bad debt write-off ──
  15: {
    mode: "gate",
  },

  // ── Step 16: Bad Debt Journal Entry (AI analysis) ──
  16: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Finance Agent for a container shipping line.
Post journal entries for an approved bad debt write-off:
1. Debit: Bad Debt Expense account
2. Credit: Accounts Receivable account
3. Credit: Allowance for Doubtful Accounts (if using allowance method)
4. Include supporting documentation references

Calculate tax implications if applicable.

Provide your analysis as structured JSON with: journalEntries (array with account, debit, credit, description), writeOffAmount, taxImplication, supportingDocRefs, effectiveDate.`,
  },
};

/**
 * Get the executor config for a specific step in E2E-07.
 */
export function getE2e07StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_07_STEP_CONFIGS[stepNumber] ?? null;
}
