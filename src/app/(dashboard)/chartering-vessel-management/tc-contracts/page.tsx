import Link from "next/link";
import { Plus, Ship, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import { cvmTcContracts } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function TcContractsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:read")))
    redirect("/chartering-vessel-management");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "chartering:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const direction = sp.direction ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const conditions = [
    eq(cvmTcContracts.tenantId, session.tenantId),
    isNull(cvmTcContracts.deletedAt),
  ];
  if (status) conditions.push(eq(cvmTcContracts.status, status));
  if (direction) conditions.push(eq(cvmTcContracts.direction, direction));
  if (search) {
    conditions.push(
      or(
        ilike(cvmTcContracts.contractReference, `%${search}%`),
        ilike(cvmTcContracts.counterpartyName, `%${search}%`),
        ilike(cvmTcContracts.vesselName, `%${search}%`)
      )!
    );
  }
  if (cursor)
    conditions.push(lt(cvmTcContracts.createdAt, new Date(cursor)));

  const data = await db
    .select()
    .from(cvmTcContracts)
    .where(and(...conditions))
    .orderBy(desc(cvmTcContracts.createdAt))
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
    if (direction) p.set("direction", direction);
    p.set("cursor", nextCur);
    return `/chartering-vessel-management/tc-contracts?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            TC Contracts
          </h1>
          <p className="text-sm text-gray-500">
            Manage time charter in and out contracts
          </p>
        </div>
        {canCreate && (
          <Link
            href="/chartering-vessel-management/tc-contracts/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New TC Contract
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
              placeholder="Contract ref, counterparty, vessel..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="direction"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Direction
          </label>
          <select
            id="direction"
            name="direction"
            defaultValue={direction}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="tc_in">TC In</option>
            <option value="tc_out">TC Out</option>
          </select>
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
            <option value="negotiating">Negotiating</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filter
        </button>
        {(search || status || direction) && (
          <Link
            href="/chartering-vessel-management/tc-contracts"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Ship className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No TC contracts found.</p>
          {canCreate && (
            <Link
              href="/chartering-vessel-management/tc-contracts/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first TC contract
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Contract Ref
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Direction
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Vessel
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Counterparty
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Hire Rate
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr
                  key={row.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/chartering-vessel-management/tc-contracts/${row.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {row.contractReference}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.direction.replace(/_/g, " ").toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.vesselName || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.counterpartyName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.hireRate.toLocaleString()} {row.currency}/{row.hirePeriodUnit}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        row.status === "active"
                          ? "success"
                          : row.status === "negotiating"
                            ? "secondary"
                            : row.status === "terminated"
                              ? "destructive"
                              : "default"
                      }
                    >
                      {row.status}
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
