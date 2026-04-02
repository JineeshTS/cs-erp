import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Award } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getClassificationSurvey } from "@/lib/survey-inspection-management/service";
import { SimForm } from "@/components/survey-inspection-management/sim-form";
import type { FieldConfig } from "@/components/survey-inspection-management/sim-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function EditClassificationSurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "survey:edit"))) redirect("/login");

  const vesselOpts = await getVesselOptions(session.tenantId);

  const fields: FieldConfig[] = [
    {
      name: "surveyType",
      label: "Survey Type",
      type: "select",
      required: true,
      options: [
        { value: "annual", label: "Annual" },
        { value: "special", label: "Special" },
        { value: "intermediate", label: "Intermediate" },
        { value: "renewal", label: "Renewal" },
        { value: "bottom", label: "Bottom" },
      ],
    },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    { name: "imoNumber", label: "IMO Number", type: "text" },
    { name: "classificationSociety", label: "Classification Society", type: "text", required: true },
    { name: "classNotation", label: "Class Notation", type: "text" },
    { name: "surveyorName", label: "Surveyor Name", type: "text" },
    { name: "surveyorId", label: "Surveyor ID", type: "text" },
    { name: "surveyLocation", label: "Survey Location", type: "text" },
    { name: "certificateType", label: "Certificate Type", type: "text" },
    { name: "certificateNumber", label: "Certificate Number", type: "text" },
    { name: "certificateIssuedAt", label: "Certificate Issued At", type: "datetime-local" },
    { name: "certificateExpiresAt", label: "Certificate Expires At", type: "datetime-local" },
    { name: "windowStart", label: "Window Start", type: "datetime-local" },
    { name: "windowEnd", label: "Window End", type: "datetime-local" },
    { name: "findingsCount", label: "Findings Count", type: "number" },
    { name: "rectificationDeadline", label: "Rectification Deadline", type: "datetime-local" },
    { name: "rectifiedAt", label: "Rectified At", type: "datetime-local" },
    { name: "scheduledAt", label: "Scheduled At", type: "datetime-local" },
    { name: "completedAt", label: "Completed At", type: "datetime-local" },
    {
      name: "overallResult",
      label: "Overall Result",
      type: "select",
      options: [
        { value: "passed", label: "Passed" },
        { value: "conditional", label: "Conditional" },
        { value: "failed", label: "Failed" },
      ],
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;
  const record = await getClassificationSurvey(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, string | number | boolean> = {
    surveyType: record.surveyType ?? "",
    vesselName: record.vesselName ?? "",
    imoNumber: record.imoNumber ?? "",
    classificationSociety: record.classificationSociety ?? "",
    classNotation: record.classNotation ?? "",
    surveyorName: record.surveyorName ?? "",
    surveyorId: record.surveyorId ?? "",
    surveyLocation: record.surveyLocation ?? "",
    certificateType: record.certificateType ?? "",
    certificateNumber: record.certificateNumber ?? "",
    certificateIssuedAt: record.certificateIssuedAt?.toISOString() ?? "",
    certificateExpiresAt: record.certificateExpiresAt?.toISOString() ?? "",
    windowStart: record.windowStart?.toISOString() ?? "",
    windowEnd: record.windowEnd?.toISOString() ?? "",
    findingsCount: record.findingsCount ?? "",
    rectificationDeadline: record.rectificationDeadline?.toISOString() ?? "",
    rectifiedAt: record.rectifiedAt?.toISOString() ?? "",
    scheduledAt: record.scheduledAt?.toISOString() ?? "",
    completedAt: record.completedAt?.toISOString() ?? "",
    overallResult: record.overallResult ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/survey-inspection-management/classification-surveys/${record.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Award className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit {record.surveyRef}</h1>
          <p className="text-sm text-muted-foreground">
            Update classification survey details
          </p>
        </div>
      </div>

      <SimForm
        entityType="Classification Survey"
        apiPath={`/api/v1/survey-inspection-management/classification-surveys/${id}`}
        fields={fields}
        initialData={initialData}
        isEdit
        returnPath={`/survey-inspection-management/classification-surveys/${id}`}
      />
    </div>
  );
}
