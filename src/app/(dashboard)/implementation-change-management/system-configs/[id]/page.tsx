import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Settings } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getSystemConfig } from "@/lib/implementation-change-management/service";
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

export default async function SystemConfigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "icm:read")))
    redirect("/login");

  const { id } = await params;
  const record = await getSystemConfig(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/implementation-change-management/system-configs"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <Settings className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{record.configRef}</h1>
            <p className="text-sm text-muted-foreground">System Config Detail</p>
          </div>
        </div>
        {(await hasPermission(session.id, session.tenantId, "icm:edit")) && (
          <Link
            href={`/implementation-change-management/system-configs/${record.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Config Ref</dt>
          <dd className="mt-1 text-sm">{record.configRef}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Config Type</dt>
          <dd className="mt-1 text-sm">{record.configType}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Title</dt>
          <dd className="mt-1 text-sm">{record.title ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Module</dt>
          <dd className="mt-1 text-sm">{record.module ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Config Key</dt>
          <dd className="mt-1 text-sm">{record.configKey ?? "-"}</dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-sm font-medium text-muted-foreground">Config Value</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm">{record.configValue ?? "-"}</dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-sm font-medium text-muted-foreground">Previous Value</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm">{record.previousValue ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Changed By</dt>
          <dd className="mt-1 text-sm">{record.changedBy ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Changed Date</dt>
          <dd className="mt-1 text-sm">{record.changedDate?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Active</dt>
          <dd className="mt-1 text-sm">{record.isActive ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Version Number</dt>
          <dd className="mt-1 text-sm">{record.versionNumber ?? "-"}</dd>
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
