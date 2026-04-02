import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { csoAgentAssignments } from "@/db/schema";
import { CsoForm } from "@/components/customer-service-operations/cso-form";
import type { FieldConfig } from "@/components/customer-service-operations/cso-form";

const AGENT_ASSIGNMENT_FIELDS: FieldConfig[] = [
  { name: "agentId", label: "Agent ID", type: "text", required: true, placeholder: "Enter agent ID" },
  { name: "entityType", label: "Entity Type", type: "select", options: [
    { value: "inquiry", label: "Inquiry" },
    { value: "complaint", label: "Complaint" },
    { value: "service_request", label: "Service Request" },
  ]},
  { name: "entityId", label: "Entity ID", type: "text", required: true, placeholder: "Enter entity ID" },
  { name: "assignedBy", label: "Assigned By", type: "text", required: true, placeholder: "Enter assigner ID" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "reassigned", label: "Reassigned" },
  ]},
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditAgentAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customer_service:edit")))
    redirect("/customer-service-operations/agent-assignments");

  const { id } = await params;
  const record = await db
    .select()
    .from(csoAgentAssignments)
    .where(
      and(
        eq(csoAgentAssignments.id, id),
        eq(csoAgentAssignments.tenantId, session.tenantId),
        isNull(csoAgentAssignments.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    agentId: record.agentId,
    entityType: record.entityType,
    entityId: record.entityId,
    assignedBy: record.assignedBy,
    status: record.status,
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/customer-service-operations/agent-assignments/${id}`} className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Agent Assignment</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <CsoForm
          entityType="Agent Assignment"
          apiPath={`/api/v1/customer-service-operations/agent-assignments/${id}`}
          fields={AGENT_ASSIGNMENT_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/customer-service-operations/agent-assignments/${id}`}
        />
      </div>
    </div>
  );
}
