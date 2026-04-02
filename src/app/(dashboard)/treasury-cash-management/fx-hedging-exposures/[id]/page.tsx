import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getFxHedgingExposure } from "@/lib/treasury-cash-management/service";
import { Badge } from "@/components/ui/badge";

export default async function FxHedgingExposureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "treasury:read")))
    redirect("/treasury-cash-management");

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "treasury:edit"
  );

  const record = await getFxHedgingExposure(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/treasury-cash-management/fx-hedging-exposures"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {record.hedgeRef}
          </h1>
        </div>
        {canEdit && (
          <Link
            href={`/treasury-cash-management/fx-hedging-exposures/${record.id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Hedge Ref</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.hedgeRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Hedge Type</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.hedgeType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Base Currency
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.baseCurrency || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Quote Currency
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.quoteCurrency || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Notional Amount
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.notionalAmount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Hedged Amount
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.hedgedAmount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Spot Rate</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.spotRate ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Forward Rate</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.forwardRate ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Strike Rate</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.strikeRate ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Maturity Date
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.maturityDate
                ? new Date(record.maturityDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Settlement Date
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.settlementDate
                ? new Date(record.settlementDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Counterparty</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.counterparty || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Deal Reference
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.dealReference || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Hedge Effectiveness
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.hedgeEffectiveness ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Unrealized Gain/Loss
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.unrealizedGainLoss ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Realized Gain/Loss
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.realizedGainLoss ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Exposure Type
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.exposureType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Hedge Accounting Method
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.hedgeAccountingMethod || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "active"
                    ? "success"
                    : record.status === "cancelled"
                      ? "destructive"
                      : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.notes || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
