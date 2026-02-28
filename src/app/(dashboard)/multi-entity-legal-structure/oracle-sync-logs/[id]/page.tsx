import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { melsOracleSyncLogs } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function OracleSyncLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:read")))
    redirect("/multi-entity-legal-structure");

  const { id } = await params;

  const log = await db
    .select()
    .from(melsOracleSyncLogs)
    .where(
      and(
        eq(melsOracleSyncLogs.id, id),
        eq(melsOracleSyncLogs.tenantId, session.tenantId),
        isNull(melsOracleSyncLogs.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!log) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "entities:edit"
  );

  const statusVariant =
    log.status === "completed"
      ? "success"
      : log.status === "failed"
        ? "destructive"
        : log.status === "pending"
          ? "warning"
          : "secondary";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/multi-entity-legal-structure/oracle-sync-logs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Sync Log Detail
          </h1>
          <p className="text-sm text-gray-500">{log.syncType} sync</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/multi-entity-legal-structure/oracle-sync-logs/${id}/edit`}
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
              Integration Config ID
            </dt>
            <dd className="mt-1 text-gray-900">
              <Link
                href={`/multi-entity-legal-structure/oracle-integration-configs/${log.integrationConfigId}`}
                className="text-blue-600 hover:underline"
              >
                {log.integrationConfigId}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sync Type</dt>
            <dd className="mt-1 text-gray-900">{log.syncType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={statusVariant}>{log.status}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Records Processed
            </dt>
            <dd className="mt-1 text-gray-900">{log.recordsProcessed}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Records Failed
            </dt>
            <dd className="mt-1 text-gray-900">{log.recordsFailed}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Started At</dt>
            <dd className="mt-1 text-gray-900">
              {log.startedAt ? log.startedAt.toLocaleString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Completed At</dt>
            <dd className="mt-1 text-gray-900">
              {log.completedAt ? log.completedAt.toLocaleString() : "-"}
            </dd>
          </div>
          {log.errorLog != null && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Error Log</dt>
              <dd className="mt-1">
                <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-900">
                  {JSON.stringify(log.errorLog, null, 2)}
                </pre>
              </dd>
            </div>
          )}
          {log.metadata != null && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Metadata</dt>
              <dd className="mt-1">
                <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-900">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {log.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {log.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
