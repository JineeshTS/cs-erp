import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDemandForecast } from "@/lib/liner-revenue-management/service";
import { LrmForm, type FieldConfig } from "@/components/liner-revenue-management/lrm-form";

const DEMAND_FORECAST_FIELDS: FieldConfig[] = [
  {
    name: "forecastType",
    label: "Forecast Type",
    type: "select",
    required: true,
    options: [
      { value: "seasonal_trend", label: "Seasonal Trend" },
      { value: "ml_prediction", label: "ML Prediction" },
      { value: "market_analysis", label: "Market Analysis" },
      { value: "capacity_planning", label: "Capacity Planning" },
      { value: "booking_projection", label: "Booking Projection" },
    ],
  },
  { name: "tradeLane", label: "Trade Lane", type: "text" },
  { name: "originRegion", label: "Origin Region", type: "text" },
  { name: "destinationRegion", label: "Destination Region", type: "text" },
  { name: "forecastPeriod", label: "Forecast Period", type: "text" },
  { name: "predictedTeu", label: "Predicted TEU", type: "number" },
  { name: "actualTeu", label: "Actual TEU", type: "number" },
  { name: "confidencePct", label: "Confidence %", type: "text" },
  { name: "accuracyPct", label: "Accuracy %", type: "text" },
  { name: "modelVersion", label: "Model Version", type: "text" },
  { name: "forecastDate", label: "Forecast Date", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditDemandForecastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "lrm:edit")))
    redirect("/liner-revenue-management/demand-forecasts");

  const { id } = await params;

  const record = await getDemandForecast(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/liner-revenue-management/demand-forecasts/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Demand Forecast
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LrmForm
          entityType="Demand Forecast"
          apiPath={`/api/v1/liner-revenue-management/demand-forecasts/${id}`}
          fields={DEMAND_FORECAST_FIELDS}
          initialData={{
            forecastType: record.forecastType,
            tradeLane: record.tradeLane ?? "",
            originRegion: record.originRegion ?? "",
            destinationRegion: record.destinationRegion ?? "",
            forecastPeriod: record.forecastPeriod ?? "",
            predictedTeu: record.predictedTeu ?? "",
            actualTeu: record.actualTeu ?? "",
            confidencePct: record.confidencePct ?? "",
            accuracyPct: record.accuracyPct ?? "",
            modelVersion: record.modelVersion ?? "",
            forecastDate: record.forecastDate ? record.forecastDate.toISOString().slice(0, 16) : "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/liner-revenue-management/demand-forecasts/${id}`}
        />
      </div>
    </div>
  );
}
