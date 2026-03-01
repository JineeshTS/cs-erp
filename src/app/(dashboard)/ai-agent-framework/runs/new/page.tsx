import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { AafForm } from "@/components/ai-agent-framework/aaf-form";
import type { FieldConfig } from "@/components/ai-agent-framework/aaf-form";

const RUN_FIELDS: FieldConfig[] = [
  { name: "runNumber", label: "Run Number", type: "text", required: true, placeholder: "RUN-001" },
  { name: "agentId", label: "Agent ID", type: "text", required: true, placeholder: "Agent UUID" },
  { name: "triggerType", label: "Trigger Type", type: "select", options: [
    { value: "manual", label: "Manual" },
    { value: "scheduled", label: "Scheduled" },
    { value: "event", label: "Event" },
    { value: "orchestration", label: "Orchestration" },
    { value: "api", label: "API" },
  ]},
  { name: "status", label: "Status", type: "select", options: [
    { value: "pending", label: "Pending" },
    { value: "running", label: "Running" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
    { value: "cancelled", label: "Cancelled" },
  ]},
  { name: "priority", label: "Priority", type: "select", options: [
    { value: "low", label: "Low" },
    { value: "normal", label: "Normal" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ]},
  { name: "tokensUsed", label: "Tokens Used", type: "number", placeholder: "0" },
  { name: "costEstimate", label: "Cost Estimate", type: "number", placeholder: "0" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewRunPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ai:create")))
    redirect("/ai-agent-framework/runs");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/ai-agent-framework/runs" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Run</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <AafForm
          entityType="Run"
          apiPath="/api/v1/ai-agent-framework/runs"
          fields={RUN_FIELDS}
          returnPath="/ai-agent-framework/runs"
        />
      </div>
    </div>
  );
}
