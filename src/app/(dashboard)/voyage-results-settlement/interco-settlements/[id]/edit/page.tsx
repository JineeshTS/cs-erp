import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getIntercoSettlement } from "@/lib/voyage-results-settlement/service";
import { VrsForm } from "@/components/voyage-results-settlement/vrs-form";
import type { FieldConfig } from "@/components/voyage-results-settlement/vrs-form";

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
  { name: "currency", label: "Currency", type: "text" },
  { name: "allocationBasis", label: "Allocation Basis", type: "text" },
  { name: "allocationPct", label: "Allocation %", type: "text" },
  { name: "invoiceRef", label: "Invoice Ref", type: "text" },
  { name: "settledDate", label: "Settled Date", type: "datetime-local" },
  { name: "isSettled", label: "Is Settled", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditIntercoSettlementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vrs:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getIntercoSettlement(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/voyage-results-settlement/interco-settlements/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <FileText className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Interco Settlement</h1>
          <p className="text-sm text-muted-foreground">
            Update interco settlement record
          </p>
        </div>
      </div>

      <VrsForm
        entityType="Interco Settlement"
        apiPath={`/api/v1/voyage-results-settlement/interco-settlements/${id}`}
        fields={fields}
        initialData={{
          intercoType: record.intercoType ?? "",
          title: record.title ?? "",
          voyageNumber: record.voyageNumber ?? "",
          fromEntity: record.fromEntity ?? "",
          toEntity: record.toEntity ?? "",
          settlementAmount: record.settlementAmount ?? "",
          currency: record.currency ?? "",
          allocationBasis: record.allocationBasis ?? "",
          allocationPct: record.allocationPct ?? "",
          invoiceRef: record.invoiceRef ?? "",
          settledDate: record.settledDate?.toISOString() ?? "",
          isSettled: record.isSettled ?? false,
          notes: record.notes ?? "",
        }}
        isEdit
        returnPath={`/voyage-results-settlement/interco-settlements/${id}`}
      />
    </div>
  );
}
