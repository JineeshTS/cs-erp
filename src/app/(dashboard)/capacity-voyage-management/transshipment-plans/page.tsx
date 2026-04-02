import Link from "next/link";
import { Plus, Search, ArrowLeft, GitBranch } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike } from "drizzle-orm";
import { capTransshipmentPlans } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function TransshipmentPlansListPage({
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
    eq(capTransshipmentPlans.tenantId, session.tenantId),
    isNull(capTransshipmentPlans.deletedAt),
  ];

  if (search)
    conditions.push(
      ilike(capTransshipmentPlans.transshipmentPort, `%${escapeIlike(search)}%`)
    );
  if (status) conditions.push(eq(capTransshipmentPlans.status, status));
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(capTransshipmentPlans.createdAt, capTransshipmentPlans.id, parsedCursor));

  const data = await db
    .select()
    .from(capTransshipmentPlans)
    .where(and(...conditions))
    .orderBy(desc(capTransshipmentPlans.createdAt), desc(capTransshipmentPlans.id))
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
    return `/capacity-voyage-management/transshipment-plans?${p.toString()}`;
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
              Transshipment Plans
            </h1>
            <p className="text-sm text-gray-500">
              Manage transshipment planning and coordination
            </p>
          </div>
        </div>
        {canCreate && (
          <Link
            href="/capacity-voyage-management/transshipment-plans/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Transshipment Plan
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
              placeholder="Transshipment port..."
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
            <option value="planned">Planned</option>
            <option value="in_transit">In Transit</option>
            <option value="at_hub">At Hub</option>
            <option value="connected">Connected</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
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
            href="/capacity-voyage-management/transshipment-plans"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <GitBranch className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No transshipment plans found.</p>
          {canCreate && (
            <Link
              href="/capacity-voyage-management/transshipment-plans/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first transshipment plan
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Origin Port
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Transshipment Port
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Destination Port
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Container No.
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Connection Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Dwell Days
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((tp) => (
                <tr
                  key={tp.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/capacity-voyage-management/transshipment-plans/${tp.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {tp.originPort}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {tp.transshipmentPort}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {tp.destinationPort}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {tp.containerNumber ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {tp.connectionType ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {tp.dwellDays ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        tp.status === "completed" || tp.status === "connected"
                          ? "success"
                          : tp.status === "failed"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {tp.status}
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
