import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listMarketIntelligenceReports } from "@/lib/analytics-business-intelligence/service";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "default" | "success" | "secondary" | "destructive"> = {
  draft: "secondary",
  published: "success",
  archived: "destructive",
};

export default async function MarketIntelligenceReportsListPage({
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

  const { search, status, cursor } = await searchParams;

  const { data, meta } = await listMarketIntelligenceReports({
    tenantId: session.tenantId,
    search,
    status,
    cursor,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Market Intelligence Reports
          </h1>
          <p className="text-sm text-gray-500">
            Market overviews, competitor analysis, rate benchmarks, and capacity insights
          </p>
        </div>
        {canCreate && (
          <Link
            href="/analytics-business-intelligence/market-intelligence-reports/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Report
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">
            No market intelligence reports found.
          </p>
          {canCreate && (
            <Link
              href="/analytics-business-intelligence/market-intelligence-reports/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first report
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Report Ref
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Report Type
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Title
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Region
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Market Share %
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/analytics-business-intelligence/market-intelligence-reports/${report.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {report.reportRef}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {report.reportType}
                    </td>
                    <td
                      className="max-w-[200px] truncate px-4 py-3 text-gray-600"
                      title={report.title}
                    >
                      {report.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {report.region ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {report.ourMarketSharePct != null
                        ? `${report.ourMarketSharePct}%`
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={STATUS_VARIANT[report.status] ?? "secondary"}
                      >
                        {report.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta.hasMore && meta.cursor && (
            <div className="flex justify-end">
              <Link
                href={`/analytics-business-intelligence/market-intelligence-reports?cursor=${encodeURIComponent(meta.cursor)}${status ? `&status=${status}` : ""}${search ? `&search=${search}` : ""}`}
                className="text-sm text-blue-600 hover:underline"
              >
                Load more
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
