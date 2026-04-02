import Link from "next/link";
import { Plus, ShieldAlert, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike } from "drizzle-orm";
import { acmSanctionsScreenings } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function SanctionsScreeningPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "compliance:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "compliance:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const matchStatus = sp.matchStatus ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const conditions = [
    eq(acmSanctionsScreenings.tenantId, session.tenantId),
    isNull(acmSanctionsScreenings.deletedAt),
  ];
  if (matchStatus)
    conditions.push(eq(acmSanctionsScreenings.matchStatus, matchStatus));
  if (search) {
    conditions.push(
      ilike(acmSanctionsScreenings.entityName, `%${escapeIlike(search)}%`)
    );
  }
  if (cursor)
    conditions.push(
      cursorCondition(acmSanctionsScreenings.createdAt, acmSanctionsScreenings.id, parseCompoundCursor(cursor)!)
    );

  const data = await db
    .select()
    .from(acmSanctionsScreenings)
    .where(and(...conditions))
    .orderBy(desc(acmSanctionsScreenings.createdAt), desc(acmSanctionsScreenings.id))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (matchStatus) p.set("matchStatus", matchStatus);
    p.set("cursor", nextCur);
    return `/audit-compliance-management/sanctions-screening?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sanctions Screening
          </h1>
          <p className="text-sm text-gray-500">
            Screen entities against OFAC, EU, and UN sanctions lists
          </p>
        </div>
        {canCreate && (
          <Link
            href="/audit-compliance-management/sanctions-screening/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Screening
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
              placeholder="Search by entity name..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="matchStatus"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Match Status
          </label>
          <select
            id="matchStatus"
            name="matchStatus"
            defaultValue={matchStatus}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="clear">Clear</option>
            <option value="potential_match">Potential Match</option>
            <option value="confirmed_match">Confirmed Match</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filter
        </button>
        {(search || matchStatus) && (
          <Link
            href="/audit-compliance-management/sanctions-screening"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No screenings found.</p>
          {canCreate && (
            <Link
              href="/audit-compliance-management/sanctions-screening/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Start your first screening
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Screening Ref
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Entity Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Entity Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Match Status
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Risk Score
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Resolution
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Screened At
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr
                  key={s.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/audit-compliance-management/sanctions-screening/${s.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {s.screeningRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.entityName}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {s.entityType.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        s.matchStatus === "clear"
                          ? "success"
                          : s.matchStatus === "potential_match"
                            ? "warning"
                            : s.matchStatus === "confirmed_match"
                              ? "destructive"
                              : "secondary"
                      }
                    >
                      {s.matchStatus.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {s.riskScore ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {s.resolution
                      ? s.resolution.replace(/_/g, " ")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {s.screenedAt
                      ? new Date(s.screenedAt).toLocaleDateString()
                      : "—"}
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
