import Link from "next/link";
import { ArrowLeft, Pencil, Clock } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { wneSlaDefinitions, wneSlaInstances } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const priorityVariant = {
  critical: "destructive",
  high: "warning",
  medium: "secondary",
  low: "outline",
} as const;

const instanceStatusVariant = {
  on_track: "success",
  warning: "warning",
  breached: "destructive",
  completed: "secondary",
} as const;

export default async function SlaDefinitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sla:read")))
    redirect("/workflow-notification-engine");

  const { id } = await params;

  const [sla, instances] = await Promise.all([
    db
      .select()
      .from(wneSlaDefinitions)
      .where(
        and(
          eq(wneSlaDefinitions.id, id),
          eq(wneSlaDefinitions.tenantId, session.tenantId),
          isNull(wneSlaDefinitions.deletedAt)
        )
      )
      .limit(1)
      .then((r) => r[0]),
    db
      .select()
      .from(wneSlaInstances)
      .where(
        and(
          eq(wneSlaInstances.slaDefinitionId, id),
          isNull(wneSlaInstances.deletedAt)
        )
      )
      .orderBy(desc(wneSlaInstances.createdAt)),
  ]);

  if (!sla) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "sla:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/workflow-notification-engine/sla-definitions"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{sla.name}</h1>
          <p className="text-sm text-gray-500">
            {sla.entityType} &middot; {sla.triggerEvent}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/workflow-notification-engine/sla-definitions/${id}/edit`}
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
            <dd className="mt-1 text-gray-900">{sla.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Entity Type</dt>
            <dd className="mt-1 text-gray-900">{sla.entityType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Trigger Event
            </dt>
            <dd className="mt-1 text-gray-900">{sla.triggerEvent}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Target Hours</dt>
            <dd className="mt-1 text-gray-900">{sla.targetHours}h</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Warning Hours
            </dt>
            <dd className="mt-1 text-gray-900">{sla.warningHours}h</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Critical Hours
            </dt>
            <dd className="mt-1 text-gray-900">{sla.criticalHours}h</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Priority</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  priorityVariant[
                    sla.priority as keyof typeof priorityVariant
                  ] ?? "secondary"
                }
              >
                {sla.priority}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={sla.isActive ? "success" : "secondary"}>
                {sla.isActive ? "Active" : "Inactive"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {sla.createdAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          SLA Instances ({instances.length})
        </h2>
        {instances.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center">
            <Clock className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-gray-500">
              No SLA instances tracked yet.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Entity Type
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Entity ID
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Due At
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Started At
                  </th>
                </tr>
              </thead>
              <tbody>
                {instances.map((inst) => (
                  <tr
                    key={inst.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          instanceStatusVariant[
                            inst.status as keyof typeof instanceStatusVariant
                          ] ?? "secondary"
                        }
                      >
                        {inst.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {inst.entityType}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {inst.entityId}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {inst.dueAt.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {inst.startedAt.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
