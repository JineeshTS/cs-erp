import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { WneForm } from "@/components/workflow-notification-engine/wne-form";
import type { FieldConfig } from "@/components/workflow-notification-engine/wne-form";

const TEMPLATE_FIELDS: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", required: true },
  {
    name: "channel",
    label: "Channel",
    type: "select",
    required: true,
    options: [
      { value: "email", label: "Email" },
      { value: "whatsapp", label: "WhatsApp" },
      { value: "sms", label: "SMS" },
      { value: "in_app", label: "In-App" },
    ],
  },
  {
    name: "subject",
    label: "Subject",
    type: "text",
    placeholder: "Email subject line",
  },
  {
    name: "bodyTemplate",
    label: "Body Template",
    type: "textarea",
    required: true,
    placeholder: "Use {{variable}} for dynamic content",
  },
  {
    name: "bodyHtml",
    label: "HTML Body",
    type: "textarea",
    placeholder: "HTML version for email",
  },
  {
    name: "locale",
    label: "Locale",
    type: "select",
    options: [
      { value: "en", label: "English" },
      { value: "ar", label: "Arabic" },
      { value: "hi", label: "Hindi" },
    ],
  },
  {
    name: "entityType",
    label: "Entity Type",
    type: "select",
    options: [
      { value: "booking", label: "Booking" },
      { value: "invoice", label: "Invoice" },
      { value: "shipment", label: "Shipment" },
      { value: "customs_declaration", label: "Customs Declaration" },
      { value: "payment", label: "Payment" },
    ],
  },
  {
    name: "triggerEvent",
    label: "Trigger Event",
    type: "text",
    placeholder: "e.g. booking.created, invoice.approved",
  },
  { name: "isActive", label: "Active", type: "checkbox" },
];

export default async function NewNotificationTemplatePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(
      session.id,
      session.tenantId,
      "notifications:create"
    ))
  )
    redirect("/workflow-notification-engine/notification-templates");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/workflow-notification-engine/notification-templates"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Notification Template
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <WneForm
          entityType="Notification Template"
          apiPath="/api/v1/workflow-notification-engine/notification-templates"
          fields={TEMPLATE_FIELDS}
          initialData={{ locale: "en", isActive: true }}
          returnPath="/workflow-notification-engine/notification-templates"
        />
      </div>
    </div>
  );
}
