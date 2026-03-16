/**
 * AI Gate Preparer (F-028)
 *
 * Before a human gate is presented to the decision-maker, this service
 * calls Claude to analyze the context and produce:
 * - A recommended decision (approve/reject/etc.)
 * - Confidence score (0-1)
 * - Risk assessment
 * - Key factors for the decision
 * - Estimated financial impact
 *
 * The output populates the aiRecommendation field on pe_human_gates,
 * giving humans AI-powered decision support.
 */

import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { peHumanGates, peE2eStepInstances } from "@/db/schema";
import { eq, and, lt } from "drizzle-orm";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1024;

// ── Types ──

export interface AiGateRecommendation {
  recommendation: "approve" | "reject" | "needs_review";
  confidence: number;
  reasoning: string;
  keyFactors: string[];
  risks: string[];
  estimatedAmount: number | null;
  suggestedAction: string;
}

interface GateContext {
  gateType: string;
  priority: string;
  assignedToRole: string;
  flowName: string;
  flowId: string;
  stepName: string;
  module: string;
  processRef: string | null;
  entityType: string;
  entityId: string;
  slaDeadlineHours: number;
  previousStepSummaries: string[];
}

// ── Main Function ──

/**
 * Generate AI recommendation for a human gate.
 * Called when a gate is created, before it's shown to the decision-maker.
 *
 * Returns null if API key is not set (graceful degradation).
 */
export async function prepareGateRecommendation(
  context: GateContext
): Promise<AiGateRecommendation | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  try {
    const systemPrompt = buildGateSystemPrompt(context);
    const userPrompt = buildGateUserPrompt(context);

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text =
      response.content[0]?.type === "text" ? response.content[0].text : "";

    return parseGateRecommendation(text, context);
  } catch (err) {
    console.error(
      `[AiGatePreparer] Failed to generate recommendation for ${context.gateType} gate:`,
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

/**
 * Enrich a gate with AI recommendation after it's created.
 * Updates the pe_human_gates.aiRecommendation field.
 */
export async function enrichGateWithAiRecommendation(
  gateId: string,
  tenantId: string,
  context: GateContext
): Promise<void> {
  const recommendation = await prepareGateRecommendation(context);
  if (!recommendation) return;

  await db
    .update(peHumanGates)
    .set({ aiRecommendation: recommendation })
    .where(and(eq(peHumanGates.id, gateId), eq(peHumanGates.tenantId, tenantId)));
}

/**
 * Collect summaries from completed steps before a given step.
 */
export async function collectPreviousStepSummaries(
  flowInstanceId: string,
  tenantId: string,
  beforeStep: number
): Promise<string[]> {
  const steps = await db
    .select({
      stepName: peE2eStepInstances.stepName,
      outputData: peE2eStepInstances.outputData,
    })
    .from(peE2eStepInstances)
    .where(
      and(
        eq(peE2eStepInstances.flowInstanceId, flowInstanceId),
        eq(peE2eStepInstances.tenantId, tenantId),
        lt(peE2eStepInstances.stepNumber, beforeStep),
        eq(peE2eStepInstances.status, "completed")
      )
    )
    .orderBy(peE2eStepInstances.stepNumber)
    .limit(5);

  return steps.map((s) => {
    const output = s.outputData as Record<string, unknown> | null;
    const summary =
      output && typeof output.summary === "string"
        ? output.summary
        : `${s.stepName}: completed`;
    return summary;
  });
}

// ── Prompt Building ──

function buildGateSystemPrompt(context: GateContext): string {
  return `You are an AI decision support assistant for a Container Shipping ERP system.

Your job is to analyze the context of a human decision gate and provide a recommendation.

## Gate Details
- Type: ${context.gateType} (${getGateTypeDescription(context.gateType)})
- Priority: ${context.priority}
- Assigned Role: ${context.assignedToRole}
- SLA: ${context.slaDeadlineHours} hours

## Instructions
Analyze the flow context and provide a recommendation in JSON format:
{
  "recommendation": "approve" | "reject" | "needs_review",
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation",
  "keyFactors": ["Factor 1", "Factor 2"],
  "risks": ["Risk 1 if any"],
  "estimatedAmount": null or number in USD,
  "suggestedAction": "What the human should do"
}

Be conservative with confidence scores:
- 0.95+ only for clear-cut, low-risk situations
- 0.70-0.94 for moderate confidence
- Below 0.70 recommend "needs_review"

For exception gates, always recommend "needs_review" unless clearly resolvable.`;
}

function buildGateUserPrompt(context: GateContext): string {
  let prompt = `## Decision Required
A "${context.gateType}" gate has been triggered in the "${context.flowName}" flow.

Step: ${context.stepName}
Module: ${context.module}
${context.processRef ? `Process: ${context.processRef}` : ""}
Entity: ${context.entityType} — ${context.entityId}
`;

  if (context.previousStepSummaries.length > 0) {
    prompt += `\n## Previous Steps Completed\n`;
    for (const summary of context.previousStepSummaries) {
      prompt += `- ${summary}\n`;
    }
  }

  prompt += `\nProvide your recommendation as JSON.`;
  return prompt;
}

function getGateTypeDescription(gateType: string): string {
  const descriptions: Record<string, string> = {
    approval: "Requires explicit approval before proceeding",
    decision: "A choice must be made between options",
    input: "Additional information or data is needed from a human",
    exception: "An exceptional situation that needs human intervention",
  };
  return descriptions[gateType] ?? "Action required";
}

// ── Parsing ──

function parseGateRecommendation(
  text: string,
  context: GateContext
): AiGateRecommendation {
  // Default conservative recommendation
  const fallback: AiGateRecommendation = {
    recommendation: "needs_review",
    confidence: 0.5,
    reasoning: "AI analysis could not produce a clear recommendation",
    keyFactors: [`Gate type: ${context.gateType}`, `Priority: ${context.priority}`],
    risks: ["Insufficient context for automated recommendation"],
    estimatedAmount: null,
    suggestedAction: "Review the context and make a decision based on domain expertise",
  };

  try {
    const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallback;

    // M6 fix: removed dangerous backslash-doubling regex that corrupted valid unicode
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      recommendation:
        parsed.recommendation === "approve" || parsed.recommendation === "reject"
          ? parsed.recommendation
          : "needs_review",
      confidence:
        typeof parsed.confidence === "number"
          ? Math.min(1, Math.max(0, parsed.confidence))
          : 0.5,
      reasoning:
        typeof parsed.reasoning === "string" ? parsed.reasoning : fallback.reasoning,
      keyFactors: Array.isArray(parsed.keyFactors)
        ? parsed.keyFactors.filter((f: unknown) => typeof f === "string")
        : fallback.keyFactors,
      risks: Array.isArray(parsed.risks)
        ? parsed.risks.filter((r: unknown) => typeof r === "string")
        : [],
      estimatedAmount:
        typeof parsed.estimatedAmount === "number" ? parsed.estimatedAmount : null,
      suggestedAction:
        typeof parsed.suggestedAction === "string"
          ? parsed.suggestedAction
          : fallback.suggestedAction,
    };
  } catch {
    return fallback;
  }
}
