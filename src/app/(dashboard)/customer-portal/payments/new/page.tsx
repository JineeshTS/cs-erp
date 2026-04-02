import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CspForm, FieldConfig } from "@/components/customer-portal/csp-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewPaymentPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "portal:create")))
    redirect("/customer-portal/payments");

  const currencyOpts = await getCurrencyOptions();

  const fields: FieldConfig[] = [
    {
      name: "invoiceId",
      label: "Invoice ID",
      type: "text",
      required: true,
      placeholder: "Invoice UUID",
    },
    {
      name: "amount",
      label: "Amount",
      type: "number",
      required: true,
    },
    {
      name: "currency",
      label: "Currency",
      type: "select", options: currencyOpts,
    },
    {
      name: "paymentMethod",
      label: "Payment Method",
      type: "select",
      required: true,
      options: [
        { value: "credit_card", label: "Credit Card" },
        { value: "bank_transfer", label: "Bank Transfer" },
        { value: "wire", label: "Wire" },
        { value: "cheque", label: "Cheque" },
        { value: "online_banking", label: "Online Banking" },
        { value: "letter_of_credit", label: "Letter of Credit" },
      ],
    },
    {
      name: "gatewayProvider",
      label: "Gateway Provider",
      type: "text",
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
          href="/customer-portal/payments"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Payment</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CspForm
          entityType="Payment"
          apiPath="/api/v1/customer-portal/payments"
          fields={fields}
          returnPath="/customer-portal/payments"
        />
      </div>
    </div>
  );
}
