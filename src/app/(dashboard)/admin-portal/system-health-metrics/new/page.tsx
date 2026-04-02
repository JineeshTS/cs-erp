import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
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

export default async function NewSystemHealthMetricPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "admin:create"))
  )
    redirect("/admin-portal/system-health-metrics");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin-portal/system-health-metrics"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Health Metric
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AdminForm
          entityType="Health Metric"
          apiPath="/api/v1/admin-portal/system-health-metrics"
          fields={METRIC_FIELDS}
          returnPath="/admin-portal/system-health-metrics"
        />
      </div>
    </div>
  );
}
