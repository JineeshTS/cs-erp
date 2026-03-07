import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  FirmForm,
  type FieldConfig,
} from "@/components/freight-invoice-revenue-management/firm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewRevenueForecastEntryPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "invoice:create")))
    redirect("/freight-invoice-revenue-management/revenue-forecast-entries");

  const currencyOpts = await getCurrencyOptions();

  const FORECAST_ENTRY_FIELDS: FieldConfig[] = [
    {
      name: "forecastPeriod",
      label: "Forecast Period",
      type: "text",
      required: true,
    },
    {
      name: "forecastYear",
      label: "Forecast Year",
      type: "number",
      required: true,
    },
    {
      name: "forecastMonth",
      label: "Forecast Month",
      type: "number",
    },
    {
      name: "serviceRoute",
      label: "Service Route",
      type: "text",
    },
    {
      name: "customerSegment",
      label: "Customer Segment",
      type: "text",
    },
    {
      name: "currency",
      label: "Currency",
      type: "select", options: currencyOpts,
    },
    {
      name: "forecastRevenue",
      label: "Forecast Revenue",
      type: "number",
      required: true,
    },
    {
      name: "pipelineValue",
      label: "Pipeline Value",
      type: "number",
    },
    {
      name: "confirmedValue",
      label: "Confirmed Value",
      type: "number",
    },
    {
      name: "probabilityPercent",
      label: "Probability Percent",
      type: "number",
    },
    {
      name: "forecastMethod",
      label: "Forecast Method",
      type: "select",
      options: [
        { value: "historical_trend", label: "Historical Trend" },
        { value: "ai_model", label: "AI Model" },
        { value: "manual", label: "Manual" },
        { value: "bottom_up", label: "Bottom Up" },
        { value: "top_down", label: "Top Down" },
        { value: "weighted_pipeline", label: "Weighted Pipeline" },
      ],
    },
    {
      name: "confidenceScore",
      label: "Confidence Score",
      type: "number",
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
    },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/freight-invoice-revenue-management/revenue-forecast-entries"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Revenue Forecast Entry
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FirmForm
          entityType="Revenue Forecast Entry"
          apiPath="/api/v1/freight-invoice-revenue-management/revenue-forecast-entries"
          fields={FORECAST_ENTRY_FIELDS}
          returnPath="/freight-invoice-revenue-management/revenue-forecast-entries"
        />
      </div>
    </div>
  );
}
