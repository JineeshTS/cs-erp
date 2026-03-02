import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getSurveyTracking } from "@/lib/vessel-technical-management/service";
import { VtmForm } from "@/components/vessel-technical-management/vtm-form";
import type { FieldConfig } from "@/components/vessel-technical-management/vtm-form";

const fields: FieldConfig[] = [
  { name: "vesselName", label: "Vessel Name", type: "text", required: true },
  {
    name: "surveyType",
    label: "Survey Type",
    type: "select",
    required: true,
    options: [
      { value: "annual", label: "Annual" },
      { value: "intermediate", label: "Intermediate" },
      { value: "special", label: "Special" },
      { value: "renewal", label: "Renewal" },
      { value: "docking", label: "Docking" },
      { value: "bottom", label: "Bottom" },
      { value: "class_renewal", label: "Class Renewal" },
      { value: "flag_state", label: "Flag State" },
    ],
  },
  {
    name: "surveyAuthority",
    label: "Survey Authority",
    type: "text",
    required: true,
  },
  { name: "surveyorName", label: "Surveyor Name", type: "text" },
  {
    name: "dueDate",
    label: "Due Date",
    type: "datetime-local",
    required: true,
  },
  { name: "windowStartDate", label: "Window Start Date", type: "datetime-local" },
  { name: "windowEndDate", label: "Window End Date", type: "datetime-local" },
  { name: "expiryDate", label: "Expiry Date", type: "datetime-local" },
  { name: "certificateName", label: "Certificate Name", type: "text" },
  { name: "certificateNumber", label: "Certificate Number", type: "text" },
  { name: "issuedBy", label: "Issued By", type: "text" },
  {
    name: "remediationRequired",
    label: "Remediation Required",
    type: "checkbox",
  },
  {
    name: "remediationDeadline",
    label: "Remediation Deadline",
    type: "datetime-local",
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditSurveyTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "technical:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getSurveyTracking(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/vessel-technical-management/survey-trackings/${record.id}`}
          className="rounded-md border border-gray-300 p-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Survey Tracking
          </h1>
          <p className="text-sm text-gray-500">{record.surveyRef}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <VtmForm
          entityType="Survey Tracking"
          apiPath={`/api/v1/vessel-technical-management/survey-trackings/${record.id}`}
          fields={fields}
          initialData={record as unknown as Record<string, unknown>}
          isEdit
          returnPath={`/vessel-technical-management/survey-trackings/${record.id}`}
        />
      </div>
    </div>
  );
}
