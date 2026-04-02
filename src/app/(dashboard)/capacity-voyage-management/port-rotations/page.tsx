import Link from "next/link";
import { Plus, Search, ArrowLeft, Anchor } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import { capPortRotations } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function PortRotationsListPage({
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
    eq(capPortRotations.tenantId, session.tenantId),
    isNull(capPortRotations.deletedAt),
  ];

  if (status) conditions.push(eq(capPortRotations.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(capPortRotations.portName, `%${escapeIlike(search)}%`),
        ilike(capPortRotations.portCode, `%${escapeIlike(search)}%`)
      )!
    );
  }
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(capPortRotations.createdAt, capPortRotations.id, parsedCursor));

  const data = await db
    .select()
    .from(capPortRotations)
    .where(and(...conditions))
    .orderBy(desc(capPortRotations.createdAt), desc(capPortRotations.id))
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
    return `/capacity-voyage-management/port-rotations?${p.toString()}`;
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
              Port Rotations
            </h1>
            <p className="text-sm text-gray-500">
              Manage port rotation schedules and call sequences
            </p>
          </div>
        </div>
        {canCreate && (
          <Link
            href="/capacity-voyage-management/port-rotations/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Port Rotation
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
              placeholder="Port name or code..."
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
            <option value="scheduled">Scheduled</option>
            <option value="arrived">Arrived</option>
            <option value="berthed">Berthed</option>
            <option value="departed">Departed</option>
            <option value="cancelled">Cancelled</option>
            <option value="skipped">Skipped</option>
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
            href="/capacity-voyage-management/port-rotations"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Anchor className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No port rotations found.</p>
          {canCreate && (
            <Link
              href="/capacity-voyage-management/port-rotations/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first port rotation
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Port Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Port Code
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Sequence
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Call Purpose
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Arrival ETA
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((pr) => (
                <tr
                  key={pr.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/capacity-voyage-management/port-rotations/${pr.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {pr.portName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{pr.portCode}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {pr.sequenceNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {pr.callPurpose}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {pr.arrivalEta
                      ? new Date(pr.arrivalEta).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        pr.status === "arrived" || pr.status === "berthed"
                          ? "success"
                          : pr.status === "departed"
                            ? "default"
                            : pr.status === "cancelled" ||
                                pr.status === "skipped"
                              ? "destructive"
                              : "secondary"
                      }
                    >
                      {pr.status}
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
