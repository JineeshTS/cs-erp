import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getCashFlowForecast } from "@/lib/accounts-receivable-credit-control/service";

export default async function CashFlowForecastDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || !(await hasPermission(session.id, session.tenantId, "receivable:read"))) {
    redirect("/login");
  }

  const { id } = await params;
  const record = await getCashFlowForecast(id, session.tenantId);

  if (!record) {
    notFound();
  }

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Forecast Ref", value: record.forecastRef },
    { label: "Forecast Period", value: record.forecastPeriod },
    { label: "Forecast Year", value: record.forecastYear },
    { label: "Forecast Month", value: record.forecastMonth },
    { label: "Forecast Week", value: record.forecastWeek },
    { label: "Currency", value: record.currency },
    {
      label: "Opening Balance",
      value: record.openingBalance != null ? Number(record.openingBalance).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-",
    },
    {
      label: "Expected Inflows",
      value: record.expectedInflows != null ? Number(record.expectedInflows).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-",
    },
    {
      label: "Confirmed Inflows",
      value: record.confirmedInflows != null ? Number(record.confirmedInflows).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-",
    },
    {
      label: "Probable Inflows",
      value: record.probableInflows != null ? Number(record.probableInflows).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-",
    },
    {
      label: "At-Risk Inflows",
      value: record.atRiskInflows != null ? Number(record.atRiskInflows).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-",
    },
    {
      label: "Expected Outflows",
      value: record.expectedOutflows != null ? Number(record.expectedOutflows).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-",
    },
    {
      label: "Net Cash Flow",
      value: record.netCashFlow != null ? Number(record.netCashFlow).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-",
    },
    {
      label: "Closing Balance",
      value: record.closingBalance != null ? Number(record.closingBalance).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-",
    },
    {
      label: "Actual Inflows",
      value: record.actualInflows != null ? Number(record.actualInflows).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-",
    },
    {
      label: "Actual Outflows",
      value: record.actualOutflows != null ? Number(record.actualOutflows).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-",
    },
    {
      label: "Variance Amount",
      value: record.varianceAmount != null ? Number(record.varianceAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-",
    },
    {
      label: "Variance Percent",
      value: record.variancePercent != null ? `${Number(record.variancePercent).toFixed(1)}%` : "-",
    },
    { label: "Forecast Method", value: record.forecastMethod },
    { label: "AI Model Version", value: record.aiModelVersion },
    {
      label: "Confidence Score",
      value: record.confidenceScore != null ? Number(record.confidenceScore).toFixed(1) : "-",
    },
    { label: "Scenario Type", value: record.scenarioType },
    { label: "Approved By", value: record.approvedByName },
    {
      label: "Approved At",
      value: record.approvedAt ? new Date(record.approvedAt).toLocaleString() : "-",
    },
    { label: "Status", value: record.status },
    { label: "Notes", value: record.notes },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link
            href="/accounts-receivable-credit-control/cash-flow-forecasts"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; Back to Cash Flow Forecasts
          </Link>
          <h1 className="text-2xl font-semibold text-foreground">
            {record.forecastRef || "Cash Flow Forecast"}
          </h1>
        </div>
        {(await hasPermission(session.id, session.tenantId, "receivable:edit")) && (
          <Link
            href={`/accounts-receivable-credit-control/cash-flow-forecasts/${id}/edit`}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => (
            <div key={field.label}>
              <dt className="text-sm font-medium text-muted-foreground">
                {field.label}
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {field.value || "-"}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
