import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getMaintenanceSchedule } from "@/lib/fixed-assets-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  scheduled: "secondary",
  in_progress: "warning",
  completed: "success",
  overdue: "destructive",
  cancelled: "destructive",
} as const;

export default async function MaintenanceScheduleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "asset:read")))
    redirect("/fixed-assets-management");

  const { id } = await params;

  const record = await getMaintenanceSchedule(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "asset:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/fixed-assets-management/maintenance-schedules"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.maintenanceRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.assetName || "Maintenance Schedule"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/fixed-assets-management/maintenance-schedules/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Maintenance Ref</dt>
            <dd className="mt-1 text-gray-900">{record.maintenanceRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Maintenance Type</dt>
            <dd className="mt-1 text-gray-900">{record.maintenanceType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Asset Ref</dt>
            <dd className="mt-1 text-gray-900">{record.assetRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Asset Name</dt>
            <dd className="mt-1 text-gray-900">{record.assetName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Scheduled Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.scheduledDate
                ? new Date(record.scheduledDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Completed Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.completedDate
                ? new Date(record.completedDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Frequency</dt>
            <dd className="mt-1 text-gray-900">{record.frequency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
            <dd className="mt-1 text-gray-900">{record.assignedTo || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vendor</dt>
            <dd className="mt-1 text-gray-900">{record.vendor || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Estimated Cost</dt>
            <dd className="mt-1 text-gray-900">
              {record.estimatedCost ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Actual Cost</dt>
            <dd className="mt-1 text-gray-900">
              {record.actualCost ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Downtime</dt>
            <dd className="mt-1 text-gray-900">{record.downtime || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Next Scheduled Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.nextScheduledDate
                ? new Date(record.nextScheduledDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Priority</dt>
            <dd className="mt-1 text-gray-900">{record.priority || "-"}</dd>
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
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Work Description</dt>
            <dd className="mt-1 text-gray-900">
              {record.workDescription || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">
              {record.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
