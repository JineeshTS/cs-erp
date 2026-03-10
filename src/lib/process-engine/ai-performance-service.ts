/**
 * AI Performance Tracking Service (F-031)
 *
 * Tracks and reports on AI execution quality:
 * - Token usage and costs per flow/step
 * - AI decision accuracy (auto-approve vs manual override)
 * - Execution speed (AI steps vs human steps)
 * - Fallback rates (when AI fails and falls back)
 * - Recommendation accuracy (AI recommendation vs human decision)
 */

import { db } from "@/lib/db";
import {
  peE2eStepInstances,
  peHumanGates,
} from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

// ── Types ──

export interface AiPerformanceMetrics {
  execution: {
    totalAiSteps: number;
    completedAiSteps: number;
    failedAiSteps: number;
    fallbackSteps: number;
    successRate: number;
    avgDurationMs: number;
    totalTokensUsed: number;
    estimatedCostUsd: number;
  };
  recommendations: {
    totalRecommendations: number;
    followedByHuman: number;
    overriddenByHuman: number;
    accuracyRate: number;
    avgConfidence: number;
    byDecision: Array<{
      decision: string;
      count: number;
      followedAi: number;
    }>;
  };
  autoApproval: {
    totalAutoApproved: number;
    totalManualDecisions: number;
    autoApproveRate: number;
    avgAutoApproveConfidence: number;
  };
  speed: {
    avgAiStepMs: number;
    avgHumanGateMinutes: number;
    speedMultiplier: number;
  };
}

// ── Cost constants (Claude Sonnet 4 pricing estimate) ──
const COST_PER_INPUT_TOKEN = 3.0 / 1_000_000;
const COST_PER_OUTPUT_TOKEN = 15.0 / 1_000_000;
// Approximate 60% input, 40% output ratio
const AVG_COST_PER_TOKEN = COST_PER_INPUT_TOKEN * 0.6 + COST_PER_OUTPUT_TOKEN * 0.4;

// ── Main Query ──

export async function getAiPerformanceMetrics(
  tenantId: string,
  daysBack = 30
): Promise<AiPerformanceMetrics> {
  const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  const [execution, recommendations, autoApproval, speed] = await Promise.all([
    getExecutionMetrics(tenantId, since),
    getRecommendationMetrics(tenantId, since),
    getAutoApprovalMetrics(tenantId, since),
    getSpeedMetrics(tenantId, since),
  ]);

  return { execution, recommendations, autoApproval, speed };
}

// ── Sub-queries ──

async function getExecutionMetrics(tenantId: string, since: Date) {
  const [row] = await db
    .select({
      totalAiSteps: sql<number>`count(*)::int`,
      completedAiSteps: sql<number>`count(*) filter (where ${peE2eStepInstances.status} = 'completed')::int`,
      failedAiSteps: sql<number>`count(*) filter (where ${peE2eStepInstances.status} = 'failed')::int`,
      fallbackSteps: sql<number>`
        count(*) filter (where (${peE2eStepInstances.outputData}->>'fallback')::boolean = true)::int
      `,
      avgDurationMs: sql<number>`
        coalesce(avg(${peE2eStepInstances.durationMs}) filter (where ${peE2eStepInstances.durationMs} is not null), 0)::int
      `,
      totalTokensUsed: sql<number>`
        coalesce(sum((${peE2eStepInstances.outputData}->>'tokensUsed')::int) filter (where ${peE2eStepInstances.outputData}->>'tokensUsed' is not null), 0)::int
      `,
    })
    .from(peE2eStepInstances)
    .where(
      and(
        eq(peE2eStepInstances.tenantId, tenantId),
        gte(peE2eStepInstances.createdAt, since),
        sql`${peE2eStepInstances.executorType} in ('ai_agent', 'ai')`
      )
    );

  const total = row.totalAiSteps || 0;
  const completed = row.completedAiSteps || 0;
  const tokens = row.totalTokensUsed || 0;

  return {
    totalAiSteps: total,
    completedAiSteps: completed,
    failedAiSteps: row.failedAiSteps || 0,
    fallbackSteps: row.fallbackSteps || 0,
    successRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    avgDurationMs: row.avgDurationMs || 0,
    totalTokensUsed: tokens,
    estimatedCostUsd: Math.round(tokens * AVG_COST_PER_TOKEN * 100) / 100,
  };
}

async function getRecommendationMetrics(tenantId: string, since: Date) {
  // Gates where AI made a recommendation
  const gates = await db
    .select({
      decision: peHumanGates.decision,
      aiRecommendation: peHumanGates.aiRecommendation,
      autoApproved: peHumanGates.autoApproved,
    })
    .from(peHumanGates)
    .where(
      and(
        eq(peHumanGates.tenantId, tenantId),
        gte(peHumanGates.createdAt, since),
        sql`${peHumanGates.aiRecommendation} is not null and ${peHumanGates.aiRecommendation} != '{}'::jsonb`,
        sql`${peHumanGates.decision} is not null`
      )
    );

  let followed = 0;
  let overridden = 0;
  let totalConfidence = 0;
  let confidenceCount = 0;
  const byDecision: Record<string, { count: number; followedAi: number }> = {};

  for (const gate of gates) {
    if (gate.autoApproved) {
      followed++;
      continue;
    }

    const rec = gate.aiRecommendation as Record<string, unknown> | null;
    const aiRec = rec?.recommendation as string | undefined;
    const confidence = typeof rec?.confidence === "number" ? rec.confidence : 0;

    if (confidence > 0) {
      totalConfidence += confidence;
      confidenceCount++;
    }

    const decision = gate.decision ?? "unknown";
    if (!byDecision[decision]) byDecision[decision] = { count: 0, followedAi: 0 };
    byDecision[decision].count++;

    // Check if human followed AI recommendation
    const aiSaysApprove = aiRec === "approve";
    const humanApproved = decision === "approved";
    if ((aiSaysApprove && humanApproved) || (!aiSaysApprove && !humanApproved)) {
      followed++;
      byDecision[decision].followedAi++;
    } else {
      overridden++;
    }
  }

  const total = gates.length;

  return {
    totalRecommendations: total,
    followedByHuman: followed,
    overriddenByHuman: overridden,
    accuracyRate: total > 0 ? Math.round((followed / total) * 100) : 0,
    avgConfidence: confidenceCount > 0 ? Math.round((totalConfidence / confidenceCount) * 100) / 100 : 0,
    byDecision: Object.entries(byDecision).map(([decision, data]) => ({
      decision,
      count: data.count,
      followedAi: data.followedAi,
    })),
  };
}

async function getAutoApprovalMetrics(tenantId: string, since: Date) {
  const [row] = await db
    .select({
      totalAutoApproved: sql<number>`count(*) filter (where ${peHumanGates.autoApproved} = true)::int`,
      totalManualDecisions: sql<number>`count(*) filter (where ${peHumanGates.autoApproved} = false and ${peHumanGates.decision} is not null)::int`,
      avgAutoApproveConfidence: sql<number>`
        coalesce(
          avg((${peHumanGates.aiRecommendation}->>'confidence')::float)
          filter (where ${peHumanGates.autoApproved} = true and ${peHumanGates.aiRecommendation}->>'confidence' is not null),
          0
        )
      `,
    })
    .from(peHumanGates)
    .where(
      and(
        eq(peHumanGates.tenantId, tenantId),
        gte(peHumanGates.createdAt, since)
      )
    );

  const auto = row.totalAutoApproved || 0;
  const manual = row.totalManualDecisions || 0;
  const total = auto + manual;

  return {
    totalAutoApproved: auto,
    totalManualDecisions: manual,
    autoApproveRate: total > 0 ? Math.round((auto / total) * 100) : 0,
    avgAutoApproveConfidence: Math.round((row.avgAutoApproveConfidence || 0) * 100) / 100,
  };
}

async function getSpeedMetrics(tenantId: string, since: Date) {
  // Average AI step duration
  const [aiSpeed] = await db
    .select({
      avgMs: sql<number>`coalesce(avg(${peE2eStepInstances.durationMs}), 0)::int`,
    })
    .from(peE2eStepInstances)
    .where(
      and(
        eq(peE2eStepInstances.tenantId, tenantId),
        gte(peE2eStepInstances.createdAt, since),
        sql`${peE2eStepInstances.executorType} in ('ai_agent', 'ai')`,
        sql`${peE2eStepInstances.durationMs} is not null`
      )
    );

  // Average human gate response time
  const [gateSpeed] = await db
    .select({
      avgMinutes: sql<number>`
        coalesce(
          avg(extract(epoch from (${peHumanGates.decidedAt} - ${peHumanGates.createdAt})) / 60)
          filter (where ${peHumanGates.decidedAt} is not null),
          0
        )::int
      `,
    })
    .from(peHumanGates)
    .where(
      and(
        eq(peHumanGates.tenantId, tenantId),
        gte(peHumanGates.createdAt, since)
      )
    );

  const avgAiMs = aiSpeed.avgMs || 0;
  const avgHumanMin = gateSpeed.avgMinutes || 0;
  const avgHumanMs = avgHumanMin * 60 * 1000;

  return {
    avgAiStepMs: avgAiMs,
    avgHumanGateMinutes: avgHumanMin,
    speedMultiplier: avgAiMs > 0 && avgHumanMs > 0
      ? Math.round(avgHumanMs / avgAiMs)
      : 0,
  };
}
