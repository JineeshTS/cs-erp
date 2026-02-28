import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { adminNotificationConfigs } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function NotificationConfigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:read")))
    redirect("/admin-portal");

  const { id } = await params;

  const config = await db
    .select()
    .from(adminNotificationConfigs)
    .where(
      and(
        eq(adminNotificationConfigs.id, id),
        eq(adminNotificationConfigs.tenantId, session.tenantId),
        isNull(adminNotificationConfigs.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!config) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "admin:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin-portal/notification-configs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{config.name}</h1>
          <p className="text-sm text-gray-500">{config.slug}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/admin-portal/notification-configs/${id}/edit`}
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
            <dd className="mt-1 text-gray-900">{config.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Slug</dt>
            <dd className="mt-1 text-gray-900">{config.slug}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Channel</dt>
            <dd className="mt-1">
              <Badge variant="secondary">{config.channel}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Event Trigger
            </dt>
            <dd className="mt-1 text-gray-900">{config.eventTrigger}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Subject</dt>
            <dd className="mt-1 text-gray-900">{config.subject || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Priority</dt>
            <dd className="mt-1 text-gray-900">{config.priority}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Recipient Type
            </dt>
            <dd className="mt-1 text-gray-900">{config.recipientType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Active</dt>
            <dd className="mt-1">
              <Badge variant={config.isActive ? "success" : "secondary"}>
                {config.isActive ? "Active" : "Inactive"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Recipient Config
            </dt>
            <dd className="mt-1 text-gray-900">
              {config.recipientConfig
                ? JSON.stringify(config.recipientConfig)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Variables</dt>
            <dd className="mt-1 text-gray-900">
              {config.variables ? JSON.stringify(config.variables) : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Metadata</dt>
            <dd className="mt-1 text-gray-900">
              {config.metadata ? JSON.stringify(config.metadata) : "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">
              {config.description || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {config.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {config.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Body Template
        </h2>
        <pre className="overflow-auto rounded-md bg-gray-50 p-4 text-sm text-gray-800">
          {config.bodyTemplate}
        </pre>
      </div>
    </div>
  );
}
