import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getCashFlowForecast } from "@/lib/accounts-receivable-credit-control/service";
import { ArccForm } from "@/components/accounts-receivable-credit-control/arcc-form";
import type { FieldConfig } from "@/components/accounts-receivable-credit-control/arcc-form";

export default async function EditCashFlowForecastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || !(await hasPermission(session.id, session.tenantId, "receivable:edit"))) {
    redirect("/login");
  }

  const { id } = await params;
  const record = await getCashFlowForecast(id, session.tenantId);

  if (!record) {
    notFound();
  }

  const fields: FieldConfig[] = [
    { name: "forecastPeriod", label: "Forecast Period", type: "text", required: true },
    { name: "forecastYear", label: "Forecast Year", type: "number", required: true },
    { name: "forecastMonth", label: "Forecast Month", type: "number", required: true },
    { name: "forecastWeek", label: "Forecast Week", type: "number" },
    { name: "currency", label: "Currency", type: "text" },
    { name: "openingBalance", label: "Opening Balance", type: "number" },
    { name: "expectedInflows", label: "Expected Inflows", type: "number" },
    { name: "confirmedInflows", label: "Confirmed Inflows", type: "number" },
    { name: "probableInflows", label: "Probable Inflows", type: "number" },
    { name: "atRiskInflows", label: "At-Risk Inflows", type: "number" },
    { name: "expectedOutflows", label: "Expected Outflows", type: "number" },
    {
      name: "forecastMethod",
      label: "Forecast Method",
      type: "select",
      required: true,
      options: [
        { label: "Historical Trend", value: "historical_trend" },
        { label: "AI Model", value: "ai_model" },
        { label: "Manual", value: "manual" },
        { label: "Weighted Pipeline", value: "weighted_pipeline" },
        { label: "Regression", value: "regression" },
        { label: "Hybrid", value: "hybrid" },
      ],
    },
    { name: "aiModelVersion", label: "AI Model Version", type: "text" },
    { name: "confidenceScore", label: "Confidence Score", type: "number" },
    {
      name: "scenarioType",
      label: "Scenario Type",
      type: "select",
      options: [
        { label: "Base", value: "base" },
        { label: "Optimistic", value: "optimistic" },
        { label: "Pessimistic", value: "pessimistic" },
        { label: "Stress", value: "stress" },
      ],
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          href={`/accounts-receivable-credit-control/cash-flow-forecasts/${id}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to Forecast
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">
          Edit Cash Flow Forecast
        </h1>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <ArccForm
          entityType="Cash Flow Forecast"
          fields={fields}
          initialData={record}
          apiPath={`/api/v1/accounts-receivable-credit-control/cash-flow-forecasts/${id}`}
          method="PUT"
          returnPath="/accounts-receivable-credit-control/cash-flow-forecasts"
          isEdit
        />
      </div>
    </div>
  );
}
