import Link from "next/link";
import { Plus, Search, ArrowLeft, BarChart3 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import { capTradeAllocations } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function TradeAllocationsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "capacity:read")))
    redirect("/capacity-voyage-management");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "capacity:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const conditions = [
    eq(capTradeAllocations.tenantId, session.tenantId),
    isNull(capTradeAllocations.deletedAt),
  ];

  if (status) conditions.push(eq(capTradeAllocations.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(capTradeAllocations.tradeLane, `%${search}%`),
        ilike(capTradeAllocations.originRegion, `%${search}%`),
        ilike(capTradeAllocations.destinationRegion, `%${search}%`)
      )!
    );
  }
  if (cursor)
    conditions.push(lt(capTradeAllocations.createdAt, new Date(cursor)));

  const data = await db
    .select()
    .from(capTradeAllocations)
    .where(and(...conditions))
    .orderBy(desc(capTradeAllocations.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/capacity-voyage-management/trade-allocations?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/capacity-voyage-management"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Trade Allocations
            </h1>
            <p className="text-sm text-gray-500">
              Manage capacity allocations by trade lane
            </p>
          </div>
        </div>
        {canCreate && (
          <Link
            href="/capacity-voyage-management/trade-allocations/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Trade Allocation
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
              placeholder="Trade lane, origin, destination..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="status"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filter
        </button>
        {(search || status) && (
          <Link
            href="/capacity-voyage-management/trade-allocations"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <BarChart3 className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No trade allocations found.</p>
          {canCreate && (
            <Link
              href="/capacity-voyage-management/trade-allocations/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first trade allocation
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Trade Lane
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Origin Region
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Destination Region
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Allocated TEU
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Utilized TEU
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Allocation Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((ta) => (
                <tr
                  key={ta.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/capacity-voyage-management/trade-allocations/${ta.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {ta.tradeLane}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {ta.originRegion || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {ta.destinationRegion || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {ta.allocatedTeu?.toLocaleString() ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {ta.utilizedTeu?.toLocaleString() ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {ta.allocationType}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        ta.status === "active"
                          ? "success"
                          : ta.status === "suspended"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {ta.status}
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
