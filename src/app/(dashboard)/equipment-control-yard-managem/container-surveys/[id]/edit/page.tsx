import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { eqyContainerSurveys } from "@/db/schema";
import { EqyForm } from "@/components/equipment-control-yard-managem/eqy-form";
import type { FieldConfig } from "@/components/equipment-control-yard-managem/eqy-form";

const SURVEY_FIELDS: FieldConfig[] = [
  { name: "surveyReference", label: "Survey Reference", type: "text", required: true },
  { name: "containerNumber", label: "Container Number", type: "text", required: true },
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

export default async function EditContainerSurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "equipment:edit")))
    redirect("/equipment-control-yard-managem/container-surveys");

  const { id } = await params;
  const record = await db
    .select()
    .from(eqyContainerSurveys)
    .where(
      and(
        eq(eqyContainerSurveys.id, id),
        eq(eqyContainerSurveys.tenantId, session.tenantId),
        isNull(eqyContainerSurveys.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    surveyReference: record.surveyReference,
    containerNumber: record.containerNumber,
    containerFleetId: record.containerFleetId ?? "",
    surveyType: record.surveyType,
    surveyorName: record.surveyorName ?? "",
    surveyCompany: record.surveyCompany ?? "",
    surveyDate: record.surveyDate?.toISOString() ?? "",
    surveyLocation: record.surveyLocation ?? "",
    overallCondition: record.overallCondition ?? "",
    structuralGrade: record.structuralGrade ?? "",
    floorGrade: record.floorGrade ?? "",
    roofGrade: record.roofGrade ?? "",
    doorGrade: record.doorGrade ?? "",
    nextSurveyDue: record.nextSurveyDue?.toISOString() ?? "",
    status: record.status,
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/equipment-control-yard-managem/container-surveys/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Container Survey
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <EqyForm
          entityType="Container Survey"
          apiPath={`/api/v1/equipment-control-yard-managem/container-surveys/${id}`}
          fields={SURVEY_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/equipment-control-yard-managem/container-surveys/${id}`}
        />
      </div>
    </div>
  );
}
