import Link from "next/link";
import { Plus, Handshake } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
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

export default async function IntercompanyTransactionsListPage() {
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
    .from(melsIntercompanyTransactions)
    .where(
      and(
        eq(melsIntercompanyTransactions.tenantId, session.tenantId),
        isNull(melsIntercompanyTransactions.deletedAt)
      )
    )
    .orderBy(desc(melsIntercompanyTransactions.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Intercompany Transactions
          </h1>
          <p className="text-sm text-gray-500">
            Track transactions between legal entities
          </p>
        </div>
        {canCreate && (
          <Link
            href="/multi-entity-legal-structure/intercompany-transactions/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Transaction
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Handshake className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">
            No intercompany transactions found.
          </p>
          {canCreate && (
            <Link
              href="/multi-entity-legal-structure/intercompany-transactions/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first intercompany transaction
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Transaction Number
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Source Entity ID
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Target Entity ID
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Currency
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Amount
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((txn) => (
                <tr
                  key={txn.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/multi-entity-legal-structure/intercompany-transactions/${txn.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {txn.transactionNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {txn.sourceEntityId}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {txn.targetEntityId}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {txn.transactionType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{txn.currency}</td>
                  <td className="px-4 py-3 text-gray-600">{txn.amount}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        statusVariant[
                          txn.status as keyof typeof statusVariant
                        ] ?? "secondary"
                      }
                    >
                      {txn.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {txn.createdAt.toLocaleDateString()}
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
