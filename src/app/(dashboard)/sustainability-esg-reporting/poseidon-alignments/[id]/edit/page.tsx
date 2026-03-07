import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPoseidonAlignment } from "@/lib/sustainability-esg-reporting/service";
import { SerForm, type FieldConfig } from "@/components/sustainability-esg-reporting/ser-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function EditPoseidonAlignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ser:edit")))
    redirect("/sustainability-esg-reporting/poseidon-alignments");

  const vesselOpts = await getVesselOptions(session.tenantId);

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
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
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
  const { id } = await params;

  const record = await getPoseidonAlignment(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/sustainability-esg-reporting/poseidon-alignments/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Poseidon Alignment
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <SerForm
          entityType="Poseidon Alignment"
          apiPath={`/api/v1/sustainability-esg-reporting/poseidon-alignments/${id}`}
          fields={ALIGNMENT_FIELDS}
          initialData={{
            alignmentType: record.alignmentType,
            reportingYear: record.reportingYear,
            vesselName: record.vesselName ?? "",
            vesselImo: record.vesselImo ?? "",
            vesselType: record.vesselType ?? "",
            aeoi: record.aeoi ?? "",
            requiredAeoi: record.requiredAeoi ?? "",
            alignmentDelta: record.alignmentDelta ?? "",
            climateAligned: record.climateAligned ? "true" : "",
            portfolioScore: record.portfolioScore ?? "",
            trajectoryTarget: record.trajectoryTarget ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/sustainability-esg-reporting/poseidon-alignments/${id}`}
        />
      </div>
    </div>
  );
}
