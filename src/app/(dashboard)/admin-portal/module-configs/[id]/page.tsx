import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { adminModuleConfigs, adminFeatureConfigs } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function ModuleConfigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:read")))
    redirect("/admin-portal");

  const { id } = await params;

  const [moduleConfig, features] = await Promise.all([
    db
      .select()
      .from(adminModuleConfigs)
      .where(
        and(
          eq(adminModuleConfigs.id, id),
          eq(adminModuleConfigs.tenantId, session.tenantId),
          isNull(adminModuleConfigs.deletedAt)
        )
      )
      .limit(1)
      .then((r) => r[0]),
    db
      .select()
      .from(adminFeatureConfigs)
      .where(
        and(
          eq(adminFeatureConfigs.moduleConfigId, id),
          eq(adminFeatureConfigs.tenantId, session.tenantId),
          isNull(adminFeatureConfigs.deletedAt)
        )
      )
      .orderBy(desc(adminFeatureConfigs.createdAt)),
  ]);

  if (!moduleConfig) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "admin:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin-portal/module-configs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {moduleConfig.moduleName}
          </h1>
          <p className="text-sm text-gray-500">{moduleConfig.moduleSlug}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/admin-portal/module-configs/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Module Name</dt>
            <dd className="mt-1 text-gray-900">{moduleConfig.moduleName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Module Slug</dt>
            <dd className="mt-1 text-gray-900">{moduleConfig.moduleSlug}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sort Order</dt>
            <dd className="mt-1 text-gray-900">{moduleConfig.sortOrder}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Enabled</dt>
            <dd className="mt-1">
              <Badge
                variant={moduleConfig.isEnabled ? "success" : "secondary"}
              >
                {moduleConfig.isEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Settings</dt>
            <dd className="mt-1 text-gray-900">
              {moduleConfig.settings
                ? JSON.stringify(moduleConfig.settings)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Metadata</dt>
            <dd className="mt-1 text-gray-900">
              {moduleConfig.metadata
                ? JSON.stringify(moduleConfig.metadata)
                : "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">
              {moduleConfig.description || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {moduleConfig.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {moduleConfig.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Feature Configs ({features.length})
        </h2>
        {features.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center">
            <p className="text-gray-500">
              No feature configs for this module.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Feature Name
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Enabled
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature) => (
                  <tr
                    key={feature.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin-portal/feature-configs/${feature.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {feature.featureName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {feature.featureSlug}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={feature.isEnabled ? "success" : "secondary"}
                      >
                        {feature.isEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {feature.createdAt.toLocaleDateString()}
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
