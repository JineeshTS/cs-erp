import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getInvoice } from "@/lib/customer-portal/service";
import { CspForm, FieldConfig } from "@/components/customer-portal/csp-form";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "portal:edit")))
    redirect("/");

  const { id } = await params;
  const invoice = await getInvoice(id, session.tenantId);
  if (!invoice) notFound();

  const fields: FieldConfig[] = [
    {
      name: "customerId",
      label: "Customer ID",
      type: "text",
      required: true,
      placeholder: "Customer UUID",
    },
    {
      name: "bookingId",
      label: "Booking ID",
      type: "text",
      placeholder: "Booking UUID",
    },
    {
      name: "invoiceType",
      label: "Invoice Type",
      type: "select",
      required: true,
      options: [
        { value: "freight", label: "Freight" },
        { value: "demurrage", label: "Demurrage" },
        { value: "detention", label: "Detention" },
        { value: "documentation", label: "Documentation" },
        { value: "surcharge", label: "Surcharge" },
        { value: "credit_note", label: "Credit Note" },
        { value: "debit_note", label: "Debit Note" },
      ],
    },
    {
      name: "currency",
      label: "Currency",
      type: "text",
      placeholder: "USD",
    },
    {
      name: "subtotal",
      label: "Subtotal",
      type: "number",
      required: true,
    },
    {
      name: "taxAmount",
      label: "Tax Amount",
      type: "number",
    },
    {
      name: "totalAmount",
      label: "Total Amount",
      type: "number",
      required: true,
    },
    {
      name: "balanceDue",
      label: "Balance Due",
      type: "number",
      required: true,
    },
    {
      name: "dueDate",
      label: "Due Date",
      type: "datetime-local",
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
    },
  ];

  const initialData: Record<string, unknown> = {
    customerId: invoice.customerId,
    bookingId: invoice.bookingId ?? "",
    invoiceType: invoice.invoiceType,
    currency: invoice.currency,
    subtotal: invoice.subtotal,
    taxAmount: invoice.taxAmount,
    totalAmount: invoice.totalAmount,
    balanceDue: invoice.balanceDue,
    dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : "",
    notes: invoice.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Invoice</h1>
        <p className="text-sm text-gray-500">
          Update invoice {invoice.invoiceRef}
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CspForm
          entityType="Invoice"
          apiPath={`/api/v1/customer-portal/invoices/${id}`}
          fields={fields}
          initialData={initialData}
          isEdit
          returnPath="/customer-portal/invoices"
        />
      </div>
    </div>
  );
}
