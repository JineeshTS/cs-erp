import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  GlfrForm,
  type FieldConfig,
} from "@/components/general-ledger-financial-reporting/glfr-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewChartOfAccountPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "gl:create")))
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
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          New Chart of Account
        </h1>
        <p className="text-sm text-gray-500">Create a new GL account</p>
      </div>
      <GlfrForm
        entityType="Chart of Account"
        fields={CHART_OF_ACCOUNT_FIELDS}
        apiPath="/api/v1/general-ledger-financial-reporting/chart-of-accounts"
        returnPath="/general-ledger-financial-reporting/chart-of-accounts"
      />
    </div>
  );
}
