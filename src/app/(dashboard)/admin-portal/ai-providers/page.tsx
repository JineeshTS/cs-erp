import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { aiProviders } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

interface SearchParams {
  status?: string;
}

export default async function AiProvidersListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ai:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "ai:create"
  );

  const params = await searchParams;
  const statusFilter = params.status;

  let conditions = and(
    eq(aiProviders.tenantId, session.tenantId),
    isNull(aiProviders.deletedAt)
  );

  if (statusFilter === "active") {
    conditions = and(conditions, eq(aiProviders.isActive, true));
  } else if (statusFilter === "inactive") {
    conditions = and(conditions, eq(aiProviders.isActive, false));
  }

  const data = await db
    .select()
    .from(aiProviders)
    .where(conditions)
    .orderBy(desc(aiProviders.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            AI Providers
          </h1>
          <p className="text-sm text-gray-500">
            Manage AI provider configurations, API keys, and endpoints
          </p>
        </div>
        {canCreate && (
          <Link
            href="/admin-portal/ai-providers/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Provider
          </Link>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Filter:</span>
        <Link
          href="/admin-portal/ai-providers"
          className={`rounded-md px-3 py-1 text-sm ${
            !statusFilter
              ? "bg-blue-100 text-blue-800 font-medium"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          All
        </Link>
        <Link
          href="/admin-portal/ai-providers?status=active"
          className={`rounded-md px-3 py-1 text-sm ${
            statusFilter === "active"
              ? "bg-blue-100 text-blue-800 font-medium"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Active
        </Link>
        <Link
          href="/admin-portal/ai-providers?status=inactive"
          className={`rounded-md px-3 py-1 text-sm ${
            statusFilter === "inactive"
              ? "bg-blue-100 text-blue-800 font-medium"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Inactive
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No AI providers found.</p>
          {canCreate && (
            <Link
              href="/admin-portal/ai-providers/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Add your first AI provider
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Provider Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Display Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  API Endpoint
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Default
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((provider) => (
                <tr
                  key={provider.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin-portal/ai-providers/${provider.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {provider.providerName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {provider.displayName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {provider.apiEndpoint ? (
                      <span className="font-mono text-xs">
                        {provider.apiEndpoint}
                      </span>
                    ) : (
                      <span className="text-gray-400">Default</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={provider.isActive ? "success" : "secondary"}
                    >
                      {provider.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {provider.isDefault && (
                      <Badge variant="default">Default</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {provider.createdAt.toLocaleDateString()}
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
