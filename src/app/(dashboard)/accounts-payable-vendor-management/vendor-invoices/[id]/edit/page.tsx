import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getVendorInvoice } from "@/lib/accounts-payable-vendor-management/service";
import { ApvmForm } from "@/components/accounts-payable-vendor-management/apvm-form";
import type { FieldConfig } from "@/components/accounts-payable-vendor-management/apvm-form";

const VENDOR_INVOICE_FIELDS: FieldConfig[] = [
  { name: "vendorName", label: "Vendor Name", type: "text", required: true },
  { name: "vendorInvoiceRef", label: "Vendor Invoice Ref", type: "text" },
  { name: "vendorCode", label: "Vendor Code", type: "text" },
  { name: "poNumber", label: "PO Number", type: "text" },
  { name: "invoiceDate", label: "Invoice Date", type: "datetime-local", required: true },
  { name: "dueDate", label: "Due Date", type: "datetime-local" },
  { name: "currency", label: "Currency", type: "text" },
  { name: "subtotal", label: "Subtotal", type: "number" },
  { name: "taxAmount", label: "Tax Amount", type: "number" },
  { name: "totalAmount", label: "Total Amount", type: "number", required: true },
  { name: "exchangeRate", label: "Exchange Rate", type: "number" },
  { name: "baseCurrencyAmount", label: "Base Currency Amount", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditVendorInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "payable:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getVendorInvoice(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/accounts-payable-vendor-management/vendor-invoices/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Vendor Invoice</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ApvmForm
          entityType="Vendor Invoice"
          apiPath={`/api/v1/accounts-payable-vendor-management/vendor-invoices/${id}`}
          fields={VENDOR_INVOICE_FIELDS}
          initialData={{
            vendorName: record.vendorName,
            vendorInvoiceRef: record.vendorInvoiceRef ?? "",
            vendorCode: record.vendorCode ?? "",
            poNumber: record.poNumber ?? "",
            invoiceDate: record.invoiceDate ? new Date(record.invoiceDate).toISOString() : "",
            dueDate: record.dueDate ? new Date(record.dueDate).toISOString() : "",
            currency: record.currency ?? "",
            subtotal: record.subtotal ? Number(record.subtotal) : "",
            taxAmount: record.taxAmount ? Number(record.taxAmount) : "",
            totalAmount: record.totalAmount ? Number(record.totalAmount) : "",
            exchangeRate: record.exchangeRate ? Number(record.exchangeRate) : "",
            baseCurrencyAmount: record.baseCurrencyAmount ? Number(record.baseCurrencyAmount) : "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/accounts-payable-vendor-management/vendor-invoices/${id}`}
        />
      </div>
    </div>
  );
}
