import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { melsSettlementBatches } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function SettlementBatchesListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:read")))
    redirect("/multi-entity-legal-structure");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "entities:create"
  );

  const data = await db
    .select()
    .from(melsSettlementBatches)
    .where(
      and(
        eq(melsSettlementBatches.tenantId, session.tenantId),
        isNull(melsSettlementBatches.deletedAt)
      )
    )
    .orderBy(desc(melsSettlementBatches.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Settlement Batches
          </h1>
          <p className="text-sm text-gray-500">
            Manage intercompany settlement batches
          </p>
        </div>
        {canCreate && (
          <Link
            href="/multi-entity-legal-structure/settlement-batches/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Settlement Batch
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No settlement batches found.</p>
          {canCreate && (
            <Link
              href="/multi-entity-legal-structure/settlement-batches/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first settlement batch
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Batch Number
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Currency
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Total Amount
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Net Amount
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Settlement Date
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((batch) => (
                <tr
                  key={batch.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/multi-entity-legal-structure/settlement-batches/${batch.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {batch.batchNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {batch.currency}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {batch.totalAmount}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {batch.netAmount}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        batch.status === "approved" || batch.status === "settled"
                          ? "success"
                          : batch.status === "pending"
                            ? "warning"
                            : "secondary"
                      }
                    >
                      {batch.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {batch.settlementDate.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {batch.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
