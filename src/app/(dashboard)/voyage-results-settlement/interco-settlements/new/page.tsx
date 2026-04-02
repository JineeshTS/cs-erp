import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { VrsForm } from "@/components/voyage-results-settlement/vrs-form";
import type { FieldConfig } from "@/components/voyage-results-settlement/vrs-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewIntercoSettlementPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vrs:create")))
    redirect("/");

  const currencyOpts = await getCurrencyOptions();

  const fields: FieldConfig[] = [
    {
      name: "intercoType",
      label: "Interco Type",
      type: "select",
      required: true,
      options: [
        { value: "cost_sharing", label: "Cost Sharing" },
        { value: "revenue_sharing", label: "Revenue Sharing" },
        { value: "management_fee", label: "Management Fee" },
        { value: "bunker_allocation", label: "Bunker Allocation" },
        { value: "overhead_allocation", label: "Overhead Allocation" },
      ],
    },
    { name: "title", label: "Title", type: "text" },
    { name: "voyageNumber", label: "Voyage Number", type: "text" },
    { name: "fromEntity", label: "From Entity", type: "text" },
    { name: "toEntity", label: "To Entity", type: "text" },
    { name: "settlementAmount", label: "Settlement Amount", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "allocationBasis", label: "Allocation Basis", type: "text" },
    { name: "allocationPct", label: "Allocation %", type: "text" },
    { name: "invoiceRef", label: "Invoice Ref", type: "text" },
    { name: "settledDate", label: "Settled Date", type: "datetime-local" },
    { name: "isSettled", label: "Is Settled", type: "checkbox" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/voyage-results-settlement/interco-settlements"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <FileText className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Interco Settlement</h1>
          <p className="text-sm text-muted-foreground">
            Create a new interco settlement record
          </p>
        </div>
      </div>

      <VrsForm
        entityType="Interco Settlement"
        apiPath="/api/v1/voyage-results-settlement/interco-settlements"
        fields={fields}
        returnPath="/voyage-results-settlement/interco-settlements"
      />
    </div>
  );
}
