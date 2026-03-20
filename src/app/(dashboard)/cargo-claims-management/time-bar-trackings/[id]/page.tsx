import Link from "next/link";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getTimeBarTracking } from "@/lib/cargo-claims-management/service";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";


export default async function TimeBarTrackingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ccm:read")))
    redirect("/");

  const { id } = await params;
  const record = await getTimeBarTracking(id, session.tenantId);
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
            href="/cargo-claims-management/time-bar-trackings"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {record.trackingRef}
            </h1>
            <p className="text-sm text-muted-foreground">
              Time Bar Tracking Details
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/cargo-claims-management/time-bar-trackings/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          )}
          {canDelete && (
            <DeleteButton apiPath={`/api/v1/cargo-claims-management/time-bar-trackings/${id}`} />
          )}
        </div>
      </div>

      <div className="rounded-md border p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Tracking Ref
            </dt>
            <dd className="mt-1 text-sm">{record.trackingRef}</dd>
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
              Tracking Type
            </dt>
            <dd className="mt-1 text-sm capitalize">
              {record.trackingType?.replace(/_/g, " ") ?? "—"}
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
              Applicable Law
            </dt>
            <dd className="mt-1 text-sm">{record.applicableLaw ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Time Bar Period (Months)
            </dt>
            <dd className="mt-1 text-sm">
              {record.timeBarPeriodMonths ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Date of Delivery
            </dt>
            <dd className="mt-1 text-sm">
              {record.dateOfDelivery
                ? new Date(record.dateOfDelivery).toLocaleDateString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Time Bar Deadline
            </dt>
            <dd className="mt-1 text-sm">
              {record.timeBarDeadline
                ? new Date(record.timeBarDeadline).toLocaleDateString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Days Remaining
            </dt>
            <dd className="mt-1 text-sm">{record.daysRemaining ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Extension Granted
            </dt>
            <dd className="mt-1 text-sm">
              {record.extensionGranted != null
                ? record.extensionGranted
                  ? "Yes"
                  : "No"
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Extension Date
            </dt>
            <dd className="mt-1 text-sm">
              {record.extensionDate
                ? new Date(record.extensionDate).toLocaleDateString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Alert Sent (30 Days)
            </dt>
            <dd className="mt-1 text-sm">
              {record.alertSent30Days != null
                ? record.alertSent30Days
                  ? "Yes"
                  : "No"
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Alert Sent (60 Days)
            </dt>
            <dd className="mt-1 text-sm">
              {record.alertSent60Days != null
                ? record.alertSent60Days
                  ? "Yes"
                  : "No"
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Alert Sent (90 Days)
            </dt>
            <dd className="mt-1 text-sm">
              {record.alertSent90Days != null
                ? record.alertSent90Days
                  ? "Yes"
                  : "No"
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Protective Action
            </dt>
            <dd className="mt-1 text-sm">{record.protectiveAction ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Protective Action Date
            </dt>
            <dd className="mt-1 text-sm">
              {record.protectiveActionDate
                ? new Date(record.protectiveActionDate).toLocaleDateString()
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
