import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listPortEquipments } from "@/lib/real-time-iot-asset-tracking/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  active: "success",
  verified: "success",
  submitted: "warning",
  rejected: "destructive",
} as const;

export default async function PortEquipmentsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "iot:read")))
    redirect("/real-time-iot-asset-tracking");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "iot:create"
  );

  const sp = await searchParams;
  const search = sp.search || "";
  const cursor = sp.cursor;

  const { data, meta } = await listPortEquipments({
    tenantId: session.tenantId,
    search: search || undefined,
    cursor,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Port Equipments
          </h1>
          <p className="text-sm text-gray-500">
            Port equipment IoT monitoring and tracking
          </p>
        </div>
        {canCreate && (
          <Link
            href="/real-time-iot-asset-tracking/port-equipments/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Port Equipment
          </Link>
        )}
      </div>

      <form method="get" className="flex items-center gap-2">
        <input
          name="search"
          type="text"
          defaultValue={search}
          placeholder="Search by equipment ref or name..."
          className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Search
        </button>
      </form>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No port equipments found.</p>
          {canCreate && (
            <Link
              href="/real-time-iot-asset-tracking/port-equipments/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first port equipment
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
                    Ref
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Equipment
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Type
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Port
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Operational
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/real-time-iot-asset-tracking/port-equipments/${record.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {record.equipmentRef}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {record.equipmentName || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {record.equipmentType}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {record.portCode || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {record.operationalStatus || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          statusVariant[
                            record.status as keyof typeof statusVariant
                          ] ?? "secondary"
                        }
                      >
                        {record.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta.hasMore && meta.cursor && (
            <div className="flex justify-center">
              <Link
                href={`/real-time-iot-asset-tracking/port-equipments?cursor=${encodeURIComponent(meta.cursor)}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Load More
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
