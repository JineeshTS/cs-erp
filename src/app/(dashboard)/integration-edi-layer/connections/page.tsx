import Link from "next/link";
import { ArrowLeft, Plus, Search, Cable } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import { ielIntegrationConnections } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function ConnectionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "integration:read")))
    redirect("/integration-edi-layer");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "integration:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const connectionType = sp.connectionType ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const conditions = [
    eq(ielIntegrationConnections.tenantId, session.tenantId),
    isNull(ielIntegrationConnections.deletedAt),
  ];
  if (connectionType)
    conditions.push(eq(ielIntegrationConnections.connectionType, connectionType));
  if (search) {
    conditions.push(
      or(
        ilike(ielIntegrationConnections.connectionName, `%${search}%`),
        ilike(ielIntegrationConnections.connectionCode, `%${search}%`)
      )!
    );
  }
  if (cursor)
    conditions.push(lt(ielIntegrationConnections.createdAt, new Date(cursor)));

  const data = await db
    .select()
    .from(ielIntegrationConnections)
    .where(and(...conditions))
    .orderBy(desc(ielIntegrationConnections.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (connectionType) p.set("connectionType", connectionType);
    p.set("cursor", nextCur);
    return `/integration-edi-layer/connections?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/integration-edi-layer"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Integration Connections
            </h1>
            <p className="text-sm text-gray-500">
              Manage integration connections and external system links
            </p>
          </div>
        </div>
        {canCreate && (
          <Link
            href="/integration-edi-layer/connections/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Connection
          </Link>
        )}
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label
            htmlFor="search"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Search
          </label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              id="search"
              name="search"
              type="text"
              defaultValue={search}
              placeholder="Connection name or code..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="connectionType"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Connection Type
          </label>
          <select
            id="connectionType"
            name="connectionType"
            defaultValue={connectionType}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="erp">ERP</option>
            <option value="edi">EDI</option>
            <option value="port">Port</option>
            <option value="customs">Customs</option>
            <option value="api">API</option>
            <option value="webhook">Webhook</option>
            <option value="sftp">SFTP</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filter
        </button>
        {(search || connectionType) && (
          <Link
            href="/integration-edi-layer/connections"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Cable className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No connections found.</p>
          {canCreate && (
            <Link
              href="/integration-edi-layer/connections/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first connection
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Connection Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Code
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Provider
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Auth
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Health
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr
                  key={c.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/integration-edi-layer/connections/${c.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {c.connectionName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.connectionCode}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.connectionType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.provider.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.authType}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        c.status === "active"
                          ? "success"
                          : c.status === "error"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {c.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        c.healthStatus === "healthy"
                          ? "success"
                          : c.healthStatus === "unhealthy"
                            ? "destructive"
                            : c.healthStatus === "degraded"
                              ? "default"
                              : "secondary"
                      }
                    >
                      {c.healthStatus}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore && nextCursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link
                href={buildNextUrl(nextCursor)}
                className="text-sm text-blue-600 hover:underline"
              >
                Load more
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
