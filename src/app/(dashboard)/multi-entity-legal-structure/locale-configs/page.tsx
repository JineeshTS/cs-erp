import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { melsLocaleConfigs } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function LocaleConfigsListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:read")))
    redirect("/multi-entity-legal-structure");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "entities:create"
  );

  const data = await db
    .select()
    .from(melsLocaleConfigs)
    .where(
      and(
        eq(melsLocaleConfigs.tenantId, session.tenantId),
        isNull(melsLocaleConfigs.deletedAt)
      )
    )
    .orderBy(desc(melsLocaleConfigs.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Locale Configs</h1>
          <p className="text-sm text-gray-500">
            Manage locale configurations for multi-language support
          </p>
        </div>
        {canCreate && (
          <Link
            href="/multi-entity-legal-structure/locale-configs/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Locale Config
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No locale configurations found.</p>
          {canCreate && (
            <Link
              href="/multi-entity-legal-structure/locale-configs/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first locale config
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Locale Code
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Locale Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Language
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Direction
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Date Format
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Default
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Active
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((locale) => (
                <tr
                  key={locale.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/multi-entity-legal-structure/locale-configs/${locale.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {locale.localeCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {locale.localeName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {locale.language}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        locale.direction === "rtl" ? "warning" : "secondary"
                      }
                    >
                      {locale.direction}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {locale.dateFormat}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={locale.isDefault ? "success" : "secondary"}
                    >
                      {locale.isDefault ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={locale.isActive ? "success" : "secondary"}
                    >
                      {locale.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {locale.createdAt.toLocaleDateString()}
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
