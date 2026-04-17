/**
 * E2E-01 Lead-to-Quote — Executor Configuration (D-006 Phase 2)
 *
 * Defines how each of the 10 steps executes:
 * - CRUD steps: field mappings from input → DB columns
 * - AI-with-tools steps: tool definitions for Claude function calling
 * - Gate steps: handled by existing gate logic (no config needed)
 *
 * Step Execution Map:
 * | Step | Name                       | Mode          | Entity Table          | Action |
 * |------|----------------------------|---------------|-----------------------|--------|
 * | 1    | Lead capture               | crud          | scm_leads             | create |
 * | 2    | Lead scoring               | ai_with_tools | scm_leads             | update |
 * | 3    | Sales qualification gate   | gate          | —                     | —      |
 * | 4    | Opportunity creation       | crud          | scm_opportunities     | create |
 * | 5    | Credit pre-assessment      | ai_with_tools | scm_leads             | update |
 * | 6    | Sanctions screening        | ai_with_tools | scm_leads             | update |
 * | 7    | Compliance exception gate  | gate          | —                     | —      |
 * | 8    | Rate calculation           | ai_with_tools | scm_rate_quotations   | create |
 * | 9    | Quote generation           | crud          | scm_rate_quotations   | update |
 * | 10   | Rate approval gate         | gate          | —                     | —      |
 */

import type { Anthropic } from "@anthropic-ai/sdk";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface StepExecutorConfig {
  mode: "crud" | "ai_with_tools" | "gate" | "human_form";
  entityTable?: string;
  entityAction?: "create" | "update" | "read";
  /** For CRUD mode: maps input field names → DB column names */
  fieldMapping?: Record<string, string>;
  /** For CRUD mode: default values to set on entity creation */
  defaults?: Record<string, unknown>;
  /** For CRUD mode: which prior step's entity provides the FK (e.g., step 1's lead_id for opportunity) */
  foreignKeys?: Record<string, { fromStep: number; fromTable: string; toColumn: string }>;
  /** For AI mode: tool definitions for Claude function calling */
  tools?: Anthropic.Tool[];
  /** For AI mode: system prompt additions specific to this step */
  systemPromptExtra?: string;
}

// ═══════════════════════════════════════════════════════════
// E2E-01 STEP CONFIGS
// ═══════════════════════════════════════════════════════════

export const E2E_01_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // ── Step 1: Lead Capture (Human Form → user creates lead in CRM, then links it) ──
  // CSERP-024 fix: Changed from "crud" to "human_form" because step 1 has no prior
  // step data to populate required fields (companyName, contactName, source).
  // Flow pauses here; user creates lead via /sales-crm/leads/new, then calls
  // step-complete with the entity binding.
  1: {
    mode: "human_form",
    entityTable: "scm_leads",
    entityAction: "create",
  },

  // ── Step 2: Lead Scoring (AI with tools → update scm_leads) ──
  2: {
    mode: "ai_with_tools",
    entityTable: "scm_leads",
    entityAction: "update",
    systemPromptExtra: `You are a Lead Qualification Agent using the BANT-S framework (Budget, Authority, Need, Timeline, Shipping-Fit).
The scoring engine computes each factor deterministically from real tariff data and trade lane coverage.
First fetch the lead details using get_lead_details, then call score_lead with the leadId.
After receiving the BANT-S breakdown, explain each factor's score and reasoning to the user in clear business terms.
Do NOT invent or override scores — the engine computes them from reference data.`,
    tools: [
      {
        name: "score_lead",
        description: "Score a lead using the BANT-S framework. Scores are computed server-side from tariff data, trade lane coverage, job title analysis, and lead completeness. Returns detailed breakdown with reasoning.",
        input_schema: {
          type: "object" as const,
          properties: {
            leadId: { type: "string", description: "UUID of the lead to score" },
          },
          required: ["leadId"],
        },
      },
      {
        name: "get_lead_details",
        description: "Fetch the current lead record to review before scoring",
        input_schema: {
          type: "object" as const,
          properties: {
            leadId: { type: "string", description: "UUID of the lead" },
          },
          required: ["leadId"],
        },
      },
    ],
  },

  // ── Step 3: Sales Qualification Gate ──
  3: {
    mode: "gate",
  },

  // ── Step 4: Opportunity Creation (CRUD → scm_opportunities) ──
  4: {
    mode: "crud",
    entityTable: "scm_opportunities",
    entityAction: "create",
    fieldMapping: {
      "Opportunity Name": "opportunityName",
      "Expected Trade Lanes": "tradeLane",
      "Origin Port": "originPort",
      "Destination Port": "destinationPort",
      "Estimated Annual Volume (TEU)": "expectedTeu",
      "Expected Revenue": "expectedRevenue",
      "Target Close Date": "expectedCloseDate",
      "Service Type": "serviceType",
      "Competitive Landscape Notes": "notes",
    },
    defaults: {
      status: "open",
      probability: 30,
      currency: "USD",
    },
    foreignKeys: {
      // The lead from step 1 becomes the basis for the opportunity.
      // We need a customerId, but leads don't have one yet — use metadata.
      // The lead's companyName becomes the opportunity name if not provided.
    },
  },

  // ── Step 5: Credit Pre-Assessment (AI with tools → update scm_leads metadata) ──
  5: {
    mode: "ai_with_tools",
    entityTable: "scm_leads",
    entityAction: "update",
    systemPromptExtra: `You are a Credit Risk Assessment Agent. The credit engine uses a deterministic 4-factor model:
1. Country Risk (30%) — sovereign credit rating of the company's country
2. Volume Commitment (25%) — monthly TEU commitment reliability
3. Industry Risk (20%) — sector-specific risk profile
4. Information Quality (25%) — completeness of lead data

Call calculate_credit_score with the leadId. The engine computes everything from the lead record.
After receiving results, explain the risk rating, suggested credit limit, and payment terms.
Do NOT invent scores — the engine is deterministic.`,
    tools: [
      {
        name: "calculate_credit_score",
        description: "Run deterministic 4-factor credit assessment. Computes country risk, volume commitment, industry risk, and info quality from the lead record. Returns composite score, risk rating (green/amber/red), suggested credit limit, and payment terms.",
        input_schema: {
          type: "object" as const,
          properties: {
            leadId: { type: "string", description: "UUID of the lead" },
          },
          required: ["leadId"],
        },
      },
    ],
  },

  // ── Step 6: Sanctions Screening (AI with tools → update scm_leads metadata) ──
  6: {
    mode: "ai_with_tools",
    entityTable: "scm_leads",
    entityAction: "update",
    systemPromptExtra: `You are a Sanctions Pre-Screening Agent. The screening engine checks the company name and country against:
- Known sanctioned entity patterns (IRISL, IRGC, etc.)
- Sanctioned jurisdictions (Iran, North Korea, Syria, Cuba)
- Elevated-risk jurisdictions (Russia, Iraq, Yemen, etc.)

Call screen_sanctions with the leadId. The engine fetches the company name and country from the lead record and runs deterministic pattern matching.
Report the result transparently — this is a local pre-screening, not a full OFAC/EU check.`,
    tools: [
      {
        name: "screen_sanctions",
        description: "Pre-screen a lead against local sanctions reference list. Checks company name patterns and country jurisdiction. Returns CLEAR, HIT, or POSSIBLE_MATCH with screening source transparency.",
        input_schema: {
          type: "object" as const,
          properties: {
            leadId: { type: "string", description: "UUID of the lead to screen" },
          },
          required: ["leadId"],
        },
      },
    ],
  },

  // ── Step 7: Compliance Exception Gate ──
  7: {
    mode: "gate",
  },

  // ── Step 8: Rate Calculation (AI with tools → create scm_rate_quotations) ──
  8: {
    mode: "ai_with_tools",
    entityTable: "scm_rate_quotations",
    entityAction: "create",
    systemPromptExtra: `You are a Rate Calculation Agent. Freight rates are computed from the company's tariff database — do NOT invent rates.
First call lookup_tariff_rates to preview the rate breakdown for the trade lane.
Then call calculate_rate to create the formal quotation with line items.
The origin/destination ports come from the lead's trade lane. Get them from the opportunity or lead data.
After the quotation is created, summarize the rate breakdown and total per container.`,
    tools: [
      {
        name: "lookup_tariff_rates",
        description: "Preview freight rates from the tariff database for a port pair. Returns base ocean freight + all applicable surcharges. Read-only — does not create a quotation.",
        input_schema: {
          type: "object" as const,
          properties: {
            originPort: { type: "string", description: "Origin port UN/LOCODE (e.g., AEJEA)" },
            destinationPort: { type: "string", description: "Destination port code (e.g., INMUN)" },
            containerSize: { type: "string", description: "Container size: 20, 40, or 40HC" },
          },
          required: ["originPort", "destinationPort", "containerSize"],
        },
      },
      {
        name: "calculate_rate",
        description: "Create a rate quotation from tariff database rates. Fetches base rates and surcharges, creates quotation header and line items.",
        input_schema: {
          type: "object" as const,
          properties: {
            originPort: { type: "string", description: "Origin port UN/LOCODE (e.g., AEJEA)" },
            destinationPort: { type: "string", description: "Destination port code (e.g., INMUN)" },
            containerType: { type: "string", description: "Container type (dry/reefer)" },
            containerSize: { type: "string", description: "Container size: 20, 40, or 40HC" },
            estimatedTeu: { type: "number", description: "Estimated TEU volume for this customer" },
            validityDays: { type: "number", description: "Quote validity in days (14/30/60)" },
          },
          required: ["originPort", "destinationPort", "estimatedTeu", "validityDays"],
        },
      },
    ],
  },

  // ── Step 9: Quote Generation (CRUD → update scm_rate_quotations) ──
  9: {
    mode: "crud",
    entityTable: "scm_rate_quotations",
    entityAction: "update",
    fieldMapping: {
      "Quotation Number": "quotationNumber",
      "Valid From": "validFrom",
      "Valid To": "validTo",
      "Transit Time Days": "transitTimeDays",
      "Free Time Days": "freeTimeDays",
      "Incoterm": "incoterm",
      "Notes": "notes",
    },
    defaults: {
      status: "pending_approval",
    },
  },

  // ── Step 10: Rate Approval Gate ──
  10: {
    mode: "gate",
  },
};

/**
 * Get the executor config for a specific step in E2E-01.
 */
export function getE2e01StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_01_STEP_CONFIGS[stepNumber] ?? null;
}
