import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRightLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getClaimsRecovery } from "@/lib/insurance-claims-management/service";
import { IcmForm } from "@/components/insurance-claims-management/icm-form";
import type { FieldConfig } from "@/components/insurance-claims-management/icm-form";

const fields: FieldConfig[] = [
  {
    name: "recoveryType",
    label: "Recovery Type",
    type: "select",
    required: true,
    options: [
      { value: "subrogation", label: "Subrogation" },
      { value: "contribution", label: "Contribution" },
      { value: "salvage", label: "Salvage" },
      { value: "general_average", label: "General Average" },
      { value: "third_party", label: "Third Party" },
    ],
  },
  { name: "claimRef", label: "Claim Ref", type: "text" },
  { name: "policyRef", label: "Policy Ref", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "respondentName", label: "Respondent Name", type: "text" },
  { name: "respondentContact", label: "Respondent Contact", type: "text" },
  { name: "respondentInsurer", label: "Respondent Insurer", type: "text" },
  { name: "originalClaimAmount", label: "Original Claim Amount", type: "text" },
  { name: "targetRecoveryAmount", label: "Target Recovery Amount", type: "text" },
  { name: "recoveredAmount", label: "Recovered Amount", type: "text" },
  { name: "recoveryCurrency", label: "Recovery Currency", type: "text" },
  { name: "recoveryBasis", label: "Recovery Basis", type: "textarea" },
  { name: "legalCounsel", label: "Legal Counsel", type: "text" },
  { name: "legalCosts", label: "Legal Costs", type: "text" },
  { name: "filedAt", label: "Filed At", type: "datetime-local" },
  { name: "settledAt", label: "Settled At", type: "datetime-local" },
  { name: "limitationDate", label: "Limitation Date", type: "datetime-local" },
  { name: "courtJurisdiction", label: "Court Jurisdiction", type: "text" },
  { name: "arbitrationClause", label: "Arbitration Clause", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditClaimsRecoveryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "insurance:edit"))) redirect("/login");

  const { id } = await params;
  const record = await getClaimsRecovery(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/insurance-claims-management/claims-recoveries/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <ArrowRightLeft className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Claims Recovery</h1>
          <p className="text-sm text-muted-foreground">
            Update claims recovery record
          </p>
        </div>
      </div>

      <IcmForm
        entityType="Claims Recovery"
        apiPath={`/api/v1/insurance-claims-management/claims-recoveries/${id}`}
        fields={fields}
        initialData={{
          recoveryType: record.recoveryType ?? "",
          claimRef: record.claimRef ?? "",
          policyRef: record.policyRef ?? "",
          vesselName: record.vesselName ?? "",
          respondentName: record.respondentName ?? "",
          respondentContact: record.respondentContact ?? "",
          respondentInsurer: record.respondentInsurer ?? "",
          originalClaimAmount: record.originalClaimAmount ?? "",
          targetRecoveryAmount: record.targetRecoveryAmount ?? "",
          recoveredAmount: record.recoveredAmount ?? "",
          recoveryCurrency: record.recoveryCurrency ?? "",
          recoveryBasis: record.recoveryBasis ?? "",
          legalCounsel: record.legalCounsel ?? "",
          legalCosts: record.legalCosts ?? "",
          filedAt: record.filedAt?.toISOString() ?? "",
          settledAt: record.settledAt?.toISOString() ?? "",
          limitationDate: record.limitationDate?.toISOString() ?? "",
          courtJurisdiction: record.courtJurisdiction ?? "",
          arbitrationClause: record.arbitrationClause ?? "",
          notes: record.notes ?? "",
        }}
        isEdit
        returnPath={`/insurance-claims-management/claims-recoveries/${id}`}
      />
    </div>
  );
}
