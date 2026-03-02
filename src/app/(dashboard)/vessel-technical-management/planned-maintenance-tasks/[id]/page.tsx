import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPlannedMaintenanceTask } from "@/lib/vessel-technical-management/service";
import { Badge } from "@/components/ui/badge";

function statusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge variant="success">{status}</Badge>;
    case "overdue":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function PlannedMaintenanceTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "technical:read")))
    redirect("/");

  const { id } = await params;
  const record = await getPlannedMaintenanceTask(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "technical:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/vessel-technical-management/planned-maintenance-tasks"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {record.taskRef}
          </h1>
          {statusBadge(record.status)}
        </div>
        {canEdit && (
          <Link
            href={`/vessel-technical-management/planned-maintenance-tasks/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Task Ref
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {record.taskRef}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Vessel Name
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {record.vesselName}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Equipment Code
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {record.equipmentCode}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Equipment Name
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {record.equipmentName}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Maintenance Type
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {record.maintenanceType}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Interval Type
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {record.intervalType}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Interval Value
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {record.intervalValue}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Priority
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {record.priority}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Assigned To
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {record.assignedToName ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Department
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {record.department ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Estimated Hours
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {record.estimatedHours ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Actual Hours
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {record.actualHours ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Status
            </dt>
            <dd className="mt-1">{statusBadge(record.status)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Created At
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {new Date(record.createdAt).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Updated At
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {new Date(record.updatedAt).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
