import Link from "next/link";
import { Plus, Search, FileText } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listComplianceRecords } from "@/lib/vessel-technical-management/service";
import { Badge } from "@/components/ui/badge";

function statusBadge(status: string) {
  switch (status) {
    case "valid":
      return <Badge variant="success">{status}</Badge>;
    case "expired":
    case "suspended":
    case "withdrawn":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function ComplianceRecordsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "technical:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "technical:create"
  );

  const { search, status, cursor } = await searchParams;

  const { data: items, meta } = await listComplianceRecords({
    tenantId: session.tenantId,
    search,
    status,
    cursor,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Compliance Records
        </h1>
        {canCreate && (
          <Link
            href="/vessel-technical-management/compliance-records/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Record
          </Link>
        )}
      </div>

      <form method="GET" className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="search"
              name="search"
              type="text"
              defaultValue={search ?? ""}
              placeholder="Search by ref, vessel..."
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="min-w-[160px]">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status ?? ""}
            className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="">All Statuses</option>
            <option value="valid">Valid</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
            <option value="withdrawn">Withdrawn</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
        >
          <Search className="h-4 w-4" />
          Filter
        </button>
      </form>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-16 dark:border-gray-600">
          <FileText className="h-12 w-12 text-gray-400" />
          <p className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-100">
            No compliance records found
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {search || status
              ? "Try adjusting your search or filter criteria."
              : "Get started by creating a new compliance record."}
          </p>
          {canCreate && !search && !status && (
            <Link
              href="/vessel-technical-management/compliance-records/new"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              New Record
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Ref
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Vessel
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Type
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Certificate
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Expiry Date
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {items.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <Link
                      href={`/vessel-technical-management/compliance-records/${r.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {r.recordRef}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {r.vesselName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {r.complianceType}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {r.certificateName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {r.expiryDate
                      ? new Date(r.expiryDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {statusBadge(r.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {items.length} result{items.length !== 1 ? "s" : ""}
        </p>
        {meta.hasMore && meta.cursor && (
          <Link
            href={{
              pathname:
                "/vessel-technical-management/compliance-records",
              query: {
                ...(search ? { search } : {}),
                ...(status ? { status } : {}),
                cursor: meta.cursor,
              },
            }}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Next Page
          </Link>
        )}
      </div>
    </div>
  );
}
