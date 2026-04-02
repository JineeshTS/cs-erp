import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getBookingAuthority } from "@/lib/agent-network-management/service";
import { Badge } from "@/components/ui/badge";

function statusBadge(status: string) {
  switch (status) {
    case "active":
    case "approved":
      return <Badge variant="success">{status}</Badge>;
    case "expired":
    case "revoked":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function BookingAuthorityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "anm:read")))
    redirect("/");

  const { id } = await params;
  const record = await getBookingAuthority(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/agent-network-management/booking-authorities"
            className="text-sm text-muted-foreground hover:underline"
          >
            &larr; Back to Booking Authorities
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">
            {record.authorityRef}
          </h1>
        </div>
        <Link
          href={`/agent-network-management/booking-authorities/${record.id}/edit`}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Edit
        </Link>
      </div>

      <div className="rounded-lg border p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Authority Ref
            </dt>
            <dd className="mt-1 text-sm">{record.authorityRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Status
            </dt>
            <dd className="mt-1">{statusBadge(record.status)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Authority Type
            </dt>
            <dd className="mt-1 text-sm">{record.authorityType}</dd>
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
              Trade Route
            </dt>
            <dd className="mt-1 text-sm">{record.tradeRoute ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Max Booking Value
            </dt>
            <dd className="mt-1 text-sm">{record.maxBookingValue ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Max Discount %
            </dt>
            <dd className="mt-1 text-sm">{record.maxDiscountPct ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Currency
            </dt>
            <dd className="mt-1 text-sm">{record.authorityCurrency ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Container Types
            </dt>
            <dd className="mt-1 text-sm">{record.containerTypes ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Approval Threshold
            </dt>
            <dd className="mt-1 text-sm">{record.approvalThreshold ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Escalation Contact
            </dt>
            <dd className="mt-1 text-sm">{record.escalationContact ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Effective From
            </dt>
            <dd className="mt-1 text-sm">
              {record.effectiveFrom
                ? new Date(record.effectiveFrom).toLocaleDateString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Effective To
            </dt>
            <dd className="mt-1 text-sm">
              {record.effectiveTo
                ? new Date(record.effectiveTo).toLocaleDateString()
                : "\u2014"}
            </dd>
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
