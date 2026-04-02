import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import {
  EcrForm,
  type FieldConfig,
} from "@/components/empty-container-repositioning-ai/ecr-form";
import { getContainerTypeOptions } from "@/lib/lookups";

export default async function NewDemandForecastPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ecr:create")))
    redirect("/");

  const containerTypeOpts = await getContainerTypeOptions(session.tenantId);

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
      type: "select",
      required: true,
      options: containerTypeOpts,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/empty-container-repositioning-ai/demand-forecasts"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Demand Forecast
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new container demand forecast
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <EcrForm
          entityType="demand-forecasts"
          apiPath="/api/v1/empty-container-repositioning-ai/demand-forecasts"
          fields={fields}
          returnPath="/empty-container-repositioning-ai/demand-forecasts"
        />
      </div>
    </div>
  );
}
