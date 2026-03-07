import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  PttForm,
  type FieldConfig,
} from "@/components/port-tariff-terminal-billing/ptt-form";
import { getPortOptions } from "@/lib/lookups";

export default async function NewBudgetPlanningPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ptt:create")))
    redirect("/");

  const portOpts = await getPortOptions(session.tenantId);

  const BUDGET_FIELDS: FieldConfig[] = [
    {
      name: "budgetType",
      label: "Budget Type",
      type: "select",
      required: true,
      options: [
        { value: "annual_budget", label: "Annual Budget" },
        { value: "quarterly_forecast", label: "Quarterly Forecast" },
        { value: "monthly_actual", label: "Monthly Actual" },
        { value: "variance_analysis", label: "Variance Analysis" },
        { value: "rolling_forecast", label: "Rolling Forecast" },
      ],
    },
    { name: "portCode", label: "Port Code", type: "select", options: portOpts },
    { name: "portName", label: "Port Name", type: "select", options: portOpts },
    { name: "fiscalYear", label: "Fiscal Year", type: "number" },
    { name: "fiscalPeriod", label: "Fiscal Period", type: "text" },
    { name: "budgetedAmount", label: "Budgeted Amount", type: "number" },
    { name: "actualAmount", label: "Actual Amount", type: "number" },
    { name: "varianceAmount", label: "Variance Amount", type: "number" },
    { name: "variancePercentage", label: "Variance Percentage", type: "number" },
    { name: "budgetCurrency", label: "Currency", type: "text" },
    { name: "costCategory", label: "Cost Category", type: "text" },
    { name: "forecastedAmount", label: "Forecasted Amount", type: "number" },
    { name: "approvedBy", label: "Approved By", type: "text" },
    { name: "approvalDate", label: "Approval Date", type: "datetime-local" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/port-tariff-terminal-billing/budget-plannings"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Budget Planning
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new port budget planning entry
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <PttForm
          entityType="Budget Planning"
          apiPath="/api/v1/port-tariff-terminal-billing/budget-plannings"
          returnPath="/port-tariff-terminal-billing/budget-plannings"
          fields={BUDGET_FIELDS}
        />
      </div>
    </div>
  );
}
