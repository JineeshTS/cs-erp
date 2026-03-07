import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { adminAiAgentConfigs } from "@/db/schema";
import { AdminForm } from "@/components/admin-portal/admin-form";
import type { FieldConfig } from "@/components/admin-portal/admin-form";
import { getCustomerOptions } from "@/lib/lookups";

export default async function EditAiAgentConfigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:edit")))
    redirect("/admin-portal/ai-agent-configs");

  const customerOpts = await getCustomerOptions(session.tenantId);

  const AGENT_FIELDS: FieldConfig[] = [
    { name: "agentSlug", label: "Agent Slug", type: "text", required: true },
    { name: "agentName", label: "Agent Name", type: "select", options: customerOpts, required: true },
    { name: "description", label: "Description", type: "textarea" },
    {
      name: "modelProvider",
      label: "Model Provider",
      type: "select",
      required: true,
      options: [
        { value: "anthropic", label: "Anthropic" },
        { value: "openai", label: "OpenAI" },
        { value: "google", label: "Google" },
      ],
    },
    { name: "modelId", label: "Model ID", type: "text", required: true },
    {
      name: "temperature",
      label: "Temperature (0-100)",
      type: "number",
      placeholder: "70",
    },
    {
      name: "maxTokens",
      label: "Max Tokens",
      type: "number",
      placeholder: "4096",
    },
    { name: "systemPrompt", label: "System Prompt", type: "textarea" },
    {
      name: "automationLevel",
      label: "Automation Level (0-100)",
      type: "number",
      placeholder: "95",
    },
    {
      name: "humanReviewThreshold",
      label: "Human Review Threshold (0-100)",
      type: "number",
      placeholder: "5",
    },
    { name: "isActive", label: "Active", type: "checkbox" },
  ];
  const { id } = await params;

  const agent = await db
    .select()
    .from(adminAiAgentConfigs)
    .where(
      and(
        eq(adminAiAgentConfigs.id, id),
        eq(adminAiAgentConfigs.tenantId, session.tenantId),
        isNull(adminAiAgentConfigs.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!agent) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/admin-portal/ai-agent-configs/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit AI Agent Configuration
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AdminForm
          entityType="AI Agent Config"
          apiPath={`/api/v1/admin-portal/ai-agent-configs/${id}`}
          fields={AGENT_FIELDS}
          initialData={{
            agentSlug: agent.agentSlug,
            agentName: agent.agentName,
            description: agent.description ?? "",
            modelProvider: agent.modelProvider,
            modelId: agent.modelId,
            temperature: agent.temperature,
            maxTokens: agent.maxTokens,
            systemPrompt: agent.systemPrompt ?? "",
            automationLevel: agent.automationLevel,
            humanReviewThreshold: agent.humanReviewThreshold,
            isActive: agent.isActive,
          }}
          isEdit
          returnPath={`/admin-portal/ai-agent-configs/${id}`}
        />
      </div>
    </div>
  );
}
