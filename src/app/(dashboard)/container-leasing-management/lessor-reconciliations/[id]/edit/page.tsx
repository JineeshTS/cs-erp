import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getLessorReconciliation } from "@/lib/container-leasing-management/service";
import {
  ClmForm,
  type FieldConfig,
} from "@/components/container-leasing-management/clm-form";

const LESSOR_RECONCILIATION_FIELDS: FieldConfig[] = [
  {
    name: "reconciliationType",
    label: "Reconciliation Type",
    type: "select",
    options: [
      { value: "monthly_statement", label: "Monthly Statement" },
      { value: "quarterly_review", label: "Quarterly Review" },
      { value: "annual_audit", label: "Annual Audit" },
      { value: "dispute_resolution", label: "Dispute Resolution" },
      { value: "final_settlement", label: "Final Settlement" },
    ],
  },
  { name: "lessorName", label: "Lessor Name", type: "text" },
  { name: "agreementId", label: "Agreement ID", type: "text" },
  { name: "statementPeriod", label: "Statement Period", type: "text" },
  { name: "lessorAmount", label: "Lessor Amount", type: "text" },
  { name: "internalAmount", label: "Internal Amount", type: "text" },
  { name: "differenceAmount", label: "Difference Amount", type: "text" },
  {
    name: "reconciliationCurrency",
    label: "Reconciliation Currency",
    type: "text",
  },
  { name: "itemsMatched", label: "Items Matched", type: "number" },
  { name: "itemsUnmatched", label: "Items Unmatched", type: "number" },
  { name: "disputeCount", label: "Dispute Count", type: "number" },
  { name: "adjustmentAmount", label: "Adjustment Amount", type: "text" },
  {
    name: "reconciliationDate",
    label: "Reconciliation Date",
    type: "datetime-local",
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditLessorReconciliationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "clm:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getLessorReconciliation(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, string> = {
    reconciliationType: record.reconciliationType ?? "",
    lessorName: record.lessorName ?? "",
    agreementId: record.agreementId ?? "",
    statementPeriod: record.statementPeriod ?? "",
    lessorAmount: record.lessorAmount ?? "",
    internalAmount: record.internalAmount ?? "",
    differenceAmount: record.differenceAmount ?? "",
    reconciliationCurrency: record.reconciliationCurrency ?? "",
    itemsMatched:
      record.itemsMatched != null ? String(record.itemsMatched) : "",
    itemsUnmatched:
      record.itemsUnmatched != null ? String(record.itemsUnmatched) : "",
    disputeCount:
      record.disputeCount != null ? String(record.disputeCount) : "",
    adjustmentAmount: record.adjustmentAmount ?? "",
    reconciliationDate: record.reconciliationDate
      ? new Date(record.reconciliationDate).toISOString().slice(0, 16)
      : "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/container-leasing-management/lessor-reconciliations/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit {record.reconciliationRef}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update lessor reconciliation details
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <ClmForm
          entityType="Lessor Reconciliation"
          apiPath={`/api/v1/container-leasing-management/lessor-reconciliations/${id}`}
          returnPath="/container-leasing-management/lessor-reconciliations"
          fields={LESSOR_RECONCILIATION_FIELDS}
          initialData={initialData}
          isEdit
        />
      </div>
    </div>
  );
}
