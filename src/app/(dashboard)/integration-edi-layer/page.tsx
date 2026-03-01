import Link from "next/link";
import {
  Plus,
  Cable,
  FileText,
  FileArchive,
  RefreshCw,
  Search,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  ielIntegrationConnections,
  ielEdiMessages,
  ielCustomsFilings,
  ielOracleSyncJobs,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function IntegrationEdiLayerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "integration:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "integration:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [activeConnections, pendingEdi, pendingFilings, failedSyncs] =
    await Promise.all([
      db.select({ id: ielIntegrationConnections.id }).from(ielIntegrationConnections)
        .where(and(eq(ielIntegrationConnections.tenantId, session.tenantId), isNull(ielIntegrationConnections.deletedAt), eq(ielIntegrationConnections.status, "active")))
        .then((r) => r.length),
      db.select({ id: ielEdiMessages.id }).from(ielEdiMessages)
        .where(and(eq(ielEdiMessages.tenantId, session.tenantId), isNull(ielEdiMessages.deletedAt), eq(ielEdiMessages.status, "received")))
        .then((r) => r.length),
      db.select({ id: ielCustomsFilings.id }).from(ielCustomsFilings)
        .where(and(eq(ielCustomsFilings.tenantId, session.tenantId), isNull(ielCustomsFilings.deletedAt), eq(ielCustomsFilings.status, "draft")))
        .then((r) => r.length),
      db.select({ id: ielOracleSyncJobs.id }).from(ielOracleSyncJobs)
        .where(and(eq(ielOracleSyncJobs.tenantId, session.tenantId), isNull(ielOracleSyncJobs.deletedAt), eq(ielOracleSyncJobs.status, "failed")))
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(ielIntegrationConnections.tenantId, session.tenantId),
    isNull(ielIntegrationConnections.deletedAt),
  ];
  if (status) conditions.push(eq(ielIntegrationConnections.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(ielIntegrationConnections.connectionName, `%${search}%`),
        ilike(ielIntegrationConnections.connectionCode, `%${search}%`),
        ilike(ielIntegrationConnections.provider, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(ielIntegrationConnections.createdAt, new Date(cursor)));

  const data = await db.select().from(ielIntegrationConnections)
    .where(and(...conditions))
    .orderBy(desc(ielIntegrationConnections.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/integration-edi-layer?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integration & EDI Layer</h1>
          <p className="text-sm text-gray-500">Oracle Fusion, EDI processing, customs, and port connectivity</p>
        </div>
        {canCreate && (
          <Link href="/integration-edi-layer/connections/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Connection
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Cable className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Connections</p><p className="text-2xl font-bold text-gray-900">{activeConnections}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><FileText className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending EDI</p><p className="text-2xl font-bold text-gray-900">{pendingEdi}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><FileArchive className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Filings</p><p className="text-2xl font-bold text-gray-900">{pendingFilings}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><RefreshCw className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Failed Syncs</p><p className="text-2xl font-bold text-gray-900">{failedSyncs}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Connection name, code, or provider..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="testing">Testing</option>
            <option value="error">Error</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/integration-edi-layer" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Cable className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No connections found.</p>
          {canCreate && (
            <Link href="/integration-edi-layer/connections/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first connection</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Connection Name</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Code</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Provider</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Auth</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Health</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/integration-edi-layer/connections/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.connectionName}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.connectionCode}</td>
                  <td className="px-4 py-3 text-gray-600">{t.connectionType}</td>
                  <td className="px-4 py-3 text-gray-600">{t.provider.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-gray-600">{t.authType}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "active" ? "success" : t.status === "error" ? "destructive" : "secondary"}>{t.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={t.healthStatus === "healthy" ? "success" : t.healthStatus === "unhealthy" ? "destructive" : "secondary"}>{t.healthStatus}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore && nextCursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link href={buildNextUrl(nextCursor)} className="text-sm text-blue-600 hover:underline">Load more</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
