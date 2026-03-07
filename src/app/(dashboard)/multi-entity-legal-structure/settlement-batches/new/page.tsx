import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { MelsForm } from "@/components/multi-entity-legal-structure/mels-form";
import type { FieldConfig } from "@/components/multi-entity-legal-structure/mels-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewSettlementBatchPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "entities:create"))
  )
    redirect("/multi-entity-legal-structure/settlement-batches");

  const currencyOpts = await getCurrencyOptions();

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
      type: "select", options: currencyOpts,
      required: true,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/multi-entity-legal-structure/settlement-batches"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Settlement Batch
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MelsForm
          entityType="Settlement Batch"
          apiPath="/api/v1/multi-entity-legal-structure/settlement-batches"
          fields={FIELDS}
          returnPath="/multi-entity-legal-structure/settlement-batches"
        />
      </div>
    </div>
  );
}
