import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
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

export default async function NewEmergencyProcedurePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "lpr:create"))
  )
    redirect("/loss-prevention-risk-management/emergency-procedures");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/loss-prevention-risk-management/emergency-procedures"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Emergency Procedure
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LprForm
          entityType="Emergency Procedure"
          apiPath="/api/v1/loss-prevention-risk-management/emergency-procedures"
          fields={EMERGENCY_PROCEDURE_FIELDS}
          returnPath="/loss-prevention-risk-management/emergency-procedures"
        />
      </div>
    </div>
  );
}
