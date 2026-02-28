import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { melsIntercompanyTransactions } from "@/db/schema";
import {
  MelsForm,
  type FieldConfig,
} from "@/components/multi-entity-legal-structure/mels-form";

const FIELDS: FieldConfig[] = [
  {
    name: "transactionNumber",
    label: "Transaction Number",
    type: "text",
    required: true,
  },
  {
    name: "sourceEntityId",
    label: "Source Entity ID",
    type: "text",
    required: true,
  },
  {
    name: "targetEntityId",
    label: "Target Entity ID",
    type: "text",
    required: true,
  },
  {
    name: "transactionType",
    label: "Type",
    type: "select",
    required: true,
    options: [
      { value: "sale", label: "Sale" },
      { value: "purchase", label: "Purchase" },
      { value: "loan", label: "Loan" },
      { value: "service", label: "Service" },
      { value: "dividend", label: "Dividend" },
      { value: "royalty", label: "Royalty" },
      { value: "management_fee", label: "Management Fee" },
      { value: "other", label: "Other" },
    ],
  },
  { name: "description", label: "Description", type: "textarea" },
  {
    name: "currency",
    label: "Currency",
    type: "text",
    required: true,
    placeholder: "QAR",
  },
  {
    name: "amount",
    label: "Amount (smallest unit)",
    type: "number",
    required: true,
  },
  { name: "fxRate", label: "FX Rate", type: "number" },
  { name: "fxRateMultiplier", label: "FX Rate Multiplier", type: "number" },
  { name: "baseAmount", label: "Base Amount", type: "number" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "posted", label: "Posted" },
      { value: "reversed", label: "Reversed" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
  { name: "referenceType", label: "Reference Type", type: "text" },
  { name: "referenceId", label: "Reference ID", type: "text" },
];

export default async function EditIntercompanyTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:edit")))
    redirect("/multi-entity-legal-structure/intercompany-transactions");

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/multi-entity-legal-structure/intercompany-transactions/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Intercompany Transaction
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MelsForm
          entityType="Intercompany Transaction"
          apiPath={`/api/v1/multi-entity-legal-structure/intercompany-transactions/${id}`}
          fields={FIELDS}
          initialData={{
            transactionNumber: txn.transactionNumber,
            sourceEntityId: txn.sourceEntityId,
            targetEntityId: txn.targetEntityId,
            transactionType: txn.transactionType,
            description: txn.description ?? "",
            currency: txn.currency,
            amount: txn.amount,
            fxRate: txn.fxRate ?? "",
            fxRateMultiplier: txn.fxRateMultiplier ?? "",
            baseAmount: txn.baseAmount ?? "",
            status: txn.status,
            referenceType: txn.referenceType ?? "",
            referenceId: txn.referenceId ?? "",
          }}
          isEdit
          returnPath={`/multi-entity-legal-structure/intercompany-transactions/${id}`}
        />
      </div>
    </div>
  );
}
