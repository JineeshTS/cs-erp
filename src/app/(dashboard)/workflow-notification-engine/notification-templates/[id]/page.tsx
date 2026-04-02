import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { wneNotificationTemplates } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const channelBadgeVariant: Record<
  string,
  "default" | "success" | "warning" | "secondary"
> = {
  email: "default",
  whatsapp: "success",
  sms: "warning",
  in_app: "secondary",
};

const channelLabel: Record<string, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  sms: "SMS",
  in_app: "In-App",
};

export default async function NotificationTemplateDetailPage({
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

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "notifications:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/workflow-notification-engine/notification-templates"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
          <p className="text-sm text-gray-500">
            {template.slug} &middot; {template.locale}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/workflow-notification-engine/notification-templates/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-gray-900">{template.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Slug</dt>
            <dd className="mt-1 text-gray-900">{template.slug}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Channel</dt>
            <dd className="mt-1">
              <Badge
                variant={channelBadgeVariant[template.channel] ?? "default"}
              >
                {channelLabel[template.channel] ?? template.channel}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Subject</dt>
            <dd className="mt-1 text-gray-900">{template.subject || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Locale</dt>
            <dd className="mt-1 text-gray-900">{template.locale}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Active</dt>
            <dd className="mt-1">
              <Badge variant={template.isActive ? "success" : "secondary"}>
                {template.isActive ? "Active" : "Inactive"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Entity Type</dt>
            <dd className="mt-1 text-gray-900">
              {template.entityType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Trigger Event
            </dt>
            <dd className="mt-1 text-gray-900">
              {template.triggerEvent || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {template.createdAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Body Template
        </h2>
        <div className="rounded-lg border bg-white p-6">
          <pre className="whitespace-pre-wrap text-sm text-gray-800">
            <code>{template.bodyTemplate}</code>
          </pre>
        </div>
      </div>

      {template.bodyHtml && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            HTML Body
          </h2>
          <div className="rounded-lg border bg-white p-6">
            <pre className="whitespace-pre-wrap text-sm text-gray-800">
              <code>{template.bodyHtml}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
