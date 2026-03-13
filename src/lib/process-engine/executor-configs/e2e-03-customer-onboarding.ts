/**
 * E2E-03 Customer Onboarding — Executor Configuration
 *
 * Defines how each of the 6 steps executes:
 * - AI-with-tools steps: tool definitions for Claude function calling
 * - Gate steps: handled by existing gate logic (no config needed)
 * - CRUD steps: field mappings from input → DB columns
 *
 * Step Execution Map:
 * | Step | Name                              | Mode          | Entity Table    | Action |
 * |------|-----------------------------------|---------------|-----------------|--------|
 * | 1    | KYC document collection           | ai_with_tools | scm_customers   | create |
 * | 2    | Enhanced due diligence screening  | ai_with_tools | scm_customers   | update |
 * | 3    | KYC verification gate             | gate          | —               | —      |
 * | 4    | Credit limit approval             | gate          | —               | —      |
 * | 5    | Account setup & activation        | crud          | scm_customers   | update |
 * | 6    | Onboarding completion & handoff   | ai_with_tools | scm_customers   | update |
 */

import type { Anthropic } from "@anthropic-ai/sdk";
import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

// ═══════════════════════════════════════════════════════════
// E2E-03 STEP CONFIGS
// ═══════════════════════════════════════════════════════════

export const E2E_03_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // ── Step 1: KYC Document Collection & AI Extraction (AI with tools → create scm_customers) ──
  1: {
    mode: "ai_with_tools",
    entityTable: "scm_customers",
    entityAction: "create",
    systemPromptExtra: `You are a KYC Document Processing agent for a container shipping line. Extract company data from uploaded trade licenses, certificates of incorporation, tax registrations, and banking documents. Validate document completeness and flag missing/expired documents.`,
    tools: [
      {
        name: "extract_kyc_data",
        description:
          "Extract structured company data from uploaded KYC documents (trade licenses, certificates, tax registrations)",
        input_schema: {
          type: "object" as const,
          properties: {
            customer_name: {
              type: "string",
              description: "Legal name of the customer company",
            },
            document_types: {
              type: "array",
              items: { type: "string" },
              description:
                "List of document types being processed (e.g., trade_license, certificate_of_incorporation, tax_registration, bank_letter)",
            },
            country: {
              type: "string",
              description: "Country of incorporation or registration",
            },
          },
          required: ["customer_name", "document_types", "country"],
        },
      },
      {
        name: "validate_documents",
        description:
          "Validate completeness and status of submitted KYC documents, flagging missing or expired items",
        input_schema: {
          type: "object" as const,
          properties: {
            customer_id: {
              type: "string",
              description: "UUID of the customer record",
            },
            documents: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    description: "Document type identifier",
                  },
                  status: {
                    type: "string",
                    description:
                      "Document status (e.g., valid, expired, missing, pending_review)",
                  },
                },
                required: ["type", "status"],
              },
              description: "Array of documents with their validation status",
            },
          },
          required: ["customer_id", "documents"],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 2: Enhanced Due Diligence Screening (AI with tools → update scm_customers) ──
  2: {
    mode: "ai_with_tools",
    entityTable: "scm_customers",
    entityAction: "update",
    systemPromptExtra: `You are an Enhanced Due Diligence agent for a container shipping line. Perform comprehensive screening against sanctions lists (OFAC SDN, EU Consolidated, UN Consolidated), check for PEP status, scan adverse media, verify beneficial ownership, and assess country risk.`,
    tools: [
      {
        name: "screen_entity",
        description:
          "Screen an entity against sanctions lists (OFAC SDN, EU Consolidated, UN Consolidated) and adverse media databases",
        input_schema: {
          type: "object" as const,
          properties: {
            entity_name: {
              type: "string",
              description: "Name of the entity to screen",
            },
            entity_type: {
              type: "string",
              enum: ["individual", "company"],
              description: "Type of entity being screened",
            },
            country: {
              type: "string",
              description: "Country of the entity",
            },
          },
          required: ["entity_name", "entity_type", "country"],
        },
      },
      {
        name: "check_pep_status",
        description:
          "Check whether a person is a Politically Exposed Person (PEP) or has PEP associations",
        input_schema: {
          type: "object" as const,
          properties: {
            person_name: {
              type: "string",
              description: "Full name of the person to check",
            },
            country: {
              type: "string",
              description: "Country of the person",
            },
          },
          required: ["person_name", "country"],
        },
      },
      {
        name: "assess_country_risk",
        description:
          "Assess the risk level of a country based on sanctions exposure, corruption index, and financial crime indicators",
        input_schema: {
          type: "object" as const,
          properties: {
            country_code: {
              type: "string",
              description: "ISO 3166-1 alpha-2 country code (e.g., QA, AE, US)",
            },
          },
          required: ["country_code"],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 3: KYC Verification Gate ──
  3: {
    mode: "gate",
  },

  // ── Step 4: Credit Limit Approval Gate ──
  4: {
    mode: "gate",
  },

  // ── Step 5: Account Setup & Activation (CRUD → update scm_customers) ──
  5: {
    mode: "crud",
    entityTable: "scm_customers",
    entityAction: "update",
    fieldMapping: {
      "Approved Credit Limit & Payment Terms": "creditLimitAmount",
      "Payment Terms": "paymentTermsDays",
      // "Trade Lanes" → skipped, stored in metadata
    },
    defaults: {
      status: "active",
    },
  },

  // ── Step 6: Onboarding Completion & Handoff (AI with tools → update scm_customers) ──
  6: {
    mode: "ai_with_tools",
    entityTable: "scm_customers",
    entityAction: "update",
    systemPromptExtra: `You are a Customer Onboarding Completion agent for a container shipping line. Finalize the onboarding by updating CRM status to active, assigning an account manager, generating a welcome package summary, and confirming all setup steps are complete.`,
    tools: [
      {
        name: "complete_onboarding",
        description:
          "Finalize customer onboarding by activating the account, assigning an account manager, and generating a welcome package",
        input_schema: {
          type: "object" as const,
          properties: {
            customer_id: {
              type: "string",
              description: "UUID of the customer record",
            },
            customer_code: {
              type: "string",
              description: "Unique customer code assigned during account setup",
            },
            account_manager: {
              type: "string",
              description: "Name or ID of the assigned account manager",
            },
          },
          required: ["customer_id", "customer_code"],
        },
      },
    ] as Anthropic.Tool[],
  },
};

/**
 * Get the executor config for a specific step in E2E-03.
 */
export function getE2e03StepConfig(
  stepNumber: number
): StepExecutorConfig | null {
  return E2E_03_STEP_CONFIGS[stepNumber] ?? null;
}
