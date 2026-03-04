import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getHireReconciliation } from "@/lib/voyage-results-settlement/service";
import { VrsForm } from "@/components/voyage-results-settlement/vrs-form";
import type { FieldConfig } from "@/components/voyage-results-settlement/vrs-form";

const fields: FieldConfig[] = [
  {
    name: "reconciliationType",
    label: "Reconciliation Type",
    type: "select",
    required: true,
    options: [
      { value: "owner_statement", label: "Owner Statement" },
      { value: "charterer_statement", label: "Charterer Statement" },
      { value: "dispute_resolution", label: "Dispute Resolution" },
      { value: "final_settlement", label: "Final Settlement" },
      { value: "interim_reconciliation", label: "Interim Reconciliation" },
    ],
  },
  { name: "title", label: "Title", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "charterParty", label: "Charter Party", type: "text" },
  { name: "ownerAmount", label: "Owner Amount", type: "number" },
  { name: "chartererAmount", label: "Charterer Amount", type: "number" },
  { name: "differenceAmount", label: "Difference Amount", type: "number" },
  { name: "resolvedAmount", label: "Resolved Amount", type: "number" },
  { name: "disputeItems", label: "Dispute Items", type: "number" },
  { name: "resolvedItems", label: "Resolved Items", type: "number" },
  { name: "isReconciled", label: "Is Reconciled", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditHireReconciliationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vrs:edit")))
    redirect("/login");

  const { id } = await params;
  const record = await getHireReconciliation(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/voyage-results-settlement/hire-reconciliations/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Scale className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Hire Reconciliation</h1>
          <p className="text-sm text-muted-foreground">
            Update hire reconciliation record
          </p>
        </div>
      </div>

      <VrsForm
        entityType="Hire Reconciliation"
        apiPath={`/api/v1/voyage-results-settlement/hire-reconciliations/${id}`}
        fields={fields}
        initialData={{
          reconciliationType: record.reconciliationType ?? "",
          title: record.title ?? "",
          vesselName: record.vesselName ?? "",
          charterParty: record.charterParty ?? "",
          ownerAmount: record.ownerAmount ?? "",
          chartererAmount: record.chartererAmount ?? "",
          differenceAmount: record.differenceAmount ?? "",
          resolvedAmount: record.resolvedAmount ?? "",
          disputeItems: record.disputeItems ?? "",
          resolvedItems: record.resolvedItems ?? "",
          isReconciled: record.isReconciled ?? false,
          notes: record.notes ?? "",
        }}
        isEdit
        returnPath={`/voyage-results-settlement/hire-reconciliations/${id}`}
      />
    </div>
  );
}
