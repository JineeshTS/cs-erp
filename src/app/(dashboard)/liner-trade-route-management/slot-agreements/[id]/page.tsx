import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getSlotAgreement } from "@/lib/liner-trade-route-management/service";
import { Badge } from "@/components/ui/badge";

function statusBadge(status: string) {
  switch (status) {
    case "active":
    case "executed":
      return <Badge variant="success">{status}</Badge>;
    case "expired":
    case "terminated":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function SlotAgreementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "liner:read")))
    redirect("/");

  const { id } = await params;
  const record = await getSlotAgreement(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "liner:edit");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/liner-trade-route-management/slot-agreements"
            className="text-sm text-muted-foreground hover:underline"
          >
            &larr; Back to Slot Agreements
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">
            {record.agreementRef}
          </h1>
        </div>
        {canEdit && (
          <Link
            href={`/liner-trade-route-management/slot-agreements/${record.id}/edit`}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Agreement Ref</dt>
            <dd className="mt-1 text-sm">{record.agreementRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Agreement Type</dt>
            <dd className="mt-1 text-sm">{record.agreementType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Partner Name</dt>
            <dd className="mt-1 text-sm">{record.partnerName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Partner Code</dt>
            <dd className="mt-1 text-sm">{record.partnerCode ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Service Loop Name</dt>
            <dd className="mt-1 text-sm">{record.serviceLoopName ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Trade Route</dt>
            <dd className="mt-1 text-sm">{record.tradeRoute ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Slot Allocation (TEU)</dt>
            <dd className="mt-1 text-sm">{record.slotAllocationTeu ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Slot Utilization %</dt>
            <dd className="mt-1 text-sm">{record.slotUtilizationPercent ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Revenue Share %</dt>
            <dd className="mt-1 text-sm">{record.revenueSharePercent ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Cost Share %</dt>
            <dd className="mt-1 text-sm">{record.costSharePercent ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Min Quantity Commitment</dt>
            <dd className="mt-1 text-sm">{record.minimumQuantityCommitment ?? "\u2014"}</dd>
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
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Settlement Frequency</dt>
            <dd className="mt-1 text-sm">{record.settlementFrequency ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Last Settlement Date</dt>
            <dd className="mt-1 text-sm">
              {record.lastSettlementDate
                ? new Date(record.lastSettlementDate).toLocaleDateString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Currency</dt>
            <dd className="mt-1 text-sm">{record.currency ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Approved By</dt>
            <dd className="mt-1 text-sm">{record.approvedByName ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Approved At</dt>
            <dd className="mt-1 text-sm">
              {record.approvedAt
                ? new Date(record.approvedAt).toLocaleDateString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Status</dt>
            <dd className="mt-1">{statusBadge(record.status)}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-muted-foreground">Penalty Clause</dt>
            <dd className="mt-1 text-sm">{record.penaltyClause ?? "\u2014"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
            <dd className="mt-1 text-sm">{record.notes ?? "\u2014"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
