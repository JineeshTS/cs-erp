import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { adminFeatureConfigs } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function FeatureConfigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:read")))
    redirect("/admin-portal");

  const { id } = await params;

  const featureConfig = await db
    .select()
    .from(adminFeatureConfigs)
    .where(
      and(
        eq(adminFeatureConfigs.id, id),
        eq(adminFeatureConfigs.tenantId, session.tenantId),
        isNull(adminFeatureConfigs.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!featureConfig) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "admin:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin-portal/feature-configs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {featureConfig.featureName}
          </h1>
          <p className="text-sm text-gray-500">{featureConfig.featureSlug}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/admin-portal/feature-configs/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Feature Name</dt>
            <dd className="mt-1 text-gray-900">
              {featureConfig.featureName}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Feature Slug</dt>
            <dd className="mt-1 text-gray-900">
              {featureConfig.featureSlug}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Module Config ID
            </dt>
            <dd className="mt-1 text-gray-900">
              {featureConfig.moduleConfigId}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Enabled</dt>
            <dd className="mt-1">
              <Badge
                variant={featureConfig.isEnabled ? "success" : "secondary"}
              >
                {featureConfig.isEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Settings</dt>
            <dd className="mt-1 text-gray-900">
              {featureConfig.settings
                ? JSON.stringify(featureConfig.settings)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Metadata</dt>
            <dd className="mt-1 text-gray-900">
              {featureConfig.metadata
                ? JSON.stringify(featureConfig.metadata)
                : "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">
              {featureConfig.description || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {featureConfig.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {featureConfig.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
