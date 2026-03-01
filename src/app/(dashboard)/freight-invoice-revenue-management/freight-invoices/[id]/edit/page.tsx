import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getFreightInvoice } from "@/lib/freight-invoice-revenue-management/service";
import {
  FirmForm,
  type FieldConfig,
} from "@/components/freight-invoice-revenue-management/firm-form";

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
  { name: "customerName", label: "Customer Name", type: "text", required: true },
  { name: "customerCode", label: "Customer Code", type: "text" },
  { name: "voyageRef", label: "Voyage Ref", type: "text" },
  { name: "bookingRef", label: "Booking Ref", type: "text" },
  { name: "blNumber", label: "B/L Number", type: "text" },
  { name: "billingAddress", label: "Billing Address", type: "textarea" },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
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

export default async function EditFreightInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "invoice:edit")))
    redirect("/freight-invoice-revenue-management/freight-invoices");

  const { id } = await params;

  const invoice = await getFreightInvoice(id, session.tenantId);
  if (!invoice) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/freight-invoice-revenue-management/freight-invoices/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Freight Invoice
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FirmForm
          entityType="Freight Invoice"
          apiPath={`/api/v1/freight-invoice-revenue-management/freight-invoices/${id}`}
          fields={FREIGHT_INVOICE_FIELDS}
          initialData={{
            invoiceType: invoice.invoiceType,
            customerName: invoice.customerName,
            customerCode: invoice.customerCode ?? "",
            voyageRef: invoice.voyageRef ?? "",
            bookingRef: invoice.bookingRef ?? "",
            blNumber: invoice.blNumber ?? "",
            billingAddress: invoice.billingAddress ?? "",
            currency: invoice.currency,
            subtotal: invoice.subtotal,
            taxAmount: invoice.taxAmount,
            discountAmount: invoice.discountAmount,
            totalAmount: invoice.totalAmount,
            paymentTerms: invoice.paymentTerms ?? "",
            dueDate: invoice.dueDate
              ? new Date(invoice.dueDate).toISOString()
              : "",
            dispatchMethod: invoice.dispatchMethod ?? "",
            notes: invoice.notes ?? "",
          }}
          isEdit
          returnPath={`/freight-invoice-revenue-management/freight-invoices/${id}`}
        />
      </div>
    </div>
  );
}
