import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { adminSystemHealthMetrics } from "@/db/schema";
import { AdminForm } from "@/components/admin-portal/admin-form";
import type { FieldConfig } from "@/components/admin-portal/admin-form";

const METRIC_FIELDS: FieldConfig[] = [
  { name: "metricName", label: "Metric Name", type: "text", required: true },
  {
    name: "metricCategory",
    label: "Category",
    type: "select",
    options: [
      { value: "system", label: "System" },
      { value: "database", label: "Database" },
      { value: "api", label: "API" },
      { value: "queue", label: "Queue" },
      { value: "storage", label: "Storage" },
      { value: "network", label: "Network" },
    ],
  },
  { name: "value", label: "Value", type: "number", required: true },
  { name: "unit", label: "Unit", type: "text", placeholder: "e.g. ms, %, count" },
  { name: "threshold", label: "Threshold", type: "number" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "healthy", label: "Healthy" },
      { value: "degraded", label: "Degraded" },
      { value: "critical", label: "Critical" },
      { value: "unknown", label: "Unknown" },
    ],
  },
  { name: "source", label: "Source", type: "text", placeholder: "e.g. prometheus, internal" },
];

export default async function EditSystemHealthMetricPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:edit")))
    redirect("/admin-portal/system-health-metrics");

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/admin-portal/system-health-metrics/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Health Metric
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AdminForm
          entityType="Health Metric"
          apiPath={`/api/v1/admin-portal/system-health-metrics/${id}`}
          fields={METRIC_FIELDS}
          initialData={{
            metricName: metric.metricName,
            metricCategory: metric.metricCategory,
            value: metric.value,
            unit: metric.unit,
            threshold: metric.threshold ?? "",
            status: metric.status,
            source: metric.source ?? "",
          }}
          isEdit
          returnPath={`/admin-portal/system-health-metrics/${id}`}
        />
      </div>
    </div>
  );
}
