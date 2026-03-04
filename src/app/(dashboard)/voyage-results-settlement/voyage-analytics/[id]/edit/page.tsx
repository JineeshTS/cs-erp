import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getVoyageAnalytics } from "@/lib/voyage-results-settlement/service";
import { VrsForm } from "@/components/voyage-results-settlement/vrs-form";
import type { FieldConfig } from "@/components/voyage-results-settlement/vrs-form";

const fields: FieldConfig[] = [
  {
    name: "analyticsType",
    label: "Analytics Type",
    type: "select",
    required: true,
    options: [
      { value: "trend_analysis", label: "Trend Analysis" },
      { value: "seasonal_analysis", label: "Seasonal Analysis" },
      { value: "kpi_dashboard", label: "KPI Dashboard" },
      { value: "fleet_summary", label: "Fleet Summary" },
      { value: "route_analysis", label: "Route Analysis" },
    ],
  },
  {
    name: "title",
    label: "Title",
    type: "text",
    required: false,
  },
  {
    name: "periodFrom",
    label: "Period From",
    type: "datetime-local",
    required: false,
  },
  {
    name: "periodTo",
    label: "Period To",
    type: "datetime-local",
    required: false,
  },
  {
    name: "totalVoyages",
    label: "Total Voyages",
    type: "number",
    required: false,
  },
  {
    name: "avgTce",
    label: "Avg TCE",
    type: "number",
    required: false,
  },
  {
    name: "avgMargin",
    label: "Avg Margin",
    type: "number",
    required: false,
  },
  {
    name: "totalRevenue",
    label: "Total Revenue",
    type: "number",
    required: false,
  },
  {
    name: "totalCosts",
    label: "Total Costs",
    type: "number",
    required: false,
  },
  {
    name: "topPerformer",
    label: "Top Performer",
    type: "text",
    required: false,
  },
  {
    name: "reportUrl",
    label: "Report URL",
    type: "text",
    required: false,
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    required: false,
  },
];

export default async function EditVoyageAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vrs:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getVoyageAnalytics(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/voyage-results-settlement/voyage-analytics/${id}`}
          className="rounded-md border p-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Voyage Analytics</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <VrsForm
          entityType="Voyage Analytics"
          apiPath={`/api/v1/voyage-results-settlement/voyage-analytics/${id}`}
          fields={fields}
          initialData={record as unknown as Record<string, unknown>}
          isEdit
          returnPath={`/voyage-results-settlement/voyage-analytics/${id}`}
        />
      </div>
    </div>
  );
}
