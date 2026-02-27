import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { wneRoutingRules } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function RoutingRuleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "routing:read")))
    redirect("/workflow-notification-engine");

  const { id } = await params;

  const rule = await db
    .select()
    .from(wneRoutingRules)
    .where(
      and(
        eq(wneRoutingRules.id, id),
        eq(wneRoutingRules.tenantId, session.tenantId),
        isNull(wneRoutingRules.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!rule) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "routing:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/workflow-notification-engine/routing-rules"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{rule.name}</h1>
          <p className="text-sm text-gray-500">Routing Rule Details</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/workflow-notification-engine/routing-rules/${id}/edit`}
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
            <dd className="mt-1 text-gray-900">{rule.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Entity Type</dt>
            <dd className="mt-1 text-gray-900">{rule.entityType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Trigger Event
            </dt>
            <dd className="mt-1 text-gray-900">{rule.triggerEvent}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Priority</dt>
            <dd className="mt-1 text-gray-900">{rule.priority}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Assignment Type
            </dt>
            <dd className="mt-1 text-gray-900">{rule.assignmentType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Assignment Value
            </dt>
            <dd className="mt-1 text-gray-900">{rule.assignmentValue}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Fallback Assignment
            </dt>
            <dd className="mt-1 text-gray-900">
              {rule.fallbackAssignment || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">
              {rule.description || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Active</dt>
            <dd className="mt-1">
              <Badge
                variant={rule.isActive ? "success" : "secondary"}
              >
                {rule.isActive ? "Active" : "Inactive"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {rule.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {rule.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
