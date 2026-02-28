import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { melsLocaleConfigs, melsTranslations } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function LocaleConfigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:read")))
    redirect("/multi-entity-legal-structure");

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "entities:edit"
  );

  const [locale] = await db
    .select()
    .from(melsLocaleConfigs)
    .where(
      and(
        eq(melsLocaleConfigs.id, id),
        eq(melsLocaleConfigs.tenantId, session.tenantId),
        isNull(melsLocaleConfigs.deletedAt)
      )
    )
    .limit(1);

  if (!locale) notFound();

  const translations = await db
    .select()
    .from(melsTranslations)
    .where(
      and(
        eq(melsTranslations.localeCode, locale.localeCode),
        eq(melsTranslations.tenantId, session.tenantId),
        isNull(melsTranslations.deletedAt)
      )
    )
    .orderBy(desc(melsTranslations.createdAt))
    .limit(5);

  const translationCount = translations.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/multi-entity-legal-structure/locale-configs"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {locale.localeName}
          </h1>
        </div>
        {canEdit && (
          <Link
            href={`/multi-entity-legal-structure/locale-configs/${locale.id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Locale Code</dt>
            <dd className="mt-1 text-sm text-gray-900">{locale.localeCode}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Locale Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{locale.localeName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Language</dt>
            <dd className="mt-1 text-sm text-gray-900">{locale.language}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Direction</dt>
            <dd className="mt-1">
              <Badge
                variant={locale.direction === "rtl" ? "warning" : "secondary"}
              >
                {locale.direction}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Date Format</dt>
            <dd className="mt-1 text-sm text-gray-900">{locale.dateFormat}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Number Format
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {locale.numberFormat}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Default Locale
            </dt>
            <dd className="mt-1">
              <Badge variant={locale.isDefault ? "success" : "secondary"}>
                {locale.isDefault ? "Yes" : "No"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Active</dt>
            <dd className="mt-1">
              <Badge variant={locale.isActive ? "success" : "secondary"}>
                {locale.isActive ? "Active" : "Inactive"}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Metadata</dt>
            <dd className="mt-1">
              {locale.metadata != null ? (
                <pre className="rounded-md bg-gray-50 p-3 text-xs text-gray-800 overflow-auto">
                  {JSON.stringify(locale.metadata, null, 2)}
                </pre>
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {locale.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {locale.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Translations ({translationCount})
        </h2>
        {translations.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center">
            <p className="text-gray-500">
              No translations for this locale.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
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
                </tr>
              </thead>
              <tbody>
                {translations.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
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
