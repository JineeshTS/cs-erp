import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { wneWorkflows, wneWorkflowSteps } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "workflows:read")))
    redirect("/workflow-notification-engine");

  const { id } = await params;

  const [workflow, steps] = await Promise.all([
    db
      .select()
      .from(wneWorkflows)
      .where(
        and(
          eq(wneWorkflows.id, id),
          eq(wneWorkflows.tenantId, session.tenantId),
          isNull(wneWorkflows.deletedAt)
        )
      )
      .limit(1)
      .then((r) => r[0]),
    db
      .select()
      .from(wneWorkflowSteps)
      .where(
        and(
          eq(wneWorkflowSteps.workflowId, id),
          eq(wneWorkflowSteps.tenantId, session.tenantId),
          isNull(wneWorkflowSteps.deletedAt)
        )
      )
      .orderBy(wneWorkflowSteps.stepOrder),
  ]);

  if (!workflow) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "workflows:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/workflow-notification-engine/workflows"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{workflow.name}</h1>
          <p className="text-sm text-gray-500">
            {workflow.slug} &middot; v{workflow.version}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/workflow-notification-engine/workflows/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-gray-900">{workflow.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Slug</dt>
            <dd className="mt-1 text-gray-900">{workflow.slug}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Entity Type</dt>
            <dd className="mt-1 text-gray-900">{workflow.entityType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Trigger Event</dt>
            <dd className="mt-1 text-gray-900">{workflow.triggerEvent}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Active</dt>
            <dd className="mt-1">
              <Badge
                variant={workflow.isActive ? "success" : "secondary"}
              >
                {workflow.isActive ? "Active" : "Inactive"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Version</dt>
            <dd className="mt-1 text-gray-900">{workflow.version}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">
              {workflow.description || "-"}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Workflow Steps ({steps.length})
        </h2>
        {steps.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center">
            <p className="text-gray-500">No steps defined for this workflow.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Order
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Name
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Type
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Assignee Type
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Assignee Value
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Required Approvals
                  </th>
                </tr>
              </thead>
              <tbody>
                {steps.map((step) => (
                  <tr
                    key={step.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-gray-600">
                      {step.stepOrder}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {step.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {step.stepType}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {step.assigneeType}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {step.assigneeValue}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {step.requiredApprovals}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
