import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { capDemandForecasts } from "@/db/schema";
import { CapForm } from "@/components/capacity-voyage-management/cap-form";
import type { FieldConfig } from "@/components/capacity-voyage-management/cap-form";

const FIELDS: FieldConfig[] = [
  {
    name: "tradeLane",
    label: "Trade Lane",
    type: "text",
    required: true,
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

export default async function EditDemandForecastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "capacity:edit")))
    redirect("/capacity-voyage-management");

  const { id } = await params;
  const df = await db
    .select()
    .from(capDemandForecasts)
    .where(
      and(
        eq(capDemandForecasts.id, id),
        eq(capDemandForecasts.tenantId, session.tenantId),
        isNull(capDemandForecasts.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!df) notFound();

  const initialData: Record<string, unknown> = {
    tradeLane: df.tradeLane,
    originRegion: df.originRegion ?? "",
    destinationRegion: df.destinationRegion ?? "",
    forecastPeriodStart: df.forecastPeriodStart?.toISOString() ?? "",
    forecastPeriodEnd: df.forecastPeriodEnd?.toISOString() ?? "",
    forecastedDemandTeu: df.forecastedDemandTeu ?? "",
    actualDemandTeu: df.actualDemandTeu ?? "",
    availableCapacityTeu: df.availableCapacityTeu ?? "",
    utilizationForecastPercent:
      df.utilizationForecastPercent != null
        ? Number(df.utilizationForecastPercent)
        : "",
    confidenceLevel:
      df.confidenceLevel != null ? Number(df.confidenceLevel) : "",
    methodology: df.methodology,
    seasonFactor:
      df.seasonFactor != null ? Number(df.seasonFactor) : "",
    aiModel: df.aiModel ?? "",
    status: df.status,
    notes: df.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/capacity-voyage-management/demand-forecasts/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Demand Forecast
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CapForm
          entityType="Demand Forecast"
          apiPath={`/api/v1/capacity-voyage-management/demand-forecasts/${id}`}
          fields={FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/capacity-voyage-management/demand-forecasts/${id}`}
        />
      </div>
    </div>
  );
}
