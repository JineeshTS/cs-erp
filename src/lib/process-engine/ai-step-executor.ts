/**
 * AI Step Executor (F-027)
 *
 * Replaces simulated step execution with real Claude API calls.
 * Each AI/system step gets a contextual prompt and returns structured output.
 *
 * Uses Claude Sonnet 4 via the Anthropic SDK (already installed).
 * Falls back to simulated output if ANTHROPIC_API_KEY is not set.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { E2EFlowStep } from "@/types/processes";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 2048;

// ── System Prompt ──

function buildSystemPrompt(context: StepContext): string {
  return `You are an AI agent executing a step in an end-to-end business process flow for a Container Shipping ERP system.

## Your Role
You are the "${context.stepName}" agent in the "${context.flowName}" flow.
Module: ${context.module}
Process Reference: ${context.processRef ?? "N/A"}
Entity: ${context.entityType} (${context.entityId})

## Instructions
Execute this step as if you are the responsible AI agent. Analyze the context and produce a structured output that:
1. Summarizes what action you performed
2. Lists any key decisions or findings
3. Notes any risks or follow-up items
4. Provides data that downstream steps may need

## Output Format
Respond with a JSON object (no markdown fences) containing:
{
  "summary": "Brief summary of action taken",
  "decisions": ["Decision 1", "Decision 2"],
  "findings": ["Finding 1", "Finding 2"],
  "risks": ["Risk 1 if any"],
  "followUp": ["Follow-up item if any"],
  "data": { "key": "value pairs relevant to this step" }
}

Keep the output concise and actionable. Focus on what a shipping operations team would need.`;
}

// ── Types ──

interface StepContext {
  flowId: string;
  flowName: string;
  flowInstanceId: string;
  stepNumber: number;
  totalSteps: number;
  stepName: string;
  module: string;
  processRef: string | null;
  executorType: string;
  entityType: string;
  entityId: string;
  previousStepOutputs: Record<string, unknown>[];
}

interface AiStepResult {
  status: "completed" | "failed";
  executedBy: string;
  processRef: string | null;
  stepName: string;
  module: string;
  flowId: string;
  stepNumber: number;
  executedAt: string;
  aiModel: string;
  tokensUsed: number;
  result: Record<string, unknown>;
  error?: string;
}

// ── Execution ──

/**
 * Execute a step using Claude AI.
 * Falls back to simulated output if API key is missing or call fails.
 */
export async function executeStepWithAi(
  stepDef: E2EFlowStep,
  context: StepContext
): Promise<AiStepResult> {
  const baseResult = {
    executedBy: stepDef.executorType ?? stepDef.type,
    processRef: stepDef.processRef ?? null,
    stepName: stepDef.step,
    module: stepDef.module,
    flowId: context.flowId,
    stepNumber: context.stepNumber,
    executedAt: new Date().toISOString(),
  };

  // Fallback if no API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      ...baseResult,
      status: "completed",
      aiModel: "simulated",
      tokensUsed: 0,
      result: {
        summary: `Simulated execution of "${stepDef.step}" (no API key configured)`,
        decisions: [],
        findings: [],
        risks: [],
        followUp: [],
        data: {},
        simulated: true,
      },
    };
  }

  try {
    const systemPrompt = buildSystemPrompt(context);
    const userPrompt = buildUserPrompt(stepDef, context);

    // M12: Add 60s timeout to prevent hanging AI calls
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }, { signal: controller.signal }).finally(() => clearTimeout(timeout));

    const text =
      response.content[0]?.type === "text" ? response.content[0].text : "";
    const tokensUsed =
      (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0);

    // Parse AI output
    const parsed = parseAiOutput(text);

    return {
      ...baseResult,
      status: "completed",
      aiModel: MODEL,
      tokensUsed,
      result: parsed,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown AI error";
    console.error(
      `[AiStepExecutor] Failed to execute step ${context.stepNumber} of ${context.flowId}:`,
      errorMsg
    );

    // D-006: Return failed status so the flow doesn't silently advance
    return {
      ...baseResult,
      status: "failed",
      aiModel: MODEL,
      tokensUsed: 0,
      result: {
        summary: `AI execution failed: ${errorMsg}`,
        decisions: [],
        findings: [],
        risks: [`AI execution error: ${errorMsg}`],
        followUp: ["Review this step manually — AI execution did not complete"],
        data: {},
        failed: true,
      },
      error: errorMsg,
    };
  }
}

// ── Prompt Building ──

function buildUserPrompt(stepDef: E2EFlowStep, context: StepContext): string {
  let prompt = `## Current Step
Step ${context.stepNumber} of ${context.totalSteps}: "${stepDef.step}"
Module: ${stepDef.module}
${stepDef.processRef ? `Process: ${stepDef.processRef}` : ""}

## Flow Context
Flow: ${context.flowName} (${context.flowId})
Entity: ${context.entityType} — ${context.entityId}
`;

  // Add previous step context if available
  if (context.previousStepOutputs.length > 0) {
    prompt += `\n## Previous Step Outputs (last ${Math.min(context.previousStepOutputs.length, 3)})\n`;
    const recent = context.previousStepOutputs.slice(-3);
    for (const output of recent) {
      const summary =
        typeof output.summary === "string"
          ? output.summary
          : typeof output.stepName === "string"
          ? `Step: ${output.stepName}`
          : "Completed";
      prompt += `- ${summary}\n`;
    }
  }

  prompt += `\nExecute this step now. Provide your structured output as JSON.`;
  return prompt;
}

// ── Output Parsing ──

function parseAiOutput(text: string): Record<string, unknown> {
  // Try direct JSON parse
  try {
    const trimmed = text.trim();
    // Strip markdown code fences if present
    // M6 fix: removed dangerous backslash-doubling regex that corrupted valid unicode
    const jsonStr = trimmed
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "");
    const parsed = JSON.parse(jsonStr);
    if (typeof parsed === "object" && parsed !== null) return parsed;
  } catch {
    // Not valid JSON
  }

  // Try to extract JSON from the text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (typeof parsed === "object" && parsed !== null) return parsed;
    } catch {
      // Not valid JSON either
    }
  }

  // Return raw text as structured output
  return {
    summary: text.slice(0, 500),
    decisions: [],
    findings: [],
    risks: [],
    followUp: [],
    data: {},
    rawText: true,
  };
}
