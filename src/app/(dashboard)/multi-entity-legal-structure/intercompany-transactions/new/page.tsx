import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  MelsForm,
  type FieldConfig,
} from "@/components/multi-entity-legal-structure/mels-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewIntercompanyTransactionPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:create")))
    redirect("/multi-entity-legal-structure/intercompany-transactions");

  const currencyOpts = await getCurrencyOptions();

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
      type: "select", options: currencyOpts,
      required: true,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/multi-entity-legal-structure/intercompany-transactions"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Intercompany Transaction
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MelsForm
          entityType="Intercompany Transaction"
          apiPath="/api/v1/multi-entity-legal-structure/intercompany-transactions"
          fields={FIELDS}
          returnPath="/multi-entity-legal-structure/intercompany-transactions"
        />
      </div>
    </div>
  );
}
