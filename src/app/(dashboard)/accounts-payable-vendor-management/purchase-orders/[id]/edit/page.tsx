import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPurchaseOrder } from "@/lib/accounts-payable-vendor-management/service";
import {
  ApvmForm,
  type FieldConfig,
} from "@/components/accounts-payable-vendor-management/apvm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditPurchaseOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "payable:edit")))
    redirect("/accounts-payable-vendor-management/purchase-orders");

  const currencyOpts = await getCurrencyOptions();

  const PURCHASE_ORDER_FIELDS: FieldConfig[] = [
    { name: "vendorName", label: "Vendor Name", type: "text", required: true },
    { name: "vendorCode", label: "Vendor Code", type: "text" },
    {
      name: "poType",
      label: "PO Type",
      type: "select",
      required: true,
      options: [
        { value: "standard", label: "Standard" },
        { value: "blanket", label: "Blanket" },
        { value: "contract", label: "Contract" },
        { value: "emergency", label: "Emergency" },
        { value: "service", label: "Service" },
        { value: "other", label: "Other" },
      ],
    },
    { name: "description", label: "Description", type: "textarea" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "subtotal", label: "Subtotal", type: "number" },
    { name: "taxAmount", label: "Tax Amount", type: "number" },
    {
      name: "totalAmount",
      label: "Total Amount",
      type: "number",
      required: true,
    },
    { name: "deliveryDate", label: "Delivery Date", type: "datetime-local" },
    { name: "deliveryAddress", label: "Delivery Address", type: "textarea" },
    { name: "paymentTerms", label: "Payment Terms", type: "text" },
    { name: "budgetCode", label: "Budget Code", type: "text" },
    { name: "costCentre", label: "Cost Centre", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;
  const record = await getPurchaseOrder(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/accounts-payable-vendor-management/purchase-orders/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Purchase Order
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ApvmForm
          entityType="Purchase Order"
          apiPath={`/api/v1/accounts-payable-vendor-management/purchase-orders/${id}`}
          fields={PURCHASE_ORDER_FIELDS}
          initialData={{
            vendorName: record.vendorName,
            vendorCode: record.vendorCode ?? "",
            poType: record.poType,
            description: record.description ?? "",
            currency: record.currency,
            subtotal: record.subtotal,
            taxAmount: record.taxAmount,
            totalAmount: record.totalAmount,
            deliveryDate: record.deliveryDate
              ? new Date(record.deliveryDate).toISOString()
              : "",
            deliveryAddress: record.deliveryAddress ?? "",
            paymentTerms: record.paymentTerms ?? "",
            budgetCode: record.budgetCode ?? "",
            costCentre: record.costCentre ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/accounts-payable-vendor-management/purchase-orders/${id}`}
        />
      </div>
    </div>
  );
}
