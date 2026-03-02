import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listPortPairTradeLanes } from "@/lib/liner-trade-route-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  active: "success",
  draft: "secondary",
  suspended: "warning",
  discontinued: "destructive",
} as const;

export default async function PortPairTradeLanesListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "liner:read")))
    redirect("/liner-trade-route-management");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "liner:create"
  );

  const { search, status, cursor } = await searchParams;

  const { data, meta } = await listPortPairTradeLanes({
    tenantId: session.tenantId,
    search: search || undefined,
    status: status || undefined,
    cursor: cursor || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Port Pair Trade Lanes
          </h1>
          <p className="text-sm text-gray-500">
            Manage origin-destination port pairs and trade lane metrics
          </p>
        </div>
        {canCreate && (
          <Link
            href="/liner-trade-route-management/port-pair-trade-lanes/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Trade Lane
          </Link>
        )}
      </div>

      <form method="get" className="flex items-center gap-2">
        <input
          name="search"
          type="text"
          defaultValue={search || ""}
          placeholder="Search by ref or origin port..."
          className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          name="status"
          defaultValue={status || ""}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="suspended">Suspended</option>
          <option value="discontinued">Discontinued</option>
        </select>
        <button
          type="submit"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Search
        </button>
      </form>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No port pair trade lanes found.</p>
          {canCreate && (
            <Link
              href="/liner-trade-route-management/port-pair-trade-lanes/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first trade lane
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
                    Trade Lane Ref
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Origin Port
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Destination Port
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Trade Direction
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Distance (NM)
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((lane) => (
                  <tr
                    key={lane.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/liner-trade-route-management/port-pair-trade-lanes/${lane.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {lane.tradeLaneRef}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {lane.originPort}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {lane.destinationPort}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {lane.tradeDirection}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {lane.distanceNm ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          statusVariant[
                            lane.status as keyof typeof statusVariant
                          ] ?? "secondary"
                        }
                      >
                        {lane.status}
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
                href={`/liner-trade-route-management/port-pair-trade-lanes?${new URLSearchParams({
                  ...(search ? { search } : {}),
                  ...(status ? { status } : {}),
                  cursor: meta.cursor,
                }).toString()}`}
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
