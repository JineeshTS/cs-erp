import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { SerForm, type FieldConfig } from "@/components/sustainability-esg-reporting/ser-form";

const ALIGNMENT_FIELDS: FieldConfig[] = [
  {
    name: "alignmentType",
    label: "Alignment Type",
    type: "select",
    required: true,
    options: [
      { value: "annual_assessment", label: "Annual Assessment" },
      { value: "vessel_scoring", label: "Vessel Scoring" },
      { value: "portfolio_alignment", label: "Portfolio Alignment" },
      {
        value: "decarbonization_trajectory",
        label: "Decarbonization Trajectory",
      },
      { value: "reporting_disclosure", label: "Reporting Disclosure" },
    ],
  },
  { name: "reportingYear", label: "Reporting Year", type: "number" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "vesselImo", label: "Vessel IMO", type: "text" },
  { name: "vesselType", label: "Vessel Type", type: "text" },
  { name: "aeoi", label: "AEOI", type: "text" },
  { name: "requiredAeoi", label: "Required AEOI", type: "text" },
  { name: "alignmentDelta", label: "Alignment Delta", type: "text" },
  { name: "climateAligned", label: "Climate Aligned", type: "checkbox" },
  { name: "portfolioScore", label: "Portfolio Score", type: "text" },
  { name: "trajectoryTarget", label: "Trajectory Target", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewPoseidonAlignmentPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "ser:create"))
  )
    redirect("/sustainability-esg-reporting/poseidon-alignments");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/sustainability-esg-reporting/poseidon-alignments"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Poseidon Alignment
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <SerForm
          entityType="Poseidon Alignment"
          apiPath="/api/v1/sustainability-esg-reporting/poseidon-alignments"
          fields={ALIGNMENT_FIELDS}
          returnPath="/sustainability-esg-reporting/poseidon-alignments"
        />
      </div>
    </div>
  );
}
