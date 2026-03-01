import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getProformaInvoice } from "@/lib/freight-invoice-revenue-management/service";
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

export default async function EditProformaInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "invoice:edit")))
    redirect("/freight-invoice-revenue-management/proforma-invoices");

  const { id } = await params;
  const record = await getProformaInvoice(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    customerName: record.customerName,
    customerCode: record.customerCode,
    voyageRef: record.voyageRef,
    bookingRef: record.bookingRef,
    currency: record.currency,
    subtotal: record.subtotal,
    taxAmount: record.taxAmount,
    totalAmount: record.totalAmount,
    validUntil: record.validUntil
      ? new Date(record.validUntil).toISOString()
      : "",
    notes: record.notes,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/freight-invoice-revenue-management/proforma-invoices/${record.id}`}
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit {record.proformaNumber}
          </h1>
          <p className="text-sm text-gray-500">
            Update proforma invoice details
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FirmForm
          entityType="Proforma Invoice"
          apiPath={`/api/v1/freight-invoice-revenue-management/proforma-invoices/${record.id}`}
          fields={PROFORMA_FIELDS}
          initialData={initialData}
          isEdit
          returnPath="/freight-invoice-revenue-management/proforma-invoices"
        />
      </div>
    </div>
  );
}
