import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listDetentionTrackings } from "@/lib/demurrage-detention-management/service";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "success" | "secondary" | "warning" | "destructive"> = {
  active: "warning",
  completed: "success",
  invoiced: "secondary",
  closed: "destructive",
};

export default async function DetentionTrackingsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "demurrage:read")))
    redirect("/demurrage-detention-management");

  const { search, status, cursor } = await searchParams;

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "demurrage:create"
  );

  const { data, meta } = await listDetentionTrackings({
    tenantId: session.tenantId,
    search: search ?? undefined,
    status: status ?? undefined,
    cursor: cursor ?? undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Detention Trackings
          </h1>
          <p className="text-sm text-gray-500">
            Track container detention periods and charges
          </p>
        </div>
        {canCreate && (
          <Link
            href="/demurrage-detention-management/detention-trackings/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Detention Tracking
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No detention trackings found.</p>
          {canCreate && (
            <Link
              href="/demurrage-detention-management/detention-trackings/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first detention tracking
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Tracking Ref
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Container Number
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Customer Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Gate Out Date
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Total Amount
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((tracking) => (
                <tr
                  key={tracking.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/demurrage-detention-management/detention-trackings/${tracking.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {tracking.trackingRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {tracking.containerNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {tracking.customerName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {tracking.gateOutDate
                      ? new Date(tracking.gateOutDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {tracking.currency} {tracking.totalAmount}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={STATUS_VARIANT[tracking.status] ?? "secondary"}
                    >
                      {tracking.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta.hasMore && (
        <div className="flex justify-center">
          <Link
            href={`/demurrage-detention-management/detention-trackings?cursor=${meta.cursor}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Load more
          </Link>
        </div>
      )}
    </div>
  );
}
