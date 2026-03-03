import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { PscForm } from "@/components/procurement-supply-chain/psc-form";
import type { FieldConfig } from "@/components/procurement-supply-chain/psc-form";

const RECEIPT_FIELDS: FieldConfig[] = [
  {
    name: "receiptType",
    label: "Receipt Type",
    type: "select",
    required: true,
    options: [
      { value: "standard", label: "Standard" },
      { value: "return", label: "Return" },
      { value: "transfer", label: "Transfer" },
      { value: "adjustment", label: "Adjustment" },
      { value: "inspection", label: "Inspection" },
    ],
  },
  { name: "linkedPoRef", label: "Linked PO Ref", type: "text" },
  { name: "vendorName", label: "Vendor Name", type: "text" },
  { name: "vendorId", label: "Vendor ID", type: "text" },
  { name: "receiptDate", label: "Receipt Date", type: "datetime-local" },
  { name: "receivedBy", label: "Received By", type: "text" },
  { name: "totalOrderedQty", label: "Total Ordered Qty", type: "text" },
  { name: "totalReceivedQty", label: "Total Received Qty", type: "text" },
  { name: "totalAcceptedQty", label: "Total Accepted Qty", type: "text" },
  { name: "totalRejectedQty", label: "Total Rejected Qty", type: "text" },
  { name: "inspectionDate", label: "Inspection Date", type: "datetime-local" },
  { name: "inspectedBy", label: "Inspected By", type: "text" },
  {
    name: "inspectionResult",
    label: "Inspection Result",
    type: "select",
    options: [
      { value: "pass", label: "Pass" },
      { value: "fail", label: "Fail" },
      { value: "partial", label: "Partial" },
      { value: "conditional", label: "Conditional" },
    ],
  },
  { name: "qualityCertificateRef", label: "Quality Certificate Ref", type: "text" },
  { name: "warehouseLocation", label: "Warehouse Location", type: "text" },
  { name: "deliveryNoteRef", label: "Delivery Note Ref", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewGoodsReceiptInspectionPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "procurement:create"))
  )
    redirect("/procurement-supply-chain/goods-receipt-inspections");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/procurement-supply-chain/goods-receipt-inspections"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Goods Receipt Inspection
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PscForm
          entityType="Goods Receipt Inspection"
          apiPath="/api/v1/procurement-supply-chain/goods-receipt-inspections"
          fields={RECEIPT_FIELDS}
          returnPath="/procurement-supply-chain/goods-receipt-inspections"
        />
      </div>
    </div>
  );
}
