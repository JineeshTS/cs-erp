import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getExecutiveDashboard } from "@/lib/mobile-operations-app/service";
import { MobForm, type FieldConfig } from "@/components/mobile-operations-app/mob-form";

const EXECUTIVE_DASHBOARD_FIELDS: FieldConfig[] = [
  {
    name: "dashboardType",
    label: "Dashboard Type",
    type: "select",
    required: true,
    options: [
      { value: "revenue_overview", label: "Revenue Overview" },
      { value: "operations_summary", label: "Operations Summary" },
      { value: "fleet_status", label: "Fleet Status" },
      { value: "financial_snapshot", label: "Financial Snapshot" },
      { value: "kpi_tracker", label: "KPI Tracker" },
    ],
  },
  { name: "dashboardName", label: "Dashboard Name", type: "text" },
  { name: "reportingPeriod", label: "Reporting Period", type: "text" },
  { name: "widgetCount", label: "Widget Count", type: "number" },
  { name: "refreshInterval", label: "Refresh Interval", type: "number" },
  { name: "lastRefreshedAt", label: "Last Refreshed At", type: "datetime-local" },
  { name: "accessLevel", label: "Access Level", type: "text" },
  { name: "favorited", label: "Favorited", type: "checkbox" },
  { name: "sharedWith", label: "Shared With", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditExecutiveDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mob:edit")))
    redirect("/mobile-operations-app/executive-dashboards");

  const { id } = await params;

  const record = await getExecutiveDashboard(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/mobile-operations-app/executive-dashboards/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Executive Dashboard
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MobForm
          entityType="Executive Dashboard"
          apiPath={`/api/v1/mobile-operations-app/executive-dashboards/${id}`}
          fields={EXECUTIVE_DASHBOARD_FIELDS}
          initialData={{
            dashboardType: record.dashboardType,
            dashboardName: record.dashboardName ?? "",
            reportingPeriod: record.reportingPeriod ?? "",
            widgetCount: record.widgetCount ?? "",
            refreshInterval: record.refreshInterval ?? "",
            lastRefreshedAt: record.lastRefreshedAt
              ? record.lastRefreshedAt.toISOString().slice(0, 16)
              : "",
            accessLevel: record.accessLevel ?? "",
            favorited: record.favorited ?? false,
            sharedWith: record.sharedWith ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/mobile-operations-app/executive-dashboards/${id}`}
        />
      </div>
    </div>
  );
}
