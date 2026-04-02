import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getRiskKpiDashboard } from "@/lib/loss-prevention-risk-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  published: "success",
  approved: "default",
  archived: "secondary",
  in_progress: "warning",
  completed: "success",
  rejected: "destructive",
} as const;

export default async function RiskKpiDashboardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "lpr:read")))
    redirect("/");

  const { id } = await params;

  const record = await getRiskKpiDashboard(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "lpr:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/loss-prevention-risk-management/risk-kpi-dashboards"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.dashboardRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.dashboardType?.replace(/_/g, " ")} &middot; {record.title || "KPI dashboard details"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/loss-prevention-risk-management/risk-kpi-dashboards/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Dashboard Ref</dt>
            <dd className="mt-1 text-gray-900">{record.dashboardRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Dashboard Type</dt>
            <dd className="mt-1 text-gray-900 capitalize">{record.dashboardType?.replace(/_/g, " ")}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Title</dt>
            <dd className="mt-1 text-gray-900">{record.title || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Reporting Period</dt>
            <dd className="mt-1 text-gray-900">{record.reportingPeriod || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Risks</dt>
            <dd className="mt-1 text-gray-900">{record.totalRisks ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">High Risks</dt>
            <dd className="mt-1 text-gray-900">{record.highRisks ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Incident Count</dt>
            <dd className="mt-1 text-gray-900">{record.incidentCount ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Near Miss Count</dt>
            <dd className="mt-1 text-gray-900">{record.nearMissCount ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">LTIF Rate</dt>
            <dd className="mt-1 text-gray-900">{record.ltifRate ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">TRIF Rate</dt>
            <dd className="mt-1 text-gray-900">{record.trifRate ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Insurance Claims</dt>
            <dd className="mt-1 text-gray-900">{record.insuranceClaims ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Compliance Rate</dt>
            <dd className="mt-1 text-gray-900">{record.complianceRate ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Board Presented Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.boardPresentedDate ? record.boardPresentedDate.toLocaleDateString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    record.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
