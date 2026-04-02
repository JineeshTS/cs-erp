import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { EqyForm } from "@/components/equipment-control-yard-managem/eqy-form";
import type { FieldConfig } from "@/components/equipment-control-yard-managem/eqy-form";

const SURVEY_FIELDS: FieldConfig[] = [
  { name: "surveyReference", label: "Survey Reference", type: "text", required: true, placeholder: "SRV-2026-001" },
  { name: "containerNumber", label: "Container Number", type: "text", required: true, placeholder: "ABCU1234567" },
  { name: "containerFleetId", label: "Container Fleet ID", type: "text" },
  { name: "surveyType", label: "Survey Type", type: "select", options: [
    { value: "condition", label: "Condition" },
    { value: "damage", label: "Damage" },
    { value: "pre_trip", label: "Pre-Trip" },
    { value: "on_hire", label: "On-Hire" },
    { value: "off_hire", label: "Off-Hire" },
    { value: "periodic", label: "Periodic" },
  ]},
  { name: "surveyorName", label: "Surveyor Name", type: "text" },
  { name: "surveyCompany", label: "Survey Company", type: "text" },
  { name: "surveyDate", label: "Survey Date", type: "datetime-local", required: true },
  { name: "surveyLocation", label: "Survey Location", type: "text" },
  { name: "overallCondition", label: "Overall Condition", type: "select", options: [
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
    { value: "poor", label: "Poor" },
    { value: "condemned", label: "Condemned" },
  ]},
  { name: "structuralGrade", label: "Structural Grade", type: "text" },
  { name: "floorGrade", label: "Floor Grade", type: "text" },
  { name: "roofGrade", label: "Roof Grade", type: "text" },
  { name: "doorGrade", label: "Door Grade", type: "text" },
  { name: "nextSurveyDue", label: "Next Survey Due", type: "datetime-local" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "scheduled", label: "Scheduled" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "reviewed", label: "Reviewed" },
  ]},
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewContainerSurveyPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "equipment:create")))
    redirect("/equipment-control-yard-managem/container-surveys");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/equipment-control-yard-managem/container-surveys"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Container Survey
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <EqyForm
          entityType="Container Survey"
          apiPath="/api/v1/equipment-control-yard-managem/container-surveys"
          fields={SURVEY_FIELDS}
          returnPath="/equipment-control-yard-managem/container-surveys"
        />
      </div>
    </div>
  );
}
