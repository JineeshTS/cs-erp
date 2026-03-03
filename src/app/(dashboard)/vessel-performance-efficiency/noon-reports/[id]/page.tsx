import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getNoonReport } from "@/lib/vessel-performance-efficiency/service";
import { Badge } from "@/components/ui/badge";

export default async function NoonReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vpe:read")))
    redirect("/vessel-performance-efficiency");

  const { id } = await params;

  const record = await getNoonReport(id, session.tenantId);
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
          href="/vessel-performance-efficiency/noon-reports"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.reportRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.reportType} &middot;{" "}
            {record.vesselName || "No vessel"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/vessel-performance-efficiency/noon-reports/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Report Ref</dt>
            <dd className="mt-1 text-gray-900">{record.reportRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Report Type</dt>
            <dd className="mt-1 text-gray-900">{record.reportType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel ID</dt>
            <dd className="mt-1 text-gray-900">{record.vesselId ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">
              {record.vesselName ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage ID</dt>
            <dd className="mt-1 text-gray-900">{record.voyageId ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Report Datetime
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.reportDatetime
                ? new Date(record.reportDatetime).toLocaleDateString()
                : "-"}
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
              Course Heading
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.courseHeading ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Distance Since Last Report
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.distanceSinceLastReport ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Distance To Go
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.distanceToGo ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Avg Speed</dt>
            <dd className="mt-1 text-gray-900">
              {record.avgSpeed ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Wind Direction
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.windDirection ?? "-"}
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
              Swell Height
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.swellHeight ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">ROB FO</dt>
            <dd className="mt-1 text-gray-900">{record.robFo ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">ROB DO</dt>
            <dd className="mt-1 text-gray-900">{record.robDo ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">ROB LO</dt>
            <dd className="mt-1 text-gray-900">{record.robLo ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              ME Consumption
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.meConsumption ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              AE Consumption
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.aeConsumption ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Boiler Consumption
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.boilerConsumption ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">ETA</dt>
            <dd className="mt-1 text-gray-900">
              {record.eta
                ? new Date(record.eta).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "verified"
                    ? "success"
                    : record.status === "processed"
                      ? "default"
                      : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Master Remarks
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.masterRemarks || "-"}
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
