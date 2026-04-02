import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getElectronicSeal } from "@/lib/real-time-iot-asset-tracking/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  active: "success",
  sealed: "success",
  tampered: "destructive",
  removed: "warning",
  expired: "secondary",
} as const;

export default async function ElectronicSealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "iot:read")))
    redirect("/real-time-iot-asset-tracking");

  const { id } = await params;

  const record = await getElectronicSeal(id, session.tenantId);
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
          href="/real-time-iot-asset-tracking/electronic-seals"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.sealRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.sealType} &middot; {record.containerNumber || "No container"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/real-time-iot-asset-tracking/electronic-seals/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Seal Ref</dt>
            <dd className="mt-1 text-gray-900">{record.sealRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Seal Type</dt>
            <dd className="mt-1 text-gray-900">{record.sealType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Seal Number</dt>
            <dd className="mt-1 text-gray-900">
              {record.sealNumber || "-"}
            </dd>
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
            <dt className="text-sm font-medium text-gray-500">Seal Status</dt>
            <dd className="mt-1 text-gray-900">
              {record.sealStatus || "-"}
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
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Integrity Check
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.integrityCheck === null
                ? "-"
                : record.integrityCheck
                  ? "Passed"
                  : "Failed"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Tamper Detected
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.tamperDetected === null
                ? "-"
                : record.tamperDetected
                  ? "Yes"
                  : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Last Verified At
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.lastVerifiedAt
                ? record.lastVerifiedAt.toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Applied At</dt>
            <dd className="mt-1 text-gray-900">
              {record.appliedAt
                ? record.appliedAt.toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Removed At</dt>
            <dd className="mt-1 text-gray-900">
              {record.removedAt
                ? record.removedAt.toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Applied By</dt>
            <dd className="mt-1 text-gray-900">
              {record.appliedBy || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Applied Location
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.appliedLocation || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Device ID</dt>
            <dd className="mt-1 text-gray-900">
              {record.deviceId || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Battery Level
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.batteryLevel ?? "-"}
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
