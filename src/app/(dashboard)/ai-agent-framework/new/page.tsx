import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { AafForm } from "@/components/ai-agent-framework/aaf-form";
import type { FieldConfig } from "@/components/ai-agent-framework/aaf-form";
import { getCustomerOptions } from "@/lib/lookups";

export default async function NewAgentPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ai:create")))
    redirect("/ai-agent-framework");

  const customerOpts = await getCustomerOptions(session.tenantId);

  const AGENT_FIELDS: FieldConfig[] = [
    { name: "agentCode", label: "Agent Code", type: "text", required: true, placeholder: "DOC-INTEL-001" },
    { name: "agentName", label: "Agent Name", type: "select", options: customerOpts, required: true },
    { name: "agentType", label: "Agent Type", type: "select", required: true, options: [
      { value: "document_intelligence", label: "Document Intelligence" },
      { value: "workflow_orchestrator", label: "Workflow Orchestrator" },
      { value: "communication", label: "Communication" },
      { value: "compliance", label: "Compliance" },
      { value: "exception_handler", label: "Exception Handler" },
      { value: "query_processor", label: "Query Processor" },
      { value: "custom", label: "Custom" },
    ]},
    { name: "modelProvider", label: "Model Provider", type: "select", options: [
      { value: "anthropic", label: "Anthropic" },
      { value: "openai", label: "OpenAI" },
      { value: "google", label: "Google" },
      { value: "azure", label: "Azure" },
      { value: "custom", label: "Custom" },
    ]},
    { name: "modelId", label: "Model ID", type: "text", placeholder: "claude-sonnet-4-20250514" },
    { name: "endpoint", label: "Endpoint URL", type: "text", placeholder: "https://api.example.com/v1" },
    { name: "maxConcurrency", label: "Max Concurrency", type: "number", placeholder: "1" },
    { name: "timeoutMs", label: "Timeout (ms)", type: "number", placeholder: "30000" },
    { name: "isActive", label: "Active", type: "checkbox" },
    { name: "status", label: "Status", type: "select", options: [
      { value: "idle", label: "Idle" },
      { value: "running", label: "Running" },
      { value: "error", label: "Error" },
      { value: "disabled", label: "Disabled" },
    ]},
    { name: "description", label: "Description", type: "textarea" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/ai-agent-framework" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Agent</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <AafForm
          entityType="Agent"
          apiPath="/api/v1/ai-agent-framework/agents"
          fields={AGENT_FIELDS}
          returnPath="/ai-agent-framework"
        />
      </div>
    </div>
  );
}
