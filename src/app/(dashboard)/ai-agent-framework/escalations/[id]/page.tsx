import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { aafEscalations } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

function severityVariant(severity: string) {
  switch (severity) {
    case "critical":
      return "destructive" as const;
    case "high":
      return "warning" as const;
    case "medium":
      return "secondary" as const;
    case "low":
      return "default" as const;
    default:
      return "secondary" as const;
  }
}

function statusVariant(status: string) {
  switch (status) {
    case "resolved":
      return "success" as const;
    case "dismissed":
      return "secondary" as const;
    case "open":
      return "destructive" as const;
    case "assigned":
      return "warning" as const;
    case "in_review":
      return "default" as const;
    default:
      return "secondary" as const;
  }
}

export default async function EscalationDetailPage({
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
    .from(aafEscalations)
    .where(
      and(
        eq(aafEscalations.id, id),
        eq(aafEscalations.tenantId, session.tenantId),
        isNull(aafEscalations.deletedAt)
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
        <Link href="/ai-agent-framework/escalations" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.escalationRef}</h1>
          <p className="text-sm text-gray-500">{record.sourceType.replace(/_/g, " ")} escalation</p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link href={`/ai-agent-framework/escalations/${id}/edit`} className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          )}
          {canDelete && (
            <form action={`/api/v1/ai-agent-framework/escalations/${id}`} method="POST">
              <button type="submit" className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
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
            { label: "Escalation Reference", value: record.escalationRef },
            { label: "Source Type", value: record.sourceType.replace(/_/g, " ") },
            { label: "Source ID", value: record.sourceId ?? "-" },
            { label: "Agent ID", value: record.agentId ?? "-" },
            { label: "Run ID", value: record.runId ?? "-" },
            { label: "Reason Code", value: record.reasonCode ?? "-" },
            { label: "Priority", value: record.priority },
            { label: "Assigned To", value: record.assignedTo ?? "-" },
            { label: "Assigned At", value: fmtDate(record.assignedAt) },
            { label: "Resolution Action", value: record.resolutionAction ?? "-" },
            { label: "Resolved By", value: record.resolvedBy ?? "-" },
            { label: "Resolved At", value: fmtDate(record.resolvedAt) },
            { label: "SLA Deadline", value: fmtDate(record.slaDeadline) },
            { label: "Escalated At", value: fmtDate(record.escalatedAt) },
            { label: "Created", value: fmtDate(record.createdAt) },
            { label: "Updated", value: fmtDate(record.updatedAt) },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-xs font-medium text-gray-500">{field.label}</p>
              <p className="mt-0.5 text-sm text-gray-900">{field.value}</p>
            </div>
          ))}
          <div>
            <p className="text-xs font-medium text-gray-500">Severity</p>
            <div className="mt-0.5">
              <Badge variant={severityVariant(record.severity)}>
                {record.severity}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Status</p>
            <div className="mt-0.5">
              <Badge variant={statusVariant(record.status)}>
                {record.status.replace(/_/g, " ")}
              </Badge>
            </div>
          </div>
        </div>
        {record.reason && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Reason</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{record.reason}</p>
          </div>
        )}
        {record.resolution && (
          <div className="mt-4 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Resolution</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{record.resolution}</p>
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
