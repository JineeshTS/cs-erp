import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDdmInvoice } from "@/lib/demurrage-detention-management/service";
import { DdmForm } from "@/components/demurrage-detention-management/ddm-form";
import type { FieldConfig } from "@/components/demurrage-detention-management/ddm-form";

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
  { name: "customerName", label: "Customer Name", type: "text", required: true },
  { name: "customerCode", label: "Customer Code", type: "text" },
  { name: "containerNumber", label: "Container Number", type: "text" },
  { name: "bookingRef", label: "Booking Ref", type: "text" },
  { name: "blNumber", label: "BL Number", type: "text" },
  { name: "demurrageAmount", label: "Demurrage Amount", type: "text" },
  { name: "detentionAmount", label: "Detention Amount", type: "text" },
  { name: "subtotal", label: "Subtotal", type: "text" },
  { name: "taxRate", label: "Tax Rate", type: "text" },
  { name: "taxAmount", label: "Tax Amount", type: "text" },
  { name: "totalAmount", label: "Total Amount", type: "text", required: true },
  { name: "currency", label: "Currency", type: "text" },
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

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "demurrage:edit")))
    redirect("/demurrage-detention-management/invoices");

  const { id } = await params;

  const invoice = await getDdmInvoice(id, session.tenantId);
  if (!invoice) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/demurrage-detention-management/invoices/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit D&D Invoice</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DdmForm
          entityType="Invoice"
          apiPath={`/api/v1/demurrage-detention-management/invoices/${id}`}
          fields={INVOICE_FIELDS}
          initialData={{
            invoiceType: invoice.invoiceType ?? "",
            customerName: invoice.customerName ?? "",
            customerCode: invoice.customerCode ?? "",
            containerNumber: invoice.containerNumber ?? "",
            bookingRef: invoice.bookingRef ?? "",
            blNumber: invoice.blNumber ?? "",
            demurrageAmount: invoice.demurrageAmount ?? "",
            detentionAmount: invoice.detentionAmount ?? "",
            subtotal: invoice.subtotal ?? "",
            taxRate: invoice.taxRate ?? "",
            taxAmount: invoice.taxAmount ?? "",
            totalAmount: invoice.totalAmount ?? "",
            currency: invoice.currency ?? "",
            invoiceDate: invoice.invoiceDate
              ? new Date(invoice.invoiceDate).toISOString()
              : "",
            dueDate: invoice.dueDate
              ? new Date(invoice.dueDate).toISOString()
              : "",
            dispatchMethod: invoice.dispatchMethod ?? "",
            customerEmail: invoice.customerEmail ?? "",
            notes: invoice.notes ?? "",
          }}
          isEdit
          returnPath={`/demurrage-detention-management/invoices/${id}`}
        />
      </div>
    </div>
  );
}
