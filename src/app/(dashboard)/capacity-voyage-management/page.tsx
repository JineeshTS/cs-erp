import Link from "next/link";
import {
  Plus,
  Ship,
  Calendar,
  BarChart3,
  Container,
  Search,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, gt, or } from "drizzle-orm";
import {
  capVesselSchedules,
  capTradeAllocations,
  capSpaceControls,
  capLoadOptimizations,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function CapacityVoyageManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "capacity:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "capacity:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const scheduleType = sp.scheduleType ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [activeSchedules, pendingBookings, allocatedTeu, optimizationRuns] =
    await Promise.all([
      db
        .select({ id: capVesselSchedules.id })
        .from(capVesselSchedules)
        .where(
          and(
            eq(capVesselSchedules.tenantId, session.tenantId),
            isNull(capVesselSchedules.deletedAt),
            eq(capVesselSchedules.status, "active")
          )
        )
        .then((r) => r.length),
      db
        .select({ id: capSpaceControls.id })
        .from(capSpaceControls)
        .where(
          and(
            eq(capSpaceControls.tenantId, session.tenantId),
            isNull(capSpaceControls.deletedAt),
            eq(capSpaceControls.status, "pending")
          )
        )
        .then((r) => r.length),
      db
        .select({ teu: capTradeAllocations.allocatedTeu })
        .from(capTradeAllocations)
        .where(
          and(
            eq(capTradeAllocations.tenantId, session.tenantId),
            isNull(capTradeAllocations.deletedAt),
            eq(capTradeAllocations.status, "active")
          )
        )
        .then((rows) => rows.reduce((sum, r) => sum + (r.teu ?? 0), 0)),
      db
        .select({ id: capLoadOptimizations.id })
        .from(capLoadOptimizations)
        .where(
          and(
            eq(capLoadOptimizations.tenantId, session.tenantId),
            isNull(capLoadOptimizations.deletedAt),
            eq(capLoadOptimizations.status, "completed")
          )
        )
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(capVesselSchedules.tenantId, session.tenantId),
    isNull(capVesselSchedules.deletedAt),
  ];
  if (scheduleType)
    conditions.push(eq(capVesselSchedules.scheduleType, scheduleType));
  if (status) conditions.push(eq(capVesselSchedules.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(capVesselSchedules.vesselName, `%${search}%`),
        ilike(capVesselSchedules.serviceName, `%${search}%`),
        ilike(capVesselSchedules.tradeLane, `%${search}%`)
      )!
    );
  }
  if (cursor)
    conditions.push(lt(capVesselSchedules.createdAt, new Date(cursor)));

  const data = await db
    .select()
    .from(capVesselSchedules)
    .where(and(...conditions))
    .orderBy(desc(capVesselSchedules.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (scheduleType) p.set("scheduleType", scheduleType);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/capacity-voyage-management?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Capacity &amp; Voyage Management
          </h1>
          <p className="text-sm text-gray-500">
            Manage vessel schedules, capacity, stowage, and performance
          </p>
        </div>
        {canCreate && (
          <Link
            href="/capacity-voyage-management/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Schedule
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
              <p className="text-sm text-gray-500">Active Schedules</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeSchedules}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Bookings</p>
              <p className="text-2xl font-bold text-gray-900">
                {pendingBookings}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600">
              <Container className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Allocated TEU</p>
              <p className="text-2xl font-bold text-gray-900">
                {allocatedTeu.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Optimizations</p>
              <p className="text-2xl font-bold text-gray-900">
                {optimizationRuns}
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
              placeholder="Vessel, service, trade lane..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="scheduleType"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Schedule Type
          </label>
          <select
            id="scheduleType"
            name="scheduleType"
            defaultValue={scheduleType}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="regular">Regular</option>
            <option value="ad_hoc">Ad Hoc</option>
            <option value="extra_loader">Extra Loader</option>
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
            <option value="suspended">Suspended</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filter
        </button>
        {(search || scheduleType || status) && (
          <Link
            href="/capacity-voyage-management"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Vessel Schedules Table */}
      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Ship className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No vessel schedules found.</p>
          {canCreate && (
            <Link
              href="/capacity-voyage-management/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first vessel schedule
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Vessel
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Service
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Trade Lane
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Validity
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Capacity (TEU)
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((vs) => (
                <tr
                  key={vs.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/capacity-voyage-management/${vs.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {vs.vesselName}
                    </Link>
                    {vs.vesselImo && (
                      <span className="ms-1 text-xs text-gray-400">
                        ({vs.vesselImo})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {vs.serviceName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {vs.tradeLane || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {vs.scheduleType.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(vs.validityFrom).toLocaleDateString()}
                    {vs.validityTo
                      ? ` – ${new Date(vs.validityTo).toLocaleDateString()}`
                      : ""}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {vs.totalCapacityTeu?.toLocaleString() ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        vs.status === "active"
                          ? "success"
                          : vs.status === "draft"
                            ? "secondary"
                            : vs.status === "suspended"
                              ? "destructive"
                              : "default"
                      }
                    >
                      {vs.status}
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
