import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { melsFxRates } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function FxRateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:read")))
    redirect("/multi-entity-legal-structure");

  const { id } = await params;

  const fxRate = await db
    .select()
    .from(melsFxRates)
    .where(
      and(
        eq(melsFxRates.id, id),
        eq(melsFxRates.tenantId, session.tenantId),
        isNull(melsFxRates.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!fxRate) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "entities:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/multi-entity-legal-structure/fx-rates"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {fxRate.sourceCurrency} / {fxRate.targetCurrency}
          </h1>
          <p className="text-sm text-gray-500">FX Rate Details</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/multi-entity-legal-structure/fx-rates/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">
              Source Currency
            </dt>
            <dd className="mt-1 text-gray-900">{fxRate.sourceCurrency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Target Currency
            </dt>
            <dd className="mt-1 text-gray-900">{fxRate.targetCurrency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Rate</dt>
            <dd className="mt-1 text-gray-900">{fxRate.rate}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Rate Multiplier
            </dt>
            <dd className="mt-1 text-gray-900">{fxRate.rateMultiplier}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Rate Type</dt>
            <dd className="mt-1 text-gray-900">{fxRate.rateType || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Provider</dt>
            <dd className="mt-1 text-gray-900">{fxRate.provider || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Effective From
            </dt>
            <dd className="mt-1 text-gray-900">
              {new Date(fxRate.effectiveFrom).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Effective To</dt>
            <dd className="mt-1 text-gray-900">
              {fxRate.effectiveTo
                ? new Date(fxRate.effectiveTo).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Active</dt>
            <dd className="mt-1">
              <Badge variant={fxRate.isActive ? "success" : "secondary"}>
                {fxRate.isActive ? "Active" : "Inactive"}
              </Badge>
            </dd>
          </div>
          {fxRate.metadata != null && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Metadata</dt>
              <dd className="mt-1">
                <pre className="rounded-md bg-gray-50 p-3 text-sm text-gray-900">
                  {JSON.stringify(fxRate.metadata, null, 2)}
                </pre>
              </dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(fxRate.createdAt).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(fxRate.updatedAt).toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
