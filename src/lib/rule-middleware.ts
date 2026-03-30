/**
 * Business Rule Middleware (ERP-040)
 *
 * Wraps the rule evaluator engine for convenient use in API routes.
 * - Validation failures return a 422 error response.
 * - Calculation/assignment rules return the modified data.
 * - Can be called from any API route before insert/update.
 */

import { NextResponse } from "next/server";
import { evaluateRules, type TriggerEvent, type EvaluationResult } from "@/lib/engines/rule-evaluator";

export interface RuleMiddlewareResult {
  /** Whether all rules passed (no validation errors) */
  ok: boolean;
  /** If ok=false, a NextResponse with 422 status to return directly */
  errorResponse?: NextResponse;
  /** If ok=true, the entity data with any calculation/assignment modifications applied */
  data: Record<string, unknown>;
  /** Full evaluation result for logging/inspection */
  evaluation: EvaluationResult;
}

/**
 * Apply business rules to entity data before insert/update.
 *
 * Usage in API routes:
 * ```ts
 * const ruleResult = await applyBusinessRules(user.tenantId, "booking", "before_create", parsed.data);
 * if (!ruleResult.ok) return ruleResult.errorResponse!;
 * // Use ruleResult.data (which may have modified fields) for the insert
 * ```
 */
export async function applyBusinessRules(
  tenantId: string,
  entityType: string,
  triggerEvent: TriggerEvent,
  data: Record<string, unknown>
): Promise<RuleMiddlewareResult> {
  const evaluation = await evaluateRules(tenantId, entityType, triggerEvent, data);

  if (!evaluation.passed) {
    return {
      ok: false,
      errorResponse: NextResponse.json(
        {
          error: {
            code: "BUSINESS_RULE_VIOLATION",
            message: evaluation.errors.join("; "),
            details: evaluation.errors.map((msg) => ({ message: msg })),
          },
        },
        { status: 422 }
      ),
      data,
      evaluation,
    };
  }

  // Apply modifications from calculation/assignment rules
  const modifiedData = { ...data, ...evaluation.modifications };

  return {
    ok: true,
    data: modifiedData,
    evaluation,
  };
}
