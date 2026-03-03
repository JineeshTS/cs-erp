import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getClaimSettlement } from "@/lib/cargo-claims-management/service";
import { CcmForm, type FieldConfig } from "@/components/cargo-claims-management/ccm-form";

const SETTLEMENT_FIELDS: FieldConfig[] = [
  {
    name: "settlementType",
    label: "Settlement Type",
    type: "select",
    options: [
      { value: "full_settlement", label: "Full Settlement" },
      { value: "partial_settlement", label: "Partial Settlement" },
      { value: "compromise", label: "Compromise" },
      { value: "denial", label: "Denial" },
      { value: "withdrawal", label: "Withdrawal" },
      { value: "without_prejudice", label: "Without Prejudice" },
    ],
  },
  { name: "claimId", label: "Claim ID", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "originalClaimAmount", label: "Original Claim Amount", type: "text" },
  { name: "offeredAmount", label: "Offered Amount", type: "text" },
  { name: "settledAmount", label: "Settled Amount", type: "text" },
  { name: "settlementCurrency", label: "Settlement Currency", type: "text" },
  { name: "settlementDate", label: "Settlement Date", type: "datetime-local" },
  { name: "paymentMethod", label: "Payment Method", type: "text" },
  { name: "paymentReference", label: "Payment Reference", type: "text" },
  { name: "paymentDate", label: "Payment Date", type: "datetime-local" },
  { name: "releaseObtained", label: "Release Obtained", type: "checkbox" },
  { name: "releaseDate", label: "Release Date", type: "datetime-local" },
  { name: "savingsAmount", label: "Savings Amount", type: "text" },
  { name: "savingsPercentage", label: "Savings Percentage", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditClaimSettlementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ccm:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getClaimSettlement(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/cargo-claims-management/claim-settlements/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Claim Settlement
          </h1>
          <p className="text-sm text-muted-foreground">
            {record.settlementRef}
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <CcmForm
          entityType="Claim Settlement"
          apiPath={`/api/v1/cargo-claims-management/claim-settlements/${id}`}
          returnPath={`/cargo-claims-management/claim-settlements/${id}`}
          fields={SETTLEMENT_FIELDS}
          isEdit
          initialData={{
            settlementType: record.settlementType ?? "",
            claimId: record.claimId ?? "",
            vesselName: record.vesselName ?? "",
            originalClaimAmount: record.originalClaimAmount ?? "",
            offeredAmount: record.offeredAmount ?? "",
            settledAmount: record.settledAmount ?? "",
            settlementCurrency: record.settlementCurrency ?? "",
            settlementDate: record.settlementDate
              ? new Date(record.settlementDate).toISOString()
              : "",
            paymentMethod: record.paymentMethod ?? "",
            paymentReference: record.paymentReference ?? "",
            paymentDate: record.paymentDate
              ? new Date(record.paymentDate).toISOString()
              : "",
            releaseObtained: record.releaseObtained ?? false,
            releaseDate: record.releaseDate
              ? new Date(record.releaseDate).toISOString()
              : "",
            savingsAmount: record.savingsAmount ?? "",
            savingsPercentage: record.savingsPercentage ?? "",
            notes: record.notes ?? "",
          }}
        />
      </div>
    </div>
  );
}
