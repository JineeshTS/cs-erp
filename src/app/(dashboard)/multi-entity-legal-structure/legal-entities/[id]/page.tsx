import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { melsLegalEntities, melsCurrencyConfigs } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function LegalEntityDetailPage({
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

  const [entity] = await db
    .select()
    .from(melsLegalEntities)
    .where(
      and(
        eq(melsLegalEntities.id, id),
        eq(melsLegalEntities.tenantId, session.tenantId),
        isNull(melsLegalEntities.deletedAt)
      )
    )
    .limit(1);

  if (!entity) notFound();

  const currencyConfigs = await db
    .select()
    .from(melsCurrencyConfigs)
    .where(
      and(
        eq(melsCurrencyConfigs.legalEntityId, id),
        eq(melsCurrencyConfigs.tenantId, session.tenantId),
        isNull(melsCurrencyConfigs.deletedAt)
      )
    )
    .orderBy(desc(melsCurrencyConfigs.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/multi-entity-legal-structure/legal-entities"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{entity.name}</h1>
        </div>
        {canEdit && (
          <Link
            href={`/multi-entity-legal-structure/legal-entities/${entity.id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{entity.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Short Name</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {entity.shortName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Slug</dt>
            <dd className="mt-1 text-sm text-gray-900">{entity.slug}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Entity Type</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {entity.entityType}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Legal Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{entity.legalName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Registration Number
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {entity.registrationNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tax ID</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {entity.taxId || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">VAT Number</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {entity.vatNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Country</dt>
            <dd className="mt-1 text-sm text-gray-900">{entity.country}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Region</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {entity.region || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Base Currency
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {entity.baseCurrency}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Timezone</dt>
            <dd className="mt-1 text-sm text-gray-900">{entity.timezone}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Fiscal Year Start
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {entity.fiscalYearStart}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Active</dt>
            <dd className="mt-1">
              <Badge variant={entity.isActive ? "success" : "secondary"}>
                {entity.isActive ? "Active" : "Inactive"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Headquarters</dt>
            <dd className="mt-1">
              <Badge variant={entity.isHeadquarters ? "success" : "secondary"}>
                {entity.isHeadquarters ? "Yes" : "No"}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Address</dt>
            <dd className="mt-1">
              {entity.address != null ? (
                <pre className="rounded-md bg-gray-50 p-3 text-xs text-gray-800 overflow-auto">
                  {JSON.stringify(entity.address, null, 2)}
                </pre>
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Contact Info</dt>
            <dd className="mt-1">
              {entity.contactInfo != null ? (
                <pre className="rounded-md bg-gray-50 p-3 text-xs text-gray-800 overflow-auto">
                  {JSON.stringify(entity.contactInfo, null, 2)}
                </pre>
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Metadata</dt>
            <dd className="mt-1">
              {entity.metadata != null ? (
                <pre className="rounded-md bg-gray-50 p-3 text-xs text-gray-800 overflow-auto">
                  {JSON.stringify(entity.metadata, null, 2)}
                </pre>
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {entity.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {entity.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Currency Configurations
        </h2>
        {currencyConfigs.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center">
            <p className="text-gray-500">
              No currency configurations for this entity.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Currency Code
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Currency Name
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Symbol
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Decimal Places
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Base Currency
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Enabled
                  </th>
                </tr>
              </thead>
              <tbody>
                {currencyConfigs.map((config) => (
                  <tr
                    key={config.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/multi-entity-legal-structure/currency-configs/${config.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {config.currencyCode}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {config.currencyName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {config.symbol || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {config.decimalPlaces}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          config.isBaseCurrency ? "success" : "secondary"
                        }
                      >
                        {config.isBaseCurrency ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={config.isEnabled ? "success" : "secondary"}
                      >
                        {config.isEnabled ? "Yes" : "No"}
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
