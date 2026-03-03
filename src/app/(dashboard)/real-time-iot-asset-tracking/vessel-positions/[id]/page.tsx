import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getVesselPosition } from "@/lib/real-time-iot-asset-tracking/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  active: "success",
  verified: "success",
  submitted: "warning",
  rejected: "destructive",
} as const;

export default async function VesselPositionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "iot:read")))
    redirect("/real-time-iot-asset-tracking");

  const { id } = await params;

  const record = await getVesselPosition(id, session.tenantId);
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
          href="/real-time-iot-asset-tracking/vessel-positions"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.positionRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.positionType} &middot; {record.vesselName || "No vessel"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/real-time-iot-asset-tracking/vessel-positions/${id}/edit`}
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
              Position Ref
            </dt>
            <dd className="mt-1 text-gray-900">{record.positionRef}</dd>
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
            <dt className="text-sm font-medium text-gray-500">
              Position Type
            </dt>
            <dd className="mt-1 text-gray-900">{record.positionType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">
              {record.vesselName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel IMO</dt>
            <dd className="mt-1 text-gray-900">
              {record.vesselImo || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">MMSI</dt>
            <dd className="mt-1 text-gray-900">
              {record.mmsi || "-"}
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
            <dt className="text-sm font-medium text-gray-500">
              Course Over Ground
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.courseOverGround ?? "-"}
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
            <dt className="text-sm font-medium text-gray-500">Nav Status</dt>
            <dd className="mt-1 text-gray-900">
              {record.navStatus || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Destination</dt>
            <dd className="mt-1 text-gray-900">
              {record.destination || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">ETA</dt>
            <dd className="mt-1 text-gray-900">
              {record.eta ? record.eta.toLocaleDateString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Draught</dt>
            <dd className="mt-1 text-gray-900">
              {record.draught ?? "-"}
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
