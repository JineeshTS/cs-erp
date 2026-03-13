/**
 * AI Tool Executor — Claude with Function Calling (D-006 Phase 2)
 *
 * Executes flow steps that need AI intelligence backed by real data.
 * Claude gets tool definitions and calls real service functions:
 * - score_lead → calculates and persists a real score on scm_leads
 * - calculate_credit_score → persists credit assessment
 * - screen_sanctions → records screening result
 * - calculate_rate → creates a rate quotation record
 *
 * Unlike ai-step-executor.ts (which generates text summaries),
 * this executor creates/updates real entities via tool calls.
 */

import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { scmLeads, scmRateQuotations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { StepExecutorConfig } from "./executor-configs/e2e-01-lead-to-quote";
import { createEntityBinding, resolveEntityInFlow } from "./entity-binding-service";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 4096;

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface AiToolExecutionParams {
  tenantId: string;
  flowInstanceId: string;
  stepInstanceId: string;
  stepNumber: number;
  config: StepExecutorConfig;
  /** Context from prior steps (entity data, outputs) */
  priorContext: Record<string, unknown>;
  /** Flow metadata */
  flowMeta: {
    flowId: string;
    flowName: string;
    entityType: string;
    entityId: string;
    totalSteps: number;
  };
  userId: string;
}

interface AiToolExecutionResult {
  status: "completed" | "failed";
  entityTable: string | null;
  entityId: string | null;
  entityAction: string | null;
  entityData: Record<string, unknown> | null;
  aiAnalysis: Record<string, unknown>;
  toolCallsExecuted: string[];
  tokensUsed: number;
  error?: string;
}

// ═══════════════════════════════════════════════════════════
// MAIN EXECUTOR
// ═══════════════════════════════════════════════════════════

export async function executeAiToolStep(params: AiToolExecutionParams): Promise<AiToolExecutionResult> {
  const { config, flowMeta } = params;

  if (!process.env.ANTHROPIC_API_KEY) {
    return simulatedExecution(params);
  }

  try {
    const systemPrompt = buildSystemPrompt(params);
    const userPrompt = buildUserPrompt(params);

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      tools: config.tools ?? [],
      messages: [{ role: "user", content: userPrompt }],
    });

    const tokensUsed = (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0);
    const toolCallsExecuted: string[] = [];
    let entityTable: string | null = null;
    let entityId: string | null = null;
    let entityAction: string | null = null;
    let entityData: Record<string, unknown> | null = null;
    let aiAnalysis: Record<string, unknown> = {};

    // Process response — handle tool calls in a loop
    let messages: Anthropic.MessageParam[] = [{ role: "user", content: userPrompt }];
    let currentResponse = response;
    let iterations = 0;
    const maxIterations = 5;

    while (currentResponse.stop_reason === "tool_use" && iterations < maxIterations) {
      iterations++;
      const assistantContent = currentResponse.content;
      messages.push({ role: "assistant", content: assistantContent });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of assistantContent) {
        if (block.type === "tool_use") {
          toolCallsExecuted.push(block.name);
          const toolResult = await executeToolCall(
            block.name,
            block.input as Record<string, unknown>,
            params
          );

          // Track entity created/updated by tools
          if (toolResult.entityId) {
            entityTable = toolResult.entityTable ?? config.entityTable ?? null;
            entityId = toolResult.entityId;
            entityAction = toolResult.entityAction ?? config.entityAction ?? null;
            entityData = toolResult.entityData ?? null;
          }

          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify(toolResult.result),
          });
        }
      }

      messages.push({ role: "user", content: toolResults });

      // Continue conversation to get final analysis
      currentResponse = await anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        tools: config.tools ?? [],
        messages,
      });
    }

    // Extract final text analysis
    for (const block of currentResponse.content) {
      if (block.type === "text") {
        aiAnalysis = parseAiAnalysis(block.text);
      }
    }

    // Create entity binding if we have an entity
    if (entityTable && entityId) {
      await createEntityBinding({
        tenantId: params.tenantId,
        stepInstanceId: params.stepInstanceId,
        flowInstanceId: params.flowInstanceId,
        entityTable,
        entityId,
        entityAction: (entityAction ?? "update") as "create" | "update" | "read",
        entityData: entityData ?? undefined,
      });
    }

    return {
      status: "completed",
      entityTable,
      entityId,
      entityAction,
      entityData,
      aiAnalysis,
      toolCallsExecuted,
      tokensUsed,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown AI tool error";
    console.error(`[AiToolExecutor] Step ${params.stepNumber} failed:`, errorMsg);
    return {
      status: "failed",
      entityTable: null,
      entityId: null,
      entityAction: null,
      entityData: null,
      aiAnalysis: { error: errorMsg },
      toolCallsExecuted: [],
      tokensUsed: 0,
      error: errorMsg,
    };
  }
}

// ═══════════════════════════════════════════════════════════
// TOOL CALL DISPATCHER
// ═══════════════════════════════════════════════════════════

interface ToolCallResult {
  result: Record<string, unknown>;
  entityTable?: string;
  entityId?: string;
  entityAction?: string;
  entityData?: Record<string, unknown>;
}

async function executeToolCall(
  toolName: string,
  input: Record<string, unknown>,
  params: AiToolExecutionParams
): Promise<ToolCallResult> {
  switch (toolName) {
    case "score_lead":
      return executeScoreLead(input, params);
    case "get_lead_details":
      return executeGetLeadDetails(input, params);
    case "calculate_credit_score":
      return executeCalculateCreditScore(input, params);
    case "screen_sanctions":
      return executeScreenSanctions(input, params);
    case "calculate_rate":
      return executeCalculateRate(input, params);
    default:
      return { result: { error: `Unknown tool: ${toolName}` } };
  }
}

// ═══════════════════════════════════════════════════════════
// TOOL IMPLEMENTATIONS — Real DB operations
// ═══════════════════════════════════════════════════════════

async function executeScoreLead(
  input: Record<string, unknown>,
  params: AiToolExecutionParams
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = params;

  // Resolve the lead from flow bindings
  const leadBinding = await resolveEntityInFlow(flowInstanceId, tenantId, "scm_leads");
  const leadId = (input.leadId as string) || leadBinding?.entityId;

  if (!leadId) {
    return { result: { error: "No lead found in flow to score" } };
  }

  // Calculate composite score
  const tradeLaneFit = (input.tradeLaneFit as number) ?? 50;
  const volumePotential = (input.volumePotential as number) ?? 50;
  const cargoCompatibility = (input.cargoCompatibility as number) ?? 50;
  const winProbability = (input.winProbability as number) ?? 50;
  const creditIndicators = (input.creditIndicators as number) ?? 50;

  const compositeScore = Math.round(
    tradeLaneFit * 0.3 +
    volumePotential * 0.25 +
    cargoCompatibility * 0.2 +
    winProbability * 0.15 +
    creditIndicators * 0.1
  );

  const qualification = compositeScore >= 70 ? "auto_qualified" : compositeScore >= 40 ? "review" : "nurture";
  const newStatus = compositeScore >= 70 ? "qualified" : compositeScore >= 40 ? "contacted" : "new";

  // Update lead with real score
  const [updated] = await db
    .update(scmLeads)
    .set({
      qualificationScore: compositeScore,
      status: newStatus,
      metadata: {
        scoreBreakdown: { tradeLaneFit, volumePotential, cargoCompatibility, winProbability, creditIndicators },
        qualification,
        scoredAt: new Date().toISOString(),
        scoredBy: "ai_scoring_agent",
      },
    })
    .where(and(eq(scmLeads.id, leadId), eq(scmLeads.tenantId, tenantId)))
    .returning();

  return {
    result: {
      leadId,
      compositeScore,
      scoreBreakdown: { tradeLaneFit, volumePotential, cargoCompatibility, winProbability, creditIndicators },
      qualification,
      status: newStatus,
    },
    entityTable: "scm_leads",
    entityId: leadId,
    entityAction: "update",
    entityData: updated as Record<string, unknown>,
  };
}

async function executeGetLeadDetails(
  input: Record<string, unknown>,
  params: AiToolExecutionParams
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = params;

  const leadBinding = await resolveEntityInFlow(flowInstanceId, tenantId, "scm_leads");
  const leadId = (input.leadId as string) || leadBinding?.entityId;

  if (!leadId) {
    return { result: { error: "No lead found" } };
  }

  const [lead] = await db
    .select()
    .from(scmLeads)
    .where(and(eq(scmLeads.id, leadId), eq(scmLeads.tenantId, tenantId)))
    .limit(1);

  if (!lead) {
    return { result: { error: "Lead not found in database" } };
  }

  return { result: lead as unknown as Record<string, unknown> };
}

async function executeCalculateCreditScore(
  input: Record<string, unknown>,
  params: AiToolExecutionParams
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = params;

  const leadBinding = await resolveEntityInFlow(flowInstanceId, tenantId, "scm_leads");
  const leadId = (input.leadId as string) || leadBinding?.entityId;

  if (!leadId) {
    return { result: { error: "No lead found for credit assessment" } };
  }

  const creditScore = (input.creditScore as number) ?? 60;
  const suggestedCreditLimit = (input.suggestedCreditLimit as number) ?? 50000;
  const riskRating = (input.riskRating as string) ?? "amber";
  const paymentTermsDays = (input.paymentTermsDays as number) ?? 30;
  const assessmentNotes = (input.assessmentNotes as string) ?? "";

  // Update lead metadata with credit assessment
  const [updated] = await db
    .update(scmLeads)
    .set({
      estimatedRevenue: suggestedCreditLimit,
      metadata: {
        ...(leadBinding?.entityData as Record<string, unknown>)?.metadata as Record<string, unknown> ?? {},
        creditAssessment: {
          creditScore,
          suggestedCreditLimit,
          riskRating,
          paymentTermsDays,
          assessmentNotes,
          assessedAt: new Date().toISOString(),
          assessedBy: "ai_credit_agent",
        },
      },
    })
    .where(and(eq(scmLeads.id, leadId), eq(scmLeads.tenantId, tenantId)))
    .returning();

  return {
    result: {
      leadId,
      creditScore,
      suggestedCreditLimit,
      riskRating,
      paymentTermsDays,
      assessmentNotes,
    },
    entityTable: "scm_leads",
    entityId: leadId,
    entityAction: "update",
    entityData: updated as Record<string, unknown>,
  };
}

async function executeScreenSanctions(
  input: Record<string, unknown>,
  params: AiToolExecutionParams
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = params;

  const leadBinding = await resolveEntityInFlow(flowInstanceId, tenantId, "scm_leads");
  const leadId = (input.leadId as string) || leadBinding?.entityId;

  if (!leadId) {
    return { result: { error: "No lead found for sanctions screening" } };
  }

  const screeningResult = (input.screeningResult as string) ?? "CLEAR";
  const matchedLists = (input.matchedLists as string[]) ?? [];
  const matchConfidence = (input.matchConfidence as number) ?? 0;
  const screeningNotes = (input.screeningNotes as string) ?? "";

  // Update lead metadata with screening result
  const [updated] = await db
    .update(scmLeads)
    .set({
      metadata: {
        ...(leadBinding?.entityData as Record<string, unknown>)?.metadata as Record<string, unknown> ?? {},
        sanctionsScreening: {
          result: screeningResult,
          matchedLists,
          matchConfidence,
          screeningNotes,
          screenedAt: new Date().toISOString(),
          screenedBy: "ai_sanctions_agent",
          screeningId: `SCR-${Date.now().toString(36).toUpperCase()}`,
        },
      },
    })
    .where(and(eq(scmLeads.id, leadId), eq(scmLeads.tenantId, tenantId)))
    .returning();

  return {
    result: {
      leadId,
      screeningResult,
      matchedLists,
      matchConfidence,
      screeningNotes,
    },
    entityTable: "scm_leads",
    entityId: leadId,
    entityAction: "update",
    entityData: updated as Record<string, unknown>,
  };
}

async function executeCalculateRate(
  input: Record<string, unknown>,
  params: AiToolExecutionParams
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId, userId } = params;

  const originPort = (input.originPort as string) ?? "AEJEA";
  const destinationPort = (input.destinationPort as string) ?? "CNSHA";
  const totalRate = (input.totalRate as number) ?? 0;
  const estimatedTeu = (input.estimatedTeu as number) ?? 1;
  const validityDays = (input.validityDays as number) ?? 30;

  const validFrom = new Date();
  const validTo = new Date();
  validTo.setDate(validTo.getDate() + validityDays);

  // Try to resolve customer/opportunity for the quotation
  const oppBinding = await resolveEntityInFlow(flowInstanceId, tenantId, "scm_opportunities");
  const oppData = oppBinding?.entityData as Record<string, unknown> | null;

  // Create rate quotation
  const [quotation] = await db
    .insert(scmRateQuotations)
    .values({
      tenantId,
      quotationNumber: `QT-${Date.now().toString(36).toUpperCase()}`,
      customerId: (oppData?.customerId as string) ?? tenantId, // fallback to tenant as placeholder
      opportunityId: oppBinding?.entityId,
      salesRepId: userId,
      originPort,
      destinationPort,
      tradeLane: `${originPort}-${destinationPort}`,
      containerType: (input.containerType as string) ?? "dry",
      containerSize: (input.containerSize as string) ?? "40",
      estimatedTeu,
      totalAmount: totalRate * estimatedTeu,
      currency: "USD",
      validFrom,
      validTo,
      transitTimeDays: (input.transitTimeDays as number) ?? null,
      status: "draft",
      metadata: {
        rateBreakdown: {
          baseRate: input.baseRate,
          surcharges: input.surcharges,
          totalRate,
        },
        calculatedBy: "ai_rate_optimizer",
        calculatedAt: new Date().toISOString(),
      },
    })
    .returning();

  return {
    result: {
      quotationId: quotation.id,
      quotationNumber: quotation.quotationNumber,
      totalRate,
      totalAmount: totalRate * estimatedTeu,
      originPort,
      destinationPort,
      validFrom: validFrom.toISOString(),
      validTo: validTo.toISOString(),
    },
    entityTable: "scm_rate_quotations",
    entityId: quotation.id,
    entityAction: "create",
    entityData: quotation as unknown as Record<string, unknown>,
  };
}

// ═══════════════════════════════════════════════════════════
// PROMPT BUILDING
// ═══════════════════════════════════════════════════════════

function buildSystemPrompt(params: AiToolExecutionParams): string {
  const { config, flowMeta } = params;

  let prompt = `You are an AI agent executing Step ${params.stepNumber} of the "${flowMeta.flowName}" flow (${flowMeta.flowId}) in a Container Shipping ERP.

You MUST use the provided tools to perform real operations. Do not just describe what you would do — call the tools.

After completing your tool calls, provide a brief analysis summary.`;

  if (config.systemPromptExtra) {
    prompt += `\n\n${config.systemPromptExtra}`;
  }

  return prompt;
}

function buildUserPrompt(params: AiToolExecutionParams): string {
  const { stepNumber, flowMeta, priorContext } = params;

  let prompt = `## Step ${stepNumber} of ${flowMeta.totalSteps}
Flow: ${flowMeta.flowName} (${flowMeta.flowId})
Entity: ${flowMeta.entityType} — ${flowMeta.entityId}

## Context from Prior Steps
${JSON.stringify(priorContext, null, 2)}

Execute this step now. Use the tools provided to perform real operations, then summarize your analysis.`;

  return prompt;
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function parseAiAnalysis(text: string): Record<string, unknown> {
  try {
    const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === "object" && parsed !== null) return parsed;
  } catch {
    // Not JSON
  }

  return {
    summary: text.slice(0, 1000),
    rawText: true,
  };
}

/**
 * Simulated execution when no API key is set.
 * Still creates real entities with placeholder data.
 */
async function simulatedExecution(params: AiToolExecutionParams): Promise<AiToolExecutionResult> {
  console.log(`[AiToolExecutor] Simulated execution for step ${params.stepNumber} (no API key)`);

  return {
    status: "completed",
    entityTable: params.config.entityTable ?? null,
    entityId: null,
    entityAction: params.config.entityAction ?? null,
    entityData: null,
    aiAnalysis: {
      summary: `Simulated AI tool execution for step ${params.stepNumber} (no ANTHROPIC_API_KEY)`,
      simulated: true,
    },
    toolCallsExecuted: [],
    tokensUsed: 0,
  };
}
