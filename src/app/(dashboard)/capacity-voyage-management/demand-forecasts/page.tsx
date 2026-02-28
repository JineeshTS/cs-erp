import Link from "next/link";
import { Plus, Search, ArrowLeft, TrendingUp } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike } from "drizzle-orm";
import { capDemandForecasts } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function DemandForecastsListPage({
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
    eq(capDemandForecasts.tenantId, session.tenantId),
    isNull(capDemandForecasts.deletedAt),
  ];

  if (status) conditions.push(eq(capDemandForecasts.status, status));
  if (search) {
    conditions.push(ilike(capDemandForecasts.tradeLane, `%${search}%`));
  }
  if (cursor)
    conditions.push(lt(capDemandForecasts.createdAt, new Date(cursor)));

  const data = await db
    .select()
    .from(capDemandForecasts)
    .where(and(...conditions))
    .orderBy(desc(capDemandForecasts.createdAt))
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
    return `/capacity-voyage-management/demand-forecasts?${p.toString()}`;
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
              Demand Forecasts
            </h1>
            <p className="text-sm text-gray-500">
              Manage demand forecasting and capacity utilization predictions
            </p>
          </div>
        </div>
        {canCreate && (
          <Link
            href="/capacity-voyage-management/demand-forecasts/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Demand Forecast
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
              placeholder="Trade lane..."
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
            <option value="draft">Draft</option>
            <option value="preliminary">Preliminary</option>
            <option value="final">Final</option>
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
            href="/capacity-voyage-management/demand-forecasts"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <TrendingUp className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No demand forecasts found.</p>
          {canCreate && (
            <Link
              href="/capacity-voyage-management/demand-forecasts/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first demand forecast
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
                  Forecasted TEU
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Available TEU
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Methodology
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((df) => (
                <tr
                  key={df.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/capacity-voyage-management/demand-forecasts/${df.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {df.tradeLane}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {df.originRegion ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {df.destinationRegion ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {df.forecastedDemandTeu ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {df.availableCapacityTeu ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {df.methodology}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        df.status === "final"
                          ? "success"
                          : df.status === "expired"
                            ? "destructive"
                            : df.status === "preliminary"
                              ? "default"
                              : "secondary"
                      }
                    >
                      {df.status}
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
