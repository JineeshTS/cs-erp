import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { AafForm } from "@/components/ai-agent-framework/aaf-form";
import type { FieldConfig } from "@/components/ai-agent-framework/aaf-form";

const ORCHESTRATION_TASK_FIELDS: FieldConfig[] = [
  {
    name: "taskCode",
    label: "Task Code",
    type: "text",
    required: true,
    placeholder: "ORCH-001",
  },
  {
    name: "taskName",
    label: "Task Name",
    type: "text",
    required: true,
    placeholder: "Multi-Agent Document Processing",
  },
  {
    name: "strategy",
    label: "Strategy",
    type: "select",
    options: [
      { value: "sequential", label: "Sequential" },
      { value: "parallel", label: "Parallel" },
      { value: "conditional", label: "Conditional" },
      { value: "fan_out", label: "Fan Out" },
    ],
  },
  {
    name: "priority",
    label: "Priority",
    type: "select",
    options: [
      { value: "low", label: "Low" },
      { value: "normal", label: "Normal" },
      { value: "high", label: "High" },
      { value: "urgent", label: "Urgent" },
    ],
  },
  {
    name: "totalSteps",
    label: "Total Steps",
    type: "number",
    placeholder: "0",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Describe the orchestration task...",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Additional notes...",
  },
];

export default async function NewOrchestrationTaskPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ai:create")))
    redirect("/ai-agent-framework/orchestration-tasks");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/ai-agent-framework/orchestration-tasks"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Orchestration Task
        </h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <AafForm
          entityType="Orchestration Task"
          apiPath="/api/v1/ai-agent-framework/orchestrate"
          fields={ORCHESTRATION_TASK_FIELDS}
          returnPath="/ai-agent-framework/orchestration-tasks"
        />
      </div>
    </div>
  );
}
