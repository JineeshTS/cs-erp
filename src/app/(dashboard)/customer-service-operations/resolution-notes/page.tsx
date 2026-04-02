import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Search, StickyNote } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike } from "drizzle-orm";
import { csoResolutionNotes } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function ResolutionNotesListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customer_service:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "customer_service:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const conditions = [
    eq(csoResolutionNotes.tenantId, session.tenantId),
    isNull(csoResolutionNotes.deletedAt),
  ];
  if (search) conditions.push(ilike(csoResolutionNotes.content, `%${escapeIlike(search)}%`));
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(csoResolutionNotes.createdAt, csoResolutionNotes.id, parsedCursor));

  const data = await db
    .select()
    .from(csoResolutionNotes)
    .where(and(...conditions))
    .orderBy(desc(csoResolutionNotes.createdAt), desc(csoResolutionNotes.id))
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
    return `/customer-service-operations/resolution-notes?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resolution Notes</h1>
          <p className="text-sm text-gray-500">
            Manage resolution notes for inquiries, complaints, and service requests
          </p>
        </div>
        {canCreate && (
          <Link
            href="/customer-service-operations/resolution-notes/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Note
          </Link>
        )}
      </div>

      {/* Search */}
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
              placeholder="Search by content..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          Filter
        </button>
        {search && (
          <Link href="/customer-service-operations/resolution-notes" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <StickyNote className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No resolution notes found.</p>
          {canCreate && (
            <Link href="/customer-service-operations/resolution-notes/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
              Create your first resolution note
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Entity Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Internal</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Content</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((record) => (
                <tr key={record.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/customer-service-operations/resolution-notes/${record.id}`} className="font-medium text-gray-900 hover:underline">
                      {record.entityType.replace(/_/g, " ")}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {record.noteType.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={record.isInternal ? "secondary" : "default"}>
                      {record.isInternal ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {record.content.slice(0, 60)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore && nextCursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link href={buildNextUrl(nextCursor)} className="text-sm text-blue-600 hover:underline">
                Load more
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
