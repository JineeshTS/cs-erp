import Link from "next/link";
import { Plus, Route } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { wneRoutingRules } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function RoutingRulesListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "routing:read")))
    redirect("/workflow-notification-engine");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "routing:create"
  );

  const data = await db
    .select()
    .from(wneRoutingRules)
    .where(
      and(
        eq(wneRoutingRules.tenantId, session.tenantId),
        isNull(wneRoutingRules.deletedAt)
      )
    )
    .orderBy(desc(wneRoutingRules.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Routing Rules</h1>
          <p className="text-sm text-gray-500">
            Manage task routing and assignment rules
          </p>
        </div>
        {canCreate && (
          <Link
            href="/workflow-notification-engine/routing-rules/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Routing Rule
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Route className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No routing rules found.</p>
          {canCreate && (
            <Link
              href="/workflow-notification-engine/routing-rules/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first routing rule
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
                  Entity Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Trigger Event
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Assignment Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Priority
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Active
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
                      href={`/workflow-notification-engine/routing-rules/${rule.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {rule.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rule.entityType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rule.triggerEvent}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rule.assignmentType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rule.priority}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={rule.isActive ? "success" : "secondary"}
                    >
                      {rule.isActive ? "Active" : "Inactive"}
                    </Badge>
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
