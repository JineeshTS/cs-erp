import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getGaAgreement } from "@/lib/agent-network-management/service";
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

export default async function GaAgreementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "anm:read")))
    redirect("/");

  const { id } = await params;
  const record = await getGaAgreement(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "anm:edit");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/agent-network-management/ga-agreements"
            className="text-sm text-muted-foreground hover:underline"
          >
            &larr; Back to GA Agreements
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">
            {record.agreementRef}
          </h1>
        </div>
        {canEdit && (
          <Link
            href={`/agent-network-management/ga-agreements/${record.id}/edit`}
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
            <dt className="text-sm font-medium text-muted-foreground">Status</dt>
            <dd className="mt-1">{statusBadge(record.status)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Agreement Type</dt>
            <dd className="mt-1 text-sm capitalize">{record.agreementType?.replace(/_/g, " ")}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Agent Name</dt>
            <dd className="mt-1 text-sm">{record.agentName ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Agent Code</dt>
            <dd className="mt-1 text-sm">{record.agentCode ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Territory</dt>
            <dd className="mt-1 text-sm">{record.territory ?? "\u2014"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-muted-foreground">Ports Covered</dt>
            <dd className="mt-1 text-sm">{record.portsCovered ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Commencement Date</dt>
            <dd className="mt-1 text-sm">
              {record.commencementDate
                ? new Date(record.commencementDate).toLocaleDateString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Expiry Date</dt>
            <dd className="mt-1 text-sm">
              {record.expiryDate
                ? new Date(record.expiryDate).toLocaleDateString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Auto Renewal</dt>
            <dd className="mt-1 text-sm">{record.autoRenewal ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Termination Notice Days</dt>
            <dd className="mt-1 text-sm">{record.terminationNoticeDays ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Base Commission %</dt>
            <dd className="mt-1 text-sm">{record.baseCommissionPct ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Commission Currency</dt>
            <dd className="mt-1 text-sm">{record.commissionCurrency ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Exclusivity Clause</dt>
            <dd className="mt-1 text-sm">{record.exclusivityClause ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Performance Guarantee</dt>
            <dd className="mt-1 text-sm">{record.performanceGuarantee ?? "\u2014"}</dd>
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
