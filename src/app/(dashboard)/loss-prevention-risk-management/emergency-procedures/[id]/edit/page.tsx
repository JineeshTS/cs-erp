import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getEmergencyProcedure } from "@/lib/loss-prevention-risk-management/service";
import { LprForm, type FieldConfig } from "@/components/loss-prevention-risk-management/lpr-form";

const EMERGENCY_PROCEDURE_FIELDS: FieldConfig[] = [
  {
    name: "procedureType",
    label: "Procedure Type",
    type: "select",
    required: true,
    options: [
      { value: "fire", label: "Fire" },
      { value: "abandon_ship", label: "Abandon Ship" },
      { value: "man_overboard", label: "Man Overboard" },
      { value: "grounding", label: "Grounding" },
      { value: "collision", label: "Collision" },
      { value: "piracy", label: "Piracy" },
      { value: "medical", label: "Medical" },
      { value: "pollution", label: "Pollution" },
    ],
  },
  { name: "title", label: "Title", type: "text" },
  { name: "vesselType", label: "Vessel Type", type: "text" },
  { name: "applicableTo", label: "Applicable To", type: "text" },
  { name: "responseSteps", label: "Response Steps", type: "textarea" },
  { name: "equipmentRequired", label: "Equipment Required", type: "textarea" },
  { name: "personnelRoles", label: "Personnel Roles", type: "textarea" },
  { name: "drillFrequency", label: "Drill Frequency", type: "text" },
  { name: "lastDrillDate", label: "Last Drill Date", type: "datetime-local" },
  { name: "nextDrillDate", label: "Next Drill Date", type: "datetime-local" },
  { name: "revisionNumber", label: "Revision Number", type: "number" },
  { name: "approvedBy", label: "Approved By", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditEmergencyProcedurePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "lpr:edit")))
    redirect("/loss-prevention-risk-management/emergency-procedures");

  const { id } = await params;

  const record = await getEmergencyProcedure(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/loss-prevention-risk-management/emergency-procedures/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Emergency Procedure
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LprForm
          entityType="Emergency Procedure"
          apiPath={`/api/v1/loss-prevention-risk-management/emergency-procedures/${id}`}
          fields={EMERGENCY_PROCEDURE_FIELDS}
          initialData={{
            procedureType: record.procedureType,
            title: record.title ?? "",
            vesselType: record.vesselType ?? "",
            applicableTo: record.applicableTo ?? "",
            responseSteps: record.responseSteps ?? "",
            equipmentRequired: record.equipmentRequired ?? "",
            personnelRoles: record.personnelRoles ?? "",
            drillFrequency: record.drillFrequency ?? "",
            lastDrillDate: record.lastDrillDate ? record.lastDrillDate.toISOString().slice(0, 16) : "",
            nextDrillDate: record.nextDrillDate ? record.nextDrillDate.toISOString().slice(0, 16) : "",
            revisionNumber: record.revisionNumber ?? "",
            approvedBy: record.approvedBy ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/loss-prevention-risk-management/emergency-procedures/${id}`}
        />
      </div>
    </div>
  );
}
