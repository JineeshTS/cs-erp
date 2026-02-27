import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { exchangeRates } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function ExchangeRateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "finance:read")))
    redirect("/master-data-management");

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "finance:approve"
  );

  const [rate] = await db
    .select()
    .from(exchangeRates)
    .where(
      and(
        eq(exchangeRates.id, id),
        eq(exchangeRates.tenantId, session.tenantId),
        isNull(exchangeRates.deletedAt)
      )
    )
    .limit(1);

  if (!rate) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/master-data-management/exchange-rates"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {rate.baseCurrency}/{rate.targetCurrency}
            </h1>
            <p className="text-sm text-gray-500">Exchange rate details</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/master-data-management/exchange-rates/${rate.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" />
            Edit Rate
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <dl className="divide-y">
          <div className="grid grid-cols-3 px-6 py-4">
            <dt className="text-sm font-medium text-gray-500">
              Base Currency
            </dt>
            <dd className="col-span-2 text-sm text-gray-900">
              {rate.baseCurrency}
            </dd>
          </div>
          <div className="grid grid-cols-3 px-6 py-4">
            <dt className="text-sm font-medium text-gray-500">
              Target Currency
            </dt>
            <dd className="col-span-2 text-sm text-gray-900">
              {rate.targetCurrency}
            </dd>
          </div>
          <div className="grid grid-cols-3 px-6 py-4">
            <dt className="text-sm font-medium text-gray-500">Rate</dt>
            <dd className="col-span-2 text-sm text-gray-900">{rate.rate}</dd>
          </div>
          <div className="grid grid-cols-3 px-6 py-4">
            <dt className="text-sm font-medium text-gray-500">Inverse Rate</dt>
            <dd className="col-span-2 text-sm text-gray-900">
              {rate.inverseRate || "-"}
            </dd>
          </div>
          <div className="grid grid-cols-3 px-6 py-4">
            <dt className="text-sm font-medium text-gray-500">Source</dt>
            <dd className="col-span-2 text-sm text-gray-900">
              {rate.source || "-"}
            </dd>
          </div>
          <div className="grid grid-cols-3 px-6 py-4">
            <dt className="text-sm font-medium text-gray-500">
              Effective Date
            </dt>
            <dd className="col-span-2 text-sm text-gray-900">
              {rate.effectiveDate}
            </dd>
          </div>
          <div className="grid grid-cols-3 px-6 py-4">
            <dt className="text-sm font-medium text-gray-500">Valid Until</dt>
            <dd className="col-span-2 text-sm text-gray-900">
              {rate.validUntil || "-"}
            </dd>
          </div>
          <div className="grid grid-cols-3 px-6 py-4">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="col-span-2">
              <Badge
                variant={
                  rate.status === "active" ? "success" : "secondary"
                }
              >
                {rate.status}
              </Badge>
            </dd>
          </div>
          <div className="grid grid-cols-3 px-6 py-4">
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="col-span-2 text-sm text-gray-900">
              {rate.createdAt.toISOString()}
            </dd>
          </div>
          <div className="grid grid-cols-3 px-6 py-4">
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="col-span-2 text-sm text-gray-900">
              {rate.updatedAt.toISOString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
