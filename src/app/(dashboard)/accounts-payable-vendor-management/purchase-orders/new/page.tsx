import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  ApvmForm,
  type FieldConfig,
} from "@/components/accounts-payable-vendor-management/apvm-form";

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
  { name: "currency", label: "Currency", type: "text" },
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

export default async function NewPurchaseOrderPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "payable:create")))
    redirect("/accounts-payable-vendor-management/purchase-orders");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/accounts-payable-vendor-management/purchase-orders"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Purchase Order
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ApvmForm
          entityType="Purchase Order"
          apiPath="/api/v1/accounts-payable-vendor-management/purchase-orders"
          fields={PURCHASE_ORDER_FIELDS}
          returnPath="/accounts-payable-vendor-management/purchase-orders"
        />
      </div>
    </div>
  );
}
