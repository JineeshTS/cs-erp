import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { aafAgents } from "@/db/schema";
import { AafForm } from "@/components/ai-agent-framework/aaf-form";
import type { FieldConfig } from "@/components/ai-agent-framework/aaf-form";

const AGENT_FIELDS: FieldConfig[] = [
  { name: "agentCode", label: "Agent Code", type: "text", required: true },
  { name: "agentName", label: "Agent Name", type: "text", required: true },
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
  { name: "modelId", label: "Model ID", type: "text" },
  { name: "endpoint", label: "Endpoint URL", type: "text" },
  { name: "maxConcurrency", label: "Max Concurrency", type: "number" },
  { name: "timeoutMs", label: "Timeout (ms)", type: "number" },
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

export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ai:edit")))
    redirect("/ai-agent-framework");

  const { id } = await params;
  const record = await db
    .select()
    .from(aafAgents)
    .where(
      and(
        eq(aafAgents.id, id),
        eq(aafAgents.tenantId, session.tenantId),
        isNull(aafAgents.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    agentCode: record.agentCode,
    agentName: record.agentName,
    agentType: record.agentType,
    modelProvider: record.modelProvider ?? "",
    modelId: record.modelId ?? "",
    endpoint: record.endpoint ?? "",
    maxConcurrency: record.maxConcurrency ?? "",
    timeoutMs: record.timeoutMs ?? "",
    isActive: record.isActive,
    status: record.status,
    description: record.description ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/ai-agent-framework/${id}`} className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Agent</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <AafForm
          entityType="Agent"
          apiPath={`/api/v1/ai-agent-framework/agents/${id}`}
          fields={AGENT_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/ai-agent-framework/${id}`}
        />
      </div>
    </div>
  );
}
