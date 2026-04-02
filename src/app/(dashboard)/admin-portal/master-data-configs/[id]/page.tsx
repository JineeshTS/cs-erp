import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { adminMasterDataConfigs } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function MasterDataConfigDetailPage({
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
    .from(adminMasterDataConfigs)
    .where(
      and(
        eq(adminMasterDataConfigs.id, id),
        eq(adminMasterDataConfigs.tenantId, session.tenantId),
        isNull(adminMasterDataConfigs.deletedAt)
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
          href="/admin-portal/master-data-configs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {config.entityName}
          </h1>
          <p className="text-sm text-gray-500">{config.entityType}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/admin-portal/master-data-configs/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Entity Name</dt>
            <dd className="mt-1 text-gray-900">{config.entityName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Entity Type</dt>
            <dd className="mt-1 text-gray-900">{config.entityType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Record Count</dt>
            <dd className="mt-1 text-gray-900">{config.recordCount}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Locked</dt>
            <dd className="mt-1">
              <Badge variant={config.isLocked ? "destructive" : "success"}>
                {config.isLocked ? "Locked" : "Unlocked"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Synced</dt>
            <dd className="mt-1 text-gray-900">
              {config.lastSyncedAt
                ? config.lastSyncedAt.toLocaleString()
                : "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">
              {config.description || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Validation Rules
            </dt>
            <dd className="mt-1">
              {config.validationRules ? (
                <pre className="overflow-x-auto rounded bg-gray-50 p-3 text-xs text-gray-800">
                  {JSON.stringify(config.validationRules, null, 2)}
                </pre>
              ) : (
                <span className="text-gray-900">-</span>
              )}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Default Values
            </dt>
            <dd className="mt-1">
              {config.defaultValues ? (
                <pre className="overflow-x-auto rounded bg-gray-50 p-3 text-xs text-gray-800">
                  {JSON.stringify(config.defaultValues, null, 2)}
                </pre>
              ) : (
                <span className="text-gray-900">-</span>
              )}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Required Fields
            </dt>
            <dd className="mt-1">
              {config.requiredFields ? (
                <pre className="overflow-x-auto rounded bg-gray-50 p-3 text-xs text-gray-800">
                  {JSON.stringify(config.requiredFields, null, 2)}
                </pre>
              ) : (
                <span className="text-gray-900">-</span>
              )}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Unique Fields
            </dt>
            <dd className="mt-1">
              {config.uniqueFields ? (
                <pre className="overflow-x-auto rounded bg-gray-50 p-3 text-xs text-gray-800">
                  {JSON.stringify(config.uniqueFields, null, 2)}
                </pre>
              ) : (
                <span className="text-gray-900">-</span>
              )}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Metadata</dt>
            <dd className="mt-1">
              {config.metadata ? (
                <pre className="overflow-x-auto rounded bg-gray-50 p-3 text-xs text-gray-800">
                  {JSON.stringify(config.metadata, null, 2)}
                </pre>
              ) : (
                <span className="text-gray-900">-</span>
              )}
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
    </div>
  );
}
