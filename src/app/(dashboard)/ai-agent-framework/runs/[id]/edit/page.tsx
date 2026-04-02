import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { aafAgentRuns } from "@/db/schema";
import { AafForm } from "@/components/ai-agent-framework/aaf-form";
import type { FieldConfig } from "@/components/ai-agent-framework/aaf-form";

const RUN_FIELDS: FieldConfig[] = [
  { name: "runNumber", label: "Run Number", type: "text", required: true },
  { name: "agentId", label: "Agent ID", type: "text", required: true },
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
  { name: "tokensUsed", label: "Tokens Used", type: "number" },
  { name: "costEstimate", label: "Cost Estimate", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditRunPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ai:edit")))
    redirect("/ai-agent-framework/runs");

  const { id } = await params;
  const record = await db
    .select()
    .from(aafAgentRuns)
    .where(
      and(
        eq(aafAgentRuns.id, id),
        eq(aafAgentRuns.tenantId, session.tenantId),
        isNull(aafAgentRuns.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    runNumber: record.runNumber,
    agentId: record.agentId,
    triggerType: record.triggerType,
    status: record.status,
    priority: record.priority,
    tokensUsed: record.tokensUsed ?? "",
    costEstimate: record.costEstimate ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/ai-agent-framework/runs/${id}`} className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Run</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <AafForm
          entityType="Run"
          apiPath={`/api/v1/ai-agent-framework/runs/${id}`}
          fields={RUN_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/ai-agent-framework/runs/${id}`}
        />
      </div>
    </div>
  );
}
