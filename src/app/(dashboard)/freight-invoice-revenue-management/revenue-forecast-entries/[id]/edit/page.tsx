import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getRevenueForecastEntry } from "@/lib/freight-invoice-revenue-management/service";
import {
  FirmForm,
  type FieldConfig,
} from "@/components/freight-invoice-revenue-management/firm-form";

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
    type: "text",
    placeholder: "USD",
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

export default async function EditRevenueForecastEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "invoice:edit")))
    redirect("/freight-invoice-revenue-management/revenue-forecast-entries");

  const { id } = await params;
  const record = await getRevenueForecastEntry(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/freight-invoice-revenue-management/revenue-forecast-entries/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Revenue Forecast Entry
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FirmForm
          entityType="Revenue Forecast Entry"
          apiPath={`/api/v1/freight-invoice-revenue-management/revenue-forecast-entries/${id}`}
          fields={FORECAST_ENTRY_FIELDS}
          initialData={{
            forecastPeriod: record.forecastPeriod,
            forecastYear: record.forecastYear,
            forecastMonth: record.forecastMonth ?? "",
            serviceRoute: record.serviceRoute ?? "",
            customerSegment: record.customerSegment ?? "",
            currency: record.currency,
            forecastRevenue: record.forecastRevenue,
            pipelineValue: record.pipelineValue,
            confirmedValue: record.confirmedValue,
            probabilityPercent: record.probabilityPercent ?? "",
            forecastMethod: record.forecastMethod ?? "",
            confidenceScore: record.confidenceScore ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/freight-invoice-revenue-management/revenue-forecast-entries/${id}`}
        />
      </div>
    </div>
  );
}
