import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getFuelReconciliation } from "@/lib/bunker-fuel-management/service";
import { Badge } from "@/components/ui/badge";

export default async function ReconciliationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bunker:read")))
    redirect("/bunker-fuel-management");

  const { id } = await params;

  const record = await getFuelReconciliation(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "bunker:edit"
  );

  const statusBadgeVariant = (s: string) => {
    switch (s) {
      case "reconciled":
        return "success" as const;
      case "disputed":
        return "destructive" as const;
      case "in_review":
        return "warning" as const;
      case "draft":
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/bunker-fuel-management/reconciliations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.reconciliationRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.vesselName} &middot; {record.fuelType}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/bunker-fuel-management/reconciliations/${id}/edit`}
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
              Reconciliation Ref
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.reconciliationRef}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{record.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel IMO</dt>
            <dd className="mt-1 text-gray-900">
              {record.vesselImo || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage Ref</dt>
            <dd className="mt-1 text-gray-900">
              {record.voyageRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Fuel Type</dt>
            <dd className="mt-1 text-gray-900">{record.fuelType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Period Start
            </dt>
            <dd className="mt-1 text-gray-900">
              {new Date(record.periodStart).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period End</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(record.periodEnd).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Opening ROB</dt>
            <dd className="mt-1 text-gray-900">
              {record.openingRob} {record.unit}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Closing ROB</dt>
            <dd className="mt-1 text-gray-900">
              {record.closingRob} {record.unit}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Received
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalReceived} {record.unit}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Consumed
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalConsumed} {record.unit}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Transferred
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalTransferred} {record.unit}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Variance</dt>
            <dd className="mt-1 text-gray-900">{record.variance ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Variance Percent
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.variancePercent != null
                ? `${record.variancePercent}%`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Unit</dt>
            <dd className="mt-1 text-gray-900">{record.unit}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={statusBadgeVariant(record.status)}>
                {record.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reconciled At
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.reconciledAt
                ? new Date(record.reconciledAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
