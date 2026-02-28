import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { adminSystemHealthMetrics } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  healthy: "success",
  degraded: "warning",
  critical: "destructive",
  unknown: "secondary",
};

export default async function SystemHealthMetricsListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:read")))
    redirect("/admin-portal");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "admin:create"
  );

  const data = await db
    .select()
    .from(adminSystemHealthMetrics)
    .where(
      and(
        eq(adminSystemHealthMetrics.tenantId, session.tenantId),
        isNull(adminSystemHealthMetrics.deletedAt)
      )
    )
    .orderBy(desc(adminSystemHealthMetrics.recordedAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            System Health Metrics
          </h1>
          <p className="text-sm text-gray-500">
            Monitor system performance and health indicators
          </p>
        </div>
        {canCreate && (
          <Link
            href="/admin-portal/system-health-metrics/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Metric
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No health metrics found.</p>
          {canCreate && (
            <Link
              href="/admin-portal/system-health-metrics/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Record your first metric
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Metric Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Category
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Value
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Unit
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Recorded At
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((metric) => (
                <tr
                  key={metric.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin-portal/system-health-metrics/${metric.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {metric.metricName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {metric.metricCategory}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{metric.value}</td>
                  <td className="px-4 py-3 text-gray-600">{metric.unit}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={STATUS_VARIANT[metric.status] ?? "secondary"}
                    >
                      {metric.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {metric.recordedAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
