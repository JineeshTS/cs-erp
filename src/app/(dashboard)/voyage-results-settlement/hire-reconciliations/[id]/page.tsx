import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Scale } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getHireReconciliation } from "@/lib/voyage-results-settlement/service";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "draft":
      return "secondary";
    case "verified":
      return "success";
    case "published":
      return "default";
    default:
      return "secondary";
  }
}

export default async function HireReconciliationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vrs:read")))
    redirect("/login");

  const { id } = await params;
  const record = await getHireReconciliation(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/voyage-results-settlement/hire-reconciliations"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <Scale className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{record.reconciliationRef}</h1>
            <p className="text-sm text-muted-foreground">Hire Reconciliation Detail</p>
          </div>
        </div>
        {(await hasPermission(session.id, session.tenantId, "vrs:edit")) && (
          <Link
            href={`/voyage-results-settlement/hire-reconciliations/${record.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Reconciliation Ref</dt>
          <dd className="mt-1 text-sm">{record.reconciliationRef}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Reconciliation Type</dt>
          <dd className="mt-1 text-sm capitalize">{record.reconciliationType?.replace(/_/g, " ")}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Status</dt>
          <dd className="mt-1">
            <Badge variant={statusVariant(record.status)}>{record.status}</Badge>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Title</dt>
          <dd className="mt-1 text-sm">{record.title ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Vessel Name</dt>
          <dd className="mt-1 text-sm">{record.vesselName ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Charter Party</dt>
          <dd className="mt-1 text-sm">{record.charterParty ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Owner Amount</dt>
          <dd className="mt-1 text-sm">
            {record.ownerAmount !== null && record.ownerAmount !== undefined
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(Number(record.ownerAmount))
              : "-"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Charterer Amount</dt>
          <dd className="mt-1 text-sm">
            {record.chartererAmount !== null && record.chartererAmount !== undefined
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(Number(record.chartererAmount))
              : "-"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Difference Amount</dt>
          <dd className="mt-1 text-sm">
            {record.differenceAmount !== null && record.differenceAmount !== undefined
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(Number(record.differenceAmount))
              : "-"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Resolved Amount</dt>
          <dd className="mt-1 text-sm">
            {record.resolvedAmount !== null && record.resolvedAmount !== undefined
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(Number(record.resolvedAmount))
              : "-"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Dispute Items</dt>
          <dd className="mt-1 text-sm">{record.disputeItems ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Resolved Items</dt>
          <dd className="mt-1 text-sm">{record.resolvedItems ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Is Reconciled</dt>
          <dd className="mt-1 text-sm">
            {record.isReconciled ? "Yes" : "No"}
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
