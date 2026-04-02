import Link from "next/link";
import { ArrowLeft, Bell } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { wneNotifications } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const statusVariant = (status: string) => {
  switch (status) {
    case "pending":
      return "secondary" as const;
    case "sent":
      return "default" as const;
    case "delivered":
      return "success" as const;
    case "read":
      return "outline" as const;
    case "failed":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
};

const priorityVariant = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "destructive" as const;
    case "high":
      return "warning" as const;
    case "normal":
      return "secondary" as const;
    case "low":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
};

export default async function NotificationsListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "notifications:read"))
  )
    redirect("/workflow-notification-engine");

  const data = await db
    .select()
    .from(wneNotifications)
    .where(
      and(
        eq(wneNotifications.tenantId, session.tenantId),
        isNull(wneNotifications.deletedAt)
      )
    )
    .orderBy(desc(wneNotifications.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/workflow-notification-engine"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500">
              View system-generated notifications and their delivery status
            </p>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Bell className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No notifications found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Title
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Channel
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Priority
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Created At
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
                      href={`/workflow-notification-engine/notifications/${notification.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {notification.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {notification.channel}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={priorityVariant(notification.priority)}>
                      {notification.priority}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(notification.status)}>
                      {notification.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {notification.createdAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
