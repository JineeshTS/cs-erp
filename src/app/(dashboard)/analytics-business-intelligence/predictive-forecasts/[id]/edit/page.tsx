import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPredictiveForecast } from "@/lib/analytics-business-intelligence/service";
import { AbiForm } from "@/components/analytics-business-intelligence/abi-form";
import type { FieldConfig } from "@/components/analytics-business-intelligence/abi-form";

const FORECAST_FIELDS: FieldConfig[] = [
  {
    name: "forecastType",
    label: "Forecast Type",
    type: "select",
    required: true,
    options: [
      { value: "demand_forecast", label: "Demand Forecast" },
      { value: "rate_forecast", label: "Rate Forecast" },
      { value: "volume_forecast", label: "Volume Forecast" },
      { value: "capacity_forecast", label: "Capacity Forecast" },
    ],
  },
  { name: "modelName", label: "Model Name", type: "text" },
  { name: "modelVersion", label: "Model Version", type: "text" },
  { name: "targetMetric", label: "Target Metric", type: "text", required: true },
  { name: "targetEntity", label: "Target Entity", type: "text" },
  {
    name: "forecastHorizon",
    label: "Forecast Horizon",
    type: "select",
    options: [
      { value: "1_week", label: "1 Week" },
      { value: "1_month", label: "1 Month" },
      { value: "3_months", label: "3 Months" },
      { value: "6_months", label: "6 Months" },
      { value: "1_year", label: "1 Year" },
    ],
  },
  { name: "forecastStart", label: "Forecast Start", type: "datetime-local" },
  { name: "forecastEnd", label: "Forecast End", type: "datetime-local" },
  { name: "predictedValue", label: "Predicted Value", type: "number" },
  { name: "confidenceLower", label: "Confidence Lower", type: "number" },
  { name: "confidenceUpper", label: "Confidence Upper", type: "number" },
  { name: "confidencePct", label: "Confidence %", type: "number" },
  { name: "actualValue", label: "Actual Value", type: "number" },
  { name: "dataPoints", label: "Data Points", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditPredictiveForecastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "analytics:edit")))
    redirect("/analytics-business-intelligence/predictive-forecasts");

  const { id } = await params;

  const forecast = await getPredictiveForecast(id, session.tenantId);
  if (!forecast) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/analytics-business-intelligence/predictive-forecasts/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Predictive Forecast
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AbiForm
          entityType="Predictive Forecast"
          apiPath={`/api/v1/analytics-business-intelligence/predictive-forecasts/${id}`}
          fields={FORECAST_FIELDS}
          initialData={{
            forecastType: forecast.forecastType,
            modelName: forecast.modelName ?? "",
            modelVersion: forecast.modelVersion ?? "",
            targetMetric: forecast.targetMetric,
            targetEntity: forecast.targetEntity ?? "",
            forecastHorizon: forecast.forecastHorizon ?? "",
            forecastStart: forecast.forecastStart
              ? forecast.forecastStart.toISOString()
              : "",
            forecastEnd: forecast.forecastEnd
              ? forecast.forecastEnd.toISOString()
              : "",
            predictedValue: forecast.predictedValue
              ? Number(forecast.predictedValue)
              : "",
            confidenceLower: forecast.confidenceLower
              ? Number(forecast.confidenceLower)
              : "",
            confidenceUpper: forecast.confidenceUpper
              ? Number(forecast.confidenceUpper)
              : "",
            confidencePct: forecast.confidencePct
              ? Number(forecast.confidencePct)
              : "",
            actualValue: forecast.actualValue
              ? Number(forecast.actualValue)
              : "",
            dataPoints: forecast.dataPoints ?? "",
            notes: forecast.notes ?? "",
          }}
          isEdit
          returnPath={`/analytics-business-intelligence/predictive-forecasts/${id}`}
        />
      </div>
    </div>
  );
}
