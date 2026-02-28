import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { melsOracleSyncLogs } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function OracleSyncLogsListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:read")))
    redirect("/multi-entity-legal-structure");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "entities:create"
  );

  const data = await db
    .select()
    .from(melsOracleSyncLogs)
    .where(
      and(
        eq(melsOracleSyncLogs.tenantId, session.tenantId),
        isNull(melsOracleSyncLogs.deletedAt)
      )
    )
    .orderBy(desc(melsOracleSyncLogs.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Oracle Sync Logs
          </h1>
          <p className="text-sm text-gray-500">
            View and manage Oracle synchronization logs
          </p>
        </div>
        {canCreate && (
          <Link
            href="/multi-entity-legal-structure/oracle-sync-logs/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Sync Log
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No oracle sync logs found.</p>
          {canCreate && (
            <Link
              href="/multi-entity-legal-structure/oracle-sync-logs/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first sync log
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Integration Config ID
                </th>
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
              {data.map((log) => (
                <tr
                  key={log.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-gray-600">
                    <span title={log.integrationConfigId}>
                      {log.integrationConfigId.slice(0, 8)}...
                    </span>
                  </td>
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
  );
}
