import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPortEquipment } from "@/lib/real-time-iot-asset-tracking/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  active: "success",
  verified: "success",
  submitted: "warning",
  rejected: "destructive",
} as const;

export default async function PortEquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "iot:read")))
    redirect("/real-time-iot-asset-tracking");

  const { id } = await params;

  const record = await getPortEquipment(id, session.tenantId);
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
          href="/real-time-iot-asset-tracking/port-equipments"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.equipmentRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.equipmentType} &middot; {record.equipmentName || "No name"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/real-time-iot-asset-tracking/port-equipments/${id}/edit`}
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
              Equipment Ref
            </dt>
            <dd className="mt-1 text-gray-900">{record.equipmentRef}</dd>
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
              Equipment Type
            </dt>
            <dd className="mt-1 text-gray-900">{record.equipmentType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Equipment Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.equipmentName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Equipment ID
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.equipmentId || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Code</dt>
            <dd className="mt-1 text-gray-900">
              {record.portCode || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Terminal Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.terminalName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Operational Status
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.operationalStatus || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Utilization %
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.utilizationPct ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Fuel Consumption
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.fuelConsumption ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Hours Operated
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.hoursOperated ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Last Maintenance At
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.lastMaintenanceAt
                ? record.lastMaintenanceAt.toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Next Maintenance Due
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.nextMaintenanceDue
                ? record.nextMaintenanceDue.toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sensor ID</dt>
            <dd className="mt-1 text-gray-900">
              {record.sensorId || "-"}
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
