import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  FirmForm,
  type FieldConfig,
} from "@/components/freight-invoice-revenue-management/firm-form";
import { getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewFreightInvoicePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "invoice:create"))
  )
    redirect("/freight-invoice-revenue-management/freight-invoices");

  const [customerOpts, currencyOpts] = await Promise.all([
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const FREIGHT_INVOICE_FIELDS: FieldConfig[] = [
    {
      name: "invoiceType",
      label: "Invoice Type",
      type: "select",
      required: true,
      options: [
        { value: "freight", label: "Freight" },
        { value: "demurrage", label: "Demurrage" },
        { value: "detention", label: "Detention" },
        { value: "surcharge", label: "Surcharge" },
        { value: "combined", label: "Combined" },
        { value: "other", label: "Other" },
      ],
    },
    { name: "customerName", label: "Customer Name", type: "select", options: customerOpts, required: true },
    { name: "customerCode", label: "Customer Code", type: "select", options: customerOpts },
    { name: "voyageRef", label: "Voyage Ref", type: "text" },
    { name: "bookingRef", label: "Booking Ref", type: "text" },
    { name: "blNumber", label: "B/L Number", type: "text" },
    { name: "billingAddress", label: "Billing Address", type: "textarea" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "subtotal", label: "Subtotal", type: "number" },
    { name: "taxAmount", label: "Tax Amount", type: "number" },
    { name: "discountAmount", label: "Discount Amount", type: "number" },
    { name: "totalAmount", label: "Total Amount", type: "number", required: true },
    { name: "paymentTerms", label: "Payment Terms", type: "text" },
    { name: "dueDate", label: "Due Date", type: "datetime-local" },
    {
      name: "dispatchMethod",
      label: "Dispatch Method",
      type: "select",
      options: [
        { value: "email", label: "Email" },
        { value: "post", label: "Post" },
        { value: "portal", label: "Portal" },
        { value: "edi", label: "EDI" },
        { value: "manual", label: "Manual" },
      ],
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/freight-invoice-revenue-management/freight-invoices"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Freight Invoice
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FirmForm
          entityType="Freight Invoice"
          apiPath="/api/v1/freight-invoice-revenue-management/freight-invoices"
          fields={FREIGHT_INVOICE_FIELDS}
          returnPath="/freight-invoice-revenue-management/freight-invoices"
        />
      </div>
    </div>
  );
}
