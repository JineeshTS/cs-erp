import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Settings } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getChangeRequest } from "@/lib/implementation-change-management/service";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "draft":
      return "secondary";
    case "in_progress":
      return "warning";
    case "completed":
      return "success";
    case "verified":
      return "success";
    case "rejected":
      return "destructive";
    default:
      return "secondary";
  }
}

export default async function ChangeRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "icm:read")))
    redirect("/login");

  const { id } = await params;
  const record = await getChangeRequest(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/implementation-change-management/change-requests"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <Settings className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{record.changeRef}</h1>
            <p className="text-sm text-muted-foreground">Change Request Detail</p>
          </div>
        </div>
        {(await hasPermission(session.id, session.tenantId, "icm:edit")) && (
          <Link
            href={`/implementation-change-management/change-requests/${record.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Change Ref</dt>
          <dd className="mt-1 text-sm">{record.changeRef}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Change Type</dt>
          <dd className="mt-1 text-sm">{record.changeType}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Title</dt>
          <dd className="mt-1 text-sm">{record.title ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Requested By</dt>
          <dd className="mt-1 text-sm">{record.requestedBy ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Department</dt>
          <dd className="mt-1 text-sm">{record.department ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Priority</dt>
          <dd className="mt-1 text-sm">{record.priority ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Impact Level</dt>
          <dd className="mt-1 text-sm">{record.impactLevel ?? "-"}</dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-sm font-medium text-muted-foreground">Description</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm">{record.description ?? "-"}</dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-sm font-medium text-muted-foreground">Justification</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm">{record.justification ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Estimated Effort Days</dt>
          <dd className="mt-1 text-sm">{record.estimatedEffortDays ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Approved By</dt>
          <dd className="mt-1 text-sm">{record.approvedBy ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Approved Date</dt>
          <dd className="mt-1 text-sm">{record.approvedDate?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Target Date</dt>
          <dd className="mt-1 text-sm">{record.targetDate?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Status</dt>
          <dd className="mt-1">
            <Badge variant={statusVariant(record.status)}>{record.status}</Badge>
          </dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm">{record.notes ?? "-"}</dd>
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
