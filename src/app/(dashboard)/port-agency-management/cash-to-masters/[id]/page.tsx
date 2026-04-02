import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCashToMaster } from "@/lib/port-agency-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  requested: "secondary",
  approved: "default",
  disbursed: "success",
  settled: "success",
  rejected: "destructive",
} as const;

export default async function CashToMasterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "port_agency:read")))
    redirect("/");

  const { id } = await params;

  const txn = await getCashToMaster(id, session.tenantId);
  if (!txn) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "port_agency:edit"
  );

  function formatAmount(
    amount: string | number | null | undefined,
    currency: string | null | undefined
  ): string {
    if (amount == null) return "-";
    return `${amount}${currency ? ` ${currency}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/port-agency-management/cash-to-masters"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {txn.transactionRef}
          </h1>
          <p className="text-sm text-gray-500">
            {txn.transactionType} &middot; {txn.vesselName}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/port-agency-management/cash-to-masters/${id}/edit`}
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
              Transaction Ref
            </dt>
            <dd className="mt-1 text-gray-900">{txn.transactionRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Transaction Type
            </dt>
            <dd className="mt-1 text-gray-900">{txn.transactionType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    txn.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {txn.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{txn.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IMO Number</dt>
            <dd className="mt-1 text-gray-900">{txn.imoNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Port Call Ref
            </dt>
            <dd className="mt-1 text-gray-900">{txn.portCallRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Name</dt>
            <dd className="mt-1 text-gray-900">{txn.portName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Master Name</dt>
            <dd className="mt-1 text-gray-900">{txn.masterName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Requested Amount
            </dt>
            <dd className="mt-1 text-gray-900">
              {formatAmount(txn.requestedAmount, txn.currency)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{txn.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Exchange Rate
            </dt>
            <dd className="mt-1 text-gray-900">
              {txn.exchangeRate != null ? txn.exchangeRate : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Local Currency
            </dt>
            <dd className="mt-1 text-gray-900">{txn.localCurrency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Local Amount</dt>
            <dd className="mt-1 text-gray-900">
              {formatAmount(txn.localAmount, txn.localCurrency)}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Purpose</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {txn.purpose || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {txn.notes || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {txn.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {txn.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
