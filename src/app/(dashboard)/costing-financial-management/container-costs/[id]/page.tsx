import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getContainerCost } from "@/lib/costing-financial-management/service";
import { Badge } from "@/components/ui/badge";

export default async function ContainerCostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:read")))
    redirect("/costing-financial-management");

  const { id } = await params;
  const cost = await getContainerCost(id, session.tenantId);
  if (!cost) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "costing:edit"
  );

  function fmt(val: string | number | null | undefined): string {
    if (val == null) return "--";
    return Number(val).toLocaleString();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/costing-financial-management/container-costs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{cost.costRef}</h1>
          <p className="text-sm text-gray-500">
            Container Cost &middot; {cost.containerNumber}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/costing-financial-management/container-costs/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          General Information
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Cost Ref</dt>
            <dd className="mt-1 text-gray-900">{cost.costRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Number
            </dt>
            <dd className="mt-1 text-gray-900">{cost.containerNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Type
            </dt>
            <dd className="mt-1 text-gray-900">
              {cost.containerType || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage Ref</dt>
            <dd className="mt-1 text-gray-900">{cost.voyageRef || "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Booking Ref</dt>
            <dd className="mt-1 text-gray-900">{cost.bookingRef || "--"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Cost Category
            </dt>
            <dd className="mt-1 text-gray-900">
              {cost.costCategory || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{cost.currency || "USD"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Allocation Method
            </dt>
            <dd className="mt-1 text-gray-900">
              {cost.allocationMethod || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  cost.status === "approved"
                    ? "success"
                    : cost.status === "allocated"
                      ? "warning"
                      : "secondary"
                }
              >
                {cost.status}
              </Badge>
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Cost Breakdown
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Lease Cost</dt>
            <dd className="mt-1 text-gray-900">{fmt(cost.leaseCost)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Handling Cost
            </dt>
            <dd className="mt-1 text-gray-900">{fmt(cost.handlingCost)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Repositioning Cost
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmt(cost.repositioningCost)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Maintenance Cost
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmt(cost.maintenanceCost)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Insurance Cost
            </dt>
            <dd className="mt-1 text-gray-900">{fmt(cost.insuranceCost)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Other Cost</dt>
            <dd className="mt-1 text-gray-900">{fmt(cost.otherCost)}</dd>
          </div>
          <div className="lg:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Total Cost</dt>
            <dd className="mt-1 text-lg font-semibold text-red-700">
              {fmt(cost.totalCost)}
            </dd>
          </div>
        </dl>
      </div>

      {cost.notes && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Notes</h2>
          <p className="whitespace-pre-wrap text-gray-700">{cost.notes}</p>
        </div>
      )}
    </div>
  );
}
