import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { adminIntegrationEndpoints } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<
  string,
  "success" | "secondary" | "warning" | "destructive"
> = {
  active: "success",
  inactive: "secondary",
  testing: "warning",
  error: "destructive",
};

export default async function IntegrationEndpointsListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:read")))
    redirect("/admin-portal");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "admin:create"
  );

  const data = await db
    .select()
    .from(adminIntegrationEndpoints)
    .where(
      and(
        eq(adminIntegrationEndpoints.tenantId, session.tenantId),
        isNull(adminIntegrationEndpoints.deletedAt)
      )
    )
    .orderBy(desc(adminIntegrationEndpoints.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Integration Endpoints
          </h1>
          <p className="text-sm text-gray-500">
            Manage external API integrations and endpoint configurations
          </p>
        </div>
        {canCreate && (
          <Link
            href="/admin-portal/integration-endpoints/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Endpoint
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No integration endpoints found.</p>
          {canCreate && (
            <Link
              href="/admin-portal/integration-endpoints/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first integration endpoint
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
                  Provider
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Method
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  URL
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Last Tested
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((endpoint) => (
                <tr
                  key={endpoint.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin-portal/integration-endpoints/${endpoint.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {endpoint.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {endpoint.provider}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{endpoint.method}</Badge>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-gray-600">
                    {endpoint.endpointUrl}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={STATUS_VARIANT[endpoint.status] ?? "secondary"}
                    >
                      {endpoint.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {endpoint.lastTestedAt
                      ? endpoint.lastTestedAt.toLocaleDateString()
                      : "-"}
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
