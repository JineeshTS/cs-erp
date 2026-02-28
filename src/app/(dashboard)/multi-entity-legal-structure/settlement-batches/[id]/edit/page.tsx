import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { melsSettlementBatches } from "@/db/schema";
import { MelsForm } from "@/components/multi-entity-legal-structure/mels-form";
import type { FieldConfig } from "@/components/multi-entity-legal-structure/mels-form";

const FIELDS: FieldConfig[] = [
  { name: "batchNumber", label: "Batch Number", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  {
    name: "settlementDate",
    label: "Settlement Date",
    type: "date",
    required: true,
  },
  {
    name: "currency",
    label: "Currency",
    type: "text",
    required: true,
    placeholder: "QAR",
  },
  { name: "totalAmount", label: "Total Amount", type: "number" },
  { name: "netAmount", label: "Net Amount", type: "number" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "settled", label: "Settled" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
];

export default async function EditSettlementBatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:edit")))
    redirect("/multi-entity-legal-structure/settlement-batches");

  const { id } = await params;

  const batch = await db
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
    .then((r) => r[0]);

  if (!batch) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/multi-entity-legal-structure/settlement-batches/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Settlement Batch
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MelsForm
          entityType="Settlement Batch"
          apiPath={`/api/v1/multi-entity-legal-structure/settlement-batches/${id}`}
          fields={FIELDS}
          initialData={{
            batchNumber: batch.batchNumber,
            description: batch.description ?? "",
            settlementDate: batch.settlementDate.toISOString().slice(0, 10),
            currency: batch.currency,
            totalAmount: batch.totalAmount,
            netAmount: batch.netAmount,
            status: batch.status,
          }}
          isEdit
          returnPath={`/multi-entity-legal-structure/settlement-batches/${id}`}
        />
      </div>
    </div>
  );
}
