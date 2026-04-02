import Link from "next/link";
import { Plus, FileBarChart, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listAgingReports } from "@/lib/accounts-receivable-credit-control/service";
import { Badge } from "@/components/ui/badge";

export default async function AgingReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "receivable:read")))
    redirect("/");
  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "receivable:create"
  );

  const sp = await searchParams;
  const result = await listAgingReports({
    tenantId: session.tenantId,
    search: sp.search,
    status: sp.status,
    cursor: sp.cursor,
    limit: 50,
  });

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (sp.search) p.set("search", sp.search);
    if (sp.status) p.set("status", sp.status);
    p.set("cursor", nextCur);
    return `/accounts-receivable-credit-control/aging-reports?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aging Reports</h1>
          <p className="text-sm text-gray-500">
            Track receivable aging and overdue analysis
          </p>
        </div>
        {canCreate && (
          <Link
            href="/accounts-receivable-credit-control/aging-reports/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> New Report
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
              defaultValue={sp.search ?? ""}
              placeholder="Report ref, type..."
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
            defaultValue={sp.status ?? ""}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="generated">Generated</option>
            <option value="reviewed">Reviewed</option>
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
        {(sp.search || sp.status) && (
          <Link
            href="/accounts-receivable-credit-control/aging-reports"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {result.data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileBarChart className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No aging reports found.</p>
          {canCreate && (
            <Link
              href="/accounts-receivable-credit-control/aging-reports/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Generate your first aging report
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Report Ref
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Date
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Total Receivables
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Current
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Over 120 Days
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((t) => (
                <tr
                  key={t.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/accounts-receivable-credit-control/aging-reports/${t.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {t.reportRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.reportType}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.reportDate
                      ? new Date(t.reportDate).toLocaleDateString()
                      : "--"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.totalReceivables?.toLocaleString() ?? "--"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.currentAmount?.toLocaleString() ?? "--"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.over120Days?.toLocaleString() ?? "--"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        t.status === "published"
                          ? "success"
                          : t.status === "draft"
                            ? "secondary"
                            : t.status === "reviewed"
                              ? "warning"
                              : "default"
                      }
                    >
                      {t.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.meta.hasMore && result.meta.cursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link
                href={buildNextUrl(result.meta.cursor)}
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
