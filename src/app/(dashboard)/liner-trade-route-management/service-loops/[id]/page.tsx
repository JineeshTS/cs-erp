import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getServiceLoop } from "@/lib/liner-trade-route-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  active: "success",
  draft: "secondary",
  suspended: "warning",
  discontinued: "destructive",
} as const;

export default async function ServiceLoopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "liner:read")))
    redirect("/liner-trade-route-management");

  const { id } = await params;

  const loop = await getServiceLoop(id, session.tenantId);
  if (!loop) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "liner:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/liner-trade-route-management/service-loops"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {loop.loopName}
          </h1>
          <p className="text-sm text-gray-500">
            {loop.loopRef}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/liner-trade-route-management/service-loops/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Loop Ref</dt>
            <dd className="mt-1 text-gray-900">{loop.loopRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Loop Name</dt>
            <dd className="mt-1 text-gray-900">{loop.loopName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Loop Code</dt>
            <dd className="mt-1 text-gray-900">{loop.loopCode}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Trade Route</dt>
            <dd className="mt-1 text-gray-900">{loop.tradeRoute}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Direction</dt>
            <dd className="mt-1 text-gray-900">{loop.direction}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Ports</dt>
            <dd className="mt-1 text-gray-900">{loop.totalPorts}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Round Trip Days</dt>
            <dd className="mt-1 text-gray-900">{loop.roundTripDays ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Frequency</dt>
            <dd className="mt-1 text-gray-900">{loop.frequency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Count</dt>
            <dd className="mt-1 text-gray-900">{loop.vesselCount ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Deployed Capacity (TEU)</dt>
            <dd className="mt-1 text-gray-900">{loop.deployedCapacityTeu ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Alliance Partner</dt>
            <dd className="mt-1 text-gray-900">{loop.alliancePartner || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Operating Carrier</dt>
            <dd className="mt-1 text-gray-900">{loop.operatingCarrier || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Effective From</dt>
            <dd className="mt-1 text-gray-900">
              {loop.effectiveFrom
                ? new Date(loop.effectiveFrom).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Effective To</dt>
            <dd className="mt-1 text-gray-900">
              {loop.effectiveTo
                ? new Date(loop.effectiveTo).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    loop.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {loop.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{loop.notes || "-"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
