import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPowerManagementRecord } from "@/lib/reefer-container-management/service";
import { Badge } from "@/components/ui/badge";

function formatDatetime(val: Date | string | null | undefined): string {
  if (!val) return "-";
  return new Date(val).toLocaleString();
}

export default async function PowerManagementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "reefer:read")))
    redirect("/reefer-container-management");

  const { id } = await params;
  const record = await getPowerManagementRecord(id, session.tenantId);
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
          href="/reefer-container-management/power-management"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.powerRef}
          </h1>
          <p className="text-sm text-gray-500">
            Container {record.containerNumber} &middot; {record.locationName}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/reefer-container-management/power-management/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Power Ref</dt>
            <dd className="mt-1 text-gray-900">{record.powerRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Number
            </dt>
            <dd className="mt-1 text-gray-900">{record.containerNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Location Name
            </dt>
            <dd className="mt-1 text-gray-900">{record.locationName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Location Type
            </dt>
            <dd className="mt-1 text-gray-900">{record.locationType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Plug Type</dt>
            <dd className="mt-1 text-gray-900">
              {record.plugType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voltage</dt>
            <dd className="mt-1 text-gray-900">
              {record.voltage ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Amperage</dt>
            <dd className="mt-1 text-gray-900">
              {record.amperage ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Bay Position
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.bayPosition || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Tier Position
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.tierPosition || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Plugged In At</dt>
            <dd className="mt-1 text-gray-900">
              {formatDatetime(record.pluggedInAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Unplugged At
            </dt>
            <dd className="mt-1 text-gray-900">
              {formatDatetime(record.unpluggedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Plug Hours
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalPlugHours ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Power Consumption (kWh)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.powerConsumptionKwh ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Cost Per kWh
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.costPerKwh ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Cost</dt>
            <dd className="mt-1 text-gray-900">
              {record.totalCost ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">
              {record.currency || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Power Interruptions
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.powerInterruptions ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Last Interruption At
            </dt>
            <dd className="mt-1 text-gray-900">
              {formatDatetime(record.lastInterruptionAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Genset Backup
            </dt>
            <dd className="mt-1">
              {record.gensetBackup === null ||
              record.gensetBackup === undefined ? (
                <span className="text-gray-400">-</span>
              ) : (
                <Badge variant={record.gensetBackup ? "success" : "secondary"}>
                  {record.gensetBackup ? "Yes" : "No"}
                </Badge>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Monitored By
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.monitoredByName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "active"
                    ? "success"
                    : record.status === "maintenance"
                      ? "warning"
                      : record.status === "archived"
                        ? "destructive"
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
