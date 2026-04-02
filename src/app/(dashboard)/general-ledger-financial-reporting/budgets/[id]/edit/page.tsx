import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getBudget } from "@/lib/general-ledger-financial-reporting/service";
import { GlfrForm } from "@/components/general-ledger-financial-reporting/glfr-form";
import type { FieldConfig } from "@/components/general-ledger-financial-reporting/glfr-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditBudgetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "gl:edit")))
    redirect("/general-ledger-financial-reporting/budgets");

  const currencyOpts = await getCurrencyOptions();

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
      type: "select", options: currencyOpts,
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
  const { id } = await params;
  const record = await getBudget(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/general-ledger-financial-reporting/budgets/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Budget</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <GlfrForm
          entityType="Budget"
          apiPath={`/api/v1/general-ledger-financial-reporting/budgets/${id}`}
          fields={BUDGET_FIELDS}
          initialData={{
            budgetType: record.budgetType,
            budgetName: record.budgetName ?? "",
            fiscalYear: record.fiscalYear ?? "",
            periodStart: record.periodStart
              ? new Date(record.periodStart).toISOString()
              : "",
            periodEnd: record.periodEnd
              ? new Date(record.periodEnd).toISOString()
              : "",
            currency: record.currency ?? "",
            department: record.department ?? "",
            costCenter: record.costCenter ?? "",
            totalBudgeted: record.totalBudgeted ?? "",
            totalActual: record.totalActual ?? "",
            totalVariance: record.totalVariance ?? "",
            variancePercentage: record.variancePercentage ?? "",
            currentRevision: record.currentRevision ?? "",
            preparedBy: record.preparedBy ?? "",
            approvedBy: record.approvedBy ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/general-ledger-financial-reporting/budgets/${id}`}
        />
      </div>
    </div>
  );
}
