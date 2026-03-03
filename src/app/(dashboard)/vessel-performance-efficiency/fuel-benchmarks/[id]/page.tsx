import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getFuelBenchmark } from "@/lib/vessel-performance-efficiency/service";
import { Badge } from "@/components/ui/badge";

export default async function FuelBenchmarkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vpe:read")))
    redirect("/vessel-performance-efficiency");

  const { id } = await params;

  const record = await getFuelBenchmark(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "vpe:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/vessel-performance-efficiency/fuel-benchmarks"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.benchmarkRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.benchmarkType} &middot;{" "}
            {record.vesselName || "No vessel"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/vessel-performance-efficiency/fuel-benchmarks/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">
              Benchmark Ref
            </dt>
            <dd className="mt-1 text-gray-900">{record.benchmarkRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Benchmark Type
            </dt>
            <dd className="mt-1 text-gray-900">{record.benchmarkType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel ID</dt>
            <dd className="mt-1 text-gray-900">{record.vesselId ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">
              {record.vesselName ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Vessel Class
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.vesselClass ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Period Start
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.periodStart
                ? new Date(record.periodStart).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period End</dt>
            <dd className="mt-1 text-gray-900">
              {record.periodEnd
                ? new Date(record.periodEnd).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Avg Daily Consumption
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.avgDailyConsumption ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Benchmark Consumption
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.benchmarkConsumption ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Efficiency Ratio
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.efficiencyRatio ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Fuel Cost Per NM
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.fuelCostPerNm ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">CO2 Per NM</dt>
            <dd className="mt-1 text-gray-900">
              {record.co2PerNm ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Fleet Ranking
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.fleetRanking ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Vessels In Class
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalVesselsInClass ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Percentile</dt>
            <dd className="mt-1 text-gray-900">
              {record.percentile ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Trend Direction
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.trendDirection ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "published"
                    ? "success"
                    : record.status === "reviewed"
                      ? "default"
                      : "secondary"
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
        </dl>
      </div>
    </div>
  );
}
