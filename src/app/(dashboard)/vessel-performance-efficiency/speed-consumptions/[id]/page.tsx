import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getSpeedConsumption } from "@/lib/vessel-performance-efficiency/service";
import { Badge } from "@/components/ui/badge";

export default async function SpeedConsumptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vpe:read")))
    redirect("/vessel-performance-efficiency");

  const { id } = await params;

  const record = await getSpeedConsumption(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "vpe:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/vessel-performance-efficiency/speed-consumptions"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.consumptionRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.consumptionType} &middot;{" "}
            {record.vesselName || "No vessel"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/vessel-performance-efficiency/speed-consumptions/${id}/edit`}
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
              Consumption Ref
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.consumptionRef}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Consumption Type
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.consumptionType}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel ID</dt>
            <dd className="mt-1 text-gray-900">
              {record.vesselId ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">
              {record.vesselName ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage ID</dt>
            <dd className="mt-1 text-gray-900">
              {record.voyageId ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Report Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.reportDate
                ? new Date(record.reportDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Speed Ordered
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.speedOrdered ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Speed Actual
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.speedActual ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Speed Over Ground
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.speedOverGround ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Fuel Consumed MT
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.fuelConsumedMt ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Fuel Type</dt>
            <dd className="mt-1 text-gray-900">
              {record.fuelType ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Daily Consumption
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.dailyConsumption ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Distance Traveled
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.distanceTraveled ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Slip Percentage
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.slipPercentage ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Wind Force</dt>
            <dd className="mt-1 text-gray-900">
              {record.windForce ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sea State</dt>
            <dd className="mt-1 text-gray-900">
              {record.seaState ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Current Factor
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.currentFactor ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Performance Index
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.performanceIndex ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Weather Impact
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.weatherImpact ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "verified"
                    ? "success"
                    : record.status === "published"
                      ? "default"
                      : "secondary"
                }
              >
                {record.status}
              </Badge>
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
