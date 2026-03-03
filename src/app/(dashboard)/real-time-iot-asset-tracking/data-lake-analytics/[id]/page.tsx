import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDataLakeAnalytic } from "@/lib/real-time-iot-asset-tracking/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  active: "success",
  verified: "success",
  published: "default",
  archived: "destructive",
} as const;

export default async function DataLakeAnalyticDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "iot:read")))
    redirect("/real-time-iot-asset-tracking");

  const { id } = await params;

  const record = await getDataLakeAnalytic(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "iot:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/real-time-iot-asset-tracking/data-lake-analytics"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.analyticsRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.analyticsType?.replace(/_/g, " ")} &middot;{" "}
            {record.reportName || "No report name"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/real-time-iot-asset-tracking/data-lake-analytics/${id}/edit`}
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
            <dd className="mt-1 text-gray-900">{record.analyticsRef}</dd>
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
            <dt className="text-sm font-medium text-gray-500">
              Analytics Type
            </dt>
            <dd className="mt-1 text-gray-900 capitalize">
              {record.analyticsType?.replace(/_/g, " ")}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Report Name</dt>
            <dd className="mt-1 text-gray-900">
              {record.reportName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reporting Period
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.reportingPeriod || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Data Source Count
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.dataSourceCount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Records Processed
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.recordsProcessed ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Anomalies Detected
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.anomaliesDetected ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Avg Response Time
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.avgResponseTime ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Uptime %</dt>
            <dd className="mt-1 text-gray-900">
              {record.uptimePct ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Last Refreshed At
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.lastRefreshedAt
                ? record.lastRefreshedAt.toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Schedule Cron
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.scheduleCron || "-"}
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
