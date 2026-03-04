import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { KmtForm, type FieldConfig } from "@/components/knowledge-management-training/kmt-form";

const ONBOARDING_WORKFLOW_FIELDS: FieldConfig[] = [
  {
    name: "workflowType",
    label: "Workflow Type",
    type: "select",
    required: true,
    options: [
      { value: "new_hire", label: "New Hire" },
      { value: "role_transfer", label: "Role Transfer" },
      { value: "department_change", label: "Department Change" },
      { value: "contractor_onboard", label: "Contractor Onboard" },
      { value: "rehire", label: "Rehire" },
    ],
  },
  { name: "employeeName", label: "Employee Name", type: "text" },
  { name: "employeeId", label: "Employee ID", type: "text" },
  { name: "department", label: "Department", type: "text" },
  { name: "position", label: "Position", type: "text" },
  { name: "startDate", label: "Start Date", type: "datetime-local" },
  { name: "targetCompletionDate", label: "Target Completion Date", type: "datetime-local" },
  { name: "completedSteps", label: "Completed Steps", type: "number" },
  { name: "totalSteps", label: "Total Steps", type: "number" },
  { name: "progressPct", label: "Progress (%)", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewOnboardingWorkflowPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "kmt:create"))
  )
    redirect("/knowledge-management-training/onboarding-workflows");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/knowledge-management-training/onboarding-workflows"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Onboarding Workflow
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <KmtForm
          entityType="Onboarding Workflow"
          apiPath="/api/v1/knowledge-management-training/onboarding-workflows"
          fields={ONBOARDING_WORKFLOW_FIELDS}
          returnPath="/knowledge-management-training/onboarding-workflows"
        />
      </div>
    </div>
  );
}
