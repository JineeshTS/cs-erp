import Link from "next/link";
import { Plus, Clock } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { wneSlaDefinitions } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const priorityVariant = {
  critical: "destructive",
  high: "warning",
  medium: "secondary",
  low: "outline",
} as const;

export default async function SlaDefinitionsListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sla:read")))
    redirect("/workflow-notification-engine");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "sla:create"
  );

  const data = await db
    .select()
    .from(wneSlaDefinitions)
    .where(
      and(
        eq(wneSlaDefinitions.tenantId, session.tenantId),
        isNull(wneSlaDefinitions.deletedAt)
      )
    )
    .orderBy(desc(wneSlaDefinitions.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            SLA Definitions
          </h1>
          <p className="text-sm text-gray-500">
            Manage service level agreement definitions and tracking thresholds
          </p>
        </div>
        {canCreate && (
          <Link
            href="/workflow-notification-engine/sla-definitions/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New SLA Definition
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Clock className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No SLA definitions found.</p>
          {canCreate && (
            <Link
              href="/workflow-notification-engine/sla-definitions/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first SLA definition
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
                  Target Hours
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Warning Hours
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
              {data.map((sla) => (
                <tr
                  key={sla.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/workflow-notification-engine/sla-definitions/${sla.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {sla.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {sla.entityType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {sla.targetHours}h
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {sla.warningHours}h
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        priorityVariant[
                          sla.priority as keyof typeof priorityVariant
                        ] ?? "secondary"
                      }
                    >
                      {sla.priority}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={sla.isActive ? "success" : "secondary"}>
                      {sla.isActive ? "Active" : "Inactive"}
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
