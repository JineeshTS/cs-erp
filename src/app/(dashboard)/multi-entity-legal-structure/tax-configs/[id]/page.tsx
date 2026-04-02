import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { melsTaxConfigs, melsTaxRates } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function TaxConfigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:read")))
    redirect("/multi-entity-legal-structure");

  const { id } = await params;

  const taxConfig = await db
    .select()
    .from(melsTaxConfigs)
    .where(
      and(
        eq(melsTaxConfigs.id, id),
        eq(melsTaxConfigs.tenantId, session.tenantId),
        isNull(melsTaxConfigs.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!taxConfig) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "entities:edit"
  );

  const taxRates = await db
    .select()
    .from(melsTaxRates)
    .where(
      and(
        eq(melsTaxRates.taxConfigId, id),
        eq(melsTaxRates.tenantId, session.tenantId),
        isNull(melsTaxRates.deletedAt)
      )
    )
    .orderBy(desc(melsTaxRates.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/multi-entity-legal-structure/tax-configs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {taxConfig.taxName}
          </h1>
          <p className="text-sm text-gray-500">Tax Config Details</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/multi-entity-legal-structure/tax-configs/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Tax Name</dt>
            <dd className="mt-1 text-gray-900">{taxConfig.taxName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tax Code</dt>
            <dd className="mt-1 text-gray-900">{taxConfig.taxCode}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tax Type</dt>
            <dd className="mt-1 text-gray-900">{taxConfig.taxType || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Country</dt>
            <dd className="mt-1 text-gray-900">{taxConfig.country}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Region</dt>
            <dd className="mt-1 text-gray-900">{taxConfig.region || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Legal Entity ID
            </dt>
            <dd className="mt-1 text-gray-900">
              {taxConfig.legalEntityId || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">
              {taxConfig.description || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Is Compound</dt>
            <dd className="mt-1">
              <Badge variant={taxConfig.isCompound ? "warning" : "secondary"}>
                {taxConfig.isCompound ? "Yes" : "No"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Active</dt>
            <dd className="mt-1">
              <Badge variant={taxConfig.isActive ? "success" : "secondary"}>
                {taxConfig.isActive ? "Active" : "Inactive"}
              </Badge>
            </dd>
          </div>
          {taxConfig.metadata != null && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Metadata</dt>
              <dd className="mt-1">
                <pre className="rounded-md bg-gray-50 p-3 text-sm text-gray-900">
                  {JSON.stringify(taxConfig.metadata, null, 2)}
                </pre>
              </dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(taxConfig.createdAt).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(taxConfig.updatedAt).toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Tax Rates</h2>
        {taxRates.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center">
            <p className="text-gray-500">No tax rates found for this config.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Rate (BPS)
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Description
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Effective From
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Effective To
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
                {taxRates.map((rate) => (
                  <tr
                    key={rate.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {rate.rateBps}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {rate.description || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(rate.effectiveFrom).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {rate.effectiveTo
                        ? new Date(rate.effectiveTo).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={rate.isActive ? "success" : "secondary"}>
                        {rate.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(rate.createdAt).toLocaleDateString()}
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
