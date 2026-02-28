import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { melsTranslations } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function TranslationDetailPage({
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

  const [translation] = await db
    .select()
    .from(melsTranslations)
    .where(
      and(
        eq(melsTranslations.id, id),
        eq(melsTranslations.tenantId, session.tenantId),
        isNull(melsTranslations.deletedAt)
      )
    )
    .limit(1);

  if (!translation) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/multi-entity-legal-structure/translations"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {translation.key}
          </h1>
        </div>
        {canEdit && (
          <Link
            href={`/multi-entity-legal-structure/translations/${translation.id}/edit`}
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
            <dd className="mt-1 text-sm text-gray-900">
              {translation.localeCode}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Namespace</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {translation.namespace}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Key</dt>
            <dd className="mt-1 text-sm text-gray-900">{translation.key}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Verified</dt>
            <dd className="mt-1">
              <Badge
                variant={translation.isVerified ? "success" : "secondary"}
              >
                {translation.isVerified ? "Yes" : "No"}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Value</dt>
            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
              {translation.value}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Metadata</dt>
            <dd className="mt-1">
              {translation.metadata != null ? (
                <pre className="rounded-md bg-gray-50 p-3 text-xs text-gray-800 overflow-auto">
                  {JSON.stringify(translation.metadata, null, 2)}
                </pre>
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {translation.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {translation.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
