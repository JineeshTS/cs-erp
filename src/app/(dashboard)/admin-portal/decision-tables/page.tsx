import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, inArray } from "drizzle-orm";
import { businessRules } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

interface RuleCondition {
  field: string;
  operator: string;
  value: unknown;
}

interface RuleAction {
  type: string;
  message?: string;
  targetField?: string;
  expression?: string;
  assignValue?: unknown;
}

export default async function DecisionTablesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:read")))
    redirect("/admin-portal");

  const data = await db
    .select()
    .from(businessRules)
    .where(
      and(
        eq(businessRules.tenantId, session.tenantId),
        isNull(businessRules.deletedAt),
        eq(businessRules.isActive, true),
        inArray(businessRules.ruleType, ["validation", "calculation"])
      )
    )
    .orderBy(desc(businessRules.priority))
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Decision Tables</h1>
        <p className="text-sm text-gray-500">
          Validation and calculation business rules displayed as decision tables
        </p>
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">
            No validation or calculation rules found.
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Create business rules in the Business Rules section to see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {data.map((rule) => {
            const conditions = (rule.conditions as RuleCondition[]) || [];
            const actions = (rule.actions as RuleAction[]) || [];

            return (
              <div
                key={rule.id}
                className="overflow-hidden rounded-lg border bg-white"
              >
                {/* Rule Header */}
                <div className="border-b bg-gray-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {rule.ruleName}
                      </h2>
                      {rule.description && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          {rule.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{rule.entityType}</Badge>
                      <Badge
                        variant={
                          rule.ruleType === "validation"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {rule.ruleType}
                      </Badge>
                      <Badge variant="secondary">
                        Priority: {rule.priority}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Decision Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th
                          colSpan={conditions.length || 1}
                          className="border-e bg-blue-50 px-4 py-2 text-center text-xs font-medium uppercase text-blue-700"
                        >
                          Conditions
                        </th>
                        <th
                          colSpan={actions.length || 1}
                          className="bg-green-50 px-4 py-2 text-center text-xs font-medium uppercase text-green-700"
                        >
                          Actions
                        </th>
                      </tr>
                      <tr className="border-b bg-gray-50">
                        {conditions.length > 0 ? (
                          conditions.map((c, i) => (
                            <th
                              key={`cond-h-${i}`}
                              className="border-e px-4 py-2 text-start font-medium text-gray-600"
                            >
                              {c.field}
                            </th>
                          ))
                        ) : (
                          <th className="border-e px-4 py-2 text-start font-medium text-gray-400">
                            (always)
                          </th>
                        )}
                        {actions.length > 0 ? (
                          actions.map((a, i) => (
                            <th
                              key={`act-h-${i}`}
                              className="px-4 py-2 text-start font-medium text-gray-600"
                            >
                              {a.type === "validation"
                                ? "Error Message"
                                : a.targetField || a.type}
                            </th>
                          ))
                        ) : (
                          <th className="px-4 py-2 text-start font-medium text-gray-400">
                            (none)
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-gray-50">
                        {conditions.length > 0 ? (
                          conditions.map((c, i) => (
                            <td
                              key={`cond-v-${i}`}
                              className="border-e px-4 py-3 text-gray-700"
                            >
                              <span className="font-mono text-xs text-gray-500">
                                {c.operator}
                              </span>{" "}
                              <span className="font-medium">
                                {typeof c.value === "object"
                                  ? JSON.stringify(c.value)
                                  : String(c.value)}
                              </span>
                            </td>
                          ))
                        ) : (
                          <td className="border-e px-4 py-3 text-gray-400">
                            Always applies
                          </td>
                        )}
                        {actions.length > 0 ? (
                          actions.map((a, i) => (
                            <td
                              key={`act-v-${i}`}
                              className="px-4 py-3 text-gray-700"
                            >
                              {a.type === "validation" && (
                                <span className="text-red-600">
                                  {a.message || "Fail"}
                                </span>
                              )}
                              {a.type === "calculation" && (
                                <span className="font-mono text-xs">
                                  {a.expression}
                                </span>
                              )}
                              {a.type === "assignment" && (
                                <span>
                                  = {typeof a.assignValue === "object"
                                    ? JSON.stringify(a.assignValue)
                                    : String(a.assignValue ?? "")}
                                </span>
                              )}
                            </td>
                          ))
                        ) : (
                          <td className="px-4 py-3 text-gray-400">
                            No actions
                          </td>
                        )}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="border-t bg-gray-50 px-4 py-2 text-xs text-gray-400">
                  Trigger: {rule.triggerEvent} | Created:{" "}
                  {rule.createdAt.toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
