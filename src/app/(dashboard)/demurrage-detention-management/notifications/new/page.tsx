import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { DdmForm } from "@/components/demurrage-detention-management/ddm-form";
import type { FieldConfig } from "@/components/demurrage-detention-management/ddm-form";

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
  { name: "customerName", label: "Customer Name", type: "text", required: true },
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

export default async function NewNotificationPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "demurrage:create"))
  )
    redirect("/demurrage-detention-management/notifications");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/demurrage-detention-management/notifications"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Notification</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DdmForm
          entityType="Notification"
          apiPath="/api/v1/demurrage-detention-management/notifications"
          fields={NOTIFICATION_FIELDS}
          returnPath="/demurrage-detention-management/notifications"
        />
      </div>
    </div>
  );
}
