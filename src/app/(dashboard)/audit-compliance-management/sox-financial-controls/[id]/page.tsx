import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getSoxFinancialControl } from "@/lib/audit-compliance-management/service";
import { Badge } from "@/components/ui/badge";

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function testResultBadgeVariant(result: string | null | undefined) {
  if (!result) return "secondary" as const;
  if (result === "effective") return "success" as const;
  if (result === "ineffective") return "destructive" as const;
  return "warning" as const;
}

function statusBadgeVariant(status: string) {
  if (status === "active") return "success" as const;
  if (status === "inactive" || status === "retired") return "destructive" as const;
  if (status === "under_review") return "warning" as const;
  return "secondary" as const;
}

function riskBadgeVariant(risk: string | null | undefined) {
  if (!risk) return "secondary" as const;
  if (risk === "high") return "destructive" as const;
  if (risk === "medium") return "warning" as const;
  return "success" as const;
}

function deficiencyBadgeVariant(level: string | null | undefined) {
  if (!level || level === "none") return "success" as const;
  if (level === "material_weakness") return "destructive" as const;
  if (level === "significant_deficiency") return "warning" as const;
  return "secondary" as const;
}

export default async function SoxFinancialControlDetailPage({
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
  const record = await getSoxFinancialControl(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/audit-compliance-management/sox-financial-controls"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.title}
            </h1>
            <p className="text-sm text-gray-500">{record.controlRef}</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/audit-compliance-management/sox-financial-controls/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Edit className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500">Control Ref</p>
            <p className="mt-1 text-sm text-gray-900">{record.controlRef}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Title</p>
            <p className="mt-1 text-sm text-gray-900">{record.title}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Control Type</p>
            <p className="mt-1 text-sm text-gray-900">{record.controlType}</p>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium text-gray-500">
              Control Objective
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.controlObjective || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Process Area</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.processArea || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Control Owner</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.controlOwner || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Control Frequency
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.controlFrequency || "-"}
            </p>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium text-gray-500">Test Procedure</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.testProcedure || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Test Frequency</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.testFrequency || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Last Test Date</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.lastTestDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Next Test Date</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.nextTestDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Test Result</p>
            <div className="mt-1">
              {record.testResult ? (
                <Badge variant={testResultBadgeVariant(record.testResult)}>
                  {record.testResult}
                </Badge>
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Deficiency Level
            </p>
            <div className="mt-1">
              {record.deficiencyLevel ? (
                <Badge
                  variant={deficiencyBadgeVariant(record.deficiencyLevel)}
                >
                  {record.deficiencyLevel}
                </Badge>
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </div>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium text-gray-500">
              Remediation Plan
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.remediationPlan || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Remediation Due Date
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.remediationDueDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Remediation Completed Date
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.remediationCompletedDate)}
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
            <p className="text-xs font-medium text-gray-500">Key Control</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.keyControl ? "Yes" : "No"}
            </p>
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
