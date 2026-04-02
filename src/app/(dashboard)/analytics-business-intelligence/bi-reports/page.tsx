import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listBiReports } from "@/lib/analytics-business-intelligence/service";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "default" | "success" | "secondary" | "destructive"> = {
  draft: "secondary",
  scheduled: "default",
  generating: "default",
  completed: "success",
  failed: "destructive",
};

export default async function BiReportsListPage({
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

  const { data, meta } = await listBiReports({
    tenantId: session.tenantId,
    search,
    status,
    cursor,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">BI Reports</h1>
          <p className="text-sm text-gray-500">
            Manage scheduled, ad-hoc, and custom business intelligence reports
          </p>
        </div>
        {canCreate && (
          <Link
            href="/analytics-business-intelligence/bi-reports/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New BI Report
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No BI reports found.</p>
          {canCreate && (
            <Link
              href="/analytics-business-intelligence/bi-reports/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first BI report
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
                    Category
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Schedule
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
                        href={`/analytics-business-intelligence/bi-reports/${report.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {report.reportRef}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {report.reportType}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <span
                        className="block max-w-[200px] truncate"
                        title={report.title}
                      >
                        {report.title}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {report.category || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {report.schedule || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[report.status] ?? "default"}>
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
                href={`/analytics-business-intelligence/bi-reports?cursor=${encodeURIComponent(meta.cursor)}${search ? `&search=${encodeURIComponent(search)}` : ""}${status ? `&status=${encodeURIComponent(status)}` : ""}`}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Next Page
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
