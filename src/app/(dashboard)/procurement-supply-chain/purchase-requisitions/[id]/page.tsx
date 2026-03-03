import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPurchaseRequisition } from "@/lib/procurement-supply-chain/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  pending: "warning",
  approved: "success",
  rejected: "destructive",
  completed: "success",
} as const;

export default async function PurchaseRequisitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "procurement:read")))
    redirect("/procurement-supply-chain");

  const { id } = await params;

  const record = await getPurchaseRequisition(id, session.tenantId);
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
          href="/procurement-supply-chain/purchase-requisitions"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.requisitionRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.title}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/procurement-supply-chain/purchase-requisitions/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Requisition Ref</dt>
            <dd className="mt-1 text-gray-900">{record.requisitionRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Title</dt>
            <dd className="mt-1 text-gray-900">{record.title}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Requisition Type</dt>
            <dd className="mt-1 text-gray-900">{record.requisitionType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Requested By</dt>
            <dd className="mt-1 text-gray-900">{record.requestedBy || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Department</dt>
            <dd className="mt-1 text-gray-900">{record.department || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Cost Center</dt>
            <dd className="mt-1 text-gray-900">{record.costCenter || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Request Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.requestDate
                ? new Date(record.requestDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Required Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.requiredDate
                ? new Date(record.requiredDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Priority</dt>
            <dd className="mt-1 text-gray-900">{record.priority || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Estimated Cost</dt>
            <dd className="mt-1 text-gray-900">
              {record.totalEstimatedCost ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "-"}</dd>
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
            <dt className="text-sm font-medium text-gray-500">Approver</dt>
            <dd className="mt-1 text-gray-900">{record.approver || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approval Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.approvalDate
                ? new Date(record.approvalDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Budget Code</dt>
            <dd className="mt-1 text-gray-900">{record.budgetCode || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Delivery Location</dt>
            <dd className="mt-1 text-gray-900">{record.deliveryLocation || "-"}</dd>
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
            <dt className="text-sm font-medium text-gray-500">Justification</dt>
            <dd className="mt-1 text-gray-900">
              {record.justification || "-"}
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
