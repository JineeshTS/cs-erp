import Link from "next/link";
import { Plus, FileText, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listPowerManagement } from "@/lib/reefer-container-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  active: "success",
  disconnected: "secondary",
  maintenance: "warning",
  archived: "destructive",
} as const;

export default async function PowerManagementListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "reefer:read")))
    redirect("/reefer-container-management");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "reefer:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";

  const { data: items, meta } = await listPowerManagement({
    tenantId: session.tenantId,
    search: search || undefined,
    status: status || undefined,
    cursor: cursor || undefined,
  });

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/reefer-container-management/power-management?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Power Management
          </h1>
          <p className="text-sm text-gray-500">
            Reefer plug and power supply management
          </p>
        </div>
        {canCreate && (
          <Link
            href="/reefer-container-management/power-management/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Record
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
              placeholder="Ref, container, location..."
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
            <option value="active">Active</option>
            <option value="disconnected">Disconnected</option>
            <option value="maintenance">Maintenance</option>
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
            href="/reefer-container-management/power-management"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No power management records found.</p>
          {canCreate && (
            <Link
              href="/reefer-container-management/power-management/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first power management record
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Power Ref
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Container
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Location
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Plug Hours
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
                      href={`/reefer-container-management/power-management/${t.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {t.powerRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.containerNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.locationName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.locationType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.totalPlugHours ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        statusVariant[
                          t.status as keyof typeof statusVariant
                        ] ?? "secondary"
                      }
                    >
                      {t.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {meta.hasMore && meta.cursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link
                href={buildNextUrl(meta.cursor)}
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
