import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CcmForm, type FieldConfig } from "@/components/cargo-claims-management/ccm-form";

const RECOVERY_FIELDS: FieldConfig[] = [
  {
    name: "recoveryType",
    label: "Recovery Type",
    type: "select",
    options: [
      { value: "subrogation", label: "Subrogation" },
      { value: "contribution", label: "Contribution" },
      { value: "indemnity", label: "Indemnity" },
      { value: "recourse", label: "Recourse" },
      { value: "third_party", label: "Third Party" },
    ],
  },
  { name: "claimId", label: "Claim ID", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "respondentName", label: "Respondent Name", type: "text" },
  { name: "respondentType", label: "Respondent Type", type: "text" },
  { name: "amountClaimed", label: "Amount Claimed", type: "text" },
  { name: "amountRecovered", label: "Amount Recovered", type: "text" },
  { name: "recoveryCurrency", label: "Recovery Currency", type: "text" },
  { name: "recoveryBasis", label: "Recovery Basis", type: "textarea" },
  { name: "demandLetterDate", label: "Demand Letter Date", type: "datetime-local" },
  { name: "responseDeadline", label: "Response Deadline", type: "datetime-local" },
  { name: "recoveryDate", label: "Recovery Date", type: "datetime-local" },
  { name: "legalActionFiled", label: "Legal Action Filed", type: "checkbox" },
  { name: "recoveryPercentage", label: "Recovery Percentage", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewSubrogationRecoveryPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ccm:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/cargo-claims-management/subrogation-recoveries"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Subrogation Recovery
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new subrogation recovery record
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <CcmForm
          entityType="Subrogation Recovery"
          apiPath="/api/v1/cargo-claims-management/subrogation-recoveries"
          returnPath="/cargo-claims-management/subrogation-recoveries"
          fields={RECOVERY_FIELDS}
        />
      </div>
    </div>
  );
}
