import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPerformanceKpi } from "@/lib/agent-network-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  active: "success",
  completed: "success",
  pending: "warning",
  cancelled: "destructive",
} as const;

export default async function PerformanceKpiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "anm:read")))
    redirect("/agent-network-management");

  const { id } = await params;

  const record = await getPerformanceKpi(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "anm:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/agent-network-management/performance-kpis"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.kpiRef}</h1>
          <p className="text-sm text-gray-500">
            {record.kpiType} &middot; {record.agentName || "No agent"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/agent-network-management/performance-kpis/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">KPI Ref</dt>
            <dd className="mt-1 text-gray-900">{record.kpiRef}</dd>
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
          <div>
            <dt className="text-sm font-medium text-gray-500">KPI Type</dt>
            <dd className="mt-1 text-gray-900">{record.kpiType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Agent Name</dt>
            <dd className="mt-1 text-gray-900">{record.agentName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Agent Code</dt>
            <dd className="mt-1 text-gray-900">{record.agentCode || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">KPI Period</dt>
            <dd className="mt-1 text-gray-900">{record.kpiPeriod || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Target Value</dt>
            <dd className="mt-1 text-gray-900">
              {record.targetValue ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Actual Value</dt>
            <dd className="mt-1 text-gray-900">
              {record.actualValue ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Achievement %
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.achievementPct ? `${record.achievementPct}%` : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">KPI Currency</dt>
            <dd className="mt-1 text-gray-900">
              {record.kpiCurrency || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Ranking</dt>
            <dd className="mt-1 text-gray-900">{record.ranking ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Trend Direction
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.trendDirection || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Benchmark Value
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.benchmarkValue ?? "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
