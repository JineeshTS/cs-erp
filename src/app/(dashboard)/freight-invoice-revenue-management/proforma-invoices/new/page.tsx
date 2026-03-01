import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import {
  FirmForm,
  type FieldConfig,
} from "@/components/freight-invoice-revenue-management/firm-form";

const PROFORMA_FIELDS: FieldConfig[] = [
  { name: "customerName", label: "Customer Name", type: "text", required: true },
  { name: "customerCode", label: "Customer Code", type: "text" },
  { name: "voyageRef", label: "Voyage Ref", type: "text" },
  { name: "bookingRef", label: "Booking Ref", type: "text" },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "subtotal", label: "Subtotal", type: "number" },
  { name: "taxAmount", label: "Tax Amount", type: "number" },
  { name: "totalAmount", label: "Total Amount", type: "number", required: true },
  { name: "validUntil", label: "Valid Until", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewProformaInvoicePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "invoice:create")))
    redirect("/freight-invoice-revenue-management/proforma-invoices");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/freight-invoice-revenue-management/proforma-invoices"
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            New Proforma Invoice
          </h1>
          <p className="text-sm text-gray-500">
            Create a new proforma invoice
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FirmForm
          entityType="Proforma Invoice"
          apiPath="/api/v1/freight-invoice-revenue-management/proforma-invoices"
          fields={PROFORMA_FIELDS}
          returnPath="/freight-invoice-revenue-management/proforma-invoices"
        />
      </div>
    </div>
  );
}
