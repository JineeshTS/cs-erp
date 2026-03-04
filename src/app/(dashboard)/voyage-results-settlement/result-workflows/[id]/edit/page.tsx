import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getResultWorkflow } from "@/lib/voyage-results-settlement/service";
import { VrsForm } from "@/components/voyage-results-settlement/vrs-form";
import type { FieldConfig } from "@/components/voyage-results-settlement/vrs-form";

const fields: FieldConfig[] = [
  {
    name: "workflowType",
    label: "Workflow Type",
    type: "select",
    required: true,
    options: [
      { value: "approval_chain", label: "Approval Chain" },
      { value: "audit_review", label: "Audit Review" },
      { value: "variance_review", label: "Variance Review" },
      { value: "exception_handling", label: "Exception Handling" },
      { value: "escalation", label: "Escalation" },
    ],
  },
  { name: "title", label: "Title", type: "text" },
  { name: "voyageNumber", label: "Voyage Number", type: "text" },
  { name: "currentStep", label: "Current Step", type: "text" },
  { name: "totalSteps", label: "Total Steps", type: "text" },
  { name: "completedSteps", label: "Completed Steps", type: "text" },
  { name: "assignedTo", label: "Assigned To", type: "text" },
  { name: "dueDate", label: "Due Date", type: "datetime-local" },
  { name: "completedDate", label: "Completed Date", type: "datetime-local" },
  { name: "varianceAmount", label: "Variance Amount", type: "text" },
  { name: "variancePct", label: "Variance %", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditResultWorkflowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vrs:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getResultWorkflow(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/voyage-results-settlement/result-workflows/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <FileText className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Result Workflow</h1>
          <p className="text-sm text-muted-foreground">
            Update result workflow record
          </p>
        </div>
      </div>

      <VrsForm
        entityType="Result Workflow"
        apiPath={`/api/v1/voyage-results-settlement/result-workflows/${id}`}
        fields={fields}
        initialData={{
          workflowType: record.workflowType ?? "",
          title: record.title ?? "",
          voyageNumber: record.voyageNumber ?? "",
          currentStep: record.currentStep ?? "",
          totalSteps: record.totalSteps ?? "",
          completedSteps: record.completedSteps ?? "",
          assignedTo: record.assignedTo ?? "",
          dueDate: record.dueDate?.toISOString() ?? "",
          completedDate: record.completedDate?.toISOString() ?? "",
          varianceAmount: record.varianceAmount ?? "",
          variancePct: record.variancePct ?? "",
          notes: record.notes ?? "",
        }}
        isEdit
        returnPath={`/voyage-results-settlement/result-workflows/${id}`}
      />
    </div>
  );
}
