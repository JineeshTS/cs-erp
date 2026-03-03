import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getInventoryStockControl } from "@/lib/procurement-supply-chain/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  active: "success",
  low_stock: "warning",
  out_of_stock: "destructive",
  discontinued: "secondary",
} as const;

export default async function InventoryStockControlDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "procurement:read")))
    redirect("/procurement-supply-chain");

  const { id } = await params;

  const record = await getInventoryStockControl(id, session.tenantId);
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
          href="/procurement-supply-chain/inventory-stock-controls"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.inventoryRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.itemName}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/procurement-supply-chain/inventory-stock-controls/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Inventory Ref</dt>
            <dd className="mt-1 text-gray-900">{record.inventoryRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Inventory Type</dt>
            <dd className="mt-1 text-gray-900">{record.inventoryType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Item Code</dt>
            <dd className="mt-1 text-gray-900">{record.itemCode}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Item Name</dt>
            <dd className="mt-1 text-gray-900">{record.itemName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Category</dt>
            <dd className="mt-1 text-gray-900">{record.category || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Unit of Measure</dt>
            <dd className="mt-1 text-gray-900">{record.uom || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Current Stock</dt>
            <dd className="mt-1 text-gray-900">{record.currentStock ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Reorder Level</dt>
            <dd className="mt-1 text-gray-900">{record.reorderLevel ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Reorder Quantity</dt>
            <dd className="mt-1 text-gray-900">{record.reorderQuantity ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Safety Stock</dt>
            <dd className="mt-1 text-gray-900">{record.safetyStock ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Max Stock</dt>
            <dd className="mt-1 text-gray-900">{record.maxStock ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Unit Cost</dt>
            <dd className="mt-1 text-gray-900">{record.unitCost ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Value</dt>
            <dd className="mt-1 text-gray-900">{record.totalValue ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Warehouse Location</dt>
            <dd className="mt-1 text-gray-900">{record.warehouseLocation || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Bin Number</dt>
            <dd className="mt-1 text-gray-900">{record.binNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Received Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.lastReceivedDate
                ? new Date(record.lastReceivedDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Issued Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.lastIssuedDate
                ? new Date(record.lastIssuedDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.expiryDate
                ? new Date(record.expiryDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Batch Number</dt>
            <dd className="mt-1 text-gray-900">{record.batchNumber || "-"}</dd>
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
