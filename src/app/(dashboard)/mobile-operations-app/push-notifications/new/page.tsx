import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { MobForm, type FieldConfig } from "@/components/mobile-operations-app/mob-form";

const PUSH_NOTIFICATION_FIELDS: FieldConfig[] = [
  {
    name: "notificationType",
    label: "Notification Type",
    type: "select",
    required: true,
    options: [
      { value: "alert", label: "Alert" },
      { value: "reminder", label: "Reminder" },
      { value: "update", label: "Update" },
      { value: "broadcast", label: "Broadcast" },
      { value: "escalation", label: "Escalation" },
    ],
  },
  { name: "title", label: "Title", type: "text" },
  { name: "body", label: "Body", type: "textarea" },
  { name: "channel", label: "Channel", type: "text" },
  { name: "priority", label: "Priority", type: "text" },
  { name: "targetAudience", label: "Target Audience", type: "text" },
  { name: "recipientCount", label: "Recipient Count", type: "number" },
  { name: "deliveredCount", label: "Delivered Count", type: "number" },
  { name: "readCount", label: "Read Count", type: "number" },
  { name: "scheduledAt", label: "Scheduled At", type: "datetime-local" },
  { name: "sentAt", label: "Sent At", type: "datetime-local" },
  { name: "expiresAt", label: "Expires At", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewPushNotificationPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "mob:create"))
  )
    redirect("/mobile-operations-app/push-notifications");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/mobile-operations-app/push-notifications"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Push Notification
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MobForm
          entityType="Push Notification"
          apiPath="/api/v1/mobile-operations-app/push-notifications"
          fields={PUSH_NOTIFICATION_FIELDS}
          returnPath="/mobile-operations-app/push-notifications"
        />
      </div>
    </div>
  );
}
