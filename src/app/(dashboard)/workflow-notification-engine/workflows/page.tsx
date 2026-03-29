import Link from "next/link";
import { Plus, PenTool } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { wneWorkflows } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function WorkflowsListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "workflows:read")))
    redirect("/workflow-notification-engine");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "workflows:create"
  );

  const data = await db
    .select()
    .from(wneWorkflows)
    .where(
      and(
        eq(wneWorkflows.tenantId, session.tenantId),
        isNull(wneWorkflows.deletedAt)
      )
    )
    .orderBy(desc(wneWorkflows.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
          <p className="text-sm text-gray-500">
            Manage approval workflows and trigger configurations
          </p>
        </div>
        {canCreate && (
          <Link
            href="/workflow-notification-engine/workflows/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Workflow
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No workflows found.</p>
          {canCreate && (
            <Link
              href="/workflow-notification-engine/workflows/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first workflow
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
                  Active
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Version
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((workflow) => (
                <tr
                  key={workflow.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/workflow-notification-engine/workflows/${workflow.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {workflow.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {workflow.entityType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {workflow.triggerEvent}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={workflow.isActive ? "success" : "secondary"}
                    >
                      {workflow.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    v{workflow.version}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/workflow-notification-engine/process-studio/${workflow.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                    >
                      <PenTool className="h-3.5 w-3.5" />
                      Design
                    </Link>
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
