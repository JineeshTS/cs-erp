/**
 * E2E-02 Quote-to-Contract — Executor Configuration (D-006 Phase 2)
 *
 * Defines how each of the 6 steps executes:
 * - CRUD steps: field mappings from input -> DB columns
 * - AI-with-tools steps: tool definitions for Claude function calling
 * - Gate steps: handled by existing gate logic (no config needed)
 *
 * Step Execution Map:
 * | Step | Name                           | Mode          | Entity Table          | Action |
 * |------|--------------------------------|---------------|-----------------------|--------|
 * | 1    | Customer response capture      | ai_with_tools | scm_rate_quotations   | update |
 * | 2    | AI negotiation strategy        | ai_with_tools | scm_rate_quotations   | update |
 * | 3    | Negotiation decision gate      | gate          | —                     | —      |
 * | 4    | Contract creation              | crud          | scm_contracts         | create |
 * | 5    | Contract legal review gate     | gate          | —                     | —      |
 * | 6    | Contract execution & activation| ai_with_tools | scm_contracts         | update |
 */

import type { Anthropic } from "@anthropic-ai/sdk";
import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

// ═══════════════════════════════════════════════════════════
// E2E-02 STEP CONFIGS
// ═══════════════════════════════════════════════════════════

export const E2E_02_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // ── Step 1: Customer Response Capture (AI with tools → update scm_rate_quotations) ──
  1: {
    mode: "ai_with_tools",
    entityTable: "scm_rate_quotations",
    entityAction: "update",
    systemPromptExtra: `You are a Customer Response Capture agent for a container shipping line. Analyze the customer's response to our quotation — classify as acceptance, counter-offer, or rejection. Extract any counter-rates, requested term changes, and assess customer sentiment.`,
    tools: [
      {
        name: "analyze_customer_response",
        description:
          "Analyze and classify a customer's response to a rate quotation, extracting counter-rates and term changes",
        input_schema: {
          type: "object" as const,
          properties: {
            quotation_id: {
              type: "string",
              description: "UUID of the rate quotation being responded to",
            },
            response_text: {
              type: "string",
              description:
                "The customer's response text to analyze",
            },
            response_type: {
              type: "string",
              enum: ["accept", "counter", "reject", "request_info"],
              description:
                "Classification of the customer response",
            },
          },
          required: ["quotation_id", "response_text", "response_type"],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 2: AI Negotiation Strategy (AI with tools → update scm_rate_quotations) ──
  2: {
    mode: "ai_with_tools",
    entityTable: "scm_rate_quotations",
    entityAction: "update",
    systemPromptExtra: `You are a Negotiation Strategy agent for a container shipping line. Analyze the customer's counter-offer against market rates, our walk-away thresholds, and customer lifetime value. Recommend a counter-rate, identify concession opportunities, and flag if we should walk away.`,
    tools: [
      {
        name: "generate_negotiation_strategy",
        description:
          "Generate a negotiation strategy by analyzing counter-offer against market rates, thresholds, and customer value",
        input_schema: {
          type: "object" as const,
          properties: {
            counter_rate: {
              type: "number",
              description: "The customer's counter-offered rate in USD",
            },
            walk_away_rate: {
              type: "number",
              description:
                "Our minimum acceptable rate (walk-away threshold) in USD",
            },
            market_rate: {
              type: "number",
              description: "Current market rate benchmark in USD",
            },
            customer_lifetime_value: {
              type: "number",
              description:
                "Estimated customer lifetime value in USD (optional)",
            },
          },
          required: ["counter_rate", "walk_away_rate", "market_rate"],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 3: Negotiation Decision Gate ──
  3: {
    mode: "gate",
  },

  // ── Step 4: Contract Creation (CRUD → scm_contracts) ──
  4: {
    mode: "crud",
    entityTable: "scm_contracts",
    entityAction: "create",
    fieldMapping: {
      "Agreed Rate & Terms": "notes",
      "Trade Lanes": "tradeLane",
      "Volume Commitments MQC": "minimumCommitmentTeu",
      "Payment Terms 30/60/90 days": "paymentTermsDays",
      "Contract Type NAC/SC/FAK/Tender": "contractType",
    },
    defaults: {
      status: "draft",
    },
    foreignKeys: {
      customerId: {
        fromStep: 1,
        fromTable: "scm_rate_quotations",
        toColumn: "customerId",
      },
      quotationId: {
        fromStep: 1,
        fromTable: "scm_rate_quotations",
        toColumn: "id",
      },
    },
  },

  // ── Step 5: Contract Legal Review Gate ──
  5: {
    mode: "gate",
  },

  // ── Step 6: Contract Execution & Activation (AI with tools → update scm_contracts) ──
  6: {
    mode: "ai_with_tools",
    entityTable: "scm_contracts",
    entityAction: "update",
    systemPromptExtra: `You are a Contract Activation agent for a container shipping line. Finalize the approved contract by activating rates, setting up volume tracking, and sending customer notification. Mark the contract as active.`,
    tools: [
      {
        name: "activate_contract",
        description:
          "Activate a contract by finalizing rates, setting up volume tracking, and triggering customer notification",
        input_schema: {
          type: "object" as const,
          properties: {
            contract_id: {
              type: "string",
              description: "UUID of the contract to activate",
            },
            activation_date: {
              type: "string",
              description:
                "ISO date string for when the contract becomes active",
            },
          },
          required: ["contract_id", "activation_date"],
        },
      },
    ] as Anthropic.Tool[],
  },
};

/**
 * Get the executor config for a specific step in E2E-02.
 */
export function getE2e02StepConfig(
  stepNumber: number
): StepExecutorConfig | null {
  return E2E_02_STEP_CONFIGS[stepNumber] ?? null;
}
