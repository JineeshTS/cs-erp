import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getAgentIncentive } from "@/lib/agent-network-management/service";
import { Badge } from "@/components/ui/badge";

function statusBadge(status: string) {
  switch (status) {
    case "active":
    case "approved":
    case "paid":
      return <Badge variant="success">{status}</Badge>;
    case "expired":
    case "rejected":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function AgentIncentiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "anm:read")))
    redirect("/");

  const { id } = await params;
  const record = await getAgentIncentive(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/agent-network-management/agent-incentives"
            className="text-sm text-muted-foreground hover:underline"
          >
            &larr; Back to Agent Incentives
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">
            {record.incentiveRef}
          </h1>
        </div>
        <Link
          href={`/agent-network-management/agent-incentives/${record.id}/edit`}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Edit
        </Link>
      </div>

      <div className="rounded-lg border p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Incentive Ref
            </dt>
            <dd className="mt-1 text-sm">{record.incentiveRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Status
            </dt>
            <dd className="mt-1">{statusBadge(record.status)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Incentive Type
            </dt>
            <dd className="mt-1 text-sm">{record.incentiveType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Agent Name
            </dt>
            <dd className="mt-1 text-sm">{record.agentName ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Agent Code
            </dt>
            <dd className="mt-1 text-sm">{record.agentCode ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Incentive Period
            </dt>
            <dd className="mt-1 text-sm">{record.incentivePeriod ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Target TEU
            </dt>
            <dd className="mt-1 text-sm">{record.targetTeu ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Achieved TEU
            </dt>
            <dd className="mt-1 text-sm">{record.achievedTeu ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Bonus Rate
            </dt>
            <dd className="mt-1 text-sm">{record.bonusRate ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Bonus Amount
            </dt>
            <dd className="mt-1 text-sm">{record.bonusAmount ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Currency
            </dt>
            <dd className="mt-1 text-sm">{record.incentiveCurrency ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Payout Date
            </dt>
            <dd className="mt-1 text-sm">
              {record.payoutDate
                ? new Date(record.payoutDate).toLocaleDateString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Approved By
            </dt>
            <dd className="mt-1 text-sm">{record.approvedBy ?? "\u2014"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-muted-foreground">
              Notes
            </dt>
            <dd className="mt-1 text-sm">{record.notes ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Created At
            </dt>
            <dd className="mt-1 text-sm">
              {record.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Updated At
            </dt>
            <dd className="mt-1 text-sm">
              {record.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
