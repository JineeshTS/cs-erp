import Link from "next/link";
import { ArrowLeft, Bell } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
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

function formatTimestamp(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function NotificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "notifications:read"))
  )
    redirect("/workflow-notification-engine");

  const { id } = await params;

  const notification = await db
    .select()
    .from(wneNotifications)
    .where(
      and(
        eq(wneNotifications.id, id),
        eq(wneNotifications.tenantId, session.tenantId),
        isNull(wneNotifications.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!notification) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/workflow-notification-engine/notifications"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {notification.title}
          </h1>
          <p className="text-sm text-gray-500">Notification details</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Title</dt>
            <dd className="mt-1 text-gray-900">{notification.title}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Body</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {notification.body}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Channel</dt>
            <dd className="mt-1 text-gray-900">{notification.channel}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Priority</dt>
            <dd className="mt-1">
              <Badge variant={priorityVariant(notification.priority)}>
                {notification.priority}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={statusVariant(notification.status)}>
                {notification.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Entity Type</dt>
            <dd className="mt-1 text-gray-900">
              {notification.entityType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Entity ID</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {notification.entityId || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Action URL</dt>
            <dd className="mt-1 text-gray-900">
              {notification.actionUrl ? (
                <a
                  href={notification.actionUrl}
                  className="text-blue-600 hover:underline"
                >
                  {notification.actionUrl}
                </a>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">User ID</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {notification.userId}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Timestamps</h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {formatTimestamp(notification.createdAt)}
            </dd>
          </div>
          {notification.sentAt && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Sent At</dt>
              <dd className="mt-1 text-gray-900">
                {formatTimestamp(notification.sentAt)}
              </dd>
            </div>
          )}
          {notification.deliveredAt && (
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Delivered At
              </dt>
              <dd className="mt-1 text-gray-900">
                {formatTimestamp(notification.deliveredAt)}
              </dd>
            </div>
          )}
          {notification.readAt && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Read At</dt>
              <dd className="mt-1 text-gray-900">
                {formatTimestamp(notification.readAt)}
              </dd>
            </div>
          )}
          {notification.failedAt && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Failed At</dt>
              <dd className="mt-1 text-gray-900">
                {formatTimestamp(notification.failedAt)}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {notification.failureReason && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-800">
            Failure Reason
          </h2>
          <p className="whitespace-pre-wrap text-sm text-red-700">
            {notification.failureReason}
          </p>
        </div>
      )}
    </div>
  );
}
