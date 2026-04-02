import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getBreakdownResponse } from "@/lib/reefer-container-management/service";
import { Badge } from "@/components/ui/badge";

export default async function BreakdownResponseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "reefer:read")))
    redirect("/reefer-container-management");

  const { id } = await params;

  const record = await getBreakdownResponse(id, session.tenantId);
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
          href="/reefer-container-management/breakdown-responses"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.breakdownRef}
          </h1>
          <p className="text-sm text-gray-500">
            Container {record.containerNumber} &middot;{" "}
            {record.breakdownType}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/reefer-container-management/breakdown-responses/${id}/edit`}
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
              Breakdown Ref
            </dt>
            <dd className="mt-1 text-gray-900">{record.breakdownRef}</dd>
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
              Breakdown Type
            </dt>
            <dd className="mt-1 text-gray-900">{record.breakdownType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Severity Level
            </dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.severityLevel === "minor"
                    ? "secondary"
                    : record.severityLevel === "moderate"
                      ? "warning"
                      : "destructive"
                }
              >
                {record.severityLevel}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Reported At</dt>
            <dd className="mt-1 text-gray-900">
              {record.reportedAt
                ? new Date(record.reportedAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Location Description
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.locationDescription || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">
              {record.vesselName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Voyage Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.voyageNumber || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Fault Description
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.faultDescription || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Fault Code</dt>
            <dd className="mt-1 text-gray-900">
              {record.faultCode || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Last Known Temp (C)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.lastKnownTempC ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Cargo at Risk
            </dt>
            <dd className="mt-1">
              <Badge
                variant={record.cargoAtRisk ? "destructive" : "secondary"}
              >
                {record.cargoAtRisk ? "Yes" : "No"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Commodity Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.commodityName || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Immediate Action
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.immediateAction || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Technician Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.technicianName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Response Started At
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.responseStartedAt
                ? new Date(record.responseStartedAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Repair Description
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.repairDescription || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Resolved At</dt>
            <dd className="mt-1 text-gray-900">
              {record.resolvedAt
                ? new Date(record.resolvedAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Downtime (min)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalDowntimeMinutes ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Repair Cost</dt>
            <dd className="mt-1 text-gray-900">
              {record.repairCost || "-"}
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
              Container Swapped
            </dt>
            <dd className="mt-1">
              <Badge
                variant={record.containerSwapped ? "warning" : "secondary"}
              >
                {record.containerSwapped ? "Yes" : "No"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Swapped to Container
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.swappedToContainer || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "resolved" || record.status === "closed"
                    ? "success"
                    : record.status === "in_repair" ||
                        record.status === "responding"
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
