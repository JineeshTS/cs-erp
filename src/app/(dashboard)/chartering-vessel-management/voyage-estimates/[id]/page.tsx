import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { cvmVoyageEstimates } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function VoyageEstimateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:read")))
    redirect("/chartering-vessel-management");

  const { id } = await params;

  const ve = await db
    .select()
    .from(cvmVoyageEstimates)
    .where(
      and(
        eq(cvmVoyageEstimates.id, id),
        eq(cvmVoyageEstimates.tenantId, session.tenantId),
        isNull(cvmVoyageEstimates.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!ve) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "chartering:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/chartering-vessel-management/voyage-estimates"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {ve.voyageNumber}
          </h1>
          <p className="text-sm text-gray-500">
            Voyage Estimate &middot; {ve.vesselName || "No vessel"}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/chartering-vessel-management/voyage-estimates/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage Number</dt>
            <dd className="mt-1 text-gray-900">{ve.voyageNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Charter Party ID</dt>
            <dd className="mt-1 text-gray-900">{ve.charterPartyId || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{ve.vesselName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Origin Port</dt>
            <dd className="mt-1 text-gray-900">{ve.originPort || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Destination Port</dt>
            <dd className="mt-1 text-gray-900">{ve.destinationPort || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  ve.status === "approved"
                    ? "success"
                    : ve.status === "draft"
                      ? "secondary"
                      : "default"
                }
              >
                {ve.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Cargo Type</dt>
            <dd className="mt-1 text-gray-900">{ve.cargoType || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Cargo Quantity</dt>
            <dd className="mt-1 text-gray-900">
              {ve.cargoQuantity !== null ? ve.cargoQuantity.toLocaleString() : "-"}
              {ve.cargoUnit ? ` ${ve.cargoUnit}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Estimated Revenue</dt>
            <dd className="mt-1 text-gray-900">
              {ve.estimatedRevenue !== null
                ? ve.estimatedRevenue.toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Bunker Cost</dt>
            <dd className="mt-1 text-gray-900">
              {ve.bunkerCost !== null ? ve.bunkerCost.toLocaleString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Cost</dt>
            <dd className="mt-1 text-gray-900">
              {ve.portCost !== null ? ve.portCost.toLocaleString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Canal Cost</dt>
            <dd className="mt-1 text-gray-900">
              {ve.canalCost !== null ? ve.canalCost.toLocaleString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Other Costs</dt>
            <dd className="mt-1 text-gray-900">
              {ve.otherCosts !== null ? ve.otherCosts.toLocaleString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Cost</dt>
            <dd className="mt-1 text-gray-900">
              {ve.totalCost !== null ? ve.totalCost.toLocaleString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Net Result</dt>
            <dd className="mt-1 text-gray-900">
              {ve.netResult !== null ? ve.netResult.toLocaleString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{ve.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage Days</dt>
            <dd className="mt-1 text-gray-900">
              {ve.voyageDays !== null ? ve.voyageDays : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sea Days</dt>
            <dd className="mt-1 text-gray-900">
              {ve.seaDays !== null ? ve.seaDays : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Days</dt>
            <dd className="mt-1 text-gray-900">
              {ve.portDays !== null ? ve.portDays : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Distance (NM)</dt>
            <dd className="mt-1 text-gray-900">{ve.distanceNm || "-"}</dd>
          </div>
          {ve.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {ve.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
