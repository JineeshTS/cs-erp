import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, AlertTriangle } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getClaimsRegistration } from "@/lib/insurance-claims-management/service";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "settled":
      return "success";
    case "closed":
      return "success";
    case "denied":
      return "destructive";
    case "open":
      return "warning";
    default:
      return "secondary";
  }
}

export default async function ClaimsRegistrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "insurance:read"))) redirect("/login");

  const { id } = await params;
  const record = await getClaimsRegistration(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/insurance-claims-management/claims-registrations"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <AlertTriangle className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{record.claimRef}</h1>
            <p className="text-sm text-muted-foreground">Claims Registration Detail</p>
          </div>
        </div>
        {(await hasPermission(session.id, session.tenantId, "insurance:edit")) && (
          <Link
            href={`/insurance-claims-management/claims-registrations/${record.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Claim Ref</dt>
          <dd className="mt-1 text-sm">{record.claimRef}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Claim Type</dt>
          <dd className="mt-1 text-sm">{record.claimType}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Policy Ref</dt>
          <dd className="mt-1 text-sm">{record.policyRef ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Vessel Name</dt>
          <dd className="mt-1 text-sm">{record.vesselName ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">IMO Number</dt>
          <dd className="mt-1 text-sm">{record.imoNumber ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Voyage Number</dt>
          <dd className="mt-1 text-sm">{record.voyageNumber ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Incident Date</dt>
          <dd className="mt-1 text-sm">{record.incidentDate?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Incident Location</dt>
          <dd className="mt-1 text-sm">{record.incidentLocation ?? "-"}</dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-sm font-medium text-muted-foreground">Incident Description</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm">{record.incidentDescription ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Claimant Name</dt>
          <dd className="mt-1 text-sm">{record.claimantName ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Claimant Contact</dt>
          <dd className="mt-1 text-sm">{record.claimantContact ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Claimant Type</dt>
          <dd className="mt-1 text-sm">{record.claimantType ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Estimated Amount</dt>
          <dd className="mt-1 text-sm">{record.estimatedAmount ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Reserve Amount</dt>
          <dd className="mt-1 text-sm">{record.reserveAmount ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Settled Amount</dt>
          <dd className="mt-1 text-sm">{record.settledAmount ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Claim Currency</dt>
          <dd className="mt-1 text-sm">{record.claimCurrency ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Investigator Name</dt>
          <dd className="mt-1 text-sm">{record.investigatorName ?? "-"}</dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-sm font-medium text-muted-foreground">Investigation Findings</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm">{record.investigationFindings ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Time Bar Date</dt>
          <dd className="mt-1 text-sm">{record.timeBarDate?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Registered At</dt>
          <dd className="mt-1 text-sm">{record.registeredAt?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Closed At</dt>
          <dd className="mt-1 text-sm">{record.closedAt?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Closure Reason</dt>
          <dd className="mt-1 text-sm">{record.closureReason ?? "-"}</dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm">{record.notes ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Status</dt>
          <dd className="mt-1">
            <Badge variant={statusVariant(record.status)}>{record.status}</Badge>
          </dd>
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
