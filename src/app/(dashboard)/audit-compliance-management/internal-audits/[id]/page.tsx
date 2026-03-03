import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getInternalAudit } from "@/lib/audit-compliance-management/service";
import { Badge } from "@/components/ui/badge";

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function riskBadgeVariant(risk: string | null | undefined) {
  if (!risk) return "secondary" as const;
  if (risk === "critical" || risk === "high") return "destructive" as const;
  if (risk === "medium") return "warning" as const;
  return "success" as const;
}

function statusBadgeVariant(status: string) {
  if (status === "completed") return "success" as const;
  if (status === "cancelled") return "destructive" as const;
  if (status === "in_progress") return "warning" as const;
  return "secondary" as const;
}

export default async function InternalAuditDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "audit:read")))
    redirect("/");
  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "audit:edit"
  );

  const { id } = await params;
  const record = await getInternalAudit(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/audit-compliance-management/internal-audits"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.title}
            </h1>
            <p className="text-sm text-gray-500">{record.auditRef}</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/audit-compliance-management/internal-audits/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Edit className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500">Audit Ref</p>
            <p className="mt-1 text-sm text-gray-900">{record.auditRef}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Title</p>
            <p className="mt-1 text-sm text-gray-900">{record.title}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Audit Type</p>
            <p className="mt-1 text-sm text-gray-900">{record.auditType}</p>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium text-gray-500">Scope</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.scope || "-"}
            </p>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium text-gray-500">Objective</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.objective || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Lead Auditor</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.leadAuditor || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Department</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.department || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Planned Start Date
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.plannedStartDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Planned End Date
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.plannedEndDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Actual Start Date
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.actualStartDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Actual End Date
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.actualEndDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Total Findings
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.totalFindings ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Critical Findings
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.criticalFindings ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Major Findings
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.majorFindings ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Minor Findings
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.minorFindings ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Risk Rating</p>
            <div className="mt-1">
              {record.riskRating ? (
                <Badge variant={riskBadgeVariant(record.riskRating)}>
                  {record.riskRating}
                </Badge>
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Status</p>
            <div className="mt-1">
              <Badge variant={statusBadgeVariant(record.status)}>
                {record.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
