import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { cvmVesselPerformances } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function VesselPerformanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:read")))
    redirect("/chartering-vessel-management");

  const { id } = await params;

  const vp = await db
    .select()
    .from(cvmVesselPerformances)
    .where(
      and(
        eq(cvmVesselPerformances.id, id),
        eq(cvmVesselPerformances.tenantId, session.tenantId),
        isNull(cvmVesselPerformances.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!vp) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "chartering:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/chartering-vessel-management/vessel-performances"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {vp.vesselName} - Performance Report
          </h1>
          <p className="text-sm text-gray-500">
            {new Date(vp.reportDate).toLocaleDateString()} &middot;{" "}
            {vp.reportType}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/chartering-vessel-management/vessel-performances/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">
              Voyage Estimate ID
            </dt>
            <dd className="mt-1 text-gray-900">
              {vp.voyageEstimateId || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{vp.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Report Date</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(vp.reportDate).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Report Type</dt>
            <dd className="mt-1">
              <Badge variant="secondary">{vp.reportType}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Latitude</dt>
            <dd className="mt-1 text-gray-900">{vp.latitude || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Longitude</dt>
            <dd className="mt-1 text-gray-900">{vp.longitude || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Speed (Knots)
            </dt>
            <dd className="mt-1 text-gray-900">{vp.speedKnots || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Consumption (MT)
            </dt>
            <dd className="mt-1 text-gray-900">{vp.consumptionMt || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Fuel Type</dt>
            <dd className="mt-1 text-gray-900">{vp.fuelType || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Wind Force</dt>
            <dd className="mt-1 text-gray-900">
              {vp.windForce !== null ? vp.windForce : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sea State</dt>
            <dd className="mt-1 text-gray-900">
              {vp.seaState !== null ? vp.seaState : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Weather Conditions
            </dt>
            <dd className="mt-1 text-gray-900">
              {vp.weatherConditions || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Distance (NM)
            </dt>
            <dd className="mt-1 text-gray-900">{vp.distanceNm || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Slip %</dt>
            <dd className="mt-1 text-gray-900">{vp.slipPercent || "-"}</dd>
          </div>
          {vp.remarks && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Remarks</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {vp.remarks}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
