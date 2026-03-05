import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { redirect, notFound } from "next/navigation";
import { MecForm, type FieldConfig } from "@/components/marpol-environmental-compliance/mec-form";
import { getCargoCharter } from "@/lib/marpol-environmental-compliance/service";

const fields: FieldConfig[] = [
  {
    name: "charterType",
    label: "Charter Type",
    type: "select",
    options: [
      { label: "Annual Disclosure", value: "annual_disclosure" },
      { label: "Voyage Report", value: "voyage_report" },
      { label: "Alignment Assessment", value: "alignment_assessment" },
      { label: "Trajectory Analysis", value: "trajectory_analysis" },
      { label: "Benchmark", value: "benchmark" },
    ],
    required: true,
  },
  { name: "title", label: "Title", type: "text", required: true },
  { name: "reportingYear", label: "Reporting Year", type: "number" },
  { name: "tradeLane", label: "Trade Lane", type: "text" },
  { name: "totalVoyages", label: "Total Voyages", type: "number" },
  { name: "totalCargoTonnes", label: "Total Cargo Tonnes", type: "text" },
  { name: "totalCo2Tonnes", label: "Total CO2 Tonnes", type: "text" },
  { name: "carbonIntensity", label: "Carbon Intensity", type: "text" },
  { name: "alignmentStatus", label: "Alignment Status", type: "text" },
  { name: "disclosureDate", label: "Disclosure Date", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditCargoCharterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mec:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getCargoCharter(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Cargo Charter</h1>
      <MecForm
        entityType="cargo-charter"
        apiPath={`/api/v1/marpol-environmental-compliance/cargo-charters/${id}`}
        fields={fields}
        initialData={{
          charterType: record.charterType ?? "",
          title: record.title ?? "",
          reportingYear: record.reportingYear ?? "",
          tradeLane: record.tradeLane ?? "",
          totalVoyages: record.totalVoyages ?? "",
          totalCargoTonnes: record.totalCargoTonnes ?? "",
          totalCo2Tonnes: record.totalCo2Tonnes ?? "",
          carbonIntensity: record.carbonIntensity ?? "",
          alignmentStatus: record.alignmentStatus ?? "",
          disclosureDate: record.disclosureDate ?? "",
          notes: record.notes ?? "",
        }}
        isEdit
        returnPath={`/marpol-environmental-compliance/cargo-charters/${id}`}
      />
    </div>
  );
}
