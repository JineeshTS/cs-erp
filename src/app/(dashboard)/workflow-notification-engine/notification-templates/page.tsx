import Link from "next/link";
import { Plus, Mail } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
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

export default async function NotificationTemplatesListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "notifications:read"))
  )
    redirect("/workflow-notification-engine");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "notifications:create"
  );

  const data = await db
    .select()
    .from(wneNotificationTemplates)
    .where(
      and(
        eq(wneNotificationTemplates.tenantId, session.tenantId),
        isNull(wneNotificationTemplates.deletedAt)
      )
    )
    .orderBy(desc(wneNotificationTemplates.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Notification Templates
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Manage email, WhatsApp, SMS, and in-app notification templates
          </p>
        </div>
        {canCreate && (
          <Link
            href="/workflow-notification-engine/notification-templates/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Template
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No notification templates found.</p>
          {canCreate && (
            <Link
              href="/workflow-notification-engine/notification-templates/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first template
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Channel
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Subject
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Locale
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Active
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((template) => (
                <tr
                  key={template.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/workflow-notification-engine/notification-templates/${template.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {template.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        channelBadgeVariant[template.channel] ?? "default"
                      }
                    >
                      {channelLabel[template.channel] ?? template.channel}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {template.subject || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {template.locale}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={template.isActive ? "success" : "secondary"}
                    >
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
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
