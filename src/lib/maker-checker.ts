/**
 * ERP-045: Maker-Checker Enforcement
 *
 * Provides maker-checker (four-eyes) approval workflow using the pe_approvals table.
 * Maker creates a pending approval; a different user (checker) resolves it.
 */

import { db } from "@/lib/db";
import { peApprovals, peProcessInstances, peStepInstances } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

interface ApprovalRecord {
  id: string;
  tenantId: string;
  stepInstanceId: string;
  processInstanceId: string;
  approverId: string;
  decision: string | null;
  comment: string | null;
  decidedAt: Date | null;
  createdAt: Date;
}

/**
 * Create a pending approval record (maker step).
 *
 * Creates a lightweight process + step instance to anchor the approval,
 * then inserts a pe_approvals row assigned to the maker's counterpart (checker).
 *
 * @param tenantId - Tenant scope
 * @param entityType - The entity type being approved (e.g. "booking", "invoice")
 * @param actionType - The action requiring approval (e.g. "create", "approve_payment")
 * @param makerId - The user who initiated the change (will be excluded as checker)
 * @returns The created approval record
 */
export async function requireMakerChecker(
  tenantId: string,
  entityType: string,
  actionType: string,
  makerId: string
): Promise<ApprovalRecord> {
  // Create a process instance to anchor this approval
  const [processInstance] = await db
    .insert(peProcessInstances)
    .values({
      tenantId,
      processId: "PRC-MC",
      processName: `Maker-Checker: ${entityType}/${actionType}`,
      status: "waiting_approval",
      currentStep: 1,
      totalSteps: 1,
      triggerType: "manual",
      triggeredBy: makerId,
      entityType,
      contextJson: { actionType, makerId },
    })
    .returning();

  // Create a step instance for the approval step
  const [stepInstance] = await db
    .insert(peStepInstances)
    .values({
      tenantId,
      processInstanceId: processInstance.id,
      stepNumber: 1,
      stepName: `Approval: ${entityType}/${actionType}`,
      executorType: "human",
      executorId: null,
      status: "pending",
    })
    .returning();

  // Create the pending approval -- approverId is set to makerId as placeholder;
  // the actual checker will be assigned when resolveApproval is called.
  // For now we store makerId so the record is queryable, but enforce separation on resolve.
  const [approval] = await db
    .insert(peApprovals)
    .values({
      tenantId,
      stepInstanceId: stepInstance.id,
      processInstanceId: processInstance.id,
      approverId: makerId, // placeholder -- checker must be different on resolve
      decision: null,
      metadata: { entityType, actionType, makerId, awaitingChecker: true },
    })
    .returning();

  return {
    id: approval.id,
    tenantId: approval.tenantId,
    stepInstanceId: approval.stepInstanceId,
    processInstanceId: approval.processInstanceId,
    approverId: approval.approverId,
    decision: approval.decision,
    comment: approval.comment,
    decidedAt: approval.decidedAt,
    createdAt: approval.createdAt,
  };
}

/**
 * Resolve a pending approval (checker step).
 *
 * Enforces maker-checker separation: the checker must be a different user than the maker.
 *
 * @param tenantId - Tenant scope
 * @param approvalId - The pe_approvals row ID
 * @param checkerId - The user resolving the approval
 * @param decision - "approved" or "rejected"
 * @param comment - Optional comment from the checker
 * @returns The updated approval record
 */
export async function resolveApproval(
  tenantId: string,
  approvalId: string,
  checkerId: string,
  decision: "approved" | "rejected",
  comment?: string
): Promise<ApprovalRecord> {
  // Fetch the existing approval
  const [existing] = await db
    .select()
    .from(peApprovals)
    .where(
      and(
        eq(peApprovals.id, approvalId),
        eq(peApprovals.tenantId, tenantId),
        isNull(peApprovals.deletedAt)
      )
    )
    .limit(1);

  if (!existing) {
    throw new Error(`Approval ${approvalId} not found`);
  }

  if (existing.decision) {
    throw new Error(`Approval ${approvalId} already resolved as "${existing.decision}"`);
  }

  // Enforce maker-checker separation: extract makerId from metadata
  const meta = (existing.metadata ?? {}) as Record<string, unknown>;
  const makerId = meta.makerId as string | undefined;

  if (makerId && checkerId === makerId) {
    throw new Error("Maker-checker violation: checker must be a different user than the maker");
  }

  const now = new Date();

  // Update the approval record
  const [updated] = await db
    .update(peApprovals)
    .set({
      approverId: checkerId,
      decision,
      comment: comment ?? null,
      decidedAt: now,
      metadata: { ...meta, awaitingChecker: false, checkerId },
    })
    .where(eq(peApprovals.id, approvalId))
    .returning();

  // Update the step instance status
  await db
    .update(peStepInstances)
    .set({
      status: decision === "approved" ? "completed" : "failed",
      completedAt: now,
    })
    .where(eq(peStepInstances.id, existing.stepInstanceId));

  // Update the process instance status
  await db
    .update(peProcessInstances)
    .set({
      status: decision === "approved" ? "completed" : "failed",
      completedAt: now,
    })
    .where(eq(peProcessInstances.id, existing.processInstanceId));

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    stepInstanceId: updated.stepInstanceId,
    processInstanceId: updated.processInstanceId,
    approverId: updated.approverId,
    decision: updated.decision,
    comment: updated.comment,
    decidedAt: updated.decidedAt,
    createdAt: updated.createdAt,
  };
}
