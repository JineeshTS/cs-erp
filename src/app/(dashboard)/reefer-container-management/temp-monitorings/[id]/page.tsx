import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getTempMonitoring } from "@/lib/reefer-container-management/service";
import { Badge } from "@/components/ui/badge";

export default async function TempMonitoringDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "reefer:read")))
    redirect("/reefer-container-management");

  const { id } = await params;

  const record = await getTempMonitoring(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "reefer:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/reefer-container-management/temp-monitorings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.monitoringRef}</h1>
          <p className="text-sm text-gray-500">
            Container {record.containerNumber}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/reefer-container-management/temp-monitorings/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Container Number</dt>
            <dd className="mt-1 text-gray-900">{record.containerNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Booking Ref</dt>
            <dd className="mt-1 text-gray-900">{record.bookingRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sensor ID</dt>
            <dd className="mt-1 text-gray-900">{record.sensorId || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sensor Type</dt>
            <dd className="mt-1 text-gray-900">{record.sensorType || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Set Point Temp (&deg;C)</dt>
            <dd className="mt-1 text-gray-900">{record.setPointTempC ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Actual Temp (&deg;C)</dt>
            <dd className="mt-1 text-gray-900">{record.actualTempC ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Set Point Humidity</dt>
            <dd className="mt-1 text-gray-900">{record.setPointHumidity ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Actual Humidity</dt>
            <dd className="mt-1 text-gray-900">{record.actualHumidity ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Supply Air Temp (&deg;C)</dt>
            <dd className="mt-1 text-gray-900">{record.supplyAirTempC ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Return Air Temp (&deg;C)</dt>
            <dd className="mt-1 text-gray-900">{record.returnAirTempC ?? "-"}</dd>
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
            <dt className="text-sm font-medium text-gray-500">Compressor Status</dt>
            <dd className="mt-1 text-gray-900">{record.compressorStatus || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Defrost Cycle Active</dt>
            <dd className="mt-1">
              <Badge variant={record.defrostCycleActive ? "success" : "secondary"}>
                {record.defrostCycleActive ? "Yes" : "No"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Reading Timestamp</dt>
            <dd className="mt-1 text-gray-900">
              {record.readingTimestamp
                ? new Date(record.readingTimestamp).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Location Description</dt>
            <dd className="mt-1 text-gray-900">{record.locationDescription || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Latitude</dt>
            <dd className="mt-1 text-gray-900">{record.latitude ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Longitude</dt>
            <dd className="mt-1 text-gray-900">{record.longitude ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Alert Triggered</dt>
            <dd className="mt-1">
              <Badge variant={record.alertTriggered ? "destructive" : "secondary"}>
                {record.alertTriggered ? "Yes" : "No"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Alert Type</dt>
            <dd className="mt-1 text-gray-900">{record.alertType || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Data Source</dt>
            <dd className="mt-1 text-gray-900">{record.dataSource || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "active"
                    ? "success"
                    : record.status === "alert"
                      ? "destructive"
                      : record.status === "inactive"
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
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
