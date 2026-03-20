/**
 * Human Gate Manager
 *
 * Manages the lifecycle of human gates in E2E flows:
 * - Notification dispatch when gates are created
 * - SLA monitoring — warning and breach detection
 * - Escalation — reassign overdue gates up the chain
 * - Auto-approve — resolve low-risk gates with high AI confidence
 *
 * SLA enforcement per D-005 Section 6:
 * | Priority | Default SLA | Warning At | Escalation At | Auto-Approve |
 * |----------|-------------|-----------|---------------|--------------|
 * | Critical | 1 hour      | 30 min    | 1 hour        | Never        |
 * | High     | 2 hours     | 1 hour    | 2 hours       | AI > 95% AND < $5,000 |
 * | Normal   | 4 hours     | 2 hours   | 4 hours       | AI > 95% AND < $1,000 |
 * | Low      | 24 hours    | 12 hours  | 24 hours      | AI > 95%     |
 *
 * Escalation chain:
 * Assigned user → Direct manager → Department head → Operations director → CEO
 */

import { db } from "@/lib/db";
import {
  peHumanGates,
  peE2eFlowInstances,
  peFlowEvents,
  wneNotifications,
} from "@/db/schema";
import { eq, and, isNull, lt, sql } from "drizzle-orm";
import { eventBus } from "@/lib/events/event-bus";

// ── SLA Configuration ──

interface SlaTier {
  slaHours: number;
  warningHours: number;
  autoApproveMaxAmount: number | null; // null = never auto-approve
  autoApproveMinConfidence: number;
}

const SLA_TIERS: Record<string, SlaTier> = {
  critical: {
    slaHours: 1,
    warningHours: 0.5,
    autoApproveMaxAmount: null, // never
    autoApproveMinConfidence: 1.0,
  },
  high: {
    slaHours: 2,
    warningHours: 1,
    autoApproveMaxAmount: 5000,
    autoApproveMinConfidence: 0.95,
  },
  normal: {
    slaHours: 4,
    warningHours: 2,
    autoApproveMaxAmount: 1000,
    autoApproveMinConfidence: 0.95,
  },
  low: {
    slaHours: 24,
    warningHours: 12,
    autoApproveMaxAmount: Infinity,
    autoApproveMinConfidence: 0.95,
  },
};

const ESCALATION_CHAIN = [
  "assigned_user",
  "direct_manager",
  "department_head",
  "operations_director",
  "ceo",
];

// ── Notification Dispatch ──

/**
 * Send in-app notification when a human gate is created.
 * Uses the existing wne_notifications table.
 */
export async function notifyGateCreated(params: {
  tenantId: string;
  gateId: string;
  gateType: string;
  assignedToUserId?: string;
  assignedToRole: string;
  flowInstanceId: string;
  stepName: string;
  priority: string;
  slaDeadline: Date;
  entityType: string;
  entityId: string;
}) {
  const titleByType: Record<string, string> = {
    approval: "Approval Required",
    decision: "Decision Required",
    input: "Input Required",
    exception: "Exception — Action Required",
  };

  const title = titleByType[params.gateType] ?? "Action Required";
  const body =
    `${title}: ${params.stepName}\n` +
    `Entity: ${params.entityType} ${params.entityId}\n` +
    `Priority: ${params.priority.toUpperCase()}\n` +
    `SLA Deadline: ${params.slaDeadline.toISOString()}\n` +
    `Role: ${params.assignedToRole}`;

  // Create in-app notification if we have a user ID
  if (params.assignedToUserId) {
    await db.insert(wneNotifications).values({
      tenantId: params.tenantId,
      userId: params.assignedToUserId,
      channel: "in_app",
      title: `[${params.priority.toUpperCase()}] ${title}`,
      body,
      entityType: "human_gate",
      entityId: params.gateId,
      actionUrl: `/e2e-flows/gates?gate=${params.gateId}`,
      priority: params.priority,
      status: "pending",
    });
  }

  // Emit event for external notification channels (email, SMS, etc.)
  eventBus.emit({
    type: "APPROVAL_REQUESTED",
    tenantId: params.tenantId,
    userId: params.assignedToUserId ?? "",
    entityId: params.gateId,
    entityType: "approval" as const,
    timestamp: new Date(),
    data: {
      approvalType: `e2e_gate_${params.gateType}`,
      requestedById: "system",
      assignedToId: params.assignedToUserId ?? params.assignedToRole,
      referenceId: params.flowInstanceId,
      referenceType: "e2e_flow",
    },
  });
}

/**
 * Send SLA warning notification.
 */
async function notifySlaWarning(gate: {
  id: string;
  tenantId: string;
  assignedToUserId: string | null;
  assignedToRole: string;
  gateType: string;
  slaDeadline: Date;
  flowInstanceId: string;
}) {
  if (!gate.assignedToUserId) return;

  const minutesRemaining = Math.round(
    (gate.slaDeadline.getTime() - Date.now()) / 60000
  );

  await db.insert(wneNotifications).values({
    tenantId: gate.tenantId,
    userId: gate.assignedToUserId,
    channel: "in_app",
    title: `SLA Warning: ${gate.gateType} gate approaching deadline`,
    body: `You have ${minutesRemaining} minutes remaining to respond to this ${gate.gateType} gate. The SLA deadline is ${gate.slaDeadline.toISOString()}.`,
    entityType: "human_gate",
    entityId: gate.id,
    actionUrl: `/e2e-flows/gates?gate=${gate.id}`,
    priority: "high",
    status: "pending",
  });
}

/**
 * Send SLA breach notification.
 */
async function notifySlaBreach(gate: {
  id: string;
  tenantId: string;
  assignedToUserId: string | null;
  escalationToRole: string | null;
  gateType: string;
  slaDeadline: Date;
  flowInstanceId: string;
}) {
  if (!gate.assignedToUserId) return;

  const minutesOverdue = Math.round(
    (Date.now() - gate.slaDeadline.getTime()) / 60000
  );

  await db.insert(wneNotifications).values({
    tenantId: gate.tenantId,
    userId: gate.assignedToUserId,
    channel: "in_app",
    title: `SLA BREACHED: ${gate.gateType} gate overdue by ${minutesOverdue}m`,
    body: `This ${gate.gateType} gate has exceeded its SLA deadline by ${minutesOverdue} minutes. Escalation in progress.`,
    entityType: "human_gate",
    entityId: gate.id,
    actionUrl: `/e2e-flows/gates?gate=${gate.id}`,
    priority: "critical",
    status: "pending",
  });
}

// ── SLA Monitoring ──

/**
 * Check all pending gates for SLA warnings and breaches.
 * Intended to be called periodically (e.g. every 5 minutes via cron/scheduled task).
 *
 * Returns counts of warnings sent, breaches detected, and auto-approvals.
 */
export async function checkGateSlas(tenantId: string): Promise<{
  warnings: number;
  breaches: number;
  escalations: number;
  autoApprovals: number;
}> {
  const now = new Date();
  let warnings = 0;
  let breaches = 0;
  let escalations = 0;
  let autoApprovals = 0;

  // C3 fix: tenant-isolated query (was querying ALL tenants)
  const pendingGates = await db
    .select()
    .from(peHumanGates)
    .where(
      and(
        eq(peHumanGates.tenantId, tenantId),
        isNull(peHumanGates.decision)
      )
    );

  for (const gate of pendingGates) {
    const tier = SLA_TIERS[gate.priority] ?? SLA_TIERS.normal;
    const warningTime = new Date(
      gate.createdAt.getTime() + tier.warningHours * 3600000
    );

    // H5 fix: idempotency — check metadata for already-notified flags
    const gateMeta = (gate.decisionData ?? {}) as Record<string, unknown>;

    // Check for SLA breach
    if (now >= gate.slaDeadline) {
      // Only notify/escalate if not already processed in a prior run
      if (!gateMeta._breachNotifiedAt) {
        breaches++;
        await notifySlaBreach(gate);

        await db.insert(peFlowEvents).values({
          tenantId: gate.tenantId,
          flowInstanceId: gate.flowInstanceId,
          stepInstanceId: gate.stepInstanceId,
          eventType: "sla_breached",
          metadata: {
            gateId: gate.id,
            gateType: gate.gateType,
            priority: gate.priority,
            slaDeadline: gate.slaDeadline.toISOString(),
            minutesOverdue: Math.round(
              (now.getTime() - gate.slaDeadline.getTime()) / 60000
            ),
          },
        });

        // Mark breach as notified to prevent duplicate notifications
        await db
          .update(peHumanGates)
          .set({
            decisionData: {
              ...gateMeta,
              _breachNotifiedAt: now.toISOString(),
            },
          })
          .where(and(eq(peHumanGates.id, gate.id), eq(peHumanGates.tenantId, tenantId)));
      }

      // Attempt auto-approve for non-critical gates
      const autoApproved = await attemptAutoApprove(gate, tier);
      if (autoApproved) {
        autoApprovals++;
        continue;
      }

      // Escalate
      const escalated = await escalateGate(gate, tenantId);
      if (escalated) escalations++;
    }
    // Check for SLA warning
    else if (now >= warningTime) {
      // Only notify if not already warned
      if (!gateMeta._warningNotifiedAt) {
        warnings++;
        await notifySlaWarning(gate);

        await db.insert(peFlowEvents).values({
          tenantId: gate.tenantId,
          flowInstanceId: gate.flowInstanceId,
          stepInstanceId: gate.stepInstanceId,
          eventType: "sla_warning",
          metadata: {
            gateId: gate.id,
            gateType: gate.gateType,
            minutesRemaining: Math.round(
              (gate.slaDeadline.getTime() - now.getTime()) / 60000
            ),
          },
        });

        // Mark warning as notified
        await db
          .update(peHumanGates)
          .set({
            decisionData: {
              ...gateMeta,
              _warningNotifiedAt: now.toISOString(),
            },
          })
          .where(and(eq(peHumanGates.id, gate.id), eq(peHumanGates.tenantId, tenantId)));
      }
    }
  }

  if (breaches > 0 || warnings > 0) {
    console.log(
      `[GateManager] SLA check (${tenantId}): ${warnings} warnings, ${breaches} breaches, ` +
      `${escalations} escalations, ${autoApprovals} auto-approvals`
    );
  }

  return { warnings, breaches, escalations, autoApprovals };
}

// ── Auto-Approve ──

/**
 * Attempt to auto-approve a gate based on AI recommendation confidence
 * and the amount threshold for the priority tier.
 */
async function attemptAutoApprove(
  gate: typeof peHumanGates.$inferSelect,
  tier: SlaTier
): Promise<boolean> {
  // Never auto-approve critical gates
  if (tier.autoApproveMaxAmount === null) return false;

  // Only auto-approve "approval" gates (not decision/input/exception)
  if (gate.gateType !== "approval") return false;

  const recommendation = (gate.aiRecommendation ?? {}) as Record<string, unknown>;
  const confidence = typeof recommendation.confidence === "number"
    ? recommendation.confidence
    : 0;
  // C2 fix: field is "estimatedAmount" (from AiGateRecommendation), not "amount"
  const amount = typeof recommendation.estimatedAmount === "number"
    ? recommendation.estimatedAmount
    : typeof recommendation.amount === "number"
      ? recommendation.amount
      : 0; // Default to 0 (not Infinity) — unknown amounts should NOT auto-approve

  if (confidence >= tier.autoApproveMinConfidence && amount <= tier.autoApproveMaxAmount) {
    // Auto-approve — with tenant isolation
    await db
      .update(peHumanGates)
      .set({
        decision: "approved",
        decidedBy: "system_auto_approve",
        decidedAt: new Date(),
        autoApproved: true,
        decisionData: {
          autoApproved: true,
          aiConfidence: confidence,
          reason: `Auto-approved: AI confidence ${(confidence * 100).toFixed(1)}% ≥ ${(tier.autoApproveMinConfidence * 100).toFixed(0)}%, amount $${amount} ≤ $${tier.autoApproveMaxAmount}`,
        },
      })
      .where(and(eq(peHumanGates.id, gate.id), eq(peHumanGates.tenantId, gate.tenantId)));

    // H6 fix: Resume flow AND trigger step execution (was only setting status)
    await db
      .update(peE2eFlowInstances)
      .set({ status: "active" })
      .where(and(eq(peE2eFlowInstances.id, gate.flowInstanceId), eq(peE2eFlowInstances.tenantId, gate.tenantId)));

    // Advance past the gate step and continue execution
    // Import dynamically to avoid circular dependency
    const { resumeAfterGate } = await import("./step-executor");
    resumeAfterGate(gate.flowInstanceId, gate.tenantId, "approved", {
      autoApproved: true,
      aiConfidence: confidence,
    }).catch((err: unknown) =>
      console.error(`[GateManager] Auto-approve resume failed for gate ${gate.id}:`, err)
    );

    await db.insert(peFlowEvents).values({
      tenantId: gate.tenantId,
      flowInstanceId: gate.flowInstanceId,
      stepInstanceId: gate.stepInstanceId,
      eventType: "gate_auto_approved",
      metadata: {
        gateId: gate.id,
        confidence,
        amount,
        tier: gate.priority,
      },
    });

    console.log(
      `[GateManager] Auto-approved gate ${gate.id} — ` +
      `confidence: ${(confidence * 100).toFixed(1)}%, amount: $${amount}`
    );

    return true;
  }

  return false;
}

// ── Escalation ──

/**
 * Escalate a gate to the next person in the escalation chain.
 */
async function escalateGate(
  gate: typeof peHumanGates.$inferSelect,
  tenantId: string
): Promise<boolean> {
  const currentRole = gate.escalationToRole ?? gate.assignedToRole;
  const currentIdx = ESCALATION_CHAIN.indexOf(currentRole);
  const nextIdx = currentIdx + 1;

  if (nextIdx >= ESCALATION_CHAIN.length) {
    console.warn(
      `[GateManager] Gate ${gate.id} already at top of escalation chain`
    );
    return false;
  }

  const nextRole = ESCALATION_CHAIN[nextIdx];

  // M7 fix: add tenant isolation to update
  await db
    .update(peHumanGates)
    .set({
      escalationToRole: nextRole,
      // Extend SLA by 1 hour for escalated gates
      slaDeadline: new Date(Date.now() + 3600000),
    })
    .where(and(eq(peHumanGates.id, gate.id), eq(peHumanGates.tenantId, tenantId)));

  await db.insert(peFlowEvents).values({
    tenantId: gate.tenantId,
    flowInstanceId: gate.flowInstanceId,
    stepInstanceId: gate.stepInstanceId,
    eventType: "escalation",
    metadata: {
      gateId: gate.id,
      fromRole: currentRole,
      toRole: nextRole,
      escalationLevel: nextIdx,
    },
  });

  console.log(
    `[GateManager] Escalated gate ${gate.id}: ${currentRole} → ${nextRole}`
  );

  return true;
}

// ── Gate Statistics ──

/**
 * Get gate statistics for monitoring dashboard.
 */
export async function getGateStatistics(tenantId: string) {
  const now = new Date();

  const [stats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      pending: sql<number>`count(*) filter (where ${peHumanGates.decision} is null)::int`,
      approved: sql<number>`count(*) filter (where ${peHumanGates.decision} = 'approved')::int`,
      rejected: sql<number>`count(*) filter (where ${peHumanGates.decision} = 'rejected')::int`,
      autoApproved: sql<number>`count(*) filter (where ${peHumanGates.autoApproved} = true)::int`,
      breached: sql<number>`count(*) filter (where ${peHumanGates.decision} is null and ${peHumanGates.slaDeadline} < ${now.toISOString()}::timestamptz)::int`,
      avgResponseMinutes: sql<number>`
        coalesce(
          avg(extract(epoch from (${peHumanGates.decidedAt} - ${peHumanGates.createdAt})) / 60)
          filter (where ${peHumanGates.decidedAt} is not null),
          0
        )::int
      `,
    })
    .from(peHumanGates)
    .where(eq(peHumanGates.tenantId, tenantId));

  const byType = await db
    .select({
      gateType: peHumanGates.gateType,
      count: sql<number>`count(*)::int`,
      pending: sql<number>`count(*) filter (where ${peHumanGates.decision} is null)::int`,
    })
    .from(peHumanGates)
    .where(eq(peHumanGates.tenantId, tenantId))
    .groupBy(peHumanGates.gateType);

  return { ...stats, byType };
}
