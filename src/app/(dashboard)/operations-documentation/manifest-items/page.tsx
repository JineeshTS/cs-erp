import Link from "next/link";
import { Plus, FileText, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike } from "drizzle-orm";
import { odmManifestItems } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function ManifestItemsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "operations:read")))
    redirect("/operations-documentation");

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
    eq(odmManifestItems.tenantId, session.tenantId),
    isNull(odmManifestItems.deletedAt),
  ];
  if (search) {
    conditions.push(ilike(odmManifestItems.blNumber, `%${escapeIlike(search)}%`));
  }
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(odmManifestItems.createdAt, odmManifestItems.id, parsedCursor));

  const data = await db
    .select()
    .from(odmManifestItems)
    .where(and(...conditions))
    .orderBy(desc(odmManifestItems.createdAt), desc(odmManifestItems.id))
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
    return `/operations-documentation/manifest-items?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manifest Items
          </h1>
          <p className="text-sm text-gray-500">
            Manage manifest line items and cargo details
          </p>
        </div>
        {canCreate && (
          <Link
            href="/operations-documentation/manifest-items/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Manifest Item
          </Link>
        )}
      </div>

      {/* Filters */}
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
              placeholder="Search by BL number..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filter
        </button>
        {search && (
          <Link
            href="/operations-documentation/manifest-items"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No manifest items found.</p>
          {canCreate && (
            <Link
              href="/operations-documentation/manifest-items/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Add your first manifest item
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  BL Number
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Container
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Shipper
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Consignee
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Gross Weight
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Packages
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/operations-documentation/manifest-items/${item.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {item.blNumber ?? "-"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.containerNumber ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.shipperName ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.consigneeName ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.grossWeight ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.packageCount ?? "-"}
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
