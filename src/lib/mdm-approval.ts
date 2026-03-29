/**
 * ERP-052: Maker-Checker on MDM (Master Data Management)
 *
 * Wires maker-checker approval into MDM operations (create/update/delete).
 * Stores the full change payload so the checker can review what's being approved.
 */

import { requireMakerChecker } from "@/lib/maker-checker";
import { db } from "@/lib/db";
import { peApprovals } from "@/db/schema";
import { eq } from "drizzle-orm";

interface MdmApprovalResult {
  approvalId: string;
  status: "pending_approval";
}

/**
 * Require MDM approval for a master data change.
 *
 * Creates a pending maker-checker approval and attaches the change payload
 * (entity details + proposed changes) so the checker can review the exact
 * data being approved.
 *
 * @param tenantId - Tenant scope
 * @param entityType - MDM entity type (e.g. "port", "vessel", "customer", "exchange_rate")
 * @param entityId - The entity being changed (null for creates)
 * @param changeType - The type of change: "create", "update", or "delete"
 * @param makerId - The user initiating the change
 * @param changeData - The proposed change payload for reviewer inspection
 * @returns approvalId and pending status
 */
export async function requireMdmApproval(
  tenantId: string,
  entityType: string,
  entityId: string | null,
  changeType: "create" | "update" | "delete",
  makerId: string,
  changeData: Record<string, unknown>
): Promise<MdmApprovalResult> {
  // Create the maker-checker approval via the core module
  const approval = await requireMakerChecker(
    tenantId,
    `mdm_${entityType}`,
    changeType,
    makerId
  );

  // Enrich the approval metadata with the full change payload
  // so the checker can inspect the exact data being approved
  await db
    .update(peApprovals)
    .set({
      metadata: {
        entityType: `mdm_${entityType}`,
        actionType: changeType,
        makerId,
        awaitingChecker: true,
        mdmEntityId: entityId,
        mdmChangeType: changeType,
        mdmChangeData: changeData,
      },
    })
    .where(eq(peApprovals.id, approval.id));

  return {
    approvalId: approval.id,
    status: "pending_approval",
  };
}
