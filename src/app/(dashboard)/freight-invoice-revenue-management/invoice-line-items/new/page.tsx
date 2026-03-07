import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  FirmForm,
  type FieldConfig,
} from "@/components/freight-invoice-revenue-management/firm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewInvoiceLineItemPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "invoice:create"))
  )
    redirect("/freight-invoice-revenue-management/invoice-line-items");

  const currencyOpts = await getCurrencyOptions();

  const LINE_ITEM_FIELDS: FieldConfig[] = [
    { name: "invoiceId", label: "Invoice ID", type: "text", required: true },
    { name: "lineNumber", label: "Line Number", type: "number", required: true },
    { name: "chargeCode", label: "Charge Code", type: "text", required: true },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: true,
    },
    { name: "containerNumber", label: "Container Number", type: "text" },
    { name: "containerType", label: "Container Type", type: "text" },
    { name: "quantity", label: "Quantity", type: "number" },
    { name: "unitPrice", label: "Unit Price", type: "number", required: true },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "amount", label: "Amount", type: "number", required: true },
    { name: "taxRate", label: "Tax Rate", type: "number" },
    { name: "taxAmount", label: "Tax Amount", type: "number" },
    {
      name: "totalAmount",
      label: "Total Amount",
      type: "number",
      required: true,
    },
    { name: "tariffRef", label: "Tariff Ref", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/freight-invoice-revenue-management/invoice-line-items"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Invoice Line Item
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FirmForm
          entityType="Invoice Line Item"
          apiPath="/api/v1/freight-invoice-revenue-management/invoice-line-items"
          fields={LINE_ITEM_FIELDS}
          returnPath="/freight-invoice-revenue-management/invoice-line-items"
        />
      </div>
    </div>
  );
}
