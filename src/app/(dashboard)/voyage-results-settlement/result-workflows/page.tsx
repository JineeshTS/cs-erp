import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { listResultWorkflows } from "@/lib/voyage-results-settlement/service";
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

export default async function ResultWorkflowsListPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; search?: string; workflowType?: string; status?: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vrs:read")))
    redirect("/");

  const params = await searchParams;
  const { data, meta } = await listResultWorkflows({
    tenantId: session.tenantId,
    cursor: params.cursor,
    search: params.search,
    status: params.status,
  });

  const canCreate = await hasPermission(session.id, session.tenantId, "vrs:create");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Result Workflows</h1>
            <p className="text-sm text-muted-foreground">
              Manage voyage result workflows and approvals
            </p>
          </div>
        </div>
        {canCreate && (
          <Link
            href="/voyage-results-settlement/result-workflows/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Workflow
          </Link>
        )}
      </div>

      <form method="get" className="flex flex-wrap items-center gap-3">
        <input
          name="search"
          type="text"
          placeholder="Search ref or title..."
          defaultValue={params.search ?? ""}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />
        <select
          name="workflowType"
          defaultValue={params.workflowType ?? ""}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">All Types</option>
          <option value="approval_chain">Approval Chain</option>
          <option value="audit_review">Audit Review</option>
          <option value="variance_review">Variance Review</option>
          <option value="exception_handling">Exception Handling</option>
          <option value="escalation">Escalation</option>
        </select>
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button
          type="submit"
          className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
        >
          Search
        </button>
      </form>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-start font-medium">Ref</th>
              <th className="px-4 py-3 text-start font-medium">Title</th>
              <th className="px-4 py-3 text-start font-medium">Type</th>
              <th className="px-4 py-3 text-start font-medium">Voyage</th>
              <th className="px-4 py-3 text-start font-medium">Assigned To</th>
              <th className="px-4 py-3 text-start font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No workflows found.
                </td>
              </tr>
            )}
            {data.map((record) => (
              <tr key={record.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link
                    href={`/voyage-results-settlement/result-workflows/${record.id}`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {record.workflowRef}
                  </Link>
                </td>
                <td className="px-4 py-3">{record.title}</td>
                <td className="px-4 py-3">{record.workflowType.replace(/_/g, " ")}</td>
                <td className="px-4 py-3">{record.voyageNumber ?? "-"}</td>
                <td className="px-4 py-3">{record.assignedTo ?? "-"}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant(record.status)}>{record.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-3">
        {meta.hasMore && meta.cursor && (
          <Link
            href={{
              pathname: "/voyage-results-settlement/result-workflows",
              query: {
                cursor: meta.cursor,
                ...(params.search ? { search: params.search } : {}),
                ...(params.workflowType ? { workflowType: params.workflowType } : {}),
                ...(params.status ? { status: params.status } : {}),
              },
            }}
            className="text-sm text-primary hover:underline"
          >
            Load more
          </Link>
        )}
      </div>
    </div>
  );
}
