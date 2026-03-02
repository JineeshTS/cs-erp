import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDefectRepair } from "@/lib/vessel-technical-management/service";
import { Badge } from "@/components/ui/badge";

export default async function DefectRepairDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "technical:read")))
    redirect("/");

  const { id } = await params;
  const record = await getDefectRepair(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "technical:edit"
  );

  function statusVariant(
    s: string
  ): "success" | "destructive" | "secondary" {
    if (s === "completed" || s === "verified") return "success";
    if (s === "reported") return "destructive";
    return "secondary";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/vessel-technical-management/defect-repairs"
            className="rounded-md border border-gray-300 p-2 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.defectRef}
            </h1>
            <p className="text-sm text-gray-500">Defect Repair Detail</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusVariant(record.status)}>
            {record.status}
          </Badge>
          {canEdit && (
            <Link
              href={`/vessel-technical-management/defect-repairs/${record.id}/edit`}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500">Vessel Name</p>
            <p className="mt-1 text-sm text-gray-900">{record.vesselName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Equipment Code</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.equipmentCode ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Equipment Name</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.equipmentName ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Defect Category
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.defectCategory}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Severity</p>
            <div className="mt-1">
              <Badge
                variant={
                  record.severity === "critical" ||
                  record.severity === "major"
                    ? "destructive"
                    : "secondary"
                }
              >
                {record.severity}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Reported Date</p>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(record.reportedDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Reported By
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.reportedByName ?? "-"}
            </p>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium text-gray-500">Description</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.description}
            </p>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium text-gray-500">Root Cause</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.rootCause ?? "-"}
            </p>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium text-gray-500">Repair Method</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.repairMethod ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Estimated Cost</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.estimatedCost != null
                ? `${record.currency ?? "USD"} ${record.estimatedCost}`
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Actual Cost</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.actualCost != null
                ? `${record.currency ?? "USD"} ${record.actualCost}`
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Currency</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.currency ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Repair Start Date
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.repairStartDate
                ? new Date(record.repairStartDate).toLocaleDateString()
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Repair End Date
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.repairEndDate
                ? new Date(record.repairEndDate).toLocaleDateString()
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Repaired By</p>
            <p className="mt-1 text-sm text-gray-900">
              {record.repairedByName ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Class Notification Required
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.classNotificationRequired ? "Yes" : "No"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Class Notified
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {record.classNotified ? "Yes" : "No"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Status</p>
            <div className="mt-1">
              <Badge variant={statusVariant(record.status)}>
                {record.status}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Created At</p>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(record.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Updated At</p>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(record.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
