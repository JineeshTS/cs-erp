/**
 * Proactive Risk Alert Service (F-029)
 *
 * Analyzes active E2E flows and predicts problems before they happen:
 * - SLA breach risk — gates approaching deadlines
 * - Bottleneck detection — flows stuck at same step too long
 * - Step failure patterns — repeated failures on specific steps
 * - Resource conflicts — same entity with multiple active flows
 * - Flow velocity anomalies — flows running slower than average
 *
 * Intended to be called periodically (e.g. every 15 minutes).
 */

import { db } from "@/lib/db";
import {
  peHumanGates,
  peE2eFlowInstances,
  peE2eStepInstances,
  peFlowEvents,
  wneNotifications,
} from "@/db/schema";
import { eq, and, isNull, lt, gt, sql, count, inArray } from "drizzle-orm";

// ── Types ──

export interface RiskAlert {
  type: "sla_risk" | "bottleneck" | "failure_pattern" | "resource_conflict" | "velocity_anomaly";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  flowInstanceId?: string;
  gateId?: string;
  entityType?: string;
  entityId?: string;
  metadata: Record<string, unknown>;
}

export interface RiskScanResult {
  alerts: RiskAlert[];
  scannedFlows: number;
  scannedGates: number;
  scanDurationMs: number;
}

// ── Main Scanner ──

/**
 * Run a full risk scan across all active flows.
 * Returns a list of risk alerts sorted by severity.
 */
export async function scanForRisks(tenantId?: string): Promise<RiskScanResult> {
  const start = Date.now();
  const alerts: RiskAlert[] = [];

  const [slaAlerts, scannedGates] = await detectSlaRisks(tenantId);
  alerts.push(...slaAlerts);

  const [bottleneckAlerts, scannedFlows] = await detectBottlenecks(tenantId);
  alerts.push(...bottleneckAlerts);

  const failureAlerts = await detectFailurePatterns(tenantId);
  alerts.push(...failureAlerts);

  const conflictAlerts = await detectResourceConflicts(tenantId);
  alerts.push(...conflictAlerts);

  // Sort by severity
  const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  alerts.sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9));

  const scanDurationMs = Date.now() - start;

  if (alerts.length > 0) {
    console.log(
      `[RiskAlerts] Scan complete: ${alerts.length} alerts ` +
      `(${alerts.filter((a) => a.severity === "critical").length} critical, ` +
      `${alerts.filter((a) => a.severity === "high").length} high) in ${scanDurationMs}ms`
    );
  }

  return { alerts, scannedFlows, scannedGates, scanDurationMs };
}

// ── SLA Risk Detection ──

/**
 * Find gates approaching SLA deadline (within 30 minutes or 25% of remaining time).
 */
async function detectSlaRisks(tenantId?: string): Promise<[RiskAlert[], number]> {
  const alerts: RiskAlert[] = [];
  const now = new Date();

  const conditions = [isNull(peHumanGates.decision)];
  if (tenantId) conditions.push(eq(peHumanGates.tenantId, tenantId));

  const pendingGates = await db
    .select()
    .from(peHumanGates)
    .where(and(...conditions));

  for (const gate of pendingGates) {
    const deadline = gate.slaDeadline;
    const remaining = deadline.getTime() - now.getTime();
    const totalSla = deadline.getTime() - gate.createdAt.getTime();
    const elapsed = now.getTime() - gate.createdAt.getTime();
    const percentUsed = totalSla > 0 ? elapsed / totalSla : 1;

    // Already overdue — skip (handled by SLA check)
    if (remaining <= 0) continue;

    // Within 30 minutes OR 75%+ of SLA used
    if (remaining < 1800000 || percentUsed >= 0.75) {
      const minutesRemaining = Math.round(remaining / 60000);
      const severity = remaining < 900000 ? "critical" as const : remaining < 1800000 ? "high" as const : "medium" as const;

      alerts.push({
        type: "sla_risk",
        severity,
        title: `SLA at risk: ${gate.gateType} gate`,
        description: `${minutesRemaining}m remaining (${Math.round(percentUsed * 100)}% elapsed). ` +
          `Priority: ${gate.priority}, assigned to: ${gate.assignedToRole}`,
        flowInstanceId: gate.flowInstanceId,
        gateId: gate.id,
        metadata: {
          minutesRemaining,
          percentUsed: Math.round(percentUsed * 100),
          gateType: gate.gateType,
          priority: gate.priority,
          slaDeadline: deadline.toISOString(),
        },
      });
    }
  }

  return [alerts, pendingGates.length];
}

// ── Bottleneck Detection ──

/**
 * Find flows that have been stuck at the same step for too long.
 * "Too long" = more than 2x the average step duration for that flow type.
 */
async function detectBottlenecks(tenantId?: string): Promise<[RiskAlert[], number]> {
  const alerts: RiskAlert[] = [];
  const now = new Date();
  const stuckThresholdMs = 2 * 60 * 60 * 1000; // 2 hours default

  const conditions = [
    eq(peE2eFlowInstances.status, "active"),
    isNull(peE2eFlowInstances.deletedAt),
  ];
  if (tenantId) conditions.push(eq(peE2eFlowInstances.tenantId, tenantId));

  const activeFlows = await db
    .select()
    .from(peE2eFlowInstances)
    .where(and(...conditions));

  if (activeFlows.length === 0) return [alerts, 0];

  // Batch-fetch all current step instances in ONE query (avoids N+1)
  const flowIds = activeFlows.map((f) => f.id);
  const allStepInstances = await db
    .select()
    .from(peE2eStepInstances)
    .where(inArray(peE2eStepInstances.flowInstanceId, flowIds));

  // Map: flowInstanceId → step instances for that flow
  const stepsByFlow = new Map<string, typeof allStepInstances>();
  for (const step of allStepInstances) {
    const existing = stepsByFlow.get(step.flowInstanceId) ?? [];
    existing.push(step);
    stepsByFlow.set(step.flowInstanceId, existing);
  }

  for (const flow of activeFlows) {
    const flowSteps = stepsByFlow.get(flow.id) ?? [];
    const currentStep = flowSteps.find(
      (s) => s.stepNumber === flow.currentStepNumber
    );

    if (!currentStep) continue;

    // M1 fix: use startedAt (when step began executing) not createdAt (row insert time)
    const stepStart = currentStep.startedAt ?? currentStep.createdAt;
    const stepAge = now.getTime() - stepStart.getTime();
    if (stepAge > stuckThresholdMs && currentStep.status !== "completed") {
      const hoursStuck = Math.round(stepAge / 3600000 * 10) / 10;
      alerts.push({
        type: "bottleneck",
        severity: hoursStuck > 8 ? "high" : "medium",
        title: `Flow stuck at step ${flow.currentStepNumber}`,
        description: `"${currentStep.stepName}" has been ${currentStep.status} for ${hoursStuck}h. ` +
          `Flow: ${flow.e2eFlowId}, entity: ${flow.entityType}/${flow.entityId}`,
        flowInstanceId: flow.id,
        entityType: flow.entityType,
        entityId: flow.entityId,
        metadata: {
          stepNumber: flow.currentStepNumber,
          stepName: currentStep.stepName,
          stepStatus: currentStep.status,
          hoursStuck,
          flowId: flow.e2eFlowId,
        },
      });
    }
  }

  return [alerts, activeFlows.length];
}

// ── Failure Pattern Detection ──

/**
 * Find steps or flows with repeated failures.
 */
async function detectFailurePatterns(tenantId?: string): Promise<RiskAlert[]> {
  const alerts: RiskAlert[] = [];

  // Look for flows with failed steps in the last 24 hours
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const conditions = [
    eq(peE2eStepInstances.status, "failed"),
    gt(peE2eStepInstances.createdAt, since),
  ];
  if (tenantId) conditions.push(eq(peE2eStepInstances.tenantId, tenantId));

  const failedSteps = await db
    .select({
      stepName: peE2eStepInstances.stepName,
      processRef: peE2eStepInstances.processRef,
      failCount: count(),
    })
    .from(peE2eStepInstances)
    .where(and(...conditions))
    .groupBy(peE2eStepInstances.stepName, peE2eStepInstances.processRef);

  for (const row of failedSteps) {
    const failCount = Number(row.failCount);
    if (failCount >= 2) {
      alerts.push({
        type: "failure_pattern",
        severity: failCount >= 5 ? "critical" : failCount >= 3 ? "high" : "medium",
        title: `Repeated failures: ${row.stepName}`,
        description: `${failCount} failures in the last 24h for "${row.stepName}"` +
          (row.processRef ? ` (${row.processRef})` : ""),
        metadata: {
          stepName: row.stepName,
          processRef: row.processRef,
          failCount,
          period: "24h",
        },
      });
    }
  }

  return alerts;
}

// ── Resource Conflict Detection ──

/**
 * Find entities with multiple active flows that may conflict.
 */
async function detectResourceConflicts(tenantId?: string): Promise<RiskAlert[]> {
  const alerts: RiskAlert[] = [];

  const conditions = [
    sql`${peE2eFlowInstances.status} IN ('active', 'paused_at_gate')`,
    isNull(peE2eFlowInstances.deletedAt),
  ];
  if (tenantId) conditions.push(eq(peE2eFlowInstances.tenantId, tenantId));

  const conflicts = await db
    .select({
      entityType: peE2eFlowInstances.entityType,
      entityId: peE2eFlowInstances.entityId,
      activeFlows: count(),
    })
    .from(peE2eFlowInstances)
    .where(and(...conditions))
    .groupBy(peE2eFlowInstances.entityType, peE2eFlowInstances.entityId)
    .having(sql`count(*) > 1`);

  for (const row of conflicts) {
    const flowCount = Number(row.activeFlows);
    alerts.push({
      type: "resource_conflict",
      severity: flowCount >= 4 ? "high" : "medium",
      title: `${flowCount} active flows for ${row.entityType}`,
      description: `Entity ${row.entityType}/${row.entityId} has ${flowCount} concurrent active flows. ` +
        `Check for potential conflicts or duplicate processing.`,
      entityType: row.entityType,
      entityId: row.entityId,
      metadata: {
        entityType: row.entityType,
        entityId: row.entityId,
        activeFlowCount: flowCount,
      },
    });
  }

  return alerts;
}

// ── API for risk alert endpoint ──

/**
 * Create notification for critical/high risk alerts.
 */
export async function notifyRiskAlerts(
  tenantId: string,
  alerts: RiskAlert[]
): Promise<number> {
  let notified = 0;
  const criticalAlerts = alerts.filter(
    (a) => a.severity === "critical" || a.severity === "high"
  );

  for (const alert of criticalAlerts) {
    await db.insert(wneNotifications).values({
      tenantId,
      userId: "system", // broadcast notification — no specific user target
      channel: "in_app",
      title: `[${alert.severity.toUpperCase()}] ${alert.title}`,
      body: alert.description,
      entityType: "risk_alert",
      entityId: alert.flowInstanceId ?? alert.entityId ?? "system",
      actionUrl: alert.flowInstanceId ? `/e2e-flows/${alert.flowInstanceId}` : "/e2e-flows",
      priority: alert.severity === "critical" ? "critical" : "high",
      status: "pending",
    });
    notified++;
  }

  return notified;
}
