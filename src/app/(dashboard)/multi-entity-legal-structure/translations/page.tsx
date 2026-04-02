import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { melsTranslations } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function TranslationsListPage() {
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
    .from(melsTranslations)
    .where(
      and(
        eq(melsTranslations.tenantId, session.tenantId),
        isNull(melsTranslations.deletedAt)
      )
    )
    .orderBy(desc(melsTranslations.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Translations</h1>
          <p className="text-sm text-gray-500">
            Manage translation keys and values across locales
          </p>
        </div>
        {canCreate && (
          <Link
            href="/multi-entity-legal-structure/translations/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Translation
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No translations found.</p>
          {canCreate && (
            <Link
              href="/multi-entity-legal-structure/translations/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first translation
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
                  Namespace
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Key
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Value
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Verified
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((t) => (
                <tr
                  key={t.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-gray-600">{t.localeCode}</td>
                  <td className="px-4 py-3 text-gray-600">{t.namespace}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/multi-entity-legal-structure/translations/${t.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {t.key}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.value.length > 50
                      ? `${t.value.slice(0, 50)}...`
                      : t.value}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={t.isVerified ? "success" : "secondary"}
                    >
                      {t.isVerified ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.createdAt.toLocaleDateString()}
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
