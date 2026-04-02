import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getRiskRegister } from "@/lib/audit-compliance-management/service";
import { Badge } from "@/components/ui/badge";

export default async function RiskRegisterDetailPage({
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
  const record = await getRiskRegister(id, session.tenantId);
  if (!record) notFound();

  function formatDate(value: Date | string | null | undefined): string {
    if (!value) return "-";
    return new Date(value).toLocaleDateString();
  }

  function riskLevelVariant(level: string | null | undefined) {
    if (!level) return "default" as const;
    if (level === "critical" || level === "high") return "destructive" as const;
    if (level === "medium") return "warning" as const;
    return "success" as const;
  }

  function statusVariant(s: string) {
    if (s === "closed") return "success" as const;
    if (s === "active") return "secondary" as const;
    if (s === "mitigated") return "warning" as const;
    return "default" as const;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/audit-compliance-management/risk-registers"
            className="rounded-md border p-2 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.riskRef}
            </h1>
            <p className="text-sm text-gray-500">{record.title}</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/audit-compliance-management/risk-registers/${record.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Edit className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500">Risk Ref</p>
            <p className="mt-1 text-sm text-gray-900">{record.riskRef}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Title</p>
            <p className="mt-1 text-sm text-gray-900">{record.title}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Risk Type</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.riskType || "-"}
            </p>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium text-gray-500">Description</p>
            <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
              {record.description || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Category</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.category || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Likelihood Score
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.likelihoodScore ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Impact Score</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.impactScore ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Risk Score</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {record.riskScore ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Risk Level</p>
            <div className="mt-1">
              {record.riskLevel ? (
                <Badge variant={riskLevelVariant(record.riskLevel)}>
                  {record.riskLevel}
                </Badge>
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Risk Owner</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.riskOwner || "-"}
            </p>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium text-gray-500">
              Mitigation Strategy
            </p>
            <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
              {record.mitigationStrategy || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Residual Likelihood
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.residualLikelihood ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Residual Impact
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.residualImpact ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Residual Risk Score
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {record.residualRiskScore ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Review Date</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.reviewDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Last Assessed At
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(record.lastAssessedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Status</p>
            <div className="mt-1">
              <Badge variant={statusVariant(record.status)}>
                {record.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
