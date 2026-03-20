import Link from "next/link";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getSubrogationRecovery } from "@/lib/cargo-claims-management/service";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";


export default async function SubrogationRecoveryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ccm:read")))
    redirect("/");

  const { id } = await params;
  const record = await getSubrogationRecovery(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "ccm:edit"
  );
  const canDelete = await hasPermission(
    session.id,
    session.tenantId,
    "ccm:delete"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/cargo-claims-management/subrogation-recoveries"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {record.recoveryRef}
            </h1>
            <p className="text-sm text-muted-foreground">
              Subrogation Recovery Details
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/cargo-claims-management/subrogation-recoveries/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          )}
          {canDelete && (
            <DeleteButton apiPath={`/api/v1/cargo-claims-management/subrogation-recoveries/${id}`} />
          )}
        </div>
      </div>

      <div className="rounded-md border p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Recovery Ref
            </dt>
            <dd className="mt-1 text-sm">{record.recoveryRef}</dd>
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
              Recovery Type
            </dt>
            <dd className="mt-1 text-sm capitalize">
              {record.recoveryType?.replace(/_/g, " ") ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Claim ID
            </dt>
            <dd className="mt-1 text-sm">{record.claimId ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Vessel Name
            </dt>
            <dd className="mt-1 text-sm">{record.vesselName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Respondent Name
            </dt>
            <dd className="mt-1 text-sm">{record.respondentName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Respondent Type
            </dt>
            <dd className="mt-1 text-sm capitalize">
              {record.respondentType?.replace(/_/g, " ") ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Amount Claimed
            </dt>
            <dd className="mt-1 text-sm">{record.amountClaimed ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Amount Recovered
            </dt>
            <dd className="mt-1 text-sm">{record.amountRecovered ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Recovery Currency
            </dt>
            <dd className="mt-1 text-sm">{record.recoveryCurrency ?? "—"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-muted-foreground">
              Recovery Basis
            </dt>
            <dd className="mt-1 text-sm whitespace-pre-wrap">
              {record.recoveryBasis ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Demand Letter Date
            </dt>
            <dd className="mt-1 text-sm">
              {record.demandLetterDate
                ? new Date(record.demandLetterDate).toLocaleString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Response Deadline
            </dt>
            <dd className="mt-1 text-sm">
              {record.responseDeadline
                ? new Date(record.responseDeadline).toLocaleString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Recovery Date
            </dt>
            <dd className="mt-1 text-sm">
              {record.recoveryDate
                ? new Date(record.recoveryDate).toLocaleString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Legal Action Filed
            </dt>
            <dd className="mt-1 text-sm">
              {record.legalActionFiled ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Recovery Percentage
            </dt>
            <dd className="mt-1 text-sm">
              {record.recoveryPercentage ?? "—"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-muted-foreground">
              Notes
            </dt>
            <dd className="mt-1 text-sm whitespace-pre-wrap">
              {record.notes ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Created At
            </dt>
            <dd className="mt-1 text-sm">
              {record.createdAt
                ? new Date(record.createdAt).toLocaleString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Updated At
            </dt>
            <dd className="mt-1 text-sm">
              {record.updatedAt
                ? new Date(record.updatedAt).toLocaleString()
                : "—"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
