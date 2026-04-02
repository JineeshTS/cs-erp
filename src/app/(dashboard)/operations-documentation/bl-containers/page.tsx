import Link from "next/link";
import { Plus, Container, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike } from "drizzle-orm";
import { odmBlContainers } from "@/db/schema";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function BlContainersListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "operations:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "operations:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const conditions = [
    eq(odmBlContainers.tenantId, session.tenantId),
    isNull(odmBlContainers.deletedAt),
  ];
  if (search) {
    conditions.push(ilike(odmBlContainers.containerNumber, `%${escapeIlike(search)}%`));
  }
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(odmBlContainers.createdAt, odmBlContainers.id, parsedCursor));

  const data = await db
    .select()
    .from(odmBlContainers)
    .where(and(...conditions))
    .orderBy(desc(odmBlContainers.createdAt), desc(odmBlContainers.id))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    p.set("cursor", nextCur);
    return `/operations-documentation/bl-containers?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">BL Containers</h1>
          <p className="text-sm text-gray-500">
            Manage containers associated with bills of lading
          </p>
        </div>
        {canCreate && (
          <Link
            href="/operations-documentation/bl-containers/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Container
          </Link>
        )}
      </div>

      {/* Filters */}
      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              id="search"
              name="search"
              type="text"
              defaultValue={search}
              placeholder="Container number..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {search && (
          <Link href="/operations-documentation/bl-containers" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {/* Table */}
      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Container className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No BL containers found.</p>
          {canCreate && (
            <Link href="/operations-documentation/bl-containers/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
              Create your first BL container
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Container Number</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Seal #</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Size</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Gross Weight</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Package Count</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/operations-documentation/bl-containers/${t.id}`} className="font-medium text-gray-900 hover:underline">
                      {t.containerNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.sealNumber ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.containerType ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.containerSize ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.grossWeight?.toString() ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.packageCount?.toString() ?? "-"}</td>
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
