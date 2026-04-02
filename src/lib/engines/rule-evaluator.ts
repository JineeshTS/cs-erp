/**
 * Business Rule Evaluator Engine (ERP-038)
 *
 * Evaluates business rules against entity data.
 * Supports conditions: equals, gt, lt, gte, lte, contains, in, not_equals
 * Supports actions: validation, calculation, assignment, notification
 */

import { eq, and, isNull, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { businessRules } from "@/db/schema";

// ── Types ───────────────────────────────────────────────────────

export type TriggerEvent = "before_create" | "before_update" | "after_create" | "after_update";
export type RuleType = "validation" | "calculation" | "assignment" | "notification";

export interface RuleCondition {
  field: string;
  operator: "equals" | "not_equals" | "gt" | "lt" | "gte" | "lte" | "contains" | "in";
  value: unknown;
}

export interface RuleAction {
  type: RuleType;
  /** For validation: error message */
  message?: string;
  /** For calculation: target field */
  targetField?: string;
  /** For calculation: expression string (e.g., "field_a * field_b") */
  expression?: string;
  /** For assignment: value to assign */
  assignValue?: unknown;
  /** For notification: notification type/channel */
  notificationType?: string;
}

export interface EvaluationResult {
  passed: boolean;
  errors: string[];
  modifications: Record<string, unknown>;
  notifications: Array<{ type: string; message: string }>;
}

// ── Condition Evaluator ─────────────────────────────────────────

function evaluateCondition(
  condition: RuleCondition,
  entityData: Record<string, unknown>
): boolean {
  const fieldValue = entityData[condition.field];

  switch (condition.operator) {
    case "equals":
      return fieldValue === condition.value ||
        String(fieldValue) === String(condition.value);

    case "not_equals":
      return fieldValue !== condition.value &&
        String(fieldValue) !== String(condition.value);

    case "gt":
      return Number(fieldValue) > Number(condition.value);

    case "lt":
      return Number(fieldValue) < Number(condition.value);

    case "gte":
      return Number(fieldValue) >= Number(condition.value);

    case "lte":
      return Number(fieldValue) <= Number(condition.value);

    case "contains":
      if (typeof fieldValue === "string" && typeof condition.value === "string") {
        return fieldValue.toLowerCase().includes(condition.value.toLowerCase());
      }
      return false;

    case "in":
      if (Array.isArray(condition.value)) {
        return condition.value.includes(fieldValue);
      }
      return false;

    default:
      return false;
  }
}

function evaluateAllConditions(
  conditions: RuleCondition[],
  entityData: Record<string, unknown>
): boolean {
  if (conditions.length === 0) return true;
  return conditions.every((c) => evaluateCondition(c, entityData));
}

// ── Simple Expression Evaluator ─────────────────────────────────

/**
 * Evaluate simple arithmetic expressions with field references.
 * Supports: +, -, *, / with field names from entity data.
 * Example: "quantity * unit_price" or "subtotal + tax_amount"
 */
function evaluateExpression(
  expression: string,
  entityData: Record<string, unknown>
): number | null {
  try {
    // Replace field references with their numeric values
    let resolved = expression;
    const fieldPattern = /[a-zA-Z_][a-zA-Z0-9_]*/g;
    const fields = expression.match(fieldPattern) || [];

    for (const field of fields) {
      const val = entityData[field];
      if (val == null) return null;
      const num = Number(val);
      if (isNaN(num)) return null;
      resolved = resolved.replace(new RegExp(`\\b${field}\\b`), String(num));
    }

    // Validate the expression only contains numbers, operators, spaces, and parentheses
    if (!/^[\d\s+\-*/.()]+$/.test(resolved)) {
      return null;
    }

    // Safe evaluation using Function constructor with strict validation
    const result = new Function(`"use strict"; return (${resolved});`)() as number;
    return typeof result === "number" && isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

// ── Action Executor ─────────────────────────────────────────────

function executeAction(
  action: RuleAction,
  entityData: Record<string, unknown>,
  result: EvaluationResult
): void {
  switch (action.type) {
    case "validation":
      result.passed = false;
      result.errors.push(action.message || "Validation rule failed");
      break;

    case "calculation":
      if (action.targetField && action.expression) {
        const computed = evaluateExpression(action.expression, entityData);
        if (computed !== null) {
          result.modifications[action.targetField] = computed;
        }
      }
      break;

    case "assignment":
      if (action.targetField && action.assignValue !== undefined) {
        result.modifications[action.targetField] = action.assignValue;
      }
      break;

    case "notification":
      result.notifications.push({
        type: action.notificationType || "general",
        message: action.message || "Business rule triggered a notification",
      });
      break;
  }
}

// ── Main Evaluator ──────────────────────────────────────────────

export async function evaluateRules(
  tenantId: string,
  entityType: string,
  triggerEvent: TriggerEvent,
  entityData: Record<string, unknown>
): Promise<EvaluationResult> {
  const result: EvaluationResult = {
    passed: true,
    errors: [],
    modifications: {},
    notifications: [],
  };

  const now = new Date();

  // Fetch active rules for this entity type and trigger event, ordered by priority
  const rules = await db
    .select()
    .from(businessRules)
    .where(
      and(
        eq(businessRules.tenantId, tenantId),
        eq(businessRules.entityType, entityType),
        eq(businessRules.triggerEvent, triggerEvent),
        eq(businessRules.isActive, true),
        isNull(businessRules.deletedAt)
      )
    )
    .orderBy(asc(businessRules.priority));

  for (const rule of rules) {
    // Check effective date range
    if (rule.effectiveFrom && new Date(rule.effectiveFrom) > now) continue;
    if (rule.effectiveTo && new Date(rule.effectiveTo) < now) continue;

    const conditions = (rule.conditions as RuleCondition[]) || [];
    const actions = (rule.actions as RuleAction[]) || [];

    // Evaluate conditions — if all match, execute actions
    if (evaluateAllConditions(conditions, entityData)) {
      for (const action of actions) {
        executeAction(action, entityData, result);
      }
    }
  }

  return result;
}
