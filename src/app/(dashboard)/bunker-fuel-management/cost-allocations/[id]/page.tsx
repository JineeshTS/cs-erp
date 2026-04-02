import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCostAllocation } from "@/lib/bunker-fuel-management/service";
import { Badge } from "@/components/ui/badge";

export default async function CostAllocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bunker:read")))
    redirect("/");

  const { id } = await params;

  const allocation = await getCostAllocation(id, session.tenantId);
  if (!allocation) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "bunker:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/bunker-fuel-management/cost-allocations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {allocation.allocationRef}
          </h1>
          <p className="text-sm text-gray-500">
            {allocation.vesselName} &middot; {allocation.voyageRef}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/bunker-fuel-management/cost-allocations/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">
              Allocation Ref
            </dt>
            <dd className="mt-1 text-gray-900">{allocation.allocationRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage Ref</dt>
            <dd className="mt-1 text-gray-900">{allocation.voyageRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{allocation.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel IMO</dt>
            <dd className="mt-1 text-gray-900">
              {allocation.vesselImo || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Order ID</dt>
            <dd className="mt-1 text-gray-900">
              {allocation.orderId || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Fuel Type</dt>
            <dd className="mt-1 text-gray-900">{allocation.fuelType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Qty Allocated
            </dt>
            <dd className="mt-1 text-gray-900">
              {allocation.quantityAllocated}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Unit</dt>
            <dd className="mt-1 text-gray-900">{allocation.unit}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Cost Per Unit
            </dt>
            <dd className="mt-1 text-gray-900">{allocation.costPerUnit}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Cost</dt>
            <dd className="mt-1 text-gray-900">{allocation.totalCost}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{allocation.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Allocation Method
            </dt>
            <dd className="mt-1 text-gray-900">
              {allocation.allocationMethod}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Leg From</dt>
            <dd className="mt-1 text-gray-900">
              {allocation.legFrom || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Leg To</dt>
            <dd className="mt-1 text-gray-900">{allocation.legTo || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Percentage Of Voyage
            </dt>
            <dd className="mt-1 text-gray-900">
              {allocation.percentageOfVoyage != null
                ? `${allocation.percentageOfVoyage}%`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  allocation.status === "approved"
                    ? "success"
                    : allocation.status === "rejected"
                      ? "destructive"
                      : "secondary"
                }
              >
                {allocation.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved At</dt>
            <dd className="mt-1 text-gray-900">
              {allocation.approvedAt
                ? new Date(allocation.approvedAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved By</dt>
            <dd className="mt-1 text-gray-900">
              {allocation.approvedBy || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {allocation.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
