import Link from "next/link";
import { Plus, FileText, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listRegulatoryComplianceCalendars } from "@/lib/audit-compliance-management/service";
import { Badge } from "@/components/ui/badge";

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

export default async function RegulatoryComplianceCalendarsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "audit:read")))
    redirect("/");
  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "audit:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";

  const { data: items, meta } = await listRegulatoryComplianceCalendars({
    tenantId: session.tenantId,
    search,
    status,
    cursor,
    limit: 50,
  });

  const hasMore = !!(meta?.cursor);

  function buildUrl(params: Record<string, string>) {
    const p = new URLSearchParams();
    if (params.search || search) p.set("search", params.search ?? search);
    if (params.status || status) p.set("status", params.status ?? status);
    if (params.cursor) p.set("cursor", params.cursor);
    return `/audit-compliance-management/regulatory-compliance-calendars?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Regulatory Compliance Calendars
          </h1>
          <p className="text-sm text-gray-500">
            Track regulatory filings, renewals, and compliance deadlines
          </p>
        </div>
        {canCreate && (
          <Link
            href="/audit-compliance-management/regulatory-compliance-calendars/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> New Calendar Entry
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
              placeholder="Calendar ref, title..."
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
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
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
            href="/audit-compliance-management/regulatory-compliance-calendars"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">
            No regulatory compliance calendar entries found.
          </p>
          {canCreate && (
            <Link
              href="/audit-compliance-management/regulatory-compliance-calendars/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first calendar entry
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Ref
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Title
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Compliance Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Due Date
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Responsible Person
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr
                  key={t.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/audit-compliance-management/regulatory-compliance-calendars/${t.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {t.calendarRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.title}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.complianceType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(t.dueDate)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.responsiblePerson || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        t.status === "completed"
                          ? "success"
                          : t.status === "overdue"
                            ? "destructive"
                            : t.status === "in_progress"
                              ? "warning"
                              : "secondary"
                      }
                    >
                      {t.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore && meta?.cursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link
                href={buildUrl({ cursor: meta.cursor })}
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
