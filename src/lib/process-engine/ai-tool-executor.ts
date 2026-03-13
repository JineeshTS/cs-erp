/**
 * AI Tool Executor — Claude with Function Calling (D-006 Phase 2)
 *
 * Executes flow steps that need AI intelligence backed by real data.
 * Claude gets tool definitions and calls real service functions via
 * the centralized tool library dispatcher (tool-libraries/index.ts).
 *
 * 35 tools across 4 domains:
 * - CRM (14): lead scoring, credit, sanctions, negotiation, contracts, KYC, onboarding
 * - Operations (12): route, credit check, quoting, space, equipment, cutoffs, VGM, gate-in, DG, stowage
 * - Documentation (5): customs, shipping instructions, BL, release type, manifest
 * - Finance (4): invoice, tax, cash application, revenue recognition
 *
 * Unlike ai-step-executor.ts (which generates text summaries),
 * this executor creates/updates real entities via tool calls.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { StepExecutorConfig } from "./executor-configs/e2e-01-lead-to-quote";
import { createEntityBinding } from "./entity-binding-service";
import { dispatchToolCall } from "./tool-libraries";
import type { ToolCallResult } from "./tool-libraries/types";

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
// TOOL CALL DISPATCHER — delegates to tool-libraries/
// ═══════════════════════════════════════════════════════════

async function executeToolCall(
  toolName: string,
  input: Record<string, unknown>,
  params: AiToolExecutionParams
): Promise<ToolCallResult> {
  return dispatchToolCall(toolName, input, {
    tenantId: params.tenantId,
    flowInstanceId: params.flowInstanceId,
    stepInstanceId: params.stepInstanceId,
    userId: params.userId,
  });
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
