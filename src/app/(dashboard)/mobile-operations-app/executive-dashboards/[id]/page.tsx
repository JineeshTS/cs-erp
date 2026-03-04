import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getExecutiveDashboard } from "@/lib/mobile-operations-app/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  active: "success",
  published: "success",
  archived: "warning",
  disabled: "destructive",
} as const;

export default async function ExecutiveDashboardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mob:read")))
    redirect("/mobile-operations-app");

  const { id } = await params;

  const record = await getExecutiveDashboard(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "mob:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/mobile-operations-app/executive-dashboards"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.dashboardRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.dashboardType} &middot; {record.dashboardName || "Untitled"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/mobile-operations-app/executive-dashboards/${id}/edit`}
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
              Dashboard Ref
            </dt>
            <dd className="mt-1 text-gray-900">{record.dashboardRef}</dd>
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
              Dashboard Type
            </dt>
            <dd className="mt-1 text-gray-900">{record.dashboardType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Dashboard Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.dashboardName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reporting Period
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.reportingPeriod || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Widget Count</dt>
            <dd className="mt-1 text-gray-900">
              {record.widgetCount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Refresh Interval
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.refreshInterval ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Last Refreshed At
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.lastRefreshedAt
                ? record.lastRefreshedAt.toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Access Level</dt>
            <dd className="mt-1 text-gray-900">
              {record.accessLevel || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Favorited</dt>
            <dd className="mt-1 text-gray-900">
              {record.favorited ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Shared With</dt>
            <dd className="mt-1 text-gray-900">
              {record.sharedWith || "-"}
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
