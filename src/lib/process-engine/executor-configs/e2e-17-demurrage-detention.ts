/**
 * E2E-17 Demurrage & Detention — Executor Configuration (D-006 Phase 5)
 *
 * D&D charge lifecycle from free time calculation through invoicing,
 * dispute resolution, and collection. 15 steps, 3 gates.
 *
 * Reuses finance tools: generate_freight_invoice (4), calculate_tax (5),
 * apply_cash (11), recognize_revenue (15).
 */

import type { Anthropic } from "@anthropic-ai/sdk";
import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_17_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  1: { mode: "ai_with_tools", systemPromptExtra: `You are a Free Time Calculator. Calculate free time from gate events — demurrage (port) and detention (customer). Apply contract/tariff free days. Provide JSON with: gateInDate, gateOutDate, freeTimeDays, demurrageDays, detentionDays.` },
  2: { mode: "ai_with_tools", systemPromptExtra: `You are a D&D Tariff Agent. Look up applicable D&D tariff rates by port, customer, and contract. Apply tiered rates (days 1-5, 6-10, 11+). Provide JSON with: demurrageRate, detentionRate, tiers, contractOverride.` },
  3: { mode: "ai_with_tools", systemPromptExtra: `You are a D&D Charge Calculator. Calculate total D&D charges. Provide JSON with: demurrageAmount, detentionAmount, totalCharges, breakdown.` },
  4: {
    mode: "ai_with_tools",
    entityTable: "firm_freight_invoices",
    entityAction: "create",
    systemPromptExtra: `You are a D&D Invoice Agent. Generate D&D invoice with charge breakdown and gate event proof. Use the generate_freight_invoice tool.`,
    tools: [{
      name: "generate_freight_invoice",
      description: "Generate a D&D invoice",
      input_schema: {
        type: "object" as const,
        properties: {
          customerId: { type: "string", description: "Customer UUID" },
          invoiceType: { type: "string", description: "demurrage_detention" },
          currency: { type: "string", description: "Invoice currency" },
          lineItems: { type: "array", items: { type: "object", properties: { description: { type: "string" }, amount: { type: "number" }, quantity: { type: "number" } } }, description: "D&D charge line items" },
        },
        required: ["customerId", "invoiceType", "currency", "lineItems"],
      },
    }] as Anthropic.Tool[],
  },
  5: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Tax Agent. Calculate applicable tax on D&D charges. Use the calculate_tax tool.`,
    tools: [{
      name: "calculate_tax",
      description: "Calculate tax on D&D invoice",
      input_schema: {
        type: "object" as const,
        properties: {
          invoiceId: { type: "string", description: "Invoice UUID" },
          jurisdiction: { type: "string", description: "Tax jurisdiction" },
          taxableAmount: { type: "number", description: "Taxable amount" },
        },
        required: ["invoiceId", "jurisdiction", "taxableAmount"],
      },
    }] as Anthropic.Tool[],
  },
  6: { mode: "ai_with_tools", systemPromptExtra: `You are a D&D Notification Agent. Notify customer of D&D charges with gate event proof attached. Provide JSON with: notificationSent, customerRef, attachments, responseDeadline.` },
  7: { mode: "ai_with_tools", systemPromptExtra: `You are a Dispute Detection Agent. Check if customer has filed a dispute against D&D charges. Provide JSON with: disputeFiled, disputeReason, disputedAmount.` },
  8: { mode: "gate" },
  9: { mode: "ai_with_tools", systemPromptExtra: `You are a Complaint Handler for D&D disputes. Verify customer's dispute — check gate events, free time, tariff application. Provide JSON with: disputeValid, verification, recommendedAction.` },
  10: { mode: "gate" },
  11: {
    mode: "ai_with_tools",
    entityTable: "arcc_cash_applications",
    entityAction: "create",
    systemPromptExtra: `You are a Cash Application Agent. Apply D&D payment to invoice. Use the apply_cash tool.`,
    tools: [{
      name: "apply_cash",
      description: "Apply D&D payment to invoice",
      input_schema: {
        type: "object" as const,
        properties: {
          invoiceId: { type: "string", description: "Invoice UUID" },
          paymentAmount: { type: "number", description: "Payment amount" },
          paymentReference: { type: "string", description: "Payment reference" },
          paymentMethod: { type: "string", enum: ["wire_transfer", "check", "credit_card", "lc"], description: "Payment method" },
        },
        required: ["invoiceId", "paymentAmount", "paymentReference", "paymentMethod"],
      },
    }] as Anthropic.Tool[],
  },
  12: { mode: "ai_with_tools", systemPromptExtra: `You are a Dunning Agent for unpaid D&D. Generate collection reminder. Provide JSON with: dunningLevel, amount, daysOverdue, communicationDraft.` },
  13: { mode: "ai_with_tools", systemPromptExtra: `You are an AR Aging Agent. Update AR aging for D&D receivables. Provide JSON with: agingBucket, totalOutstanding, daysOverdue.` },
  14: { mode: "gate" },
  15: {
    mode: "ai_with_tools",
    entityTable: "cfm_revenue_recognitions",
    entityAction: "create",
    systemPromptExtra: `You are a Revenue Recognition Agent. Recognize D&D revenue. Use the recognize_revenue tool.`,
    tools: [{
      name: "recognize_revenue",
      description: "Recognize D&D revenue",
      input_schema: {
        type: "object" as const,
        properties: {
          invoiceId: { type: "string", description: "Invoice UUID" },
          revenueAmount: { type: "number", description: "Revenue amount" },
          recognitionDate: { type: "string", description: "Recognition date" },
          voyageId: { type: "string", description: "Related voyage" },
        },
        required: ["invoiceId", "revenueAmount", "recognitionDate"],
      },
    }] as Anthropic.Tool[],
  },
};

export function getE2e17StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_17_STEP_CONFIGS[stepNumber] ?? null;
}
