import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { melsComplianceRules } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function ComplianceRulesListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:read")))
    redirect("/multi-entity-legal-structure");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "entities:create"
  );

  const data = await db
    .select()
    .from(melsComplianceRules)
    .where(
      and(
        eq(melsComplianceRules.tenantId, session.tenantId),
        isNull(melsComplianceRules.deletedAt)
      )
    )
    .orderBy(desc(melsComplianceRules.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Compliance Rules
          </h1>
          <p className="text-sm text-gray-500">
            Manage regional regulatory compliance rules
          </p>
        </div>
        {canCreate && (
          <Link
            href="/multi-entity-legal-structure/compliance-rules/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Compliance Rule
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No compliance rules found.</p>
          {canCreate && (
            <Link
              href="/multi-entity-legal-structure/compliance-rules/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first compliance rule
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Rule Code
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Country
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Rule Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Regulatory Body
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Active
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((rule) => (
                <tr
                  key={rule.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/multi-entity-legal-structure/compliance-rules/${rule.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {rule.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{rule.ruleCode}</td>
                  <td className="px-4 py-3 text-gray-600">{rule.country}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {rule.ruleType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rule.regulatoryBody || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={rule.isActive ? "success" : "secondary"}>
                      {rule.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rule.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
