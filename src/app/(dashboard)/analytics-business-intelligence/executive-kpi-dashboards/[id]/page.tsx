import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getExecutiveKpiDashboard } from "@/lib/analytics-business-intelligence/service";
import { Badge } from "@/components/ui/badge";

export default async function ExecutiveKpiDashboardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "analytics:read")))
    redirect("/analytics-business-intelligence");

  const { id } = await params;

  const dashboard = await getExecutiveKpiDashboard(id, session.tenantId);
  if (!dashboard) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "analytics:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/analytics-business-intelligence/executive-kpi-dashboards"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {dashboard.dashboardRef}
          </h1>
          <p className="text-sm text-gray-500">
            {dashboard.dashboardType} dashboard
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/analytics-business-intelligence/executive-kpi-dashboards/${id}/edit`}
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
              Dashboard Ref
            </dt>
            <dd className="mt-1 text-gray-900">{dashboard.dashboardRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Dashboard Type
            </dt>
            <dd className="mt-1 text-gray-900">{dashboard.dashboardType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  dashboard.status === "published"
                    ? "success"
                    : dashboard.status === "archived"
                      ? "destructive"
                      : "secondary"
                }
              >
                {dashboard.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period Start</dt>
            <dd className="mt-1 text-gray-900">
              {dashboard.periodStart
                ? new Date(dashboard.periodStart).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period End</dt>
            <dd className="mt-1 text-gray-900">
              {dashboard.periodEnd
                ? new Date(dashboard.periodEnd).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total TEU</dt>
            <dd className="mt-1 text-gray-900">
              {dashboard.totalTeu ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Revenue
            </dt>
            <dd className="mt-1 text-gray-900">
              {dashboard.totalRevenue
                ? `${dashboard.totalRevenue} ${dashboard.revenueCurrency ?? "USD"}`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Revenue Currency
            </dt>
            <dd className="mt-1 text-gray-900">
              {dashboard.revenueCurrency ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Gross Profit</dt>
            <dd className="mt-1 text-gray-900">
              {dashboard.grossProfit ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Gross Margin %
            </dt>
            <dd className="mt-1 text-gray-900">
              {dashboard.grossMarginPct ? `${dashboard.grossMarginPct}%` : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Vessel Utilization %
            </dt>
            <dd className="mt-1 text-gray-900">
              {dashboard.vesselUtilizationPct
                ? `${dashboard.vesselUtilizationPct}%`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Slot Utilization %
            </dt>
            <dd className="mt-1 text-gray-900">
              {dashboard.slotUtilizationPct
                ? `${dashboard.slotUtilizationPct}%`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              On-Time Performance %
            </dt>
            <dd className="mt-1 text-gray-900">
              {dashboard.onTimePerformancePct
                ? `${dashboard.onTimePerformancePct}%`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Booking Conversion %
            </dt>
            <dd className="mt-1 text-gray-900">
              {dashboard.bookingConversionPct
                ? `${dashboard.bookingConversionPct}%`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Avg Revenue / TEU
            </dt>
            <dd className="mt-1 text-gray-900">
              {dashboard.averageRevenuePerTeu ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Operating Costs
            </dt>
            <dd className="mt-1 text-gray-900">
              {dashboard.operatingCosts ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">EBITDA</dt>
            <dd className="mt-1 text-gray-900">{dashboard.ebitda ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Active Vessels
            </dt>
            <dd className="mt-1 text-gray-900">
              {dashboard.activeVessels ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Active Routes
            </dt>
            <dd className="mt-1 text-gray-900">
              {dashboard.activeRoutes ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Bookings
            </dt>
            <dd className="mt-1 text-gray-900">
              {dashboard.totalBookings ?? "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">
              {dashboard.notes || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {dashboard.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {dashboard.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
