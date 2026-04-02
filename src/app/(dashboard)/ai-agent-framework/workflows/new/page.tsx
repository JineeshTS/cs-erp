import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { AafForm } from "@/components/ai-agent-framework/aaf-form";
import type { FieldConfig } from "@/components/ai-agent-framework/aaf-form";

const WORKFLOW_FIELDS: FieldConfig[] = [
  {
    name: "workflowCode",
    label: "Workflow Code",
    type: "text",
    required: true,
    placeholder: "WF-BOOKING-001",
  },
  {
    name: "workflowName",
    label: "Workflow Name",
    type: "text",
    required: true,
    placeholder: "Booking Approval Workflow",
  },
  {
    name: "category",
    label: "Category",
    type: "text",
    placeholder: "operations",
  },
  {
    name: "version",
    label: "Version",
    type: "number",
    placeholder: "1",
  },
  {
    name: "timeoutMs",
    label: "Timeout (ms)",
    type: "number",
    placeholder: "300000",
  },
  {
    name: "isActive",
    label: "Active",
    type: "checkbox",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
  },
];

export default async function NewWorkflowDefinitionPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ai:create")))
    redirect("/ai-agent-framework/workflows");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/ai-agent-framework/workflows"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Workflow Definition
        </h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <AafForm
          entityType="Workflow Definition"
          apiPath="/api/v1/ai-agent-framework/workflow-definitions"
          fields={WORKFLOW_FIELDS}
          returnPath="/ai-agent-framework/workflows"
        />
      </div>
    </div>
  );
}
