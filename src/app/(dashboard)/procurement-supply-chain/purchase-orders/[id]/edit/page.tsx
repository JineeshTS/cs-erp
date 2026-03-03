import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPurchaseOrder } from "@/lib/procurement-supply-chain/service";
import { PscForm } from "@/components/procurement-supply-chain/psc-form";
import type { FieldConfig } from "@/components/procurement-supply-chain/psc-form";

const PO_FIELDS: FieldConfig[] = [
  {
    name: "poType",
    label: "PO Type",
    type: "select",
    required: true,
    options: [
      { value: "standard", label: "Standard" },
      { value: "blanket", label: "Blanket" },
      { value: "contract", label: "Contract" },
      { value: "scheduled", label: "Scheduled" },
      { value: "emergency", label: "Emergency" },
    ],
  },
  { name: "vendorName", label: "Vendor Name", type: "text" },
  { name: "vendorId", label: "Vendor ID", type: "text" },
  { name: "orderDate", label: "Order Date", type: "datetime-local" },
  { name: "deliveryDate", label: "Delivery Date", type: "datetime-local" },
  { name: "subtotal", label: "Subtotal", type: "text" },
  { name: "taxAmount", label: "Tax Amount", type: "text" },
  { name: "shippingCost", label: "Shipping Cost", type: "text" },
  { name: "discount", label: "Discount", type: "text" },
  { name: "totalAmount", label: "Total Amount", type: "text" },
  { name: "currency", label: "Currency", type: "text", placeholder: "QAR" },
  { name: "paymentTerms", label: "Payment Terms", type: "text" },
  { name: "shippingMethod", label: "Shipping Method", type: "text" },
  { name: "deliveryAddress", label: "Delivery Address", type: "textarea" },
  { name: "linkedRequisitionRef", label: "Linked Requisition", type: "text" },
  { name: "linkedSourcingRef", label: "Linked Sourcing", type: "text" },
  { name: "invoiceRef", label: "Invoice Ref", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditPurchaseOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "procurement:edit")))
    redirect("/procurement-supply-chain/purchase-orders");

  const { id } = await params;

  const record = await getPurchaseOrder(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/procurement-supply-chain/purchase-orders/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Purchase Order
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PscForm
          entityType="Purchase Order"
          apiPath={`/api/v1/procurement-supply-chain/purchase-orders/${id}`}
          fields={PO_FIELDS}
          initialData={{
            poType: record.poType,
            vendorName: record.vendorName ?? "",
            vendorId: record.vendorId ?? "",
            orderDate: record.orderDate
              ? new Date(record.orderDate).toISOString()
              : "",
            deliveryDate: record.deliveryDate
              ? new Date(record.deliveryDate).toISOString()
              : "",
            subtotal: record.subtotal ?? "",
            taxAmount: record.taxAmount ?? "",
            shippingCost: record.shippingCost ?? "",
            discount: record.discount ?? "",
            totalAmount: record.totalAmount ?? "",
            currency: record.currency ?? "",
            paymentTerms: record.paymentTerms ?? "",
            shippingMethod: record.shippingMethod ?? "",
            deliveryAddress: record.deliveryAddress ?? "",
            linkedRequisitionRef: record.linkedRequisitionRef ?? "",
            linkedSourcingRef: record.linkedSourcingRef ?? "",
            invoiceRef: record.invoiceRef ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/procurement-supply-chain/purchase-orders/${id}`}
        />
      </div>
    </div>
  );
}
