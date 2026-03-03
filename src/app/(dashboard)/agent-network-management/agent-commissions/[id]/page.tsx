import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getAgentCommission } from "@/lib/agent-network-management/service";
import { Badge } from "@/components/ui/badge";

export default async function AgentCommissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "anm:read")))
    redirect("/");

  const { id } = await params;
  const record = await getAgentCommission(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "anm:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/agent-network-management/agent-commissions"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {record.commissionRef}
            </h1>
            <p className="text-sm text-muted-foreground">
              Agent Commission Details
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/agent-network-management/agent-commissions/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-md border p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Commission Ref
            </dt>
            <dd className="mt-1 text-sm">{record.commissionRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Status
            </dt>
            <dd className="mt-1">
              <Badge variant="outline">{record.status}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Commission Type
            </dt>
            <dd className="mt-1 text-sm capitalize">
              {record.commissionType?.replace(/_/g, " ") ?? "\u2014"}
            </dd>
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
              Booking Ref
            </dt>
            <dd className="mt-1 text-sm">{record.bookingRef ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Freight Amount
            </dt>
            <dd className="mt-1 text-sm">{record.freightAmount ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Commission Rate
            </dt>
            <dd className="mt-1 text-sm">{record.commissionRate ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Commission Amount
            </dt>
            <dd className="mt-1 text-sm">{record.commissionAmount ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Commission Currency
            </dt>
            <dd className="mt-1 text-sm">{record.commissionCurrency ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Period From
            </dt>
            <dd className="mt-1 text-sm">
              {record.periodFrom
                ? new Date(record.periodFrom).toLocaleString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Period To
            </dt>
            <dd className="mt-1 text-sm">
              {record.periodTo
                ? new Date(record.periodTo).toLocaleString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Payment Date
            </dt>
            <dd className="mt-1 text-sm">
              {record.paymentDate
                ? new Date(record.paymentDate).toLocaleString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Payment Ref
            </dt>
            <dd className="mt-1 text-sm">{record.paymentRef ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Invoice Number
            </dt>
            <dd className="mt-1 text-sm">{record.invoiceNumber ?? "\u2014"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-muted-foreground">
              Notes
            </dt>
            <dd className="mt-1 text-sm whitespace-pre-wrap">
              {record.notes ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Created At
            </dt>
            <dd className="mt-1 text-sm">
              {record.createdAt
                ? new Date(record.createdAt).toLocaleString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Updated At
            </dt>
            <dd className="mt-1 text-sm">
              {record.updatedAt
                ? new Date(record.updatedAt).toLocaleString()
                : "\u2014"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
