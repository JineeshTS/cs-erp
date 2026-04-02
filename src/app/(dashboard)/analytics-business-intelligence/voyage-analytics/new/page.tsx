import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { AbiForm } from "@/components/analytics-business-intelligence/abi-form";
import type { FieldConfig } from "@/components/analytics-business-intelligence/abi-form";
import { getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewVoyageAnalyticPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "analytics:create"))
  )
    redirect("/analytics-business-intelligence/voyage-analytics");

  const [vesselOpts, currencyOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

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
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
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
      type: "select", options: currencyOpts,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/analytics-business-intelligence/voyage-analytics"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Voyage Analytic
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AbiForm
          entityType="Voyage Analytic"
          apiPath="/api/v1/analytics-business-intelligence/voyage-analytics"
          fields={VOYAGE_FIELDS}
          returnPath="/analytics-business-intelligence/voyage-analytics"
        />
      </div>
    </div>
  );
}
