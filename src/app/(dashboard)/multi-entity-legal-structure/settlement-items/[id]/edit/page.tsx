import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { melsSettlementItems } from "@/db/schema";
import { MelsForm } from "@/components/multi-entity-legal-structure/mels-form";
import type { FieldConfig } from "@/components/multi-entity-legal-structure/mels-form";

const FIELDS: FieldConfig[] = [
  { name: "batchId", label: "Batch ID", type: "text", required: true },
  {
    name: "transactionId",
    label: "Transaction ID",
    type: "text",
    required: true,
  },
  { name: "amount", label: "Amount", type: "number", required: true },
  {
    name: "netDirection",
    label: "Net Direction",
    type: "select",
    required: true,
    options: [
      { value: "debit", label: "Debit" },
      { value: "credit", label: "Credit" },
    ],
  },
];

export default async function EditSettlementItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:edit")))
    redirect("/multi-entity-legal-structure/settlement-items");

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/multi-entity-legal-structure/settlement-items/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Settlement Item
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MelsForm
          entityType="Settlement Item"
          apiPath={`/api/v1/multi-entity-legal-structure/settlement-items/${id}`}
          fields={FIELDS}
          initialData={{
            batchId: item.batchId,
            transactionId: item.transactionId,
            amount: item.amount,
            netDirection: item.netDirection,
          }}
          isEdit
          returnPath={`/multi-entity-legal-structure/settlement-items/${id}`}
        />
      </div>
    </div>
  );
}
