import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import {
  melsOracleIntegrationConfigs,
  melsOracleSyncLogs,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function OracleIntegrationConfigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:read")))
    redirect("/multi-entity-legal-structure");

  const { id } = await params;

  const [config, syncLogs] = await Promise.all([
    db
      .select()
      .from(melsOracleIntegrationConfigs)
      .where(
        and(
          eq(melsOracleIntegrationConfigs.id, id),
          eq(melsOracleIntegrationConfigs.tenantId, session.tenantId),
          isNull(melsOracleIntegrationConfigs.deletedAt)
        )
      )
      .limit(1)
      .then((r) => r[0]),
    db
      .select()
      .from(melsOracleSyncLogs)
      .where(
        and(
          eq(melsOracleSyncLogs.integrationConfigId, id),
          eq(melsOracleSyncLogs.tenantId, session.tenantId),
          isNull(melsOracleSyncLogs.deletedAt)
        )
      )
      .orderBy(desc(melsOracleSyncLogs.createdAt))
      .limit(50),
  ]);

  if (!config) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "entities:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/multi-entity-legal-structure/oracle-integration-configs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{config.name}</h1>
          <p className="text-sm text-gray-500">{config.slug}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/multi-entity-legal-structure/oracle-integration-configs/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-gray-900">{config.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Slug</dt>
            <dd className="mt-1 text-gray-900">{config.slug}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Active</dt>
            <dd className="mt-1">
              <Badge variant={config.isActive ? "success" : "secondary"}>
                {config.isActive ? "Active" : "Inactive"}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Endpoint URL</dt>
            <dd className="mt-1 break-all text-gray-900">
              {config.endpointUrl}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">
              {config.description || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Sync Schedule
            </dt>
            <dd className="mt-1 text-gray-900">
              {config.syncSchedule || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Last Sync At
            </dt>
            <dd className="mt-1 text-gray-900">
              {config.lastSyncAt ? config.lastSyncAt.toLocaleString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Last Sync Status
            </dt>
            <dd className="mt-1 text-gray-900">
              {config.lastSyncStatus || "-"}
            </dd>
          </div>
          {config.authConfig != null && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">
                Auth Config
              </dt>
              <dd className="mt-1">
                <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-900">
                  {JSON.stringify(config.authConfig, null, 2)}
                </pre>
              </dd>
            </div>
          )}
          {config.mappingConfig != null && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">
                Mapping Config
              </dt>
              <dd className="mt-1">
                <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-900">
                  {JSON.stringify(config.mappingConfig, null, 2)}
                </pre>
              </dd>
            </div>
          )}
          {config.metadata != null && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Metadata</dt>
              <dd className="mt-1">
                <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-900">
                  {JSON.stringify(config.metadata, null, 2)}
                </pre>
              </dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {config.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {config.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Sync Logs ({syncLogs.length})
        </h2>
        {syncLogs.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center">
            <p className="text-gray-500">
              No sync logs for this integration config.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Sync Type
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Records Processed
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Records Failed
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Started At
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {syncLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/multi-entity-legal-structure/oracle-sync-logs/${log.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {log.syncType}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          log.status === "completed"
                            ? "success"
                            : log.status === "failed"
                              ? "destructive"
                              : log.status === "pending"
                                ? "warning"
                                : "secondary"
                        }
                      >
                        {log.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {log.recordsProcessed}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {log.recordsFailed}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {log.startedAt ? log.startedAt.toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {log.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
