import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { adminSystemHealthMetrics } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  healthy: "success",
  degraded: "warning",
  critical: "destructive",
  unknown: "secondary",
};

export default async function SystemHealthMetricDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:read")))
    redirect("/admin-portal");

  const { id } = await params;

  const metric = await db
    .select()
    .from(adminSystemHealthMetrics)
    .where(
      and(
        eq(adminSystemHealthMetrics.id, id),
        eq(adminSystemHealthMetrics.tenantId, session.tenantId),
        isNull(adminSystemHealthMetrics.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!metric) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "admin:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin-portal/system-health-metrics"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {metric.metricName}
          </h1>
          <p className="text-sm text-gray-500">{metric.metricCategory}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/admin-portal/system-health-metrics/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">ID</dt>
            <dd className="mt-1 text-gray-900">{metric.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Metric Name</dt>
            <dd className="mt-1 text-gray-900">{metric.metricName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Category</dt>
            <dd className="mt-1 text-gray-900">{metric.metricCategory}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Value</dt>
            <dd className="mt-1 text-gray-900">{metric.value}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Unit</dt>
            <dd className="mt-1 text-gray-900">{metric.unit}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Threshold</dt>
            <dd className="mt-1 text-gray-900">
              {metric.threshold !== null ? metric.threshold : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Threshold vs Value
            </dt>
            <dd className="mt-1 text-gray-900">
              {metric.threshold !== null ? (
                <span>
                  {metric.value} / {metric.threshold}{" "}
                  {metric.value <= metric.threshold ? (
                    <Badge variant="success">Within threshold</Badge>
                  ) : (
                    <Badge variant="destructive">Exceeds threshold</Badge>
                  )}
                </span>
              ) : (
                "No threshold set"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={STATUS_VARIANT[metric.status] ?? "secondary"}
              >
                {metric.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Source</dt>
            <dd className="mt-1 text-gray-900">{metric.source || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Recorded At</dt>
            <dd className="mt-1 text-gray-900">
              {metric.recordedAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {metric.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {metric.updatedAt.toLocaleString()}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Metadata</dt>
            <dd className="mt-1 text-gray-900">
              {metric.metadata ? (
                <pre className="overflow-auto rounded-md bg-gray-50 p-3 text-xs">
                  {JSON.stringify(metric.metadata, null, 2)}
                </pre>
              ) : (
                "-"
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
