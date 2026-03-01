import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { aafWorkflowDefinitions } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

export default async function WorkflowDefinitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ai:read")))
    redirect("/");

  const { id } = await params;

  const record = await db
    .select()
    .from(aafWorkflowDefinitions)
    .where(
      and(
        eq(aafWorkflowDefinitions.id, id),
        eq(aafWorkflowDefinitions.tenantId, session.tenantId),
        isNull(aafWorkflowDefinitions.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "ai:edit"
  );
  const canDelete = await hasPermission(
    session.id,
    session.tenantId,
    "ai:delete"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/ai-agent-framework/workflows"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.workflowName}
          </h1>
          <p className="text-sm text-gray-500">
            {record.workflowCode} &middot; v{record.version}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/ai-agent-framework/workflows/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          )}
          {canDelete && (
            <form
              action={`/api/v1/ai-agent-framework/workflow-definitions/${id}`}
              method="POST"
            >
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Overview */}
      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Workflow Code", value: record.workflowCode },
            { label: "Workflow Name", value: record.workflowName },
            { label: "Category", value: record.category ?? "-" },
            { label: "Version", value: `v${record.version}` },
            {
              label: "Timeout",
              value: record.timeoutMs ? `${record.timeoutMs}ms` : "300000ms",
            },
            { label: "Created", value: fmtDate(record.createdAt) },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-xs font-medium text-gray-500">{field.label}</p>
              <p className="mt-0.5 text-sm text-gray-900">{field.value}</p>
            </div>
          ))}
          <div>
            <p className="text-xs font-medium text-gray-500">Active</p>
            <div className="mt-0.5">
              <Badge variant={record.isActive ? "success" : "secondary"}>
                {record.isActive ? "Yes" : "No"}
              </Badge>
            </div>
          </div>
        </div>
        {record.description && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Description</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
              {record.description}
            </p>
          </div>
        )}
        {record.notes && (
          <div className="mt-4 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
              {record.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
