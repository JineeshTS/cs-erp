import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getDemandForecast } from "@/lib/empty-container-repositioning-ai/service";
import {
  EcrForm,
  type FieldConfig,
} from "@/components/empty-container-repositioning-ai/ecr-form";

const fields: FieldConfig[] = [
  {
    name: "forecastType",
    label: "Forecast Type",
    type: "select",
    options: [
      { label: "Short Term", value: "short_term" },
      { label: "Medium Term", value: "medium_term" },
      { label: "Long Term", value: "long_term" },
      { label: "Seasonal", value: "seasonal" },
      { label: "Event Driven", value: "event_driven" },
    ],
    required: true,
  },
  { name: "title", label: "Title", type: "text", required: true },
  { name: "tradeLane", label: "Trade Lane", type: "text", required: true },
  {
    name: "containerType",
    label: "Container Type",
    type: "text",
    required: true,
  },
  { name: "periodFrom", label: "Period From", type: "datetime-local" },
  { name: "periodTo", label: "Period To", type: "datetime-local" },
  {
    name: "forecastedDemand",
    label: "Forecasted Demand",
    type: "number",
    required: true,
  },
  { name: "actualDemand", label: "Actual Demand", type: "number" },
  { name: "accuracyPct", label: "Accuracy %", type: "text" },
  { name: "confidenceLevel", label: "Confidence Level", type: "text" },
  { name: "aiModelVersion", label: "AI Model Version", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditDemandForecastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ecr:edit")))
    redirect("/");

  const { id } = await params;
  const forecast = await getDemandForecast(id, session.tenantId);
  if (!forecast) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/empty-container-repositioning-ai/demand-forecasts/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Demand Forecast
          </h1>
          <p className="text-sm text-muted-foreground">
            {forecast.forecastRef} — {forecast.title}
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <EcrForm
          entityType="demand-forecasts"
          apiPath="/api/v1/empty-container-repositioning-ai/demand-forecasts"
          fields={fields}
          initialData={forecast}
          isEdit
          returnPath={`/empty-container-repositioning-ai/demand-forecasts/${id}`}
        />
      </div>
    </div>
  );
}
