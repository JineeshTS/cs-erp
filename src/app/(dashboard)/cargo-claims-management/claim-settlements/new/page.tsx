import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CcmForm, type FieldConfig } from "@/components/cargo-claims-management/ccm-form";
import { getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewClaimSettlementPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ccm:create")))
    redirect("/");

  const [vesselOpts, currencyOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

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
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "originalClaimAmount", label: "Original Claim Amount", type: "text" },
    { name: "offeredAmount", label: "Offered Amount", type: "text" },
    { name: "settledAmount", label: "Settled Amount", type: "text" },
    { name: "settlementCurrency", label: "Settlement Currency", type: "select", options: currencyOpts },
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/cargo-claims-management/claim-settlements"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Claim Settlement
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new claim settlement record
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <CcmForm
          entityType="Claim Settlement"
          apiPath="/api/v1/cargo-claims-management/claim-settlements"
          returnPath="/cargo-claims-management/claim-settlements"
          fields={SETTLEMENT_FIELDS}
        />
      </div>
    </div>
  );
}
