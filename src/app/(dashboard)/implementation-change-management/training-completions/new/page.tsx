import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
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

export default async function NewTrainingCompletionPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "icm:create"))
  )
    redirect("/implementation-change-management/training-completions");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/implementation-change-management/training-completions"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Training Completion
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IcmForm
          entityType="Training Completion"
          apiPath="/api/v1/implementation-change-management/training-completions"
          fields={TRAINING_COMPLETION_FIELDS}
          returnPath="/implementation-change-management/training-completions"
        />
      </div>
    </div>
  );
}
