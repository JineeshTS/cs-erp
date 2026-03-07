import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ApvmForm } from "@/components/accounts-payable-vendor-management/apvm-form";
import type { FieldConfig } from "@/components/accounts-payable-vendor-management/apvm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewVendorInvoicePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "payable:create")))
    redirect("/");

  const currencyOpts = await getCurrencyOptions();

  const VENDOR_INVOICE_FIELDS: FieldConfig[] = [
    { name: "vendorName", label: "Vendor Name", type: "text", required: true },
    { name: "vendorInvoiceRef", label: "Vendor Invoice Ref", type: "text" },
    { name: "vendorCode", label: "Vendor Code", type: "text" },
    { name: "poNumber", label: "PO Number", type: "text" },
    { name: "invoiceDate", label: "Invoice Date", type: "datetime-local", required: true },
    { name: "dueDate", label: "Due Date", type: "datetime-local" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "subtotal", label: "Subtotal", type: "number" },
    { name: "taxAmount", label: "Tax Amount", type: "number" },
    { name: "totalAmount", label: "Total Amount", type: "number", required: true },
    { name: "exchangeRate", label: "Exchange Rate", type: "number" },
    { name: "baseCurrencyAmount", label: "Base Currency Amount", type: "number" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/accounts-payable-vendor-management/vendor-invoices"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Vendor Invoice</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ApvmForm
          entityType="Vendor Invoice"
          fields={VENDOR_INVOICE_FIELDS}
          apiPath="/api/v1/accounts-payable-vendor-management/vendor-invoices"
          returnPath="/accounts-payable-vendor-management/vendor-invoices"
        />
      </div>
    </div>
  );
}
