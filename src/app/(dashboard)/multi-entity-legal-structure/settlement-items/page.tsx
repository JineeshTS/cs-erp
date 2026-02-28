import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { melsSettlementItems } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function SettlementItemsListPage() {
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
    .from(melsSettlementItems)
    .where(
      and(
        eq(melsSettlementItems.tenantId, session.tenantId),
        isNull(melsSettlementItems.deletedAt)
      )
    )
    .orderBy(desc(melsSettlementItems.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Settlement Items
          </h1>
          <p className="text-sm text-gray-500">
            Manage settlement items within batches
          </p>
        </div>
        {canCreate && (
          <Link
            href="/multi-entity-legal-structure/settlement-items/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Settlement Item
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No settlement items found.</p>
          {canCreate && (
            <Link
              href="/multi-entity-legal-structure/settlement-items/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first settlement item
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Batch ID
                </th>
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
              {data.map((item) => (
                <tr
                  key={item.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-gray-600">{item.batchId}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.transactionId}
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
  );
}
