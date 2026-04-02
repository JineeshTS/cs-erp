import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDdmNotification } from "@/lib/demurrage-detention-management/service";
import { DdmForm } from "@/components/demurrage-detention-management/ddm-form";
import type { FieldConfig } from "@/components/demurrage-detention-management/ddm-form";
import { getCustomerOptions } from "@/lib/lookups";

export default async function EditNotificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "demurrage:edit")))
    redirect("/demurrage-detention-management/notifications");

  const customerOpts = await getCustomerOptions(session.tenantId);

  const NOTIFICATION_FIELDS: FieldConfig[] = [
    {
      name: "notificationType",
      label: "Notification Type",
      type: "select",
      required: true,
      options: [
        { value: "free_time_expiry", label: "Free Time Expiry" },
        { value: "demurrage_start", label: "Demurrage Start" },
        { value: "detention_start", label: "Detention Start" },
        { value: "invoice", label: "Invoice" },
        { value: "reminder", label: "Reminder" },
        { value: "escalation", label: "Escalation" },
        { value: "custom", label: "Custom" },
      ],
    },
    {
      name: "channel",
      label: "Channel",
      type: "select",
      required: true,
      options: [
        { value: "email", label: "Email" },
        { value: "sms", label: "SMS" },
        { value: "portal", label: "Portal" },
        { value: "whatsapp", label: "WhatsApp" },
      ],
    },
    { name: "customerName", label: "Customer Name", type: "select", options: customerOpts, required: true },
    { name: "customerEmail", label: "Customer Email", type: "text" },
    { name: "customerPhone", label: "Customer Phone", type: "text" },
    { name: "containerNumber", label: "Container Number", type: "text" },
    { name: "bookingRef", label: "Booking Ref", type: "text" },
    { name: "subject", label: "Subject", type: "text", required: true },
    { name: "body", label: "Body", type: "textarea", required: true },
    { name: "templateName", label: "Template Name", type: "text" },
    { name: "scheduledAt", label: "Scheduled At", type: "datetime-local" },
    { name: "relatedEntityType", label: "Related Entity Type", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;

  const notification = await getDdmNotification(id, session.tenantId);
  if (!notification) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/demurrage-detention-management/notifications/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Notification</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DdmForm
          entityType="Notification"
          apiPath={`/api/v1/demurrage-detention-management/notifications/${id}`}
          fields={NOTIFICATION_FIELDS}
          initialData={{
            notificationType: notification.notificationType ?? "",
            channel: notification.channel ?? "",
            customerName: notification.customerName ?? "",
            customerEmail: notification.customerEmail ?? "",
            customerPhone: notification.customerPhone ?? "",
            containerNumber: notification.containerNumber ?? "",
            bookingRef: notification.bookingRef ?? "",
            subject: notification.subject ?? "",
            body: notification.body ?? "",
            templateName: notification.templateName ?? "",
            scheduledAt: notification.scheduledAt
              ? new Date(notification.scheduledAt).toISOString()
              : "",
            relatedEntityType: notification.relatedEntityType ?? "",
            notes: notification.notes ?? "",
          }}
          isEdit
          returnPath={`/demurrage-detention-management/notifications/${id}`}
        />
      </div>
    </div>
  );
}
