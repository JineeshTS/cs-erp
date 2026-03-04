import Link from "next/link";
import { Plus, Search, FileText } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listVoyageCloses } from "@/lib/voyage-results-settlement/service";
import { Badge } from "@/components/ui/badge";

export default async function VoyageClosesListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vrs:read")))
    redirect("/");
  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "vrs:create"
  );

  const sp = await searchParams;
  const result = await listVoyageCloses({
    tenantId: session.tenantId,
    search: sp.search,
    status: sp.status,
    cursor: sp.cursor,
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voyage Closes</h1>
          <p className="text-sm text-gray-500">Manage voyage closure records</p>
        </div>
        {canCreate && (
          <Link
            href="/voyage-results-settlement/voyage-closes/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> New
          </Link>
        )}
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">
            Search
          </label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              id="search"
              name="search"
              type="text"
              defaultValue={sp.search ?? ""}
              placeholder="Ref, title, vessel..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={sp.status ?? ""}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="verified">Verified</option>
            <option value="published">Published</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filter
        </button>
      </form>

      {result.data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No voyage closes found.</p>
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
                  Vessel
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Voyage Number
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-end font-medium text-gray-500">
                  Net Result
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((record) => (
                <tr key={record.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/voyage-results-settlement/voyage-closes/${record.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {record.closeRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {record.title || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {record.vesselName || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {record.voyageNumber || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 capitalize">
                    {record.closeType?.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-end font-medium text-gray-900">
                    {record.netResult !== null && record.netResult !== undefined
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(Number(record.netResult))
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        record.status === "verified"
                          ? "success"
                          : record.status === "published"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {record.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.meta.hasMore && result.meta.cursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link
                href={`/voyage-results-settlement/voyage-closes?cursor=${result.meta.cursor}${sp.search ? `&search=${sp.search}` : ""}${sp.status ? `&status=${sp.status}` : ""}`}
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
