import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getTechnicalProcurement } from "@/lib/vessel-technical-management/service";
import { Badge } from "@/components/ui/badge";

function statusBadge(status: string) {
  switch (status) {
    case "delivered":
      return <Badge variant="success">{status}</Badge>;
    case "cancelled":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function TechnicalProcurementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "technical:read")))
    redirect("/");

  const { id } = await params;

  const record = await getTechnicalProcurement(id, session.tenantId);
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
          href="/vessel-technical-management/technical-procurements"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {record.procurementRef}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {record.vesselName} &middot; {record.requestType}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/vessel-technical-management/technical-procurements/${id}/edit`}
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
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Request Type</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.requestType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.description || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Requested By</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.requestedByName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.department || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Urgency</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.urgency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Budget</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.estimatedBudget ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Approved Budget</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.approvedBudget ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Actual Cost</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.actualCost ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Currency</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Supplier Name</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.supplierName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Purchase Order Ref</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.purchaseOrderRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Delivery Date</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">
              {record.deliveryDate ? new Date(record.deliveryDate).toLocaleDateString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Approved By</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{record.approvedByName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Approved At</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">
              {record.approvedAt ? new Date(record.approvedAt).toLocaleDateString() : "-"}
            </dd>
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
