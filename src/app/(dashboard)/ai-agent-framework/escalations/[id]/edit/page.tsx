import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { aafEscalations } from "@/db/schema";
import { AafForm } from "@/components/ai-agent-framework/aaf-form";
import type { FieldConfig } from "@/components/ai-agent-framework/aaf-form";

const ESCALATION_FIELDS: FieldConfig[] = [
  { name: "escalationRef", label: "Escalation Reference", type: "text", required: true },
  { name: "sourceType", label: "Source Type", type: "select", required: true, options: [
    { value: "agent_run", label: "Agent Run" },
    { value: "document_job", label: "Document Job" },
    { value: "workflow_instance", label: "Workflow Instance" },
    { value: "orchestration_task", label: "Orchestration Task" },
    { value: "manual", label: "Manual" },
  ]},
  { name: "reason", label: "Reason", type: "textarea", required: true },
  { name: "reasonCode", label: "Reason Code", type: "text" },
  { name: "severity", label: "Severity", type: "select", options: [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ]},
  { name: "priority", label: "Priority", type: "select", options: [
    { value: "low", label: "Low" },
    { value: "normal", label: "Normal" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ]},
  { name: "status", label: "Status", type: "select", options: [
    { value: "open", label: "Open" },
    { value: "assigned", label: "Assigned" },
    { value: "in_review", label: "In Review" },
    { value: "resolved", label: "Resolved" },
    { value: "dismissed", label: "Dismissed" },
  ]},
  { name: "slaDeadline", label: "SLA Deadline", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditEscalationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ai:edit")))
    redirect("/ai-agent-framework/escalations");

  const { id } = await params;
  const record = await db
    .select()
    .from(aafEscalations)
    .where(
      and(
        eq(aafEscalations.id, id),
        eq(aafEscalations.tenantId, session.tenantId),
        isNull(aafEscalations.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    escalationRef: record.escalationRef,
    sourceType: record.sourceType,
    reason: record.reason,
    reasonCode: record.reasonCode ?? "",
    severity: record.severity,
    priority: record.priority,
    status: record.status,
    slaDeadline: record.slaDeadline ? record.slaDeadline.toISOString() : "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/ai-agent-framework/escalations/${id}`} className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Escalation</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <AafForm
          entityType="Escalation"
          apiPath={`/api/v1/ai-agent-framework/escalations/${id}`}
          fields={ESCALATION_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/ai-agent-framework/escalations/${id}`}
        />
      </div>
    </div>
  );
}
