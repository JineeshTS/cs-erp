import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import {
  ApvmForm,
  type FieldConfig,
} from "@/components/accounts-payable-vendor-management/apvm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewPaymentSchedulePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "payable:create")))
    redirect("/accounts-payable-vendor-management");

  const currencyOpts = await getCurrencyOptions();

  const FIELDS: FieldConfig[] = [
    {
      name: "vendorName",
      label: "Vendor Name",
      type: "text",
      required: true,
    },
    {
      name: "invoiceNumber",
      label: "Invoice Number",
      type: "text",
    },
    {
      name: "currency",
      label: "Currency",
      type: "select", options: currencyOpts,
    },
    {
      name: "paymentAmount",
      label: "Payment Amount",
      type: "number",
      required: true,
    },
    {
      name: "scheduledDate",
      label: "Scheduled Date",
      type: "datetime-local",
      required: true,
    },
    {
      name: "paymentMethod",
      label: "Payment Method",
      type: "select",
      required: true,
      options: [
        { value: "bank_transfer", label: "Bank Transfer" },
        { value: "cheque", label: "Cheque" },
        { value: "cash", label: "Cash" },
        { value: "lc", label: "LC" },
        { value: "direct_debit", label: "Direct Debit" },
        { value: "wire", label: "Wire" },
        { value: "other", label: "Other" },
      ],
    },
    {
      name: "bankAccount",
      label: "Bank Account",
      type: "text",
    },
    {
      name: "beneficiaryAccount",
      label: "Beneficiary Account",
      type: "text",
    },
    {
      name: "exchangeRate",
      label: "Exchange Rate",
      type: "number",
    },
    {
      name: "baseCurrencyAmount",
      label: "Base Currency Amount",
      type: "number",
    },
    {
      name: "batchId",
      label: "Batch ID",
      type: "text",
    },
    {
      name: "priorityLevel",
      label: "Priority Level",
      type: "select",
      options: [
        { value: "low", label: "Low" },
        { value: "normal", label: "Normal" },
        { value: "high", label: "High" },
        { value: "urgent", label: "Urgent" },
      ],
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/accounts-payable-vendor-management/payment-schedules"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Payment Schedule
        </h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <ApvmForm
          entityType="Payment Schedule"
          apiPath="/api/v1/accounts-payable-vendor-management/payment-schedules"
          fields={FIELDS}
          returnPath="/accounts-payable-vendor-management/payment-schedules"
        />
      </div>
    </div>
  );
}
