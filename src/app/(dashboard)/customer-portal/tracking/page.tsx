import Link from "next/link";
import { Plus, Search, MapPin } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listTracking } from "@/lib/customer-portal/service";
import { Badge } from "@/components/ui/badge";

function statusBadgeVariant(status: string) {
  switch (status) {
    case "delivered":
      return "success" as const;
    case "returned":
      return "destructive" as const;
    case "in_transit":
      return "default" as const;
    case "customs_hold":
      return "warning" as const;
    case "at_port":
      return "secondary" as const;
    case "booked":
    default:
      return "secondary" as const;
  }
}

export default async function TrackingListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "portal:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "portal:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";

  const { data: items, meta } = await listTracking({
    tenantId: session.tenantId,
    search: search || undefined,
    status: status || undefined,
    cursor: cursor || undefined,
  });

  const hasMore = meta.hasMore;
  const nextCursor = meta.cursor;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/customer-portal/tracking?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Shipment Tracking
          </h1>
          <p className="text-sm text-gray-500">
            Track your shipments in real time
          </p>
        </div>
        {canCreate && (
          <Link
            href="/customer-portal/tracking/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> New Tracking
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
              placeholder="Tracking number or BL number..."
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
            <option value="booked">Booked</option>
            <option value="in_transit">In Transit</option>
            <option value="at_port">At Port</option>
            <option value="customs_hold">Customs Hold</option>
            <option value="delivered">Delivered</option>
            <option value="returned">Returned</option>
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
            href="/customer-portal/tracking"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <MapPin className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No tracking records found.</p>
          {canCreate && (
            <Link
              href="/customer-portal/tracking/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first tracking record
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Tracking Number
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  BL Number
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Vessel
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Origin
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Destination
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Current Status
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  ETA
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
                      href={`/customer-portal/tracking/${t.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {t.trackingNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.blNumber ?? "\u2014"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.vesselName ?? "\u2014"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.originPort}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.destinationPort}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadgeVariant(t.currentStatus)}>
                      {t.currentStatus.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.eta ? t.eta.toLocaleDateString() : "\u2014"}
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
