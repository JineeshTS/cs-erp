import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getShockDetection } from "@/lib/real-time-iot-asset-tracking/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  active: "success",
  detected: "warning",
  critical: "destructive",
  resolved: "success",
  archived: "secondary",
} as const;

export default async function ShockDetectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "iot:read")))
    redirect("/real-time-iot-asset-tracking");

  const { id } = await params;

  const record = await getShockDetection(id, session.tenantId);
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
          href="/real-time-iot-asset-tracking/shock-detections"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.detectionRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.detectionType} &middot; {record.containerNumber || "No container"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/real-time-iot-asset-tracking/shock-detections/${id}/edit`}
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
              Detection Ref
            </dt>
            <dd className="mt-1 text-gray-900">{record.detectionRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Detection Type
            </dt>
            <dd className="mt-1 text-gray-900">{record.detectionType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.containerNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Shock Intensity (G)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.shockIntensityG ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tilt Angle</dt>
            <dd className="mt-1 text-gray-900">
              {record.tiltAngle ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Vibration Frequency
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.vibrationFrequency ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Duration</dt>
            <dd className="mt-1 text-gray-900">
              {record.duration ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Threshold Exceeded
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.thresholdExceeded === null
                ? "-"
                : record.thresholdExceeded
                  ? "Yes"
                  : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Severity Level
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.severityLevel || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Latitude</dt>
            <dd className="mt-1 text-gray-900">
              {record.latitude ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Longitude</dt>
            <dd className="mt-1 text-gray-900">
              {record.longitude ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sensor ID</dt>
            <dd className="mt-1 text-gray-900">
              {record.sensorId || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Cargo Description
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.cargoDescription || "-"}
            </dd>
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
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
