import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { MecForm, type FieldConfig } from "@/components/marpol-environmental-compliance/mec-form";

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

export default async function NewCargoCharterPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mec:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New Cargo Charter</h1>
      <MecForm
        entityType="cargo-charter"
        apiPath="/api/v1/marpol-environmental-compliance/cargo-charters"
        fields={fields}
        returnPath="/marpol-environmental-compliance/cargo-charters"
      />
    </div>
  );
}
