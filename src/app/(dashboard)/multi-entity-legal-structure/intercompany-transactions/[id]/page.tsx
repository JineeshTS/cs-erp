import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { melsIntercompanyTransactions } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  pending: "warning",
  approved: "success",
  posted: "success",
  reversed: "destructive",
  cancelled: "secondary",
} as const;

export default async function IntercompanyTransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:read")))
    redirect("/multi-entity-legal-structure");

  const { id } = await params;

  const txn = await db
    .select()
    .from(melsIntercompanyTransactions)
    .where(
      and(
        eq(melsIntercompanyTransactions.id, id),
        eq(melsIntercompanyTransactions.tenantId, session.tenantId),
        isNull(melsIntercompanyTransactions.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!txn) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "entities:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/multi-entity-legal-structure/intercompany-transactions"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Transaction: {txn.transactionNumber}
          </h1>
          <p className="text-sm text-gray-500">
            {txn.transactionType} &middot; {txn.currency} {txn.amount}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/multi-entity-legal-structure/intercompany-transactions/${id}/edit`}
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
            <dd className="mt-1 font-mono text-xs text-gray-900">{txn.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Transaction Number
            </dt>
            <dd className="mt-1 text-gray-900">{txn.transactionNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Source Entity ID
            </dt>
            <dd className="mt-1 font-mono text-xs text-gray-900">
              {txn.sourceEntityId}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Target Entity ID
            </dt>
            <dd className="mt-1 font-mono text-xs text-gray-900">
              {txn.targetEntityId}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Type</dt>
            <dd className="mt-1 text-gray-900">{txn.transactionType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">
              {txn.description ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{txn.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Amount</dt>
            <dd className="mt-1 text-gray-900">{txn.amount}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">FX Rate</dt>
            <dd className="mt-1 text-gray-900">{txn.fxRate ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              FX Rate Multiplier
            </dt>
            <dd className="mt-1 text-gray-900">
              {txn.fxRateMultiplier ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Base Amount</dt>
            <dd className="mt-1 text-gray-900">{txn.baseAmount ?? "—"}</dd>
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
            <dt className="text-sm font-medium text-gray-500">Approved By</dt>
            <dd className="mt-1 font-mono text-xs text-gray-900">
              {txn.approvedBy ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved At</dt>
            <dd className="mt-1 text-gray-900">
              {txn.approvedAt
                ? txn.approvedAt.toLocaleDateString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Posted At</dt>
            <dd className="mt-1 text-gray-900">
              {txn.postedAt
                ? txn.postedAt.toLocaleDateString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reference Type
            </dt>
            <dd className="mt-1 text-gray-900">
              {txn.referenceType ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Reference ID</dt>
            <dd className="mt-1 font-mono text-xs text-gray-900">
              {txn.referenceId ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tenant ID</dt>
            <dd className="mt-1 font-mono text-xs text-gray-900">
              {txn.tenantId}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {txn.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {txn.updatedAt.toLocaleDateString()}
            </dd>
          </div>
          {txn.metadata != null && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Metadata</dt>
              <dd className="mt-1">
                <pre className="rounded bg-gray-50 p-3 text-xs text-gray-700">
                  {JSON.stringify(txn.metadata, null, 2)}
                </pre>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
