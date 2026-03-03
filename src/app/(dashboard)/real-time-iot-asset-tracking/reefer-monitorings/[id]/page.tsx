import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getReeferMonitoring } from "@/lib/real-time-iot-asset-tracking/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  verified: "success",
  published: "default",
} as const;

export default async function ReeferMonitoringDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "iot:read")))
    redirect("/real-time-iot-asset-tracking");

  const { id } = await params;

  const record = await getReeferMonitoring(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "iot:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/real-time-iot-asset-tracking/reefer-monitorings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.monitoringRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.monitoringType?.replace(/_/g, " ")} &middot; {record.containerNumber || "No container"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/real-time-iot-asset-tracking/reefer-monitorings/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Monitoring Ref</dt>
            <dd className="mt-1 text-gray-900">{record.monitoringRef}</dd>
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
            <dt className="text-sm font-medium text-gray-500">Monitoring Type</dt>
            <dd className="mt-1 text-gray-900 capitalize">{record.monitoringType?.replace(/_/g, " ")}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Number</dt>
            <dd className="mt-1 text-gray-900">{record.containerNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Set Temperature</dt>
            <dd className="mt-1 text-gray-900">{record.setTemperature ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Actual Temperature</dt>
            <dd className="mt-1 text-gray-900">{record.actualTemperature ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Return Air Temp</dt>
            <dd className="mt-1 text-gray-900">{record.returnAirTemp ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Supply Air Temp</dt>
            <dd className="mt-1 text-gray-900">{record.supplyAirTemp ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Humidity</dt>
            <dd className="mt-1 text-gray-900">{record.humidity ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vent Setting</dt>
            <dd className="mt-1 text-gray-900">{record.ventSetting || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">O2 Level</dt>
            <dd className="mt-1 text-gray-900">{record.o2Level ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">CO2 Level</dt>
            <dd className="mt-1 text-gray-900">{record.co2Level ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Power Status</dt>
            <dd className="mt-1 text-gray-900">{record.powerStatus || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Alarm Code</dt>
            <dd className="mt-1 text-gray-900">{record.alarmCode || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sensor ID</dt>
            <dd className="mt-1 text-gray-900">{record.sensorId || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">{record.createdAt.toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">{record.updatedAt.toLocaleDateString()}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
