import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPortPairTradeLane } from "@/lib/liner-trade-route-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  active: "success",
  draft: "secondary",
  suspended: "warning",
  discontinued: "destructive",
} as const;

export default async function PortPairTradeLaneDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "liner:read")))
    redirect("/liner-trade-route-management");

  const { id } = await params;

  const lane = await getPortPairTradeLane(id, session.tenantId);
  if (!lane) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "liner:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/liner-trade-route-management/port-pair-trade-lanes"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {lane.originPort} &rarr; {lane.destinationPort}
          </h1>
          <p className="text-sm text-gray-500">
            {lane.tradeLaneRef}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/liner-trade-route-management/port-pair-trade-lanes/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Trade Lane Ref</dt>
            <dd className="mt-1 text-gray-900">{lane.tradeLaneRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Origin Port</dt>
            <dd className="mt-1 text-gray-900">{lane.originPort}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Origin Country</dt>
            <dd className="mt-1 text-gray-900">{lane.originCountry}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Origin Region</dt>
            <dd className="mt-1 text-gray-900">{lane.originRegion || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Destination Port</dt>
            <dd className="mt-1 text-gray-900">{lane.destinationPort}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Destination Country</dt>
            <dd className="mt-1 text-gray-900">{lane.destinationCountry}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Destination Region</dt>
            <dd className="mt-1 text-gray-900">{lane.destinationRegion || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Trade Direction</dt>
            <dd className="mt-1 text-gray-900">{lane.tradeDirection}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Distance (NM)</dt>
            <dd className="mt-1 text-gray-900">{lane.distanceNm ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Average Transit Days</dt>
            <dd className="mt-1 text-gray-900">{lane.averageTransitDays ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Competitor Count</dt>
            <dd className="mt-1 text-gray-900">{lane.competitorCount ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Market Share (%)</dt>
            <dd className="mt-1 text-gray-900">{lane.marketSharePercent ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Avg Freight Rate</dt>
            <dd className="mt-1 text-gray-900">{lane.avgFreightRate ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{lane.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    lane.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {lane.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{lane.notes || "-"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
