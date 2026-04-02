import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getEmergencyProcedure } from "@/lib/dangerous-goods-management/service";
import { Badge } from "@/components/ui/badge";

export default async function EmergencyProcedureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "dangerous_goods:read")))
    redirect("/dangerous-goods-management");

  const { id } = await params;

  const record = await getEmergencyProcedure(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "dangerous_goods:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dangerous-goods-management/emergency-procedures"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.procedureRef}</h1>
          <p className="text-sm text-gray-500">
            {record.procedureName} &middot; {record.procedureType}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/dangerous-goods-management/emergency-procedures/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Procedure Ref</dt>
            <dd className="mt-1 text-gray-900">{record.procedureRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Procedure Name</dt>
            <dd className="mt-1 text-gray-900">{record.procedureName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Procedure Type</dt>
            <dd className="mt-1 text-gray-900">{record.procedureType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">EMS Number</dt>
            <dd className="mt-1 text-gray-900">{record.emsNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">MFAG Table Number</dt>
            <dd className="mt-1 text-gray-900">{record.mfagTableNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Drill Frequency</dt>
            <dd className="mt-1 text-gray-900">{record.drillFrequency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Drill Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.lastDrillDate
                ? new Date(record.lastDrillDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Next Drill Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.nextDrillDate
                ? new Date(record.nextDrillDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "active"
                    ? "success"
                    : record.status === "expired"
                      ? "destructive"
                      : record.status === "under_review"
                        ? "default"
                        : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Fire Response</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.fireResponse || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Spillage Response</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.spillageResponse || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">First Aid Measures</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.firstAidMeasures || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Personal Protection</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.personalProtection || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Evacuation Procedure</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.evacuationProcedure || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Decontamination</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.decontamination || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Training Requirements</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.trainingRequirements || "-"}
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
