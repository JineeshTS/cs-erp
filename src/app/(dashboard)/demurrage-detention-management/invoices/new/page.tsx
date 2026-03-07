import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { DdmForm } from "@/components/demurrage-detention-management/ddm-form";
import type { FieldConfig } from "@/components/demurrage-detention-management/ddm-form";
import { getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewInvoicePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "demurrage:create"))
  )
    redirect("/demurrage-detention-management/invoices");

  const [customerOpts, currencyOpts] = await Promise.all([
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const INVOICE_FIELDS: FieldConfig[] = [
    {
      name: "invoiceType",
      label: "Invoice Type",
      type: "select",
      required: true,
      options: [
        { value: "demurrage", label: "Demurrage" },
        { value: "detention", label: "Detention" },
        { value: "combined", label: "Combined" },
      ],
    },
    { name: "customerName", label: "Customer Name", type: "select", options: customerOpts, required: true },
    { name: "customerCode", label: "Customer Code", type: "select", options: customerOpts },
    { name: "containerNumber", label: "Container Number", type: "text" },
    { name: "bookingRef", label: "Booking Ref", type: "text" },
    { name: "blNumber", label: "BL Number", type: "text" },
    { name: "demurrageAmount", label: "Demurrage Amount", type: "text" },
    { name: "detentionAmount", label: "Detention Amount", type: "text" },
    { name: "subtotal", label: "Subtotal", type: "text" },
    { name: "taxRate", label: "Tax Rate", type: "text" },
    { name: "taxAmount", label: "Tax Amount", type: "text" },
    { name: "totalAmount", label: "Total Amount", type: "text", required: true },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "invoiceDate", label: "Invoice Date", type: "datetime-local", required: true },
    { name: "dueDate", label: "Due Date", type: "datetime-local", required: true },
    {
      name: "dispatchMethod",
      label: "Dispatch Method",
      type: "select",
      options: [
        { value: "email", label: "Email" },
        { value: "postal", label: "Postal" },
        { value: "portal", label: "Portal" },
        { value: "edi", label: "EDI" },
      ],
    },
    { name: "customerEmail", label: "Customer Email", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/demurrage-detention-management/invoices"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New D&D Invoice</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DdmForm
          entityType="Invoice"
          apiPath="/api/v1/demurrage-detention-management/invoices"
          fields={INVOICE_FIELDS}
          returnPath="/demurrage-detention-management/invoices"
        />
      </div>
    </div>
  );
}
