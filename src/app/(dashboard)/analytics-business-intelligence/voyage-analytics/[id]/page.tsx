import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getVoyageAnalytic } from "@/lib/analytics-business-intelligence/service";
import { Badge } from "@/components/ui/badge";

export default async function VoyageAnalyticDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "analytics:read")))
    redirect("/analytics-business-intelligence");

  const { id } = await params;

  const analytic = await getVoyageAnalytic(id, session.tenantId);
  if (!analytic) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "analytics:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/analytics-business-intelligence/voyage-analytics"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {analytic.analyticsRef}
          </h1>
          <p className="text-sm text-gray-500">
            {analytic.analyticsType} analysis
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/analytics-business-intelligence/voyage-analytics/${id}/edit`}
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
              Analytics Ref
            </dt>
            <dd className="mt-1 text-gray-900">{analytic.analyticsRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Analytics Type
            </dt>
            <dd className="mt-1 text-gray-900">{analytic.analyticsType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  analytic.status === "published"
                    ? "success"
                    : analytic.status === "archived"
                      ? "destructive"
                      : "secondary"
                }
              >
                {analytic.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage Ref</dt>
            <dd className="mt-1 text-gray-900">
              {analytic.voyageRef ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Service Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {analytic.serviceName ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">
              {analytic.vesselName ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Route Origin
            </dt>
            <dd className="mt-1 text-gray-900">
              {analytic.routeOrigin ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Route Destination
            </dt>
            <dd className="mt-1 text-gray-900">
              {analytic.routeDestination ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period Start</dt>
            <dd className="mt-1 text-gray-900">
              {analytic.periodStart
                ? new Date(analytic.periodStart).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period End</dt>
            <dd className="mt-1 text-gray-900">
              {analytic.periodEnd
                ? new Date(analytic.periodEnd).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total TEU</dt>
            <dd className="mt-1 text-gray-900">
              {analytic.totalTeu ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Revenue</dt>
            <dd className="mt-1 text-gray-900">
              {analytic.revenue
                ? `${analytic.revenue} ${analytic.currency ?? "USD"}`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Costs</dt>
            <dd className="mt-1 text-gray-900">
              {analytic.costs
                ? `${analytic.costs} ${analytic.currency ?? "USD"}`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Profit</dt>
            <dd className="mt-1 text-gray-900">
              {analytic.profit
                ? `${analytic.profit} ${analytic.currency ?? "USD"}`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Profit Margin %
            </dt>
            <dd className="mt-1 text-gray-900">
              {analytic.profitMarginPct
                ? `${analytic.profitMarginPct}%`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">
              {analytic.currency ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Utilization %
            </dt>
            <dd className="mt-1 text-gray-900">
              {analytic.utilizationPct
                ? `${analytic.utilizationPct}%`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Schedule Reliability %
            </dt>
            <dd className="mt-1 text-gray-900">
              {analytic.scheduleReliabilityPct
                ? `${analytic.scheduleReliabilityPct}%`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Avg Transit Days
            </dt>
            <dd className="mt-1 text-gray-900">
              {analytic.avgTransitDays ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Dwell Time (hours)
            </dt>
            <dd className="mt-1 text-gray-900">
              {analytic.dwellTimeHours ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Port Call Count
            </dt>
            <dd className="mt-1 text-gray-900">
              {analytic.portCallCount ?? "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">
              {analytic.notes || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {analytic.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {analytic.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
