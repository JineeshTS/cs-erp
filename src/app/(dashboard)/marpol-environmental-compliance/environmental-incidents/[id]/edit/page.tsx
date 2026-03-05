import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { redirect, notFound } from "next/navigation";
import { MecForm, type FieldConfig } from "@/components/marpol-environmental-compliance/mec-form";
import { getEnvironmentalIncident } from "@/lib/marpol-environmental-compliance/service";

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
  { name: "vesselName", label: "Vessel Name", type: "text" },
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

export default async function EditEnvironmentalIncidentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mec:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getEnvironmentalIncident(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Environmental Incident</h1>
      <MecForm
        entityType="environmental-incident"
        apiPath={`/api/v1/marpol-environmental-compliance/environmental-incidents/${id}`}
        fields={fields}
        initialData={{
          incidentType: record.incidentType ?? "",
          title: record.title ?? "",
          vesselName: record.vesselName ?? "",
          imoNumber: record.imoNumber ?? "",
          incidentDate: record.incidentDate ?? "",
          locationDescription: record.locationDescription ?? "",
          severity: record.severity ?? "",
          quantitySpilled: record.quantitySpilled ?? "",
          rootCause: record.rootCause ?? "",
          correctiveActions: record.correctiveActions ?? "",
          reportedToAuthority: record.reportedToAuthority ?? false,
          fineAmount: record.fineAmount ?? "",
          notes: record.notes ?? "",
        }}
        isEdit
        returnPath={`/marpol-environmental-compliance/environmental-incidents/${id}`}
      />
    </div>
  );
}
