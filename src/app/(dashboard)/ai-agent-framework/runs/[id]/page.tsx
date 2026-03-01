import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { aafAgentRuns } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ai:read")))
    redirect("/ai-agent-framework/runs");

  const { id } = await params;

  const record = await db
    .select()
    .from(aafAgentRuns)
    .where(
      and(
        eq(aafAgentRuns.id, id),
        eq(aafAgentRuns.tenantId, session.tenantId),
        isNull(aafAgentRuns.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "ai:edit");
  const canDelete = await hasPermission(session.id, session.tenantId, "ai:delete");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/ai-agent-framework/runs" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.runNumber}</h1>
          <p className="text-sm text-gray-500">Agent Run Details</p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link href={`/ai-agent-framework/runs/${id}/edit`} className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          )}
          {canDelete && (
            <form action={`/api/v1/ai-agent-framework/runs/${id}`} method="POST">
              <button type="submit" className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Detail Grid */}
      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Run Number", value: record.runNumber },
            { label: "Agent ID", value: record.agentId },
            { label: "Orchestration Task ID", value: record.orchestrationTaskId ?? "-" },
            { label: "Trigger Type", value: record.triggerType },
            { label: "Error Code", value: record.errorCode ?? "-" },
            { label: "Tokens Used", value: record.tokensUsed?.toString() ?? "-" },
            { label: "Cost Estimate", value: record.costEstimate?.toString() ?? "-" },
            { label: "Duration", value: record.durationMs ? `${record.durationMs}ms` : "-" },
            { label: "Retry Count", value: record.retryCount?.toString() ?? "0" },
            { label: "Parent Run ID", value: record.parentRunId ?? "-" },
            { label: "Started At", value: fmtDate(record.startedAt) },
            { label: "Completed At", value: fmtDate(record.completedAt) },
            { label: "Created At", value: fmtDate(record.createdAt) },
            { label: "Updated At", value: fmtDate(record.updatedAt) },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-xs font-medium text-gray-500">{field.label}</p>
              <p className="mt-0.5 text-sm text-gray-900">{field.value}</p>
            </div>
          ))}
          <div>
            <p className="text-xs font-medium text-gray-500">Status</p>
            <div className="mt-0.5">
              <Badge variant={record.status === "completed" ? "success" : record.status === "running" ? "success" : record.status === "failed" ? "destructive" : record.status === "cancelled" ? "default" : "secondary"}>
                {record.status}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Priority</p>
            <div className="mt-0.5">
              <Badge variant={record.priority === "urgent" ? "destructive" : record.priority === "high" ? "default" : "secondary"}>
                {record.priority}
              </Badge>
            </div>
          </div>
        </div>
        {record.errorMessage && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Error Message</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-red-700">{record.errorMessage}</p>
          </div>
        )}
        {record.input != null && (
          <div className="mt-4 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Input</p>
            <pre className="mt-1 overflow-x-auto rounded bg-gray-50 p-3 text-xs text-gray-700">{String(JSON.stringify(record.input, null, 2))}</pre>
          </div>
        )}
        {record.output != null && (
          <div className="mt-4 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Output</p>
            <pre className="mt-1 overflow-x-auto rounded bg-gray-50 p-3 text-xs text-gray-700">{String(JSON.stringify(record.output, null, 2))}</pre>
          </div>
        )}
        {record.notes && (
          <div className="mt-4 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{record.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
