import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { MobForm, type FieldConfig } from "@/components/mobile-operations-app/mob-form";

const CONTAINER_SURVEY_FIELDS: FieldConfig[] = [
  {
    name: "surveyType",
    label: "Survey Type",
    type: "select",
    required: true,
    options: [
      { value: "pre_trip", label: "Pre Trip" },
      { value: "off_hire", label: "Off Hire" },
      { value: "on_hire", label: "On Hire" },
      { value: "periodic", label: "Periodic" },
      { value: "damage_survey", label: "Damage Survey" },
    ],
  },
  { name: "containerNumber", label: "Container Number", type: "text" },
  { name: "containerSize", label: "Container Size", type: "text" },
  { name: "containerCondition", label: "Container Condition", type: "text" },
  { name: "surveyorName", label: "Surveyor Name", type: "text" },
  { name: "surveyLocation", label: "Survey Location", type: "text" },
  { name: "damageCount", label: "Damage Count", type: "number" },
  { name: "estimatedRepairCost", label: "Estimated Repair Cost", type: "text" },
  { name: "repairCurrency", label: "Repair Currency", type: "text" },
  { name: "cscPlateValid", label: "CSC Plate Valid", type: "checkbox" },
  { name: "surveyedAt", label: "Surveyed At", type: "datetime-local" },
  { name: "photoCount", label: "Photo Count", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewContainerSurveyPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "mob:create"))
  )
    redirect("/mobile-operations-app/container-surveys");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/mobile-operations-app/container-surveys"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Container Survey
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MobForm
          entityType="Container Survey"
          apiPath="/api/v1/mobile-operations-app/container-surveys"
          fields={CONTAINER_SURVEY_FIELDS}
          returnPath="/mobile-operations-app/container-surveys"
        />
      </div>
    </div>
  );
}
