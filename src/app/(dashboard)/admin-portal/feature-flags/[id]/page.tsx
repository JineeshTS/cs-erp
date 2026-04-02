import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { adminFeatureFlags } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function FeatureFlagDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:read")))
    redirect("/admin-portal");

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "admin:edit"
  );

  const [flag] = await db
    .select()
    .from(adminFeatureFlags)
    .where(
      and(
        eq(adminFeatureFlags.id, id),
        eq(adminFeatureFlags.tenantId, session.tenantId),
        isNull(adminFeatureFlags.deletedAt)
      )
    )
    .limit(1);

  if (!flag) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin-portal/feature-flags"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{flag.flagName}</h1>
        </div>
        {canEdit && (
          <Link
            href={`/admin-portal/feature-flags/${flag.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Flag Key</dt>
            <dd className="mt-1 text-sm text-gray-900">{flag.flagKey}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Flag Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{flag.flagName}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {flag.description || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Enabled</dt>
            <dd className="mt-1">
              <Badge variant={flag.isEnabled ? "success" : "secondary"}>
                {flag.isEnabled ? "On" : "Off"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Rollout Percentage
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {flag.rolloutPercentage}%
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Target Roles</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {flag.targetRoles
                ? JSON.stringify(flag.targetRoles, null, 2)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Target Users</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {flag.targetUsers
                ? JSON.stringify(flag.targetUsers, null, 2)
                : "-"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Conditions</dt>
            <dd className="mt-1">
              {flag.conditions ? (
                <pre className="rounded-md bg-gray-50 p-3 text-xs text-gray-800 overflow-auto">
                  {JSON.stringify(flag.conditions, null, 2)}
                </pre>
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Expires At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {flag.expiresAt
                ? flag.expiresAt.toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Metadata</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {flag.metadata
                ? JSON.stringify(flag.metadata, null, 2)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {flag.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {flag.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
