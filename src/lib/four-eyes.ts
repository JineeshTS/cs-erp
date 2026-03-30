/**
 * ERP-092: Four-Eyes Enforcement via DOA Matrix
 *
 * Ties together the DOA evaluator (ERP-043) and maker-checker (ERP-045)
 * into a single function. Evaluates authority first, then creates an
 * approval if dual-approval is required.
 */

import { evaluateDoaAuthority } from "@/lib/workflow-notification-engine/doa-evaluator";
import { requireMakerChecker } from "@/lib/maker-checker";

interface FourEyesResult {
  requiresApproval: boolean;
  approvalId?: string;
  reason: string;
}

/**
 * Evaluate DOA authority and, if dual approval is required, create
 * a maker-checker approval record.
 *
 * @param tenantId - Tenant scope
 * @param entityType - e.g. "payment", "purchase_order", "booking"
 * @param actionType - e.g. "approve", "release", "create"
 * @param amount - Transaction amount (null if not amount-based)
 * @param currency - ISO currency code (null if not amount-based)
 * @param initiatorId - User initiating the action (the "maker")
 * @param initiatorRole - User's role ID/name (for DOA rule matching)
 * @returns Whether approval is needed, the approval ID if created, and the reason
 */
export async function requireFourEyes(
  tenantId: string,
  entityType: string,
  actionType: string,
  amount: number | null,
  currency: string | null,
  initiatorId: string,
  initiatorRole: string | null
): Promise<FourEyesResult> {
  // Step 1: Evaluate DOA authority
  const doaResult = await evaluateDoaAuthority(
    tenantId,
    entityType,
    actionType,
    amount,
    currency,
    initiatorId,
    initiatorRole
  );

  // Not authorized at all -- reject outright
  if (!doaResult.authorized) {
    return {
      requiresApproval: false,
      reason: doaResult.reason,
    };
  }

  // Authorized but no dual approval needed
  if (!doaResult.requiresDualApproval) {
    return {
      requiresApproval: false,
      reason: doaResult.reason,
    };
  }

  // Step 2: Dual approval required -- create a maker-checker record
  try {
    const approval = await requireMakerChecker(
      tenantId,
      entityType,
      actionType,
      initiatorId
    );

    return {
      requiresApproval: true,
      approvalId: approval.id,
      reason: `${doaResult.reason}. Dual approval created (approval ${approval.id}).`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[four-eyes] Failed to create maker-checker approval:", message);
    return {
      requiresApproval: true,
      reason: `Dual approval required but creation failed: ${message}`,
    };
  }
}
