import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { adminFeatureConfigs } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function FeatureConfigsListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:read")))
    redirect("/admin-portal");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "admin:create"
  );

  const data = await db
    .select()
    .from(adminFeatureConfigs)
    .where(
      and(
        eq(adminFeatureConfigs.tenantId, session.tenantId),
        isNull(adminFeatureConfigs.deletedAt)
      )
    )
    .orderBy(desc(adminFeatureConfigs.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feature Configs</h1>
          <p className="text-sm text-gray-500">
            Manage feature configurations per module
          </p>
        </div>
        {canCreate && (
          <Link
            href="/admin-portal/feature-configs/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Feature Config
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No feature configs found.</p>
          {canCreate && (
            <Link
              href="/admin-portal/feature-configs/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first feature config
            </Link>
          )}
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
                  Module Config ID
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
              {data.map((config) => (
                <tr
                  key={config.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin-portal/feature-configs/${config.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {config.featureName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {config.featureSlug}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {config.moduleConfigId.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={config.isEnabled ? "success" : "secondary"}
                    >
                      {config.isEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {config.createdAt.toLocaleDateString()}
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
