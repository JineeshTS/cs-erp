import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getChartOfAccount } from "@/lib/general-ledger-financial-reporting/service";
import {
  GlfrForm,
  type FieldConfig,
} from "@/components/general-ledger-financial-reporting/glfr-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditChartOfAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "gl:edit")))
    redirect("/general-ledger-financial-reporting/chart-of-accounts");

  const currencyOpts = await getCurrencyOptions();

  const CHART_OF_ACCOUNT_FIELDS: FieldConfig[] = [
    {
      name: "accountType",
      label: "Account Type",
      type: "select",
      required: true,
      options: [
        { value: "asset", label: "Asset" },
        { value: "liability", label: "Liability" },
        { value: "equity", label: "Equity" },
        { value: "revenue", label: "Revenue" },
        { value: "expense", label: "Expense" },
      ],
    },
    {
      name: "accountCode",
      label: "Account Code",
      type: "text",
      required: true,
      placeholder: "e.g. 1001",
    },
    { name: "accountName", label: "Account Name", type: "text", required: true },
    { name: "parentAccountId", label: "Parent Account ID", type: "text" },
    { name: "accountLevel", label: "Account Level", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    {
      name: "normalBalance",
      label: "Normal Balance",
      type: "select",
      options: [
        { value: "debit", label: "Debit" },
        { value: "credit", label: "Credit" },
      ],
    },
    { name: "isControlAccount", label: "Is Control Account", type: "checkbox" },
    { name: "isReconcilable", label: "Is Reconcilable", type: "checkbox" },
    { name: "isBankAccount", label: "Is Bank Account", type: "checkbox" },
    { name: "segment", label: "Segment", type: "text" },
    { name: "costCenter", label: "Cost Center", type: "text" },
    { name: "department", label: "Department", type: "text" },
    { name: "taxCode", label: "Tax Code", type: "text" },
    { name: "openingBalance", label: "Opening Balance", type: "text" },
    { name: "currentBalance", label: "Current Balance", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;
  const record = await getChartOfAccount(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Chart of Account
        </h1>
        <p className="text-sm text-gray-500">
          Update account details for {record.accountName}
        </p>
      </div>
      <GlfrForm
        entityType="Chart of Account"
        fields={CHART_OF_ACCOUNT_FIELDS}
        initialData={{
          accountType: record.accountType ?? "",
          accountCode: record.accountCode ?? "",
          accountName: record.accountName ?? "",
          parentAccountId: record.parentAccountId ?? "",
          accountLevel: record.accountLevel ?? "",
          currency: record.currency ?? "",
          normalBalance: record.normalBalance ?? "",
          isControlAccount: record.isControlAccount ?? false,
          isReconcilable: record.isReconcilable ?? false,
          isBankAccount: record.isBankAccount ?? false,
          segment: record.segment ?? "",
          costCenter: record.costCenter ?? "",
          department: record.department ?? "",
          taxCode: record.taxCode ?? "",
          openingBalance: record.openingBalance ?? "",
          currentBalance: record.currentBalance ?? "",
          description: record.description ?? "",
          notes: record.notes ?? "",
        }}
        isEdit
        apiPath={`/api/v1/general-ledger-financial-reporting/chart-of-accounts/${id}`}
        returnPath={`/general-ledger-financial-reporting/chart-of-accounts/${id}`}
      />
    </div>
  );
}
