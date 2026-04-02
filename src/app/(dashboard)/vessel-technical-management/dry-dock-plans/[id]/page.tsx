import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDryDockPlan } from "@/lib/vessel-technical-management/service";
import { Badge } from "@/components/ui/badge";

function statusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge variant="success">{status}</Badge>;
    case "cancelled":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function DryDockPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "technical:read")))
    redirect("/");

  const { id } = await params;
  const record = await getDryDockPlan(id, session.tenantId);
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
            href="/vessel-technical-management/dry-dock-plans"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {record.planRef}
          </h1>
          {statusBadge(record.status)}
        </div>
        {canEdit && (
          <Link
            href={`/vessel-technical-management/dry-dock-plans/${id}/edit`}
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
              Plan Ref
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {record.planRef}
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
              Dock Yard Name
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {record.dockYardName}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Dock Yard Location
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {record.dockYardLocation ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Dock Yard Country
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {record.dockYardCountry ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Planned Start Date
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {new Date(record.plannedStartDate).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Planned End Date
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {new Date(record.plannedEndDate).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Estimated Cost
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {record.estimatedCost != null
                ? `${record.currency ?? ""} ${record.estimatedCost}`
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Actual Cost
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {record.actualCost != null
                ? `${record.currency ?? ""} ${record.actualCost}`
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Currency
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {record.currency ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Selected Contractor
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {record.selectedContractor ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Class Name
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {record.className ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Project Manager
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {record.projectManagerName ?? "—"}
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
