import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { adminFeatureFlags } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function FeatureFlagsListPage() {
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
    .from(adminFeatureFlags)
    .where(
      and(
        eq(adminFeatureFlags.tenantId, session.tenantId),
        isNull(adminFeatureFlags.deletedAt)
      )
    )
    .orderBy(desc(adminFeatureFlags.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feature Flags</h1>
          <p className="text-sm text-gray-500">
            Manage feature flags and rollout configurations
          </p>
        </div>
        {canCreate && (
          <Link
            href="/admin-portal/feature-flags/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Flag
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No feature flags found.</p>
          {canCreate && (
            <Link
              href="/admin-portal/feature-flags/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first feature flag
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Flag Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Key
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Rollout %
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Enabled
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Expires At
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((flag) => (
                <tr
                  key={flag.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin-portal/feature-flags/${flag.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {flag.flagName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{flag.flagKey}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {flag.rolloutPercentage}%
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={flag.isEnabled ? "success" : "secondary"}
                    >
                      {flag.isEnabled ? "On" : "Off"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {flag.expiresAt
                      ? flag.expiresAt.toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {flag.createdAt.toLocaleDateString()}
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
