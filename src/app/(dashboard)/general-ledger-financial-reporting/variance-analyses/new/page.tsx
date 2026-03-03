import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { GlfrForm } from "@/components/general-ledger-financial-reporting/glfr-form";
import type { FieldConfig } from "@/components/general-ledger-financial-reporting/glfr-form";

const VARIANCE_ANALYSIS_FIELDS: FieldConfig[] = [
  {
    name: "analysisType",
    label: "Analysis Type",
    type: "select",
    required: true,
    options: [
      { value: "budget_vs_actual", label: "Budget vs Actual" },
      { value: "period_over_period", label: "Period over Period" },
      { value: "forecast_vs_actual", label: "Forecast vs Actual" },
      { value: "plan_vs_actual", label: "Plan vs Actual" },
    ],
  },
  { name: "periodStart", label: "Period Start", type: "datetime-local" },
  { name: "periodEnd", label: "Period End", type: "datetime-local" },
  { name: "fiscalYear", label: "Fiscal Year", type: "number" },
  {
    name: "currency",
    label: "Currency",
    type: "text",
    placeholder: "USD",
  },
  { name: "budgetAmount", label: "Budget Amount", type: "text" },
  { name: "actualAmount", label: "Actual Amount", type: "text" },
  { name: "varianceAmount", label: "Variance Amount", type: "text" },
  {
    name: "variancePercentage",
    label: "Variance Percentage",
    type: "text",
  },
  {
    name: "favorableUnfavorable",
    label: "Favorable/Unfavorable",
    type: "select",
    options: [
      { value: "favorable", label: "Favorable" },
      { value: "unfavorable", label: "Unfavorable" },
    ],
  },
  { name: "department", label: "Department", type: "text" },
  { name: "costCenter", label: "Cost Center", type: "text" },
  { name: "accountCode", label: "Account Code", type: "text" },
  { name: "commentary", label: "Commentary", type: "textarea" },
  { name: "preparedBy", label: "Prepared By", type: "text" },
  { name: "reviewedBy", label: "Reviewed By", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewVarianceAnalysisPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "gl:create")))
    redirect("/general-ledger-financial-reporting/variance-analyses");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/general-ledger-financial-reporting/variance-analyses"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Variance Analysis
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <GlfrForm
          entityType="Variance Analysis"
          apiPath="/api/v1/general-ledger-financial-reporting/variance-analyses"
          fields={VARIANCE_ANALYSIS_FIELDS}
          returnPath="/general-ledger-financial-reporting/variance-analyses"
        />
      </div>
    </div>
  );
}
