import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getBankReconciliation } from "@/lib/treasury-cash-management/service";
import { TcmForm } from "@/components/treasury-cash-management/tcm-form";
import type { FieldConfig } from "@/components/treasury-cash-management/tcm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditBankReconciliationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "treasury:edit")))
    redirect("/treasury-cash-management/bank-reconciliations");

  const currencyOpts = await getCurrencyOptions();

  const RECONCILIATION_FIELDS: FieldConfig[] = [
    {
      name: "reconciliationType",
      label: "Reconciliation Type",
      type: "select",
      required: true,
      options: [
        { value: "auto", label: "Auto" },
        { value: "manual", label: "Manual" },
        { value: "hybrid", label: "Hybrid" },
        { value: "ai_assisted", label: "AI Assisted" },
      ],
    },
    { name: "bankAccountRef", label: "Bank Account Ref", type: "text" },
    { name: "bankName", label: "Bank Name", type: "text" },
    { name: "periodStart", label: "Period Start", type: "datetime-local" },
    { name: "periodEnd", label: "Period End", type: "datetime-local" },
    {
      name: "statementBalance",
      label: "Statement Balance",
      type: "text",
      placeholder: "0.00",
    },
    {
      name: "bookBalance",
      label: "Book Balance",
      type: "text",
      placeholder: "0.00",
    },
    {
      name: "reconciledBalance",
      label: "Reconciled Balance",
      type: "text",
      placeholder: "0.00",
    },
    { name: "unreconciledItems", label: "Unreconciled Items", type: "number" },
    {
      name: "matchedTransactions",
      label: "Matched Transactions",
      type: "number",
    },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    {
      name: "difference",
      label: "Difference",
      type: "text",
      placeholder: "0.00",
    },
    { name: "reconciledBy", label: "Reconciled By", type: "text" },
    { name: "reconciledAt", label: "Reconciled At", type: "datetime-local" },
    { name: "approvedBy", label: "Approved By", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;

  const record = await getBankReconciliation(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/treasury-cash-management/bank-reconciliations/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Bank Reconciliation
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <TcmForm
          entityType="Bank Reconciliation"
          apiPath={`/api/v1/treasury-cash-management/bank-reconciliations/${id}`}
          fields={RECONCILIATION_FIELDS}
          initialData={{
            reconciliationType: record.reconciliationType ?? "",
            bankAccountRef: record.bankAccountRef ?? "",
            bankName: record.bankName ?? "",
            periodStart: record.periodStart
              ? new Date(record.periodStart).toISOString()
              : "",
            periodEnd: record.periodEnd
              ? new Date(record.periodEnd).toISOString()
              : "",
            statementBalance: record.statementBalance ?? "",
            bookBalance: record.bookBalance ?? "",
            reconciledBalance: record.reconciledBalance ?? "",
            unreconciledItems: record.unreconciledItems ?? "",
            matchedTransactions: record.matchedTransactions ?? "",
            currency: record.currency ?? "",
            difference: record.difference ?? "",
            reconciledBy: record.reconciledBy ?? "",
            reconciledAt: record.reconciledAt
              ? new Date(record.reconciledAt).toISOString()
              : "",
            approvedBy: record.approvedBy ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/treasury-cash-management/bank-reconciliations/${id}`}
        />
      </div>
    </div>
  );
}
