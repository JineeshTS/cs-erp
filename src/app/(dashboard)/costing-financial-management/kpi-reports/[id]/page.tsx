import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getKpiReport } from "@/lib/costing-financial-management/service";
import { Badge } from "@/components/ui/badge";

export default async function KpiReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:read")))
    redirect("/");

  const { id } = await params;
  const report = await getKpiReport(id, session.tenantId);
  if (!report) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "costing:edit"
  );

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Report Ref", value: report.reportRef },
    { label: "Report Name", value: report.reportName },
    { label: "Report Type", value: report.reportType },
    { label: "Report Period", value: report.reportPeriod },
    { label: "Report Year", value: report.reportYear },
    { label: "Report Month", value: report.reportMonth },
    { label: "Currency", value: report.currency },
    {
      label: "Total Revenue",
      value: report.totalRevenue?.toLocaleString(),
    },
    { label: "Total Cost", value: report.totalCost?.toLocaleString() },
    { label: "Gross Profit", value: report.grossProfit?.toLocaleString() },
    { label: "Net Profit", value: report.netProfit?.toLocaleString() },
    { label: "EBITDA", value: report.ebitda?.toLocaleString() },
    {
      label: "Operating Ratio",
      value: report.operatingRatio != null ? `${report.operatingRatio}%` : null,
    },
    {
      label: "Revenue per TEU",
      value: report.revenuePerTeu?.toLocaleString(),
    },
    { label: "Cost per TEU", value: report.costPerTeu?.toLocaleString() },
    {
      label: "Status",
      value: (
        <Badge
          variant={
            report.status === "published"
              ? "success"
              : report.status === "archived"
                ? "outline"
                : "secondary"
          }
        >
          {report.status}
        </Badge>
      ),
    },
    {
      label: "Published At",
      value: report.publishedAt
        ? new Date(report.publishedAt).toLocaleString()
        : null,
    },
    { label: "Notes", value: report.notes },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/costing-financial-management/kpi-reports"
            className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {report.reportRef}
            </h1>
            <p className="text-sm text-gray-500">KPI Report Details</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/costing-financial-management/kpi-reports/${report.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <dl className="divide-y">
          {fields.map((f) => (
            <div
              key={f.label}
              className="grid grid-cols-3 gap-4 px-6 py-4 sm:grid-cols-4"
            >
              <dt className="text-sm font-medium text-gray-500">{f.label}</dt>
              <dd className="col-span-2 text-sm text-gray-900 sm:col-span-3">
                {f.value ?? <span className="text-gray-400">--</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
