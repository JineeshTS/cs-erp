import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getSubAgentConfig } from "@/lib/agent-network-management/service";
import { Badge } from "@/components/ui/badge";

function statusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge variant="success">{status}</Badge>;
    case "expired":
    case "terminated":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function SubAgentConfigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "anm:read")))
    redirect("/");

  const { id } = await params;
  const record = await getSubAgentConfig(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "anm:edit");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/agent-network-management/sub-agent-configs"
            className="text-sm text-muted-foreground hover:underline"
          >
            &larr; Back to Sub-Agent Configs
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">
            {record.configRef}
          </h1>
        </div>
        {canEdit && (
          <Link
            href={`/agent-network-management/sub-agent-configs/${record.id}/edit`}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Config Ref</dt>
            <dd className="mt-1 text-sm">{record.configRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Status</dt>
            <dd className="mt-1">{statusBadge(record.status)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Config Type</dt>
            <dd className="mt-1 text-sm capitalize">{record.configType?.replace(/_/g, " ")}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Parent Agent Name</dt>
            <dd className="mt-1 text-sm">{record.parentAgentName ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Parent Agent Code</dt>
            <dd className="mt-1 text-sm">{record.parentAgentCode ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Sub-Agent Name</dt>
            <dd className="mt-1 text-sm">{record.subAgentName ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Sub-Agent Code</dt>
            <dd className="mt-1 text-sm">{record.subAgentCode ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Territory</dt>
            <dd className="mt-1 text-sm">{record.territory ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Access Level</dt>
            <dd className="mt-1 text-sm">{record.accessLevel ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Commission Split %</dt>
            <dd className="mt-1 text-sm">{record.commissionSplitPct ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Booking Authority</dt>
            <dd className="mt-1 text-sm">{record.bookingAuthority ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Max Booking Value</dt>
            <dd className="mt-1 text-sm">{record.maxBookingValue ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Effective From</dt>
            <dd className="mt-1 text-sm">
              {record.effectiveFrom
                ? new Date(record.effectiveFrom).toLocaleDateString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Effective To</dt>
            <dd className="mt-1 text-sm">
              {record.effectiveTo
                ? new Date(record.effectiveTo).toLocaleDateString()
                : "\u2014"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
            <dd className="mt-1 text-sm">{record.notes ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Created At</dt>
            <dd className="mt-1 text-sm">
              {record.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Updated At</dt>
            <dd className="mt-1 text-sm">
              {record.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
