/**
 * ERP-043: Delegation of Authority (DOA) Matrix Routing
 *
 * Evaluates whether a user has authority to perform an action
 * on a given entity type and amount, based on the wne_doa_matrix rules.
 */

import { db } from "@/lib/db";
import { wneDoaMatrix } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

interface DoaEvaluationResult {
  authorized: boolean;
  requiresDualApproval: boolean;
  reason: string;
}

/**
 * Evaluate DOA authority for a user attempting an action.
 *
 * Queries wne_doa_matrix for active rules matching the tenant, entity type,
 * and action type. Checks if the user's role or ID matches a rule and whether
 * the amount falls within the rule's min/max range.
 *
 * If no matching DOA rule is found, defaults to authorized=true (no restriction).
 */
export async function evaluateDoaAuthority(
  tenantId: string,
  entityType: string,
  actionType: string,
  amount: number | null,
  currency: string | null,
  userId: string,
  userRole: string | null
): Promise<DoaEvaluationResult> {
  // Fetch all active DOA rules for this tenant + entity + action
  const rules = await db
    .select()
    .from(wneDoaMatrix)
    .where(
      and(
        eq(wneDoaMatrix.tenantId, tenantId),
        eq(wneDoaMatrix.entityType, entityType),
        eq(wneDoaMatrix.actionType, actionType),
        eq(wneDoaMatrix.isActive, true),
        isNull(wneDoaMatrix.deletedAt)
      )
    );

  // No DOA rules configured -- default to authorized (no restriction)
  if (rules.length === 0) {
    return {
      authorized: true,
      requiresDualApproval: false,
      reason: "No DOA rules configured for this entity/action; default authorized",
    };
  }

  // Find matching rules for this user
  for (const rule of rules) {
    // Check user match: rule can target a specific userId or a roleId
    const matchesUser = rule.userId === userId;
    const matchesRole = userRole && rule.roleId === userRole;

    if (!matchesUser && !matchesRole) {
      continue;
    }

    // Check delegation expiry
    if (rule.delegatedUntil && new Date() > rule.delegatedUntil) {
      continue;
    }

    // Check amount range (if amount-based rule)
    if (amount !== null && amount !== undefined) {
      // Check currency match if rule specifies a currency
      if (currency && rule.currency && rule.currency !== currency) {
        continue;
      }

      const minOk = rule.minAmount === null || amount >= rule.minAmount;
      const maxOk = rule.maxAmount === null || amount <= rule.maxAmount;

      if (!minOk || !maxOk) {
        continue;
      }
    }

    // Rule matches -- user is authorized
    return {
      authorized: true,
      requiresDualApproval: rule.requiresDualApproval,
      reason: `Authorized by DOA rule "${rule.name}" (${rule.id})`,
    };
  }

  // Rules exist but none matched this user/amount
  return {
    authorized: false,
    requiresDualApproval: false,
    reason: `No DOA rule grants authority for user ${userId} on ${entityType}/${actionType}`,
  };
}
