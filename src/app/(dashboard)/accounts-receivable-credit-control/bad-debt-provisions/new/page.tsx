import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ArccForm } from "@/components/accounts-receivable-credit-control/arcc-form";
import type { FieldConfig } from "@/components/accounts-receivable-credit-control/arcc-form";
import { getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewBadDebtProvisionPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "receivable:create"))) redirect("/");


  const [customerOpts, currencyOpts] = await Promise.all([
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);
  const fields: FieldConfig[] = [
    { name: "provisionType", label: "Provision Type", type: "select", required: true, options: [
      { label: "General", value: "general" },
      { label: "Specific", value: "specific" },
      { label: "Write-Off", value: "write_off" },
      { label: "Recovery", value: "recovery" },
    ]},
    { name: "customerName", label: "Customer Name", type: "select", options: customerOpts, required: true },
    { name: "accountNumber", label: "Account Number", type: "text" },
    { name: "invoiceRef", label: "Invoice Ref", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "originalAmount", label: "Original Amount", type: "number", required: true },
    { name: "provisionAmount", label: "Provision Amount", type: "number", required: true },
    { name: "provisionPercent", label: "Provision Percent", type: "number" },
    { name: "agingBucket", label: "Aging Bucket", type: "select", options: [
      { label: "Current", value: "current" },
      { label: "1-30 Days", value: "1_30" },
      { label: "31-60 Days", value: "31_60" },
      { label: "61-90 Days", value: "61_90" },
      { label: "91-120 Days", value: "91_120" },
      { label: "Over 120 Days", value: "over_120" },
    ]},
    { name: "reason", label: "Reason", type: "textarea" },
    { name: "glAccountCode", label: "GL Account Code", type: "text" },
    { name: "accountingPeriod", label: "Accounting Period", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Bad Debt Provision</h1>
        <p className="text-sm text-gray-500">Create a new bad debt provision</p>
      </div>
      <ArccForm
        entityType="Bad Debt Provision"
        fields={fields}
        apiPath="/api/v1/accounts-receivable-credit-control/bad-debt-provisions"
        returnPath="/accounts-receivable-credit-control/bad-debt-provisions"
      />
    </div>
  );
}
