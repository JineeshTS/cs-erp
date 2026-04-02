import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getConsolidatedStatement } from "@/lib/general-ledger-financial-reporting/service";
import { GlfrForm } from "@/components/general-ledger-financial-reporting/glfr-form";
import type { FieldConfig } from "@/components/general-ledger-financial-reporting/glfr-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditConsolidatedStatementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "gl:edit")))
    redirect("/general-ledger-financial-reporting/consolidated-statements");

  const currencyOpts = await getCurrencyOptions();

  const CONSOLIDATED_STATEMENT_FIELDS: FieldConfig[] = [
    {
      name: "consolidationType",
      label: "Consolidation Type",
      type: "select",
      required: true,
      options: [
        { value: "full", label: "Full" },
        { value: "proportional", label: "Proportional" },
        { value: "equity_method", label: "Equity Method" },
        { value: "elimination", label: "Elimination" },
      ],
    },
    { name: "periodStart", label: "Period Start", type: "datetime-local" },
    { name: "periodEnd", label: "Period End", type: "datetime-local" },
    { name: "fiscalYear", label: "Fiscal Year", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "parentEntity", label: "Parent Entity", type: "text" },
    { name: "minorityInterest", label: "Minority Interest", type: "text" },
    {
      name: "consolidatedRevenue",
      label: "Consolidated Revenue",
      type: "text",
    },
    {
      name: "consolidatedNetIncome",
      label: "Consolidated Net Income",
      type: "text",
    },
    {
      name: "consolidatedAssets",
      label: "Consolidated Assets",
      type: "text",
    },
    {
      name: "consolidatedLiabilities",
      label: "Consolidated Liabilities",
      type: "text",
    },
    {
      name: "consolidatedEquity",
      label: "Consolidated Equity",
      type: "text",
    },
    { name: "preparedBy", label: "Prepared By", type: "text" },
    { name: "approvedBy", label: "Approved By", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;

  const record = await getConsolidatedStatement(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/general-ledger-financial-reporting/consolidated-statements/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Consolidated Statement
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <GlfrForm
          entityType="Consolidated Statement"
          apiPath={`/api/v1/general-ledger-financial-reporting/consolidated-statements/${id}`}
          fields={CONSOLIDATED_STATEMENT_FIELDS}
          initialData={{
            consolidationType: record.consolidationType,
            periodStart: record.periodStart
              ? record.periodStart.toISOString()
              : "",
            periodEnd: record.periodEnd
              ? record.periodEnd.toISOString()
              : "",
            fiscalYear: record.fiscalYear ?? "",
            currency: record.currency ?? "",
            parentEntity: record.parentEntity ?? "",
            minorityInterest: record.minorityInterest ?? "",
            consolidatedRevenue: record.consolidatedRevenue ?? "",
            consolidatedNetIncome: record.consolidatedNetIncome ?? "",
            consolidatedAssets: record.consolidatedAssets ?? "",
            consolidatedLiabilities: record.consolidatedLiabilities ?? "",
            consolidatedEquity: record.consolidatedEquity ?? "",
            preparedBy: record.preparedBy ?? "",
            approvedBy: record.approvedBy ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/general-ledger-financial-reporting/consolidated-statements/${id}`}
        />
      </div>
    </div>
  );
}
