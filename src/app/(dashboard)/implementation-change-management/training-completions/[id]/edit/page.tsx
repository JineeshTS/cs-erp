import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getTrainingCompletion } from "@/lib/implementation-change-management/service";
import { IcmForm, type FieldConfig } from "@/components/implementation-change-management/icm-form";

const TRAINING_COMPLETION_FIELDS: FieldConfig[] = [
  {
    name: "completionType",
    label: "Completion Type",
    type: "select",
    required: true,
    options: [
      { value: "module_completion", label: "Module Completion" },
      { value: "certification", label: "Certification" },
      { value: "assessment", label: "Assessment" },
      { value: "refresher", label: "Refresher" },
      { value: "remedial", label: "Remedial" },
    ],
  },
  { name: "employeeName", label: "Employee Name", type: "text" },
  { name: "employeeId", label: "Employee ID", type: "text" },
  { name: "department", label: "Department", type: "text" },
  { name: "trainingModule", label: "Training Module", type: "text" },
  { name: "completionDate", label: "Completion Date", type: "datetime-local" },
  { name: "scorePct", label: "Score (%)", type: "text" },
  { name: "passed", label: "Passed", type: "checkbox" },
  { name: "certificateUrl", label: "Certificate URL", type: "text" },
  { name: "validUntil", label: "Valid Until", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditTrainingCompletionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "icm:edit")))
    redirect("/implementation-change-management/training-completions");

  const { id } = await params;

  const record = await getTrainingCompletion(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/implementation-change-management/training-completions/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Training Completion
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IcmForm
          entityType="Training Completion"
          apiPath={`/api/v1/implementation-change-management/training-completions/${id}`}
          fields={TRAINING_COMPLETION_FIELDS}
          initialData={{
            completionType: record.completionType,
            employeeName: record.employeeName ?? "",
            employeeId: record.employeeId ?? "",
            department: record.department ?? "",
            trainingModule: record.trainingModule ?? "",
            completionDate: record.completionDate ? record.completionDate.toISOString().slice(0, 16) : "",
            scorePct: record.scorePct ?? "",
            passed: record.passed ?? false,
            certificateUrl: record.certificateUrl ?? "",
            validUntil: record.validUntil ? record.validUntil.toISOString().slice(0, 16) : "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/implementation-change-management/training-completions/${id}`}
        />
      </div>
    </div>
  );
}
