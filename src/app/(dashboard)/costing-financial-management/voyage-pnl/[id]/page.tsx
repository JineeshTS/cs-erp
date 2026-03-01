import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getVoyagePnlReport } from "@/lib/costing-financial-management/service";
import { Badge } from "@/components/ui/badge";

export default async function VoyagePnlDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:read")))
    redirect("/costing-financial-management");

  const { id } = await params;
  const report = await getVoyagePnlReport(id, session.tenantId);
  if (!report) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "costing:edit"
  );

  function fmt(val: string | number | null | undefined): string {
    if (val == null) return "--";
    return Number(val).toLocaleString();
  }

  function fmtDate(val: Date | string | null | undefined): string {
    if (!val) return "--";
    return new Date(val).toLocaleDateString();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/costing-financial-management/voyage-pnl"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {report.reportRef}
          </h1>
          <p className="text-sm text-gray-500">
            Voyage P&L Report &middot; {report.voyageRef}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/costing-financial-management/voyage-pnl/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          General Information
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Report Ref</dt>
            <dd className="mt-1 text-gray-900">{report.reportRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage Ref</dt>
            <dd className="mt-1 text-gray-900">{report.voyageRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{report.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Service Route
            </dt>
            <dd className="mt-1 text-gray-900">
              {report.serviceRoute || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{report.currency || "USD"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  report.status === "published"
                    ? "success"
                    : report.status === "finalized"
                      ? "warning"
                      : "secondary"
                }
              >
                {report.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period Start</dt>
            <dd className="mt-1 text-gray-900">
              {fmtDate(report.periodStart)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period End</dt>
            <dd className="mt-1 text-gray-900">
              {fmtDate(report.periodEnd)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Revenue</h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Freight Revenue
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmt(report.freightRevenue)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Demurrage Revenue
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmt(report.demurrageRevenue)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Other Revenue
            </dt>
            <dd className="mt-1 text-gray-900">{fmt(report.otherRevenue)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Revenue
            </dt>
            <dd className="mt-1 text-lg font-semibold text-green-700">
              {fmt(report.totalRevenue)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Costs</h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Bunker Cost</dt>
            <dd className="mt-1 text-gray-900">{fmt(report.bunkerCost)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Cost</dt>
            <dd className="mt-1 text-gray-900">{fmt(report.portCost)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Commission Cost
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmt(report.commissionCost)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Charter Cost</dt>
            <dd className="mt-1 text-gray-900">{fmt(report.charterCost)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Overhead Cost
            </dt>
            <dd className="mt-1 text-gray-900">{fmt(report.overheadCost)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Other Cost</dt>
            <dd className="mt-1 text-gray-900">{fmt(report.otherCost)}</dd>
          </div>
          <div className="lg:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Total Cost</dt>
            <dd className="mt-1 text-lg font-semibold text-red-700">
              {fmt(report.totalCost)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Profitability
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Gross Profit</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {fmt(report.grossProfit)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Net Profit</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {fmt(report.netProfit)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Profit Margin
            </dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {report.profitMargin != null
                ? `${Number(report.profitMargin).toFixed(2)}%`
                : "--"}
            </dd>
          </div>
        </dl>
      </div>

      {report.notes && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Notes</h2>
          <p className="whitespace-pre-wrap text-gray-700">{report.notes}</p>
        </div>
      )}
    </div>
  );
}
