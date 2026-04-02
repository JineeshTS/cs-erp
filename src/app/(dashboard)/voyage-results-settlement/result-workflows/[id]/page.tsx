import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, FileText } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getResultWorkflow } from "@/lib/voyage-results-settlement/service";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "draft":
      return "secondary";
    case "in_progress":
      return "warning";
    case "completed":
      return "success";
    case "approved":
      return "success";
    case "rejected":
      return "destructive";
    default:
      return "secondary";
  }
}

export default async function ResultWorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vrs:read")))
    redirect("/");

  const { id } = await params;
  const record = await getResultWorkflow(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "vrs:edit");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/voyage-results-settlement/result-workflows"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <FileText className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{record.workflowRef}</h1>
            <p className="text-sm text-muted-foreground">Result Workflow Detail</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/voyage-results-settlement/result-workflows/${record.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Workflow Ref</dt>
          <dd className="mt-1 text-sm">{record.workflowRef}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Workflow Type</dt>
          <dd className="mt-1 text-sm">{record.workflowType.replace(/_/g, " ")}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Title</dt>
          <dd className="mt-1 text-sm">{record.title ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Voyage Number</dt>
          <dd className="mt-1 text-sm">{record.voyageNumber ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Current Step</dt>
          <dd className="mt-1 text-sm">{record.currentStep ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Total Steps</dt>
          <dd className="mt-1 text-sm">{record.totalSteps ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Completed Steps</dt>
          <dd className="mt-1 text-sm">{record.completedSteps ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Assigned To</dt>
          <dd className="mt-1 text-sm">{record.assignedTo ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Due Date</dt>
          <dd className="mt-1 text-sm">{record.dueDate?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Completed Date</dt>
          <dd className="mt-1 text-sm">{record.completedDate?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Variance Amount</dt>
          <dd className="mt-1 text-sm">{record.varianceAmount !== null ? record.varianceAmount : "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Variance %</dt>
          <dd className="mt-1 text-sm">{record.variancePct !== null ? `${Number(record.variancePct).toFixed(2)}%` : "-"}</dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm">{record.notes ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Status</dt>
          <dd className="mt-1">
            <Badge variant={statusVariant(record.status)}>{record.status}</Badge>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Created At</dt>
          <dd className="mt-1 text-sm">{record.createdAt?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Updated At</dt>
          <dd className="mt-1 text-sm">{record.updatedAt?.toLocaleDateString() ?? "-"}</dd>
        </div>
      </dl>
    </div>
  );
}
