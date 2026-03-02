import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDdmNotification } from "@/lib/demurrage-detention-management/service";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "success" | "secondary" | "warning" | "destructive"> = {
  pending: "warning",
  sent: "success",
  delivered: "success",
  failed: "destructive",
  cancelled: "secondary",
};

export default async function NotificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "demurrage:read")))
    redirect("/demurrage-detention-management");

  const { id } = await params;

  const notification = await getDdmNotification(id, session.tenantId);
  if (!notification) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "demurrage:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/demurrage-detention-management/notifications"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {notification.notificationRef}
          </h1>
          <p className="text-sm text-gray-500">Notification Details</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/demurrage-detention-management/notifications/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Notification Ref</dt>
            <dd className="mt-1 text-gray-900">{notification.notificationRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Notification Type</dt>
            <dd className="mt-1 text-gray-900">{notification.notificationType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Channel</dt>
            <dd className="mt-1 text-gray-900">{notification.channel}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
            <dd className="mt-1 text-gray-900">{notification.customerName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Customer Email</dt>
            <dd className="mt-1 text-gray-900">{notification.customerEmail || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Customer Phone</dt>
            <dd className="mt-1 text-gray-900">{notification.customerPhone || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Number</dt>
            <dd className="mt-1 text-gray-900">{notification.containerNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Booking Ref</dt>
            <dd className="mt-1 text-gray-900">{notification.bookingRef || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Subject</dt>
            <dd className="mt-1 text-gray-900">{notification.subject}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Body</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {notification.body || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Template Name</dt>
            <dd className="mt-1 text-gray-900">{notification.templateName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Scheduled At</dt>
            <dd className="mt-1 text-gray-900">
              {notification.scheduledAt
                ? new Date(notification.scheduledAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sent At</dt>
            <dd className="mt-1 text-gray-900">
              {notification.sentAt
                ? new Date(notification.sentAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Delivered At</dt>
            <dd className="mt-1 text-gray-900">
              {notification.deliveredAt
                ? new Date(notification.deliveredAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Failed At</dt>
            <dd className="mt-1 text-gray-900">
              {notification.failedAt
                ? new Date(notification.failedAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Failure Reason</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {notification.failureReason || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Retry Count</dt>
            <dd className="mt-1 text-gray-900">{notification.retryCount ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Related Entity Type</dt>
            <dd className="mt-1 text-gray-900">{notification.relatedEntityType || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={STATUS_VARIANT[notification.status] ?? "secondary"}>
                {notification.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {notification.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
