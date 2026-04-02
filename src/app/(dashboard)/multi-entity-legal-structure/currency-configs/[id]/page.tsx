import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { melsCurrencyConfigs } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function CurrencyConfigDetailPage({
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

  const [config] = await db
    .select()
    .from(melsCurrencyConfigs)
    .where(
      and(
        eq(melsCurrencyConfigs.id, id),
        eq(melsCurrencyConfigs.tenantId, session.tenantId),
        isNull(melsCurrencyConfigs.deletedAt)
      )
    )
    .limit(1);

  if (!config) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/multi-entity-legal-structure/currency-configs"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {config.currencyCode} &mdash; {config.currencyName}
          </h1>
        </div>
        {canEdit && (
          <Link
            href={`/multi-entity-legal-structure/currency-configs/${config.id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">
              Currency Code
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {config.currencyCode}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Currency Name
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {config.currencyName}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Symbol</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {config.symbol || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Legal Entity ID
            </dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono text-xs">
              {config.legalEntityId}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Decimal Places
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {config.decimalPlaces}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Smallest Unit
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {config.smallestUnit}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Base Currency
            </dt>
            <dd className="mt-1">
              <Badge
                variant={config.isBaseCurrency ? "success" : "secondary"}
              >
                {config.isBaseCurrency ? "Yes" : "No"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Enabled</dt>
            <dd className="mt-1">
              <Badge variant={config.isEnabled ? "success" : "secondary"}>
                {config.isEnabled ? "Yes" : "No"}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Metadata</dt>
            <dd className="mt-1">
              {config.metadata != null ? (
                <pre className="rounded-md bg-gray-50 p-3 text-xs text-gray-800 overflow-auto">
                  {JSON.stringify(config.metadata, null, 2)}
                </pre>
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {config.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {config.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
