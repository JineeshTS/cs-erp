/**
 * Process Analytics Service (F-030)
 *
 * Provides aggregated metrics for the process analytics dashboard:
 * - Flow completion rates and average durations
 * - Step-level performance (bottleneck identification)
 * - Gate resolution metrics (response times, auto-approve rates)
 * - Flow throughput over time (daily/weekly)
 * - AI execution vs human execution ratios
 */

import { db } from "@/lib/db";
import {
  peE2eFlowInstances,
  peE2eStepInstances,
  peHumanGates,
  peFlowEvents,
} from "@/db/schema";
import { eq, and, isNull, sql, gte, count } from "drizzle-orm";

// ── Types ──

export interface FlowAnalytics {
  overview: {
    totalFlows: number;
    completedFlows: number;
    failedFlows: number;
    activeFlows: number;
    completionRate: number;
    avgDurationMinutes: number;
  };
  byFlowType: Array<{
    e2eFlowId: string;
    total: number;
    completed: number;
    failed: number;
    avgDurationMinutes: number;
  }>;
  gateMetrics: {
    totalGates: number;
    resolved: number;
    pending: number;
    autoApproved: number;
    avgResponseMinutes: number;
    autoApproveRate: number;
    byType: Array<{
      gateType: string;
      total: number;
      resolved: number;
      avgResponseMinutes: number;
    }>;
  };
  throughput: Array<{
    date: string;
    started: number;
    completed: number;
  }>;
  executorBreakdown: {
    aiSteps: number;
    humanSteps: number;
    systemSteps: number;
    aiPercentage: number;
  };
}

// ── Main Query ──

/**
 * Get comprehensive flow analytics for a tenant.
 * @param tenantId - Tenant UUID
 * @param daysBack - Number of days to include (default 30)
 */
export async function getFlowAnalytics(
  tenantId: string,
  daysBack = 30
): Promise<FlowAnalytics> {
  const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  const [overview, byFlowType, gateMetrics, throughput, executorBreakdown] =
    await Promise.all([
      getOverview(tenantId, since),
      getByFlowType(tenantId, since),
      getGateMetrics(tenantId, since),
      getThroughput(tenantId, daysBack),
      getExecutorBreakdown(tenantId, since),
    ]);

  return { overview, byFlowType, gateMetrics, throughput, executorBreakdown };
}

// ── Sub-queries ──

async function getOverview(tenantId: string, since: Date) {
  const [row] = await db
    .select({
      totalFlows: sql<number>`count(*)::int`,
      completedFlows: sql<number>`count(*) filter (where ${peE2eFlowInstances.status} = 'completed')::int`,
      failedFlows: sql<number>`count(*) filter (where ${peE2eFlowInstances.status} = 'failed')::int`,
      activeFlows: sql<number>`count(*) filter (where ${peE2eFlowInstances.status} in ('active', 'paused_at_gate'))::int`,
      avgDurationMinutes: sql<number>`
        coalesce(
          avg(extract(epoch from (${peE2eFlowInstances.completedAt} - ${peE2eFlowInstances.startedAt})) / 60)
          filter (where ${peE2eFlowInstances.completedAt} is not null),
          0
        )::int
      `,
    })
    .from(peE2eFlowInstances)
    .where(
      and(
        eq(peE2eFlowInstances.tenantId, tenantId),
        gte(peE2eFlowInstances.createdAt, since),
        isNull(peE2eFlowInstances.deletedAt)
      )
    );

  const total = row.totalFlows || 0;
  const completed = row.completedFlows || 0;

  return {
    totalFlows: total,
    completedFlows: completed,
    failedFlows: row.failedFlows || 0,
    activeFlows: row.activeFlows || 0,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    avgDurationMinutes: row.avgDurationMinutes || 0,
  };
}

async function getByFlowType(tenantId: string, since: Date) {
  const rows = await db
    .select({
      e2eFlowId: peE2eFlowInstances.e2eFlowId,
      total: sql<number>`count(*)::int`,
      completed: sql<number>`count(*) filter (where ${peE2eFlowInstances.status} = 'completed')::int`,
      failed: sql<number>`count(*) filter (where ${peE2eFlowInstances.status} = 'failed')::int`,
      avgDurationMinutes: sql<number>`
        coalesce(
          avg(extract(epoch from (${peE2eFlowInstances.completedAt} - ${peE2eFlowInstances.startedAt})) / 60)
          filter (where ${peE2eFlowInstances.completedAt} is not null),
          0
        )::int
      `,
    })
    .from(peE2eFlowInstances)
    .where(
      and(
        eq(peE2eFlowInstances.tenantId, tenantId),
        gte(peE2eFlowInstances.createdAt, since),
        isNull(peE2eFlowInstances.deletedAt)
      )
    )
    .groupBy(peE2eFlowInstances.e2eFlowId)
    .orderBy(sql`count(*) desc`)
    .limit(20);

  return rows;
}

async function getGateMetrics(tenantId: string, since: Date) {
  const [overall] = await db
    .select({
      totalGates: sql<number>`count(*)::int`,
      resolved: sql<number>`count(*) filter (where ${peHumanGates.decision} is not null)::int`,
      pending: sql<number>`count(*) filter (where ${peHumanGates.decision} is null)::int`,
      autoApproved: sql<number>`count(*) filter (where ${peHumanGates.autoApproved} = true)::int`,
      avgResponseMinutes: sql<number>`
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

  const byType = await db
    .select({
      gateType: peHumanGates.gateType,
      total: sql<number>`count(*)::int`,
      resolved: sql<number>`count(*) filter (where ${peHumanGates.decision} is not null)::int`,
      avgResponseMinutes: sql<number>`
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
    )
    .groupBy(peHumanGates.gateType);

  const total = overall.totalGates || 0;
  const resolved = overall.resolved || 0;
  const autoApproved = overall.autoApproved || 0;

  return {
    totalGates: total,
    resolved,
    pending: overall.pending || 0,
    autoApproved,
    avgResponseMinutes: overall.avgResponseMinutes || 0,
    autoApproveRate: resolved > 0 ? Math.round((autoApproved / resolved) * 100) : 0,
    byType,
  };
}

async function getThroughput(tenantId: string, daysBack: number) {
  const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      date: sql<string>`to_char(${peE2eFlowInstances.createdAt}::date, 'YYYY-MM-DD')`,
      started: sql<number>`count(*)::int`,
      completed: sql<number>`count(*) filter (where ${peE2eFlowInstances.status} = 'completed')::int`,
    })
    .from(peE2eFlowInstances)
    .where(
      and(
        eq(peE2eFlowInstances.tenantId, tenantId),
        gte(peE2eFlowInstances.createdAt, since),
        isNull(peE2eFlowInstances.deletedAt)
      )
    )
    .groupBy(sql`${peE2eFlowInstances.createdAt}::date`)
    .orderBy(sql`${peE2eFlowInstances.createdAt}::date`);

  return rows;
}

async function getExecutorBreakdown(tenantId: string, since: Date) {
  const [row] = await db
    .select({
      aiSteps: sql<number>`count(*) filter (where ${peE2eStepInstances.executorType} in ('ai_agent', 'ai'))::int`,
      humanSteps: sql<number>`count(*) filter (where ${peE2eStepInstances.executorType} = 'human')::int`,
      systemSteps: sql<number>`count(*) filter (where ${peE2eStepInstances.executorType} = 'system')::int`,
    })
    .from(peE2eStepInstances)
    .where(
      and(
        eq(peE2eStepInstances.tenantId, tenantId),
        gte(peE2eStepInstances.createdAt, since)
      )
    );

  const total = (row.aiSteps || 0) + (row.humanSteps || 0) + (row.systemSteps || 0);

  return {
    aiSteps: row.aiSteps || 0,
    humanSteps: row.humanSteps || 0,
    systemSteps: row.systemSteps || 0,
    aiPercentage: total > 0 ? Math.round(((row.aiSteps || 0) / total) * 100) : 0,
  };
}
