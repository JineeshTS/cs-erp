import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { AdminForm } from "@/components/admin-portal/admin-form";
import type { FieldConfig } from "@/components/admin-portal/admin-form";

const NOTIFICATION_CONFIG_FIELDS: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  {
    name: "channel",
    label: "Channel",
    type: "select",
    options: [
      { value: "email", label: "Email" },
      { value: "sms", label: "SMS" },
      { value: "whatsapp", label: "WhatsApp" },
      { value: "in_app", label: "In-App" },
      { value: "push", label: "Push" },
    ],
  },
  {
    name: "eventTrigger",
    label: "Event Trigger",
    type: "text",
    required: true,
    placeholder: "e.g. booking.created",
  },
  { name: "subject", label: "Subject", type: "text" },
  {
    name: "bodyTemplate",
    label: "Body Template",
    type: "textarea",
    required: true,
  },
  {
    name: "priority",
    label: "Priority",
    type: "select",
    options: [
      { value: "low", label: "Low" },
      { value: "normal", label: "Normal" },
      { value: "high", label: "High" },
      { value: "urgent", label: "Urgent" },
    ],
  },
  {
    name: "recipientType",
    label: "Recipient Type",
    type: "select",
    options: [
      { value: "user", label: "User" },
      { value: "role", label: "Role" },
      { value: "group", label: "Group" },
      { value: "custom", label: "Custom" },
    ],
  },
  { name: "isActive", label: "Active", type: "checkbox" },
];

export default async function NewNotificationConfigPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "admin:create"))
  )
    redirect("/admin-portal/notification-configs");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin-portal/notification-configs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Notification Config
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AdminForm
          entityType="Notification Config"
          apiPath="/api/v1/admin-portal/notification-configs"
          fields={NOTIFICATION_CONFIG_FIELDS}
          returnPath="/admin-portal/notification-configs"
        />
      </div>
    </div>
  );
}
