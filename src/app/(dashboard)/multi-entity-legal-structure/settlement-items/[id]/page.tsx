import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { melsSettlementItems } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function SettlementItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:read")))
    redirect("/multi-entity-legal-structure");

  const { id } = await params;

  const item = await db
    .select()
    .from(melsSettlementItems)
    .where(
      and(
        eq(melsSettlementItems.id, id),
        eq(melsSettlementItems.tenantId, session.tenantId),
        isNull(melsSettlementItems.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!item) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "entities:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/multi-entity-legal-structure/settlement-items"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Settlement Item
          </h1>
          <p className="text-sm text-gray-500">{item.id}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/multi-entity-legal-structure/settlement-items/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Batch ID</dt>
            <dd className="mt-1 text-gray-900">{item.batchId}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Transaction ID
            </dt>
            <dd className="mt-1 text-gray-900">{item.transactionId}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Amount</dt>
            <dd className="mt-1 text-gray-900">{item.amount}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Net Direction
            </dt>
            <dd className="mt-1">
              <Badge
                variant={
                  item.netDirection === "debit" ? "destructive" : "success"
                }
              >
                {item.netDirection}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Metadata</dt>
            <dd className="mt-1 text-gray-900">
              {item.metadata != null
                ? JSON.stringify(item.metadata)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {item.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {item.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
