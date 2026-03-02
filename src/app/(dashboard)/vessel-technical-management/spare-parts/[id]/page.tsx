import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getSparePart } from "@/lib/vessel-technical-management/service";
import { Badge } from "@/components/ui/badge";

function statusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge variant="success">{status}</Badge>;
    case "out_of_stock":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function SparePartDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "technical:read")))
    redirect("/");

  const { id } = await params;

  const record = await getSparePart(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "technical:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/vessel-technical-management/spare-parts"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {record.partName}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {record.partRef} &middot; {record.category}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/vessel-technical-management/spare-parts/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6 dark:bg-gray-900 dark:border-gray-700">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Vessel Name</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.vesselName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Part Number</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.partNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Part Name</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.partName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.description || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.category}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Manufacturer</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.manufacturer || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Model Number</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.modelNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Unit of Measure</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.unitOfMeasure || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Minimum Stock</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.minimumStock ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Stock</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.currentStock ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Reorder Level</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.reorderLevel ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Unit Price</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.lastUnitPrice ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Currency</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Storage Location</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.storageLocation || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Critical Part</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.criticalPart ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Lead Time (Days)</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.leadTimeDays ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Preferred Supplier</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.preferredSupplierName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
            <dd className="mt-1">{statusBadge(record.status)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{new Date(record.createdAt).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Updated At</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{new Date(record.updatedAt).toLocaleDateString()}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
