import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CspForm, FieldConfig } from "@/components/customer-portal/csp-form";

export default async function NewInvoicePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "portal:create")))
    redirect("/");

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Invoice</h1>
        <p className="text-sm text-gray-500">
          Create a new customer portal invoice
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CspForm
          entityType="Invoice"
          apiPath="/api/v1/customer-portal/invoices"
          fields={fields}
          returnPath="/customer-portal/invoices"
        />
      </div>
    </div>
  );
}
