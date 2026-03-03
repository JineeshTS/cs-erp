import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CcmForm } from "@/components/cargo-claims-management/ccm-form";

export default async function NewLiabilityAssessmentPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ccm:create")))
    redirect("/");

  const fields = [
    {
      name: "assessmentType",
      label: "Assessment Type",
      type: "select" as const,
      options: [
        { value: "hague_visby", label: "Hague-Visby" },
        { value: "hamburg_rules", label: "Hamburg Rules" },
        { value: "rotterdam_rules", label: "Rotterdam Rules" },
        { value: "national_law", label: "National Law" },
        { value: "contractual", label: "Contractual" },
      ],
    },
    { name: "claimId", label: "Claim ID", type: "text" as const },
    { name: "vesselName", label: "Vessel Name", type: "text" as const },
    {
      name: "applicableConvention",
      label: "Applicable Convention",
      type: "text" as const,
    },
    {
      name: "liabilityBasis",
      label: "Liability Basis",
      type: "textarea" as const,
    },
    {
      name: "limitationApplied",
      label: "Limitation Applied",
      type: "checkbox" as const,
    },
    {
      name: "limitPerPackage",
      label: "Limit Per Package",
      type: "text" as const,
    },
    { name: "limitPerKg", label: "Limit Per Kg", type: "text" as const },
    {
      name: "totalPackages",
      label: "Total Packages",
      type: "number" as const,
    },
    {
      name: "totalWeightKg",
      label: "Total Weight (Kg)",
      type: "text" as const,
    },
    {
      name: "calculatedLimit",
      label: "Calculated Limit",
      type: "text" as const,
    },
    {
      name: "defenseApplicable",
      label: "Defense Applicable",
      type: "text" as const,
    },
    {
      name: "defenseDescription",
      label: "Defense Description",
      type: "textarea" as const,
    },
    {
      name: "recommendedLiability",
      label: "Recommended Liability",
      type: "text" as const,
    },
    {
      name: "carrierLiabilityPct",
      label: "Carrier Liability (%)",
      type: "text" as const,
    },
    { name: "notes", label: "Notes", type: "textarea" as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/cargo-claims-management/liability-assessments"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Liability Assessment
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new liability assessment
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <CcmForm
          entityType="Liability Assessment"
          apiPath="/api/v1/cargo-claims-management/liability-assessments"
          returnPath="/cargo-claims-management/liability-assessments"
          fields={fields}
        />
      </div>
    </div>
  );
}
