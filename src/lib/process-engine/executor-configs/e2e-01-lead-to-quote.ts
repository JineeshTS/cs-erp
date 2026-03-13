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
  // ── Step 1: Lead Capture (CRUD → scm_leads) ──
  1: {
    mode: "crud",
    entityTable: "scm_leads",
    entityAction: "create",
    fieldMapping: {
      "Company Name": "companyName",
      "Contact Person & Email": "contactName",
      "Contact Email": "contactEmail",
      "Contact Phone": "contactPhone",
      "Job Title": "jobTitle",
      "Trade Lanes of Interest": "tradeLane",
      "Estimated Annual TEU Volume": "estimatedTeu",
      "Cargo Types (dry/reefer/DG/OOG)": "industry",
      "Source Channel": "source",
      "Country": "country",
      "City": "city",
      "Notes": "notes",
    },
    defaults: {
      status: "new",
    },
  },

  // ── Step 2: Lead Scoring (AI with tools → update scm_leads) ──
  2: {
    mode: "ai_with_tools",
    entityTable: "scm_leads",
    entityAction: "update",
    systemPromptExtra: `You are a Lead Scoring Agent for a container shipping company.
Score the lead on 5 factors (0-100 each, weighted):
- Trade lane coverage fit (30%): Do we serve their routes?
- Volume potential (25%): Estimated annual TEU value
- Cargo type compatibility (20%): Can we handle their cargo?
- Competitive win probability (15%): Our position vs competitors
- Credit indicators (10%): Company size, country risk

Use the score_lead tool to calculate and persist the score.
Auto-qualify if score >= 70, flag for review if 40-69, nurture if < 40.`,
    tools: [
      {
        name: "score_lead",
        description: "Calculate a composite lead score (0-100) based on 5 weighted factors and update the lead record",
        input_schema: {
          type: "object" as const,
          properties: {
            leadId: { type: "string", description: "UUID of the lead to score" },
            tradeLaneFit: { type: "number", description: "Score 0-100 for trade lane coverage" },
            volumePotential: { type: "number", description: "Score 0-100 for volume potential" },
            cargoCompatibility: { type: "number", description: "Score 0-100 for cargo type fit" },
            winProbability: { type: "number", description: "Score 0-100 for competitive win chance" },
            creditIndicators: { type: "number", description: "Score 0-100 for credit quality signals" },
          },
          required: ["leadId", "tradeLaneFit", "volumePotential", "cargoCompatibility", "winProbability", "creditIndicators"],
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
    systemPromptExtra: `You are a Credit Risk Assessment Agent for a container shipping company.
Perform a preliminary credit assessment:
1. Review company details (name, country, estimated volume)
2. Calculate a credit score based on company indicators
3. Suggest a credit limit and payment terms
4. Rate the risk: green (auto-approve), amber (needs review), red (decline/cash-only)

Use the calculate_credit_score tool to persist the assessment.`,
    tools: [
      {
        name: "calculate_credit_score",
        description: "Calculate preliminary credit score and suggest credit limit for a lead/prospect",
        input_schema: {
          type: "object" as const,
          properties: {
            leadId: { type: "string", description: "UUID of the lead" },
            creditScore: { type: "number", description: "Preliminary credit score 0-100" },
            suggestedCreditLimit: { type: "number", description: "Suggested credit limit in USD" },
            riskRating: { type: "string", enum: ["green", "amber", "red"], description: "Risk rating" },
            paymentTermsDays: { type: "number", description: "Recommended payment terms in days" },
            assessmentNotes: { type: "string", description: "Brief assessment summary" },
          },
          required: ["leadId", "creditScore", "suggestedCreditLimit", "riskRating", "paymentTermsDays"],
        },
      },
    ],
  },

  // ── Step 6: Sanctions Screening (AI with tools → update scm_leads metadata) ──
  6: {
    mode: "ai_with_tools",
    entityTable: "scm_leads",
    entityAction: "update",
    systemPromptExtra: `You are a Sanctions & Compliance Screening Agent.
Screen the company and its beneficial owners against:
- OFAC SDN list (US)
- EU consolidated sanctions
- UN Security Council list
- UK sanctions list

Use the screen_sanctions tool to record the screening result.
Result must be: CLEAR, HIT, or POSSIBLE_MATCH.
For CLEAR: flow proceeds. For HIT/POSSIBLE_MATCH: compliance gate triggers.`,
    tools: [
      {
        name: "screen_sanctions",
        description: "Screen a company against sanctions lists and record the result",
        input_schema: {
          type: "object" as const,
          properties: {
            leadId: { type: "string", description: "UUID of the lead being screened" },
            companyName: { type: "string", description: "Company name to screen" },
            country: { type: "string", description: "Country of incorporation" },
            screeningResult: { type: "string", enum: ["CLEAR", "HIT", "POSSIBLE_MATCH"], description: "Overall screening result" },
            matchedLists: { type: "array", items: { type: "string" }, description: "Which lists had matches (if any)" },
            matchConfidence: { type: "number", description: "Match confidence 0-100 (only if HIT/POSSIBLE_MATCH)" },
            screeningNotes: { type: "string", description: "Screening analysis notes" },
          },
          required: ["leadId", "companyName", "country", "screeningResult"],
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
    systemPromptExtra: `You are a Rate Optimizer Agent for a container shipping company.
Calculate optimal freight rates based on:
- Base tariff for the trade lane
- Applicable surcharges (BAF, CAF, THC, BL fee, seal fee, VGM, ISPS, LSS)
- Customer volume commitment level
- Market rate benchmarks

Use the calculate_rate tool to create a rate quotation record.
The rate should be competitive but maintain minimum margin.`,
    tools: [
      {
        name: "calculate_rate",
        description: "Calculate freight rate components and create a rate quotation",
        input_schema: {
          type: "object" as const,
          properties: {
            originPort: { type: "string", description: "Origin port code (e.g., AEJEA)" },
            destinationPort: { type: "string", description: "Destination port code (e.g., CNSHA)" },
            containerType: { type: "string", description: "Container type (dry/reefer/tank)" },
            containerSize: { type: "string", description: "Container size (20/40/40HC/45)" },
            baseRate: { type: "number", description: "Base ocean freight rate per unit in USD" },
            surcharges: {
              type: "object",
              properties: {
                baf: { type: "number" },
                caf: { type: "number" },
                thc: { type: "number" },
                blFee: { type: "number" },
                sealFee: { type: "number" },
                vgm: { type: "number" },
                isps: { type: "number" },
                lss: { type: "number" },
              },
              description: "Surcharge components in USD",
            },
            totalRate: { type: "number", description: "All-in rate per unit in USD" },
            estimatedTeu: { type: "number", description: "Estimated TEU volume" },
            validityDays: { type: "number", description: "Quote validity in days (14/30/60)" },
            transitTimeDays: { type: "number", description: "Estimated transit time in days" },
          },
          required: ["originPort", "destinationPort", "baseRate", "totalRate", "estimatedTeu", "validityDays"],
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
