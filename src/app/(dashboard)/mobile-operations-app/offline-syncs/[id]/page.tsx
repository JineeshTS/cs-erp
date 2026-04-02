import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getOfflineSync } from "@/lib/mobile-operations-app/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  in_progress: "warning",
  completed: "success",
  synced: "success",
  failed: "destructive",
} as const;

export default async function OfflineSyncDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mob:read")))
    redirect("/mobile-operations-app");

  const { id } = await params;

  const record = await getOfflineSync(id, session.tenantId);
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
          href="/mobile-operations-app/offline-syncs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.syncRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.syncType} &middot; {record.deviceName || "No device"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/mobile-operations-app/offline-syncs/${id}/edit`}
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
              Sync Ref
            </dt>
            <dd className="mt-1 text-gray-900">{record.syncRef}</dd>
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
              Sync Type
            </dt>
            <dd className="mt-1 text-gray-900">{record.syncType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Device ID
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.deviceId || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Device Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.deviceName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              User Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.userName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Records Synced
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.recordsSynced ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Records Failed
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.recordsFailed ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Conflicts Detected
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.conflictsDetected ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Conflicts Resolved
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.conflictsResolved ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Sync Started At
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.syncStartedAt
                ? record.syncStartedAt.toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Sync Completed At
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.syncCompletedAt
                ? record.syncCompletedAt.toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Data Size (KB)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.dataSizeKb ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Sync Duration (ms)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.syncDurationMs ?? "-"}
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
