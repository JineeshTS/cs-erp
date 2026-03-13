/**
 * E2E-05 Customer Lifecycle — Executor Configuration (D-006 Phase 5)
 *
 * Full customer relationship from lead capture through qualification,
 * onboarding, KYC, credit setup, ongoing monitoring, churn prediction,
 * and contract renewal. 20 steps across 6 phases.
 *
 * Reuses tools from CRM (E2E-01/02/03) for acquisition phases.
 * Monitoring/analytics phases (14-17, 20) use pure AI analysis —
 * Claude analyzes priorContext data and produces structured insights.
 *
 * Step Execution Map:
 * | Step | Name                          | Mode          | Entity Table            | Action |
 * |------|-------------------------------|---------------|-------------------------|--------|
 * | 1    | Lead capture & enrichment     | ai_with_tools | scm_leads               | create |
 * | 2    | Lead scoring                  | ai_with_tools | scm_leads               | update |
 * | 3    | Opportunity qualification     | ai_with_tools | scm_opportunities       | create |
 * | 4    | Sales gate                    | gate          | —                       | —      |
 * | 5    | Quote generation              | ai_with_tools | scm_rate_quotations     | create |
 * | 6    | Rate negotiation support      | ai_with_tools | scm_rate_quotations     | update |
 * | 7    | Rate gate                     | gate          | —                       | —      |
 * | 8    | Contract creation             | crud          | scm_contracts           | create |
 * | 9    | Contract gate (legal review)  | gate          | —                       | —      |
 * | 10   | Customer onboarding           | ai_with_tools | scm_customers           | create |
 * | 11   | KYC verification              | ai_with_tools | acm_sanctions_screenings| create |
 * | 12   | Credit scoring                | ai_with_tools | arcc_credit_limits      | create |
 * | 13   | Credit gate                   | gate          | —                       | —      |
 * | 14   | SLA monitoring                | ai_with_tools | —                       | —      |
 * | 15   | Customer segmentation         | ai_with_tools | —                       | —      |
 * | 16   | Account health scoring        | ai_with_tools | —                       | —      |
 * | 17   | Churn prediction              | ai_with_tools | —                       | —      |
 * | 18   | Retention gate                | gate          | —                       | —      |
 * | 19   | Contract renewal              | ai_with_tools | scm_contracts           | create |
 * | 20   | Volume commitment tracking    | ai_with_tools | —                       | —      |
 */

import type { Anthropic } from "@anthropic-ai/sdk";
import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

// ═══════════════════════════════════════════════════════════
// E2E-05 STEP CONFIGS (20 Steps, 6 Phases)
// ═══════════════════════════════════════════════════════════

export const E2E_05_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // ═══════════════════════════════════════════════════════════
  // PHASE 1: LEAD MANAGEMENT (Steps 1-4)
  // ═══════════════════════════════════════════════════════════

  // ── Step 1: Lead Capture & Enrichment (AI → create scm_leads) ──
  1: {
    mode: "ai_with_tools",
    entityTable: "scm_leads",
    entityAction: "create",
    systemPromptExtra: `You are a Lead Intelligence Agent for a container shipping line.
Capture the new lead and enrich it with available data:
1. Validate against existing CRM records (check for duplicates)
2. Enrich the company profile: revenue, size, current carriers, shipping volumes
3. Identify current shipping carriers and estimated volumes
4. Score trade lane alignment with our network coverage

Use the score_lead tool to create the lead record with enrichment data.
Use get_lead_details to check for duplicates before creating.`,
    tools: [
      {
        name: "score_lead",
        description: "Create a new lead record with enriched data and initial score",
        input_schema: {
          type: "object" as const,
          properties: {
            leadId: { type: "string", description: "UUID of the lead to score (use 'new' if creating)" },
            tradeLaneFit: { type: "number", description: "Score 0-100 for trade lane coverage alignment" },
            volumePotential: { type: "number", description: "Score 0-100 for volume potential" },
            cargoCompatibility: { type: "number", description: "Score 0-100 for cargo type compatibility" },
            winProbability: { type: "number", description: "Score 0-100 for competitive win chance" },
            creditIndicators: { type: "number", description: "Score 0-100 for credit quality signals" },
          },
          required: ["leadId", "tradeLaneFit", "volumePotential", "cargoCompatibility", "winProbability", "creditIndicators"],
        },
      },
      {
        name: "get_lead_details",
        description: "Check existing CRM records for duplicates before lead creation",
        input_schema: {
          type: "object" as const,
          properties: {
            leadId: { type: "string", description: "UUID of the lead to look up" },
          },
          required: ["leadId"],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 2: Lead Scoring (AI → update scm_leads) ──
  2: {
    mode: "ai_with_tools",
    entityTable: "scm_leads",
    entityAction: "update",
    systemPromptExtra: `You are a Lead Scoring Agent for a container shipping line.
Score the enriched lead on fit (company size, trade lanes, volume) and engagement
(website visits, email opens, meeting requests). Assign a priority tier:
- Hot (score >= 70): Immediate sales engagement
- Warm (score 40-69): Nurture with targeted content
- Cold (score < 40): Marketing drip campaign

Use the score_lead tool to calculate and persist the composite score.`,
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
    ] as Anthropic.Tool[],
  },

  // ── Step 3: Opportunity Qualification (AI → create scm_opportunities) ──
  3: {
    mode: "ai_with_tools",
    entityTable: "scm_opportunities",
    entityAction: "create",
    systemPromptExtra: `You are a Sales Strategy Agent for a container shipping line.
Qualify the scored lead into a sales opportunity using the BANT framework:
- Budget: Can the customer afford our rates?
- Authority: Are we talking to the decision maker?
- Need: Do they have genuine shipping needs we can serve?
- Timeline: When do they need to start shipping?

Estimate deal value based on trade lanes, volumes, and rate levels.
Use the score_lead tool with the lead context to create the opportunity.`,
    tools: [
      {
        name: "score_lead",
        description: "Read lead data to qualify into an opportunity, using the score to determine win probability",
        input_schema: {
          type: "object" as const,
          properties: {
            leadId: { type: "string", description: "UUID of the lead to qualify" },
            tradeLaneFit: { type: "number", description: "Score 0-100 for trade lane coverage" },
            volumePotential: { type: "number", description: "Score 0-100 for volume potential" },
            cargoCompatibility: { type: "number", description: "Score 0-100 for cargo type fit" },
            winProbability: { type: "number", description: "Score 0-100 for competitive win chance" },
            creditIndicators: { type: "number", description: "Score 0-100 for credit quality signals" },
          },
          required: ["leadId", "tradeLaneFit", "volumePotential", "cargoCompatibility", "winProbability", "creditIndicators"],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 4: Sales Gate — accept/reject opportunity ──
  4: {
    mode: "gate",
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 2: QUOTATION & NEGOTIATION (Steps 5-7)
  // ═══════════════════════════════════════════════════════════

  // ── Step 5: Quote Generation (AI → create scm_rate_quotations) ──
  5: {
    mode: "ai_with_tools",
    entityTable: "scm_rate_quotations",
    entityAction: "create",
    systemPromptExtra: `You are a Rate Optimizer Agent for a container shipping line.
Generate a freight rate quotation for the qualified opportunity:
1. Pull base tariff rates for requested trade lanes
2. Apply volume discounts based on customer's commitment level
3. Add applicable surcharges (BAF, CAF, THC, BL fee, VGM, ISPS, LSS)
4. Optimize against floor prices and competitor rate intelligence

All rates must be above floor price. Quote validity: 14/30/60 days.
Use the calculate_rate tool to create the quotation record.`,
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
    ] as Anthropic.Tool[],
  },

  // ── Step 6: Rate Negotiation Support (AI → update scm_rate_quotations) ──
  6: {
    mode: "ai_with_tools",
    entityTable: "scm_rate_quotations",
    entityAction: "update",
    systemPromptExtra: `You are a Negotiation AI Assistant for a container shipping line.
Support the sales rep during rate negotiation:
1. Analyze the customer's counter-offer vs our floor prices
2. Model margin impact at different rate levels
3. Suggest optimal counter-offer strategy considering customer lifetime value
4. Identify walk-away points per trade lane

Use analyze_customer_response to classify the customer's position,
then generate_negotiation_strategy to recommend counter-rates.`,
    tools: [
      {
        name: "analyze_customer_response",
        description: "Analyze and classify a customer's response to a rate quotation",
        input_schema: {
          type: "object" as const,
          properties: {
            quotation_id: { type: "string", description: "UUID of the rate quotation being responded to" },
            response_text: { type: "string", description: "The customer's response text to analyze" },
            response_type: {
              type: "string",
              enum: ["accept", "counter", "reject", "request_info"],
              description: "Classification of the customer response",
            },
          },
          required: ["quotation_id", "response_text", "response_type"],
        },
      },
      {
        name: "generate_negotiation_strategy",
        description: "Generate a negotiation strategy analyzing counter-offer against market rates and thresholds",
        input_schema: {
          type: "object" as const,
          properties: {
            counter_rate: { type: "number", description: "The customer's counter-offered rate in USD" },
            walk_away_rate: { type: "number", description: "Our minimum acceptable rate in USD" },
            market_rate: { type: "number", description: "Current market rate benchmark in USD" },
            customer_lifetime_value: { type: "number", description: "Estimated customer lifetime value in USD" },
          },
          required: ["counter_rate", "walk_away_rate", "market_rate"],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 7: Rate Gate — approve negotiated rate ──
  7: {
    mode: "gate",
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 3: CONTRACT & ONBOARDING (Steps 8-11)
  // ═══════════════════════════════════════════════════════════

  // ── Step 8: Contract Creation (CRUD → scm_contracts) ──
  8: {
    mode: "crud",
    entityTable: "scm_contracts",
    entityAction: "create",
    fieldMapping: {
      "Agreed Rate & Terms": "notes",
      "Trade Lanes": "tradeLane",
      "Volume Commitments MQC": "minimumCommitmentTeu",
      "Payment Terms (credit days)": "paymentTermsDays",
      "Contract Type NAC/SC/FAK/Tender": "contractType",
    },
    defaults: {
      status: "draft",
    },
    foreignKeys: {
      customerId: {
        fromStep: 3,
        fromTable: "scm_opportunities",
        toColumn: "customerId",
      },
    },
  },

  // ── Step 9: Contract Gate — legal review if non-standard ──
  9: {
    mode: "gate",
  },

  // ── Step 10: Customer Onboarding (AI → create scm_customers) ──
  10: {
    mode: "ai_with_tools",
    entityTable: "scm_customers",
    entityAction: "create",
    systemPromptExtra: `You are a Customer Onboarding Agent for a container shipping line.
Onboard the new customer after contract signing:
1. Create the customer master record with all contact details
2. Extract and validate KYC documents (trade license, tax registration)
3. Configure EDI connections and booking preferences
4. Assign account manager and customer service rep
5. Complete onboarding checklist

Use extract_kyc_data to process documents, then complete_onboarding to finalize.`,
    tools: [
      {
        name: "extract_kyc_data",
        description: "Extract structured company data from uploaded KYC documents",
        input_schema: {
          type: "object" as const,
          properties: {
            customer_name: { type: "string", description: "Legal name of the customer company" },
            document_types: {
              type: "array",
              items: { type: "string" },
              description: "Document types being processed (trade_license, certificate_of_incorporation, tax_registration, bank_letter)",
            },
            country: { type: "string", description: "Country of incorporation or registration" },
          },
          required: ["customer_name", "document_types", "country"],
        },
      },
      {
        name: "complete_onboarding",
        description: "Finalize customer onboarding by activating the account and assigning an account manager",
        input_schema: {
          type: "object" as const,
          properties: {
            customer_id: { type: "string", description: "UUID of the customer record" },
            customer_code: { type: "string", description: "Unique customer code assigned during setup" },
            account_manager: { type: "string", description: "Name or ID of the assigned account manager" },
          },
          required: ["customer_id", "customer_code"],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 11: KYC Verification (AI → create acm_sanctions_screenings) ──
  11: {
    mode: "ai_with_tools",
    entityTable: "acm_sanctions_screenings",
    entityAction: "create",
    systemPromptExtra: `You are a KYC Compliance Agent for a container shipping line.
Perform comprehensive Know Your Customer verification:
1. Screen company and beneficial owners against OFAC SDN, EU, UN sanctions lists
2. Verify beneficial ownership structure to UBO level
3. Check for Politically Exposed Persons (PEP) associations
4. Assess country risk based on incorporation jurisdiction
5. Perform adverse media screening

Generate a KYC risk assessment: Pass (low risk), Escalate (medium risk), or Fail (high risk).`,
    tools: [
      {
        name: "screen_entity",
        description: "Screen an entity against sanctions lists (OFAC SDN, EU, UN) and adverse media",
        input_schema: {
          type: "object" as const,
          properties: {
            entity_name: { type: "string", description: "Name of the entity to screen" },
            entity_type: { type: "string", enum: ["individual", "company"], description: "Type of entity" },
            country: { type: "string", description: "Country of the entity" },
          },
          required: ["entity_name", "entity_type", "country"],
        },
      },
      {
        name: "check_pep_status",
        description: "Check whether a person is a Politically Exposed Person (PEP)",
        input_schema: {
          type: "object" as const,
          properties: {
            person_name: { type: "string", description: "Full name of the person to check" },
            country: { type: "string", description: "Country of the person" },
          },
          required: ["person_name", "country"],
        },
      },
      {
        name: "assess_country_risk",
        description: "Assess country risk based on sanctions exposure, corruption index, and financial crime indicators",
        input_schema: {
          type: "object" as const,
          properties: {
            country_code: { type: "string", description: "ISO 3166-1 alpha-2 country code (e.g., QA, AE)" },
          },
          required: ["country_code"],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 4: CREDIT SETUP (Steps 12-13)
  // ═══════════════════════════════════════════════════════════

  // ── Step 12: Credit Scoring (AI → create arcc_credit_limits) ──
  12: {
    mode: "ai_with_tools",
    entityTable: "arcc_credit_limits",
    entityAction: "create",
    systemPromptExtra: `You are a Credit Risk Agent for a container shipping line.
Assess customer creditworthiness using:
1. Financial statements analysis (liquidity, leverage, profitability)
2. KYC risk rating from Step 11
3. Credit bureau score (external data)
4. Trade references and payment history
5. Estimated monthly shipping value vs requested credit limit

Recommend credit limit, payment terms (30/60/90 days), and risk category.
For high-value limits, recommend credit insurance.
Use calculate_credit_score to create the credit limit record.`,
    tools: [
      {
        name: "calculate_credit_score",
        description: "Calculate credit score and create a credit limit record with recommended terms",
        input_schema: {
          type: "object" as const,
          properties: {
            leadId: { type: "string", description: "UUID of the lead/customer" },
            creditScore: { type: "number", description: "Credit score 0-100" },
            suggestedCreditLimit: { type: "number", description: "Suggested credit limit in USD" },
            riskRating: { type: "string", enum: ["green", "amber", "red"], description: "Risk rating" },
            paymentTermsDays: { type: "number", description: "Recommended payment terms in days" },
            assessmentNotes: { type: "string", description: "Credit assessment summary" },
          },
          required: ["leadId", "creditScore", "suggestedCreditLimit", "riskRating", "paymentTermsDays"],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 13: Credit Gate — approve credit limit ──
  13: {
    mode: "gate",
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 5: ONGOING MONITORING (Steps 14-18)
  // Analytics steps — AI analyzes priorContext and produces
  // structured insights stored in aiAnalysis. No DB entities.
  // ═══════════════════════════════════════════════════════════

  // ── Step 14: SLA Monitoring (AI analysis — no entity) ──
  14: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are an SLA Monitoring Agent for a container shipping line.
Analyze the customer's service level agreement compliance:
1. Transit time adherence (target vs actual per trade lane)
2. Booking confirmation speed (SLA: within 2 hours)
3. Documentation accuracy (BL errors, SI rejections)
4. Claims response time (target: acknowledge within 24h)
5. Escalation handling (resolution within SLA timeframes)

Calculate an overall SLA compliance score (0-100).
Flag any breaches and trending metrics.
Provide your analysis as structured JSON with: slaScore, breaches, trendingMetrics, escalationAlerts.`,
  },

  // ── Step 15: Customer Segmentation (AI analysis — no entity) ──
  15: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Customer Analytics Agent for a container shipping line.
Segment the customer based on value, volume, growth, and strategic importance:

Segmentation criteria:
- Platinum: > $1M annual revenue, growing, strategic lanes
- Gold: $500K-$1M revenue, stable or growing
- Silver: $100K-$500K revenue, stable
- Bronze: < $100K revenue or declining

Calculate: Revenue Rank, Growth Classification, Strategic Importance Score.
Provide your analysis as structured JSON with: segment, revenueRank, growthClassification, strategicScore, recommendations.`,
  },

  // ── Step 16: Account Health Scoring (AI analysis — no entity) ──
  16: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are an Account Health Agent for a container shipping line.
Score overall account health based on 5 dimensions (0-100 each):
1. Shipment frequency: current quarter vs prior quarter
2. Payment behavior: DSO trend, late payment count
3. SLA performance: compliance score from Step 14
4. Complaint rate: tickets per 100 shipments
5. Engagement level: login frequency, API usage, meeting attendance

Calculate composite health score (0-100) and classify trend:
- Improving (score up > 5 points)
- Stable (change within +/- 5 points)
- Declining (score down > 5 points)

Provide your analysis as structured JSON with: healthScore, trend, riskFactors, recommendedActions, dimensionScores.`,
  },

  // ── Step 17: Churn Prediction (AI analysis — no entity) ──
  17: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Churn Prediction Agent for a container shipping line.
Predict whether this customer is likely to churn in the next 90 days.

Key churn indicators:
- Declining booking volume (> 20% drop over 3 months)
- Increasing rate sensitivity (frequent rate complaints)
- Deteriorating health score (from Step 16)
- Competitor activity on customer's trade lanes
- Payment delays increasing
- Reduced engagement with account team

Classify churn risk: Low (< 20%), Medium (20-50%), High (> 50%).
Provide your analysis as structured JSON with: churnProbability, riskTier, keyDrivers, retentionRecommendations, estimatedRevenueAtRisk.`,
  },

  // ── Step 18: Retention Gate — review at-risk accounts ──
  18: {
    mode: "gate",
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 6: RENEWAL & GROWTH (Steps 19-20)
  // ═══════════════════════════════════════════════════════════

  // ── Step 19: Contract Renewal (AI → create scm_contracts) ──
  19: {
    mode: "ai_with_tools",
    entityTable: "scm_contracts",
    entityAction: "create",
    systemPromptExtra: `You are a Contract Renewal Agent for a container shipping line.
The customer's contract is approaching expiry (90-day notice).
Prepare a renewal proposal:
1. Analyze actual volume vs committed volume
2. Propose rate adjustments based on performance and market conditions
3. Recommend volume commitment changes (increase/decrease)
4. Generate renewal contract with updated terms

Use activate_contract to create the renewal contract record.
Include the performance summary and proposed rate changes in your analysis.`,
    tools: [
      {
        name: "activate_contract",
        description: "Create a renewal contract by activating new rates and terms",
        input_schema: {
          type: "object" as const,
          properties: {
            contract_id: { type: "string", description: "UUID of the expiring contract (for reference)" },
            activation_date: { type: "string", description: "ISO date for when the renewal contract starts" },
          },
          required: ["contract_id", "activation_date"],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 20: Volume Commitment Tracking (AI analysis — no entity) ──
  20: {
    mode: "ai_with_tools",
    systemPromptExtra: `You are a Volume Tracking Agent for a container shipping line.
Track the customer's actual shipping volume against contracted commitments:
1. Calculate actual vs committed volume per period (monthly/quarterly)
2. Determine achievement percentage
3. Apply rebate rules if volume exceeded (per contract clause)
4. Apply penalty rules if volume shortfall (per contract clause)
5. Project year-end achievement based on current trajectory

Provide your analysis as structured JSON with: achievementPercent, shortfallTeu, surplusTeu, rebateAmount, penaltyAmount, projectedYearEndPercent, periodBreakdown.`,
  },
};

/**
 * Get the executor config for a specific step in E2E-05.
 */
export function getE2e05StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_05_STEP_CONFIGS[stepNumber] ?? null;
}
