import React from "react";
import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPtiInspection } from "@/lib/reefer-container-management/service";
import { Badge } from "@/components/ui/badge";

const resultVariant = {
  pass: "success",
  fail: "destructive",
  conditional: "warning",
} as const;

function formatBool(val: boolean | null | undefined): React.ReactNode {
  if (val === null || val === undefined)
    return <span className="text-gray-400">-</span>;
  return (
    <Badge variant={val ? "success" : "destructive"}>
      {val ? "OK" : "Fail"}
    </Badge>
  );
}

function formatDatetime(val: Date | string | null | undefined): string {
  if (!val) return "-";
  return new Date(val).toLocaleString();
}

function formatDate(val: Date | string | null | undefined): string {
  if (!val) return "-";
  return new Date(val).toLocaleDateString();
}

export default async function PtiInspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "reefer:read")))
    redirect("/reefer-container-management");

  const { id } = await params;
  const record = await getPtiInspection(id, session.tenantId);
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
          href="/reefer-container-management/pti-inspections"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.inspectionRef}
          </h1>
          <p className="text-sm text-gray-500">
            Container {record.containerNumber}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/reefer-container-management/pti-inspections/${id}/edit`}
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
              Inspection Ref
            </dt>
            <dd className="mt-1 text-gray-900">{record.inspectionRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Number
            </dt>
            <dd className="mt-1 text-gray-900">{record.containerNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Booking Ref</dt>
            <dd className="mt-1 text-gray-900">
              {record.bookingRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Inspection Type
            </dt>
            <dd className="mt-1 text-gray-900">{record.inspectionType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Inspection Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {formatDatetime(record.inspectionDate)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Depot Name</dt>
            <dd className="mt-1 text-gray-900">
              {record.depotName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Depot Location
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.depotLocation || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Inspector Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.inspectorName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Set Point Temp (C)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.setPointTempC ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Achieved Temp (C)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.achievedTempC ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Cooldown Minutes
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.cooldownMinutes ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Compressor</dt>
            <dd className="mt-1">{formatBool(record.compressorOk)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Evaporator</dt>
            <dd className="mt-1">{formatBool(record.evaporatorOk)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Condenser</dt>
            <dd className="mt-1">{formatBool(record.condenserOk)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Controller</dt>
            <dd className="mt-1">{formatBool(record.controllerOk)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Door Seals</dt>
            <dd className="mt-1">{formatBool(record.doorSealsOk)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Drain Holes</dt>
            <dd className="mt-1">{formatBool(record.drainHolesOk)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Power Cable</dt>
            <dd className="mt-1">{formatBool(record.powerCableOk)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Cleanliness</dt>
            <dd className="mt-1">{formatBool(record.cleanlinessOk)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Overall Result
            </dt>
            <dd className="mt-1">
              {record.overallResult ? (
                <Badge
                  variant={
                    resultVariant[
                      record.overallResult as keyof typeof resultVariant
                    ] ?? "secondary"
                  }
                >
                  {record.overallResult}
                </Badge>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Certificate Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.certificateNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Certificate Expiry
            </dt>
            <dd className="mt-1 text-gray-900">
              {formatDate(record.certificateExpiry)}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Repairs Required
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.repairsRequired || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "completed"
                    ? "success"
                    : record.status === "failed"
                      ? "destructive"
                      : record.status === "in_progress"
                        ? "warning"
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
