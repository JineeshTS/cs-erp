import Link from "next/link";
import { Plus, FileText, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listExecutiveKpiDashboards } from "@/lib/analytics-business-intelligence/service";
import { Badge } from "@/components/ui/badge";

export default async function ExecutiveKpiDashboardsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "analytics:read")))
    redirect("/analytics-business-intelligence");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "analytics:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";

  const { data, meta } = await listExecutiveKpiDashboards({
    tenantId: session.tenantId,
    search: search || undefined,
    status: status || undefined,
    cursor: cursor || undefined,
  });

  function buildUrl(nextCursor: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCursor);
    return `/analytics-business-intelligence/executive-kpi-dashboards?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Executive KPI Dashboards
          </h1>
          <p className="text-sm text-gray-500">
            Manage executive-level KPI dashboards and performance snapshots
          </p>
        </div>
        {canCreate && (
          <Link
            href="/analytics-business-intelligence/executive-kpi-dashboards/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Dashboard
          </Link>
        )}
      </div>

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
              placeholder="Dashboard ref, type..."
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
            <option value="published">Published</option>
            <option value="archived">Archived</option>
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
            href="/analytics-business-intelligence/executive-kpi-dashboards"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">
            No executive KPI dashboards found.
          </p>
          {canCreate && (
            <Link
              href="/analytics-business-intelligence/executive-kpi-dashboards/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first KPI dashboard
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Dashboard Ref
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Period Start
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Revenue
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  TEU
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr
                  key={d.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/analytics-business-intelligence/executive-kpi-dashboards/${d.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {d.dashboardRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {d.dashboardType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {d.periodStart
                      ? new Date(d.periodStart).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {d.totalRevenue
                      ? `${d.totalRevenue} ${d.revenueCurrency ?? "USD"}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {d.totalTeu ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        d.status === "published"
                          ? "success"
                          : d.status === "archived"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {d.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {meta.hasMore && meta.cursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link
                href={buildUrl(meta.cursor)}
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
