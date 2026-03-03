import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { GlfrForm } from "@/components/general-ledger-financial-reporting/glfr-form";
import type { FieldConfig } from "@/components/general-ledger-financial-reporting/glfr-form";

const BUDGET_FIELDS: FieldConfig[] = [
  {
    name: "budgetType",
    label: "Budget Type",
    type: "select",
    required: true,
    options: [
      { value: "annual", label: "Annual" },
      { value: "quarterly", label: "Quarterly" },
      { value: "rolling", label: "Rolling" },
      { value: "zero_based", label: "Zero Based" },
      { value: "incremental", label: "Incremental" },
    ],
  },
  { name: "budgetName", label: "Budget Name", type: "text" },
  { name: "fiscalYear", label: "Fiscal Year", type: "number" },
  { name: "periodStart", label: "Period Start", type: "datetime-local" },
  { name: "periodEnd", label: "Period End", type: "datetime-local" },
  {
    name: "currency",
    label: "Currency",
    type: "text",
    placeholder: "USD",
  },
  { name: "department", label: "Department", type: "text" },
  { name: "costCenter", label: "Cost Center", type: "text" },
  { name: "totalBudgeted", label: "Total Budgeted", type: "text" },
  { name: "totalActual", label: "Total Actual", type: "text" },
  { name: "totalVariance", label: "Total Variance", type: "text" },
  {
    name: "variancePercentage",
    label: "Variance Percentage",
    type: "text",
  },
  { name: "currentRevision", label: "Current Revision", type: "number" },
  { name: "preparedBy", label: "Prepared By", type: "text" },
  { name: "approvedBy", label: "Approved By", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewBudgetPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "gl:create")))
    redirect("/general-ledger-financial-reporting/budgets");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/general-ledger-financial-reporting/budgets"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Budget</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <GlfrForm
          entityType="Budget"
          apiPath="/api/v1/general-ledger-financial-reporting/budgets"
          fields={BUDGET_FIELDS}
          returnPath="/general-ledger-financial-reporting/budgets"
        />
      </div>
    </div>
  );
}
