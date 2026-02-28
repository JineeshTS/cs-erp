import Link from "next/link";
import {
  Plus,
  Ship,
  Clock,
  AlertTriangle,
  TrendingUp,
  Search,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, or, ilike, gt } from "drizzle-orm";
import {
  cvmCharterParties,
  cvmTcContracts,
  cvmUtilizationAnalyses,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function CharteringVesselManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "chartering:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const charterType = sp.charterType ?? "";
  const status = sp.status ?? "";
  const vessel = sp.vessel ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [activeCharters, upcomingLaycan, expiringTc, utilizationRows] =
    await Promise.all([
      db
        .select({ id: cvmCharterParties.id })
        .from(cvmCharterParties)
        .where(
          and(
            eq(cvmCharterParties.tenantId, session.tenantId),
            isNull(cvmCharterParties.deletedAt),
            or(
              eq(cvmCharterParties.status, "active"),
              eq(cvmCharterParties.status, "commenced")
            )
          )
        )
        .then((r) => r.length),
      db
        .select({ id: cvmCharterParties.id })
        .from(cvmCharterParties)
        .where(
          and(
            eq(cvmCharterParties.tenantId, session.tenantId),
            isNull(cvmCharterParties.deletedAt),
            gt(cvmCharterParties.laycanFrom, now),
            lt(cvmCharterParties.laycanFrom, in30Days)
          )
        )
        .then((r) => r.length),
      db
        .select({ id: cvmTcContracts.id })
        .from(cvmTcContracts)
        .where(
          and(
            eq(cvmTcContracts.tenantId, session.tenantId),
            isNull(cvmTcContracts.deletedAt),
            gt(cvmTcContracts.redeliveryDate, now),
            lt(cvmTcContracts.redeliveryDate, in30Days)
          )
        )
        .then((r) => r.length),
      db
        .select({
          currentUtilizationPercent:
            cvmUtilizationAnalyses.currentUtilizationPercent,
        })
        .from(cvmUtilizationAnalyses)
        .where(
          and(
            eq(cvmUtilizationAnalyses.tenantId, session.tenantId),
            isNull(cvmUtilizationAnalyses.deletedAt)
          )
        )
        .orderBy(desc(cvmUtilizationAnalyses.analysisDate))
        .limit(10),
    ]);

  const utilizationAvg =
    utilizationRows.length > 0
      ? Math.round(
          utilizationRows.reduce(
            (sum, r) =>
              sum +
              (r.currentUtilizationPercent
                ? Number(r.currentUtilizationPercent)
                : 0),
            0
          ) / utilizationRows.length
        )
      : null;

  const conditions = [
    eq(cvmCharterParties.tenantId, session.tenantId),
    isNull(cvmCharterParties.deletedAt),
  ];
  if (charterType)
    conditions.push(eq(cvmCharterParties.charterType, charterType));
  if (status) conditions.push(eq(cvmCharterParties.status, status));
  if (vessel)
    conditions.push(ilike(cvmCharterParties.vesselName, `%${vessel}%`));
  if (search) {
    conditions.push(
      or(
        ilike(cvmCharterParties.cpReference, `%${search}%`),
        ilike(cvmCharterParties.chartererName, `%${search}%`),
        ilike(cvmCharterParties.ownerName, `%${search}%`)
      )!
    );
  }
  if (cursor)
    conditions.push(lt(cvmCharterParties.createdAt, new Date(cursor)));

  const data = await db
    .select()
    .from(cvmCharterParties)
    .where(and(...conditions))
    .orderBy(desc(cvmCharterParties.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (charterType) p.set("charterType", charterType);
    if (status) p.set("status", status);
    if (vessel) p.set("vessel", vessel);
    p.set("cursor", nextCur);
    return `/chartering-vessel-management?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Chartering &amp; Vessel Management
          </h1>
          <p className="text-sm text-gray-500">
            Manage charter parties, voyages, and fleet operations
          </p>
        </div>
        {canCreate && (
          <Link
            href="/chartering-vessel-management/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Charter Party
          </Link>
        )}
      </div>

      {/* Dashboard Widgets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
              <Ship className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Charters</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeCharters}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Upcoming Laycan</p>
              <p className="text-2xl font-bold text-gray-900">
                {upcomingLaycan}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Hire Expiry (30d)</p>
              <p className="text-2xl font-bold text-gray-900">{expiringTc}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Fleet Utilization</p>
              <p className="text-2xl font-bold text-gray-900">
                {utilizationAvg !== null ? `${utilizationAvg}%` : "N/A"}
              </p>
            </div>
          </div>
        </div>
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
              placeholder="CP ref, charterer, owner..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="charterType"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Charter Type
          </label>
          <select
            id="charterType"
            name="charterType"
            defaultValue={charterType}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="time_charter">Time Charter</option>
            <option value="voyage_charter">Voyage Charter</option>
            <option value="bareboat">Bareboat</option>
            <option value="coa">COA</option>
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
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="commenced">Commenced</option>
            <option value="completed">Completed</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="vessel"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Vessel
          </label>
          <input
            id="vessel"
            name="vessel"
            type="text"
            defaultValue={vessel}
            placeholder="Vessel name..."
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filter
        </button>
        {(search || charterType || status || vessel) && (
          <Link
            href="/chartering-vessel-management"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Charter Parties Table */}
      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Ship className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No charter parties found.</p>
          {canCreate && (
            <Link
              href="/chartering-vessel-management/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first charter party
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  CP Reference
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Vessel
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Charterer
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Owner
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Laycan
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((cp) => (
                <tr
                  key={cp.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/chartering-vessel-management/${cp.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {cp.cpReference}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {cp.charterType.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {cp.vesselName || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {cp.chartererName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {cp.ownerName || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {cp.laycanFrom
                      ? new Date(cp.laycanFrom).toLocaleDateString()
                      : "-"}
                    {cp.laycanTo
                      ? ` – ${new Date(cp.laycanTo).toLocaleDateString()}`
                      : ""}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        cp.status === "active" || cp.status === "commenced"
                          ? "success"
                          : cp.status === "draft"
                            ? "secondary"
                            : cp.status === "terminated"
                              ? "destructive"
                              : "default"
                      }
                    >
                      {cp.status}
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
