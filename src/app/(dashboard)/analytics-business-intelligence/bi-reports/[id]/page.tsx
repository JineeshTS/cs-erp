import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getBiReport } from "@/lib/analytics-business-intelligence/service";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "default" | "success" | "secondary" | "destructive"> = {
  draft: "secondary",
  scheduled: "default",
  generating: "default",
  completed: "success",
  failed: "destructive",
};

export default async function BiReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "analytics:read")))
    redirect("/analytics-business-intelligence");

  const { id } = await params;

  const report = await getBiReport(id, session.tenantId);
  if (!report) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "analytics:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/analytics-business-intelligence/bi-reports"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {report.reportRef}
          </h1>
          <p className="text-sm text-gray-500">
            {report.reportType} &middot; {report.category || "Uncategorized"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/analytics-business-intelligence/bi-reports/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Report Ref</dt>
            <dd className="mt-1 text-gray-900">{report.reportRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Report Type</dt>
            <dd className="mt-1 text-gray-900">{report.reportType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={STATUS_VARIANT[report.status] ?? "default"}>
                {report.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Title</dt>
            <dd className="mt-1 text-gray-900">{report.title}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {report.description || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Template Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {report.templateName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Category</dt>
            <dd className="mt-1 text-gray-900">{report.category || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Schedule</dt>
            <dd className="mt-1 text-gray-900">{report.schedule || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period Start</dt>
            <dd className="mt-1 text-gray-900">
              {report.periodStart
                ? new Date(report.periodStart).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period End</dt>
            <dd className="mt-1 text-gray-900">
              {report.periodEnd
                ? new Date(report.periodEnd).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Output Format
            </dt>
            <dd className="mt-1 text-gray-900">
              {report.outputFormat || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Published</dt>
            <dd className="mt-1">
              <Badge variant={report.isPublished ? "success" : "secondary"}>
                {report.isPublished ? "Yes" : "No"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Run</dt>
            <dd className="mt-1 text-gray-900">
              {report.lastRunAt
                ? new Date(report.lastRunAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Next Run</dt>
            <dd className="mt-1 text-gray-900">
              {report.nextRunAt
                ? new Date(report.nextRunAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Page Count</dt>
            <dd className="mt-1 text-gray-900">{report.pageCount ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Generation Duration (ms)
            </dt>
            <dd className="mt-1 text-gray-900">
              {report.generationDurationMs ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {report.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {report.updatedAt.toLocaleDateString()}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {report.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
