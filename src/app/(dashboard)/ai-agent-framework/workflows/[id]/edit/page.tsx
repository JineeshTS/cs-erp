import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { aafWorkflowDefinitions } from "@/db/schema";
import { AafForm } from "@/components/ai-agent-framework/aaf-form";
import type { FieldConfig } from "@/components/ai-agent-framework/aaf-form";

const WORKFLOW_FIELDS: FieldConfig[] = [
  {
    name: "workflowCode",
    label: "Workflow Code",
    type: "text",
    required: true,
  },
  {
    name: "workflowName",
    label: "Workflow Name",
    type: "text",
    required: true,
  },
  {
    name: "category",
    label: "Category",
    type: "text",
  },
  {
    name: "version",
    label: "Version",
    type: "number",
  },
  {
    name: "timeoutMs",
    label: "Timeout (ms)",
    type: "number",
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

export default async function EditWorkflowDefinitionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ai:edit")))
    redirect("/ai-agent-framework/workflows");

  const { id } = await params;
  const record = await db
    .select()
    .from(aafWorkflowDefinitions)
    .where(
      and(
        eq(aafWorkflowDefinitions.id, id),
        eq(aafWorkflowDefinitions.tenantId, session.tenantId),
        isNull(aafWorkflowDefinitions.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    workflowCode: record.workflowCode,
    workflowName: record.workflowName,
    category: record.category ?? "",
    version: record.version,
    timeoutMs: record.timeoutMs ?? "",
    isActive: record.isActive,
    description: record.description ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/ai-agent-framework/workflows/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Workflow Definition
        </h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <AafForm
          entityType="Workflow Definition"
          apiPath={`/api/v1/ai-agent-framework/workflow-definitions/${id}`}
          fields={WORKFLOW_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/ai-agent-framework/workflows/${id}`}
        />
      </div>
    </div>
  );
}
