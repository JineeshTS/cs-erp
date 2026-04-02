import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { melsOracleIntegrationConfigs } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function OracleIntegrationConfigsListPage() {
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
    .from(melsOracleIntegrationConfigs)
    .where(
      and(
        eq(melsOracleIntegrationConfigs.tenantId, session.tenantId),
        isNull(melsOracleIntegrationConfigs.deletedAt)
      )
    )
    .orderBy(desc(melsOracleIntegrationConfigs.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Oracle Integration Configs
          </h1>
          <p className="text-sm text-gray-500">
            Manage Oracle Fusion integration configurations
          </p>
        </div>
        {canCreate && (
          <Link
            href="/multi-entity-legal-structure/oracle-integration-configs/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Integration Config
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No oracle integration configs found.</p>
          {canCreate && (
            <Link
              href="/multi-entity-legal-structure/oracle-integration-configs/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first integration config
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Slug
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Endpoint URL
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Sync Schedule
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Active
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Last Sync Status
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((config) => (
                <tr
                  key={config.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/multi-entity-legal-structure/oracle-integration-configs/${config.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {config.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{config.slug}</td>
                  <td className="px-4 py-3 text-gray-600" title={config.endpointUrl}>
                    {config.endpointUrl.length > 40
                      ? `${config.endpointUrl.slice(0, 40)}...`
                      : config.endpointUrl}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {config.syncSchedule || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={config.isActive ? "success" : "secondary"}>
                      {config.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {config.lastSyncStatus || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {config.createdAt.toLocaleDateString()}
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
