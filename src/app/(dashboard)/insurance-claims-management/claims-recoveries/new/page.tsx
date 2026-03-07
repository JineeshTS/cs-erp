import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRightLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { IcmForm } from "@/components/insurance-claims-management/icm-form";
import type { FieldConfig } from "@/components/insurance-claims-management/icm-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function NewClaimsRecoveryPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "insurance:create"))) redirect("/login");

  const vesselOpts = await getVesselOptions(session.tenantId);

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
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/insurance-claims-management/claims-recoveries"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <ArrowRightLeft className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Claims Recovery</h1>
          <p className="text-sm text-muted-foreground">
            Create a new claims recovery record
          </p>
        </div>
      </div>

      <IcmForm
        entityType="Claims Recovery"
        apiPath="/api/v1/insurance-claims-management/claims-recoveries"
        fields={fields}
        returnPath="/insurance-claims-management/claims-recoveries"
      />
    </div>
  );
}
