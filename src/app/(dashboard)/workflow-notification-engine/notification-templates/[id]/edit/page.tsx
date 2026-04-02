import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { wneNotificationTemplates } from "@/db/schema";
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

export default async function EditNotificationTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "notifications:edit"))
  )
    redirect("/workflow-notification-engine/notification-templates");

  const { id } = await params;

  const template = await db
    .select()
    .from(wneNotificationTemplates)
    .where(
      and(
        eq(wneNotificationTemplates.id, id),
        eq(wneNotificationTemplates.tenantId, session.tenantId),
        isNull(wneNotificationTemplates.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!template) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/workflow-notification-engine/notification-templates/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Notification Template
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <WneForm
          entityType="Notification Template"
          apiPath={`/api/v1/workflow-notification-engine/notification-templates/${id}`}
          fields={TEMPLATE_FIELDS}
          initialData={{
            name: template.name,
            slug: template.slug,
            channel: template.channel,
            subject: template.subject ?? "",
            bodyTemplate: template.bodyTemplate,
            bodyHtml: template.bodyHtml ?? "",
            locale: template.locale,
            entityType: template.entityType ?? "",
            triggerEvent: template.triggerEvent ?? "",
            isActive: template.isActive,
          }}
          isEdit
          returnPath={`/workflow-notification-engine/notification-templates/${id}`}
        />
      </div>
    </div>
  );
}
