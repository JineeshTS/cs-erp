import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, ArrowRightLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getClaimsRecovery } from "@/lib/insurance-claims-management/service";
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

export default async function ClaimsRecoveryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "insurance:read"))) redirect("/login");

  const { id } = await params;
  const record = await getClaimsRecovery(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/insurance-claims-management/claims-recoveries"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <ArrowRightLeft className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{record.recoveryRef}</h1>
            <p className="text-sm text-muted-foreground">Claims Recovery Detail</p>
          </div>
        </div>
        {(await hasPermission(session.id, session.tenantId, "insurance:edit")) && (
          <Link
            href={`/insurance-claims-management/claims-recoveries/${record.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Recovery Ref</dt>
          <dd className="mt-1 text-sm">{record.recoveryRef}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Recovery Type</dt>
          <dd className="mt-1 text-sm">{record.recoveryType}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Claim Ref</dt>
          <dd className="mt-1 text-sm">{record.claimRef ?? "-"}</dd>
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
          <dt className="text-sm font-medium text-muted-foreground">Respondent Name</dt>
          <dd className="mt-1 text-sm">{record.respondentName ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Respondent Contact</dt>
          <dd className="mt-1 text-sm">{record.respondentContact ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Respondent Insurer</dt>
          <dd className="mt-1 text-sm">{record.respondentInsurer ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Original Claim Amount</dt>
          <dd className="mt-1 text-sm">{record.originalClaimAmount ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Target Recovery Amount</dt>
          <dd className="mt-1 text-sm">{record.targetRecoveryAmount ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Recovered Amount</dt>
          <dd className="mt-1 text-sm">{record.recoveredAmount ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Recovery Currency</dt>
          <dd className="mt-1 text-sm">{record.recoveryCurrency ?? "-"}</dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-sm font-medium text-muted-foreground">Recovery Basis</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm">{record.recoveryBasis ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Legal Counsel</dt>
          <dd className="mt-1 text-sm">{record.legalCounsel ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Legal Costs</dt>
          <dd className="mt-1 text-sm">{record.legalCosts ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Filed At</dt>
          <dd className="mt-1 text-sm">{record.filedAt?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Settled At</dt>
          <dd className="mt-1 text-sm">{record.settledAt?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Limitation Date</dt>
          <dd className="mt-1 text-sm">{record.limitationDate?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Court Jurisdiction</dt>
          <dd className="mt-1 text-sm">{record.courtJurisdiction ?? "-"}</dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-sm font-medium text-muted-foreground">Arbitration Clause</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm">{record.arbitrationClause ?? "-"}</dd>
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
