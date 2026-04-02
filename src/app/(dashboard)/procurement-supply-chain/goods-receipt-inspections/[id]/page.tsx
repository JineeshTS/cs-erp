import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getGoodsReceiptInspection } from "@/lib/procurement-supply-chain/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  pending: "warning",
  received: "secondary",
  inspecting: "warning",
  accepted: "success",
  rejected: "destructive",
} as const;

export default async function GoodsReceiptInspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "procurement:read")))
    redirect("/procurement-supply-chain");

  const { id } = await params;

  const record = await getGoodsReceiptInspection(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "procurement:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/procurement-supply-chain/goods-receipt-inspections"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.receiptRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.vendorName || "Goods Receipt Inspection"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/procurement-supply-chain/goods-receipt-inspections/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Receipt Ref</dt>
            <dd className="mt-1 text-gray-900">{record.receiptRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Receipt Type</dt>
            <dd className="mt-1 text-gray-900">{record.receiptType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Linked PO Ref</dt>
            <dd className="mt-1 text-gray-900">{record.linkedPoRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vendor Name</dt>
            <dd className="mt-1 text-gray-900">{record.vendorName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vendor ID</dt>
            <dd className="mt-1 text-gray-900">{record.vendorId || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Receipt Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.receiptDate
                ? new Date(record.receiptDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Received By</dt>
            <dd className="mt-1 text-gray-900">{record.receivedBy || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Ordered Qty</dt>
            <dd className="mt-1 text-gray-900">{record.totalOrderedQty ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Received Qty</dt>
            <dd className="mt-1 text-gray-900">{record.totalReceivedQty ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Accepted Qty</dt>
            <dd className="mt-1 text-gray-900">{record.totalAcceptedQty ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Rejected Qty</dt>
            <dd className="mt-1 text-gray-900">{record.totalRejectedQty ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Inspection Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.inspectionDate
                ? new Date(record.inspectionDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Inspected By</dt>
            <dd className="mt-1 text-gray-900">{record.inspectedBy || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Inspection Result</dt>
            <dd className="mt-1 text-gray-900">{record.inspectionResult || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Quality Certificate Ref</dt>
            <dd className="mt-1 text-gray-900">{record.qualityCertificateRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Warehouse Location</dt>
            <dd className="mt-1 text-gray-900">{record.warehouseLocation || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Delivery Note Ref</dt>
            <dd className="mt-1 text-gray-900">{record.deliveryNoteRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    record.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt.toLocaleDateString()}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">
              {record.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
