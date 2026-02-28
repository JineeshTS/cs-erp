import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
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

export default async function NewSettlementItemPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "entities:create"))
  )
    redirect("/multi-entity-legal-structure/settlement-items");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/multi-entity-legal-structure/settlement-items"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Settlement Item
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MelsForm
          entityType="Settlement Item"
          apiPath="/api/v1/multi-entity-legal-structure/settlement-items"
          fields={FIELDS}
          returnPath="/multi-entity-legal-structure/settlement-items"
        />
      </div>
    </div>
  );
}
