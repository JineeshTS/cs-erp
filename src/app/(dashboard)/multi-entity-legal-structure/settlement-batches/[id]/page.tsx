import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { melsSettlementBatches, melsSettlementItems } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function SettlementBatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:read")))
    redirect("/multi-entity-legal-structure");

  const { id } = await params;

  const [batch, items] = await Promise.all([
    db
      .select()
      .from(melsSettlementBatches)
      .where(
        and(
          eq(melsSettlementBatches.id, id),
          eq(melsSettlementBatches.tenantId, session.tenantId),
          isNull(melsSettlementBatches.deletedAt)
        )
      )
      .limit(1)
      .then((r) => r[0]),
    db
      .select()
      .from(melsSettlementItems)
      .where(
        and(
          eq(melsSettlementItems.batchId, id),
          eq(melsSettlementItems.tenantId, session.tenantId),
          isNull(melsSettlementItems.deletedAt)
        )
      )
      .orderBy(desc(melsSettlementItems.createdAt)),
  ]);

  if (!batch) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "entities:edit"
  );

  const statusVariant =
    batch.status === "approved" || batch.status === "settled"
      ? "success"
      : batch.status === "pending"
        ? "warning"
        : "secondary";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/multi-entity-legal-structure/settlement-batches"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {batch.batchNumber}
          </h1>
          <p className="text-sm text-gray-500">Settlement Batch</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/multi-entity-legal-structure/settlement-batches/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Batch Number</dt>
            <dd className="mt-1 text-gray-900">{batch.batchNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{batch.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
            <dd className="mt-1 text-gray-900">{batch.totalAmount}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Net Amount</dt>
            <dd className="mt-1 text-gray-900">{batch.netAmount}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={statusVariant}>{batch.status}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Settlement Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {batch.settlementDate.toLocaleDateString()}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">
              {batch.description || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved By</dt>
            <dd className="mt-1 text-gray-900">
              {batch.approvedBy || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved At</dt>
            <dd className="mt-1 text-gray-900">
              {batch.approvedAt
                ? batch.approvedAt.toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Settled At</dt>
            <dd className="mt-1 text-gray-900">
              {batch.settledAt
                ? batch.settledAt.toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Metadata</dt>
            <dd className="mt-1 text-gray-900">
              {batch.metadata != null
                ? JSON.stringify(batch.metadata)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {batch.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {batch.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Settlement Items ({items.length})
        </h2>
        {items.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center">
            <p className="text-gray-500">
              No settlement items for this batch.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Transaction ID
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Net Direction
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/multi-entity-legal-structure/settlement-items/${item.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {item.transactionId}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.amount}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          item.netDirection === "debit"
                            ? "destructive"
                            : "success"
                        }
                      >
                        {item.netDirection}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.createdAt.toLocaleDateString()}
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
