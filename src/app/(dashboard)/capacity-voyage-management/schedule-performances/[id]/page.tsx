import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { capSchedulePerformances } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString() : "-";
}

function fmtDateTime(d: Date | null): string {
  return d ? new Date(d).toLocaleString() : "-";
}

export default async function SchedulePerformanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "capacity:read")))
    redirect("/capacity-voyage-management");

  const { id } = await params;

  const sp = await db
    .select()
    .from(capSchedulePerformances)
    .where(
      and(
        eq(capSchedulePerformances.id, id),
        eq(capSchedulePerformances.tenantId, session.tenantId),
        isNull(capSchedulePerformances.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!sp) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "capacity:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/capacity-voyage-management/schedule-performances"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {sp.portName ?? "Schedule Performance"}
          </h1>
          <p className="text-sm text-gray-500">
            {sp.scheduledArrival
              ? new Date(sp.scheduledArrival).toLocaleDateString()
              : "No scheduled arrival"}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/capacity-voyage-management/schedule-performances/${id}/edit`}
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
              Vessel Schedule ID
            </dt>
            <dd className="mt-1 text-gray-900">
              {sp.vesselScheduleId ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Port Rotation ID
            </dt>
            <dd className="mt-1 text-gray-900">
              {sp.portRotationId ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Name</dt>
            <dd className="mt-1 text-gray-900">{sp.portName ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Scheduled Arrival
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmtDateTime(sp.scheduledArrival)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Actual Arrival
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmtDateTime(sp.actualArrival)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Scheduled Departure
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmtDateTime(sp.scheduledDeparture)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Actual Departure
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmtDateTime(sp.actualDeparture)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Arrival Delay (hrs)
            </dt>
            <dd className="mt-1 text-gray-900">
              {sp.arrivalDelayHours != null
                ? Number(sp.arrivalDelayHours)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Departure Delay (hrs)
            </dt>
            <dd className="mt-1 text-gray-900">
              {sp.departureDelayHours != null
                ? Number(sp.departureDelayHours)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Delay Reason
            </dt>
            <dd className="mt-1 text-gray-900">
              {sp.delayReason ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              On Time Arrival
            </dt>
            <dd className="mt-1 text-gray-900">
              {sp.onTimeArrival != null
                ? sp.onTimeArrival
                  ? "Yes"
                  : "No"
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              On Time Departure
            </dt>
            <dd className="mt-1 text-gray-900">
              {sp.onTimeDeparture != null
                ? sp.onTimeDeparture
                  ? "Yes"
                  : "No"
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Bunker Consumption (MT)
            </dt>
            <dd className="mt-1 text-gray-900">
              {sp.bunkerConsumptionMt != null
                ? Number(sp.bunkerConsumptionMt)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Speed (Knots)
            </dt>
            <dd className="mt-1 text-gray-900">
              {sp.speedKnots != null ? Number(sp.speedKnots) : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Distance (NM)
            </dt>
            <dd className="mt-1 text-gray-900">
              {sp.distanceNm != null ? Number(sp.distanceNm) : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Weather Conditions
            </dt>
            <dd className="mt-1 text-gray-900">
              {sp.weatherConditions ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sea State</dt>
            <dd className="mt-1 text-gray-900">{sp.seaState ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reliability Score
            </dt>
            <dd className="mt-1 text-gray-900">
              {sp.reliabilityScore != null
                ? Number(sp.reliabilityScore)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period From</dt>
            <dd className="mt-1 text-gray-900">{fmtDate(sp.periodFrom)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Period To</dt>
            <dd className="mt-1 text-gray-900">{fmtDate(sp.periodTo)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  sp.status === "published"
                    ? "success"
                    : sp.status === "verified"
                      ? "default"
                      : "secondary"
                }
              >
                {sp.status}
              </Badge>
            </dd>
          </div>
          {sp.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {sp.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
