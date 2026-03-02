import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getVoyageAnalytic } from "@/lib/analytics-business-intelligence/service";
import { AbiForm } from "@/components/analytics-business-intelligence/abi-form";
import type { FieldConfig } from "@/components/analytics-business-intelligence/abi-form";

const VOYAGE_FIELDS: FieldConfig[] = [
  {
    name: "analyticsType",
    label: "Analytics Type",
    type: "select",
    required: true,
    options: [
      { value: "voyage_performance", label: "Voyage Performance" },
      { value: "service_comparison", label: "Service Comparison" },
      { value: "route_profitability", label: "Route Profitability" },
      { value: "schedule_adherence", label: "Schedule Adherence" },
    ],
  },
  {
    name: "voyageRef",
    label: "Voyage Ref",
    type: "text",
    placeholder: "e.g. VOY-2026-001",
  },
  { name: "serviceName", label: "Service Name", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "routeOrigin", label: "Route Origin", type: "text" },
  { name: "routeDestination", label: "Route Destination", type: "text" },
  { name: "periodStart", label: "Period Start", type: "datetime-local" },
  { name: "periodEnd", label: "Period End", type: "datetime-local" },
  { name: "totalTeu", label: "Total TEU", type: "number" },
  { name: "revenue", label: "Revenue", type: "number" },
  { name: "costs", label: "Costs", type: "number" },
  { name: "profit", label: "Profit", type: "number" },
  { name: "profitMarginPct", label: "Profit Margin %", type: "number" },
  {
    name: "currency",
    label: "Currency",
    type: "text",
    placeholder: "e.g. USD, QAR, AED",
  },
  { name: "utilizationPct", label: "Utilization %", type: "number" },
  {
    name: "scheduleReliabilityPct",
    label: "Schedule Reliability %",
    type: "number",
  },
  { name: "avgTransitDays", label: "Avg Transit Days", type: "number" },
  {
    name: "dwellTimeHours",
    label: "Dwell Time (hours)",
    type: "number",
  },
  { name: "portCallCount", label: "Port Call Count", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditVoyageAnalyticPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "analytics:edit")))
    redirect("/analytics-business-intelligence/voyage-analytics");

  const { id } = await params;

  const analytic = await getVoyageAnalytic(id, session.tenantId);
  if (!analytic) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/analytics-business-intelligence/voyage-analytics/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Voyage Analytic
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AbiForm
          entityType="Voyage Analytic"
          apiPath={`/api/v1/analytics-business-intelligence/voyage-analytics/${id}`}
          fields={VOYAGE_FIELDS}
          initialData={{
            analyticsType: analytic.analyticsType,
            voyageRef: analytic.voyageRef ?? "",
            serviceName: analytic.serviceName ?? "",
            vesselName: analytic.vesselName ?? "",
            routeOrigin: analytic.routeOrigin ?? "",
            routeDestination: analytic.routeDestination ?? "",
            periodStart: analytic.periodStart
              ? analytic.periodStart.toISOString()
              : "",
            periodEnd: analytic.periodEnd
              ? analytic.periodEnd.toISOString()
              : "",
            totalTeu: analytic.totalTeu ? Number(analytic.totalTeu) : "",
            revenue: analytic.revenue ? Number(analytic.revenue) : "",
            costs: analytic.costs ? Number(analytic.costs) : "",
            profit: analytic.profit ? Number(analytic.profit) : "",
            profitMarginPct: analytic.profitMarginPct
              ? Number(analytic.profitMarginPct)
              : "",
            currency: analytic.currency ?? "",
            utilizationPct: analytic.utilizationPct
              ? Number(analytic.utilizationPct)
              : "",
            scheduleReliabilityPct: analytic.scheduleReliabilityPct
              ? Number(analytic.scheduleReliabilityPct)
              : "",
            avgTransitDays: analytic.avgTransitDays
              ? Number(analytic.avgTransitDays)
              : "",
            dwellTimeHours: analytic.dwellTimeHours
              ? Number(analytic.dwellTimeHours)
              : "",
            portCallCount: analytic.portCallCount ?? "",
            notes: analytic.notes ?? "",
          }}
          isEdit
          returnPath={`/analytics-business-intelligence/voyage-analytics/${id}`}
        />
      </div>
    </div>
  );
}
