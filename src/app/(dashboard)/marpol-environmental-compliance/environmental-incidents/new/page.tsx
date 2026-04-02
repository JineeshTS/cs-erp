import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { MecForm, type FieldConfig } from "@/components/marpol-environmental-compliance/mec-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function NewEnvironmentalIncidentPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mec:create")))
    redirect("/");

  const vesselOpts = await getVesselOptions(session.tenantId);

  const fields: FieldConfig[] = [
    {
      name: "incidentType",
      label: "Incident Type",
      type: "select",
      options: [
        { label: "Oil Spill", value: "oil_spill" },
        { label: "Chemical Release", value: "chemical_release" },
        { label: "Sewage Discharge", value: "sewage_discharge" },
        { label: "Garbage Violation", value: "garbage_violation" },
        { label: "Air Emission", value: "air_emission" },
        { label: "Ballast Violation", value: "ballast_violation" },
      ],
      required: true,
    },
    { name: "title", label: "Title", type: "text", required: true },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "imoNumber", label: "IMO Number", type: "text" },
    { name: "incidentDate", label: "Incident Date", type: "datetime-local" },
    { name: "locationDescription", label: "Location Description", type: "text" },
    { name: "severity", label: "Severity", type: "text" },
    { name: "quantitySpilled", label: "Quantity Spilled", type: "text" },
    { name: "rootCause", label: "Root Cause", type: "textarea" },
    { name: "correctiveActions", label: "Corrective Actions", type: "textarea" },
    { name: "reportedToAuthority", label: "Reported to Authority", type: "checkbox" },
    { name: "fineAmount", label: "Fine Amount", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New Environmental Incident</h1>
      <MecForm
        entityType="environmental-incident"
        apiPath="/api/v1/marpol-environmental-compliance/environmental-incidents"
        fields={fields}
        returnPath="/marpol-environmental-compliance/environmental-incidents"
      />
    </div>
  );
}
