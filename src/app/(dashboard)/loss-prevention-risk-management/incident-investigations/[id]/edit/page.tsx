import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getIncidentInvestigation } from "@/lib/loss-prevention-risk-management/service";
import { LprForm, type FieldConfig } from "@/components/loss-prevention-risk-management/lpr-form";

const INCIDENT_INVESTIGATION_FIELDS: FieldConfig[] = [
  {
    name: "investigationType",
    label: "Investigation Type",
    type: "select",
    required: true,
    options: [
      { value: "injury", label: "Injury" },
      { value: "property_damage", label: "Property Damage" },
      { value: "environmental", label: "Environmental" },
      { value: "operational", label: "Operational" },
      { value: "security", label: "Security" },
      { value: "fire", label: "Fire" },
    ],
  },
  { name: "title", label: "Title", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "locationName", label: "Location Name", type: "text" },
  { name: "incidentDate", label: "Incident Date", type: "datetime-local" },
  { name: "investigator", label: "Investigator", type: "text" },
  {
    name: "severity",
    label: "Severity",
    type: "select",
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "critical", label: "Critical" },
    ],
  },
  { name: "injuredPersons", label: "Injured Persons", type: "number" },
  {
    name: "rootCauseMethod",
    label: "Root Cause Method",
    type: "select",
    options: [
      { value: "5_why", label: "5 Why" },
      { value: "fishbone", label: "Fishbone" },
      { value: "fault_tree", label: "Fault Tree" },
      { value: "tripod_beta", label: "Tripod Beta" },
    ],
  },
  { name: "rootCauseFindings", label: "Root Cause Findings", type: "textarea" },
  { name: "correctiveActions", label: "Corrective Actions", type: "textarea" },
  { name: "estimatedCost", label: "Estimated Cost", type: "text" },
  { name: "closedDate", label: "Closed Date", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditIncidentInvestigationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "lpr:edit")))
    redirect("/loss-prevention-risk-management/incident-investigations");

  const { id } = await params;

  const record = await getIncidentInvestigation(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/loss-prevention-risk-management/incident-investigations/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Incident Investigation
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LprForm
          entityType="Incident Investigation"
          apiPath={`/api/v1/loss-prevention-risk-management/incident-investigations/${id}`}
          fields={INCIDENT_INVESTIGATION_FIELDS}
          initialData={{
            investigationType: record.investigationType,
            title: record.title ?? "",
            vesselName: record.vesselName ?? "",
            locationName: record.locationName ?? "",
            incidentDate: record.incidentDate ? record.incidentDate.toISOString().slice(0, 16) : "",
            investigator: record.investigator ?? "",
            severity: record.severity ?? "",
            injuredPersons: record.injuredPersons ?? "",
            rootCauseMethod: record.rootCauseMethod ?? "",
            rootCauseFindings: record.rootCauseFindings ?? "",
            correctiveActions: record.correctiveActions ?? "",
            estimatedCost: record.estimatedCost ?? "",
            closedDate: record.closedDate ? record.closedDate.toISOString().slice(0, 16) : "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/loss-prevention-risk-management/incident-investigations/${id}`}
        />
      </div>
    </div>
  );
}
