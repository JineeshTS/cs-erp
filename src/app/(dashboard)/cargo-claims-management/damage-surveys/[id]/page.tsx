import Link from "next/link";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDamageSurvey } from "@/lib/cargo-claims-management/service";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";


export default async function DamageSurveyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ccm:read")))
    redirect("/");

  const { id } = await params;
  const record = await getDamageSurvey(id, session.tenantId);
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
            href="/cargo-claims-management/damage-surveys"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {record.surveyRef}
            </h1>
            <p className="text-sm text-muted-foreground">
              Damage Survey Details
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/cargo-claims-management/damage-surveys/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          )}
          {canDelete && (
            <DeleteButton apiPath={`/api/v1/cargo-claims-management/damage-surveys/${id}`} />
          )}
        </div>
      </div>

      <div className="rounded-md border p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Survey Ref
            </dt>
            <dd className="mt-1 text-sm">{record.surveyRef}</dd>
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
              Survey Type
            </dt>
            <dd className="mt-1 text-sm capitalize">
              {record.surveyType?.replace(/_/g, " ") ?? "—"}
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
              Surveyor Name
            </dt>
            <dd className="mt-1 text-sm">{record.surveyorName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Surveyor Company
            </dt>
            <dd className="mt-1 text-sm">{record.surveyorCompany ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Survey Date
            </dt>
            <dd className="mt-1 text-sm">
              {record.surveyDate
                ? new Date(record.surveyDate).toLocaleDateString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Survey Location
            </dt>
            <dd className="mt-1 text-sm">{record.surveyLocation ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Damage Type
            </dt>
            <dd className="mt-1 text-sm capitalize">
              {record.damageType?.replace(/_/g, " ") ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Damage Extent
            </dt>
            <dd className="mt-1 text-sm capitalize">
              {record.damageExtent?.replace(/_/g, " ") ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Estimated Damage (USD)
            </dt>
            <dd className="mt-1 text-sm">
              {record.estimatedDamageUsd ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Container Condition
            </dt>
            <dd className="mt-1 text-sm">
              {record.containerCondition ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Seal Condition
            </dt>
            <dd className="mt-1 text-sm">{record.sealCondition ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Photos Attached
            </dt>
            <dd className="mt-1 text-sm">
              {record.photosAttached != null
                ? record.photosAttached
                  ? "Yes"
                  : "No"
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Report Received
            </dt>
            <dd className="mt-1 text-sm">
              {record.reportReceived != null
                ? record.reportReceived
                  ? "Yes"
                  : "No"
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Report Date
            </dt>
            <dd className="mt-1 text-sm">
              {record.reportDate
                ? new Date(record.reportDate).toLocaleDateString()
                : "—"}
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
                ? new Date(record.createdAt).toLocaleDateString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Updated At
            </dt>
            <dd className="mt-1 text-sm">
              {record.updatedAt
                ? new Date(record.updatedAt).toLocaleDateString()
                : "—"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
