import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listDdmNotifications } from "@/lib/demurrage-detention-management/service";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "success" | "secondary" | "warning" | "destructive"> = {
  pending: "warning",
  sent: "success",
  delivered: "success",
  failed: "destructive",
  cancelled: "secondary",
};

export default async function NotificationsListPage({
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

  const { data, meta } = await listDdmNotifications({
    tenantId: session.tenantId,
    search,
    status,
    cursor,
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            D&D Notifications
          </h1>
          <p className="text-sm text-gray-500">
            Manage demurrage and detention notification alerts
          </p>
        </div>
        {canCreate && (
          <Link
            href="/demurrage-detention-management/notifications/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Notification
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No notifications found.</p>
          {canCreate && (
            <Link
              href="/demurrage-detention-management/notifications/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first notification
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Notification Ref
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Notification Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Channel
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Customer
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Subject
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((notification) => (
                <tr
                  key={notification.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/demurrage-detention-management/notifications/${notification.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {notification.notificationRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {notification.notificationType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {notification.channel}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {notification.customerName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {notification.subject}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[notification.status] ?? "secondary"}>
                      {notification.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta.hasMore && meta.cursor && (
        <div className="flex justify-center">
          <Link
            href={`/demurrage-detention-management/notifications?cursor=${encodeURIComponent(meta.cursor)}${status ? `&status=${encodeURIComponent(status)}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Load More
          </Link>
        </div>
      )}
    </div>
  );
}
