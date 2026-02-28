import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CapForm } from "@/components/capacity-voyage-management/cap-form";
import type { FieldConfig } from "@/components/capacity-voyage-management/cap-form";

const FIELDS: FieldConfig[] = [
  {
    name: "tradeLane",
    label: "Trade Lane",
    type: "text",
    required: true,
    placeholder: "e.g. Asia-Middle East",
  },
  {
    name: "originRegion",
    label: "Origin Region",
    type: "text",
  },
  {
    name: "destinationRegion",
    label: "Destination Region",
    type: "text",
  },
  {
    name: "forecastPeriodStart",
    label: "Forecast Period Start",
    type: "datetime-local",
    required: true,
  },
  {
    name: "forecastPeriodEnd",
    label: "Forecast Period End",
    type: "datetime-local",
    required: true,
  },
  {
    name: "forecastedDemandTeu",
    label: "Forecasted Demand TEU",
    type: "number",
  },
  {
    name: "actualDemandTeu",
    label: "Actual Demand TEU",
    type: "number",
  },
  {
    name: "availableCapacityTeu",
    label: "Available Capacity TEU",
    type: "number",
  },
  {
    name: "utilizationForecastPercent",
    label: "Utilization Forecast %",
    type: "number",
  },
  {
    name: "confidenceLevel",
    label: "Confidence Level %",
    type: "number",
  },
  {
    name: "methodology",
    label: "Methodology",
    type: "select",
    options: [
      { value: "historical", label: "Historical" },
      { value: "ai", label: "AI" },
      { value: "manual", label: "Manual" },
      { value: "hybrid", label: "Hybrid" },
    ],
  },
  {
    name: "seasonFactor",
    label: "Season Factor",
    type: "number",
  },
  {
    name: "aiModel",
    label: "AI Model",
    type: "text",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "preliminary", label: "Preliminary" },
      { value: "final", label: "Final" },
      { value: "expired", label: "Expired" },
    ],
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
  },
];

export default async function NewDemandForecastPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "capacity:create"))
  )
    redirect("/capacity-voyage-management");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/capacity-voyage-management/demand-forecasts"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Demand Forecast
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CapForm
          entityType="Demand Forecast"
          apiPath="/api/v1/capacity-voyage-management/demand-forecasts"
          fields={FIELDS}
          returnPath="/capacity-voyage-management/demand-forecasts"
        />
      </div>
    </div>
  );
}
