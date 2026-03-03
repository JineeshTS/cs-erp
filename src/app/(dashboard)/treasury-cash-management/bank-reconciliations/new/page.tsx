import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { TcmForm } from "@/components/treasury-cash-management/tcm-form";
import type { FieldConfig } from "@/components/treasury-cash-management/tcm-form";

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
  { name: "currency", label: "Currency", type: "text", placeholder: "QAR" },
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

export default async function NewBankReconciliationPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "treasury:create"))
  )
    redirect("/treasury-cash-management/bank-reconciliations");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/treasury-cash-management/bank-reconciliations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Bank Reconciliation
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <TcmForm
          entityType="Bank Reconciliation"
          apiPath="/api/v1/treasury-cash-management/bank-reconciliations"
          fields={RECONCILIATION_FIELDS}
          returnPath="/treasury-cash-management/bank-reconciliations"
        />
      </div>
    </div>
  );
}
