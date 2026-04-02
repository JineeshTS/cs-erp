import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { melsTaxRates } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function TaxRateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:read")))
    redirect("/multi-entity-legal-structure");

  const { id } = await params;

  const rate = await db
    .select()
    .from(melsTaxRates)
    .where(
      and(
        eq(melsTaxRates.id, id),
        eq(melsTaxRates.tenantId, session.tenantId),
        isNull(melsTaxRates.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!rate) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "entities:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/multi-entity-legal-structure/tax-rates"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Tax Rate Detail</h1>
          <p className="text-sm text-gray-500">
            Rate: {rate.rateBps} bps
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/multi-entity-legal-structure/tax-rates/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">ID</dt>
            <dd className="mt-1 font-mono text-xs text-gray-900">{rate.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tax Config ID</dt>
            <dd className="mt-1 font-mono text-xs text-gray-900">
              {rate.taxConfigId}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Rate (basis points)
            </dt>
            <dd className="mt-1 text-gray-900">{rate.rateBps}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Effective From
            </dt>
            <dd className="mt-1 text-gray-900">
              {rate.effectiveFrom.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Effective To</dt>
            <dd className="mt-1 text-gray-900">
              {rate.effectiveTo
                ? rate.effectiveTo.toLocaleDateString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">
              {rate.description ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Active</dt>
            <dd className="mt-1">
              <Badge variant={rate.isActive ? "success" : "secondary"}>
                {rate.isActive ? "Active" : "Inactive"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tenant ID</dt>
            <dd className="mt-1 font-mono text-xs text-gray-900">
              {rate.tenantId}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {rate.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {rate.updatedAt.toLocaleDateString()}
            </dd>
          </div>
          {rate.metadata != null && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Metadata</dt>
              <dd className="mt-1">
                <pre className="rounded bg-gray-50 p-3 text-xs text-gray-700">
                  {JSON.stringify(rate.metadata, null, 2)}
                </pre>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
