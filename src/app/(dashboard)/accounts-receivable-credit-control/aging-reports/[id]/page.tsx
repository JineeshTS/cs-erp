import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getAgingReport } from "@/lib/accounts-receivable-credit-control/service";
import { Badge } from "@/components/ui/badge";

export default async function AgingReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "receivable:read")))
    redirect("/");
  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "receivable:edit"
  );

  const { id } = await params;
  const report = await getAgingReport(id, session.tenantId);
  if (!report) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/accounts-receivable-credit-control/aging-reports"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {report.reportRef}
            </h1>
            <p className="text-sm text-gray-500">Aging Report Details</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/accounts-receivable-credit-control/aging-reports/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Report Details
          </h2>
        </div>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-gray-500">Report Ref</dt>
            <dd className="mt-1 text-sm text-gray-900">{report.reportRef}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Report Type</dt>
            <dd className="mt-1 text-sm text-gray-900">{report.reportType}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Report Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {report.reportDate
                ? new Date(report.reportDate).toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {report.currency ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Total Receivables
            </dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900">
              {report.totalReceivables?.toLocaleString() ?? "0"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Current Amount
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {report.currentAmount?.toLocaleString() ?? "0"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">1-30 Days</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {report.days1to30?.toLocaleString() ?? "0"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">31-60 Days</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {report.days31to60?.toLocaleString() ?? "0"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">61-90 Days</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {report.days61to90?.toLocaleString() ?? "0"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">91-120 Days</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {report.days91to120?.toLocaleString() ?? "0"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Over 120 Days
            </dt>
            <dd className="mt-1 text-sm font-semibold text-red-600">
              {report.over120Days?.toLocaleString() ?? "0"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Total Customers
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {report.totalCustomers ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Overdue Customers
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {report.overdueCustomers ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Overdue Percent
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {report.overduePercent != null
                ? `${report.overduePercent}%`
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Generated By</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {report.generatedByName ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  report.status === "published"
                    ? "success"
                    : report.status === "draft"
                      ? "secondary"
                      : report.status === "reviewed"
                        ? "warning"
                        : "default"
                }
              >
                {report.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
              {report.notes ?? "--"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
