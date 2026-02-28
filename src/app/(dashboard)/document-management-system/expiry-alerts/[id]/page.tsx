import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { dmsExpiryAlerts } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "warning" | "secondary" | "success" | "destructive"> = {
  pending: "warning",
  notified: "secondary",
  acknowledged: "success",
  renewed: "success",
  dismissed: "destructive",
};

export default async function ExpiryAlertDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "documents:read")))
    redirect("/document-management-system");

  const { id } = await params;

  const alert = await db
    .select()
    .from(dmsExpiryAlerts)
    .where(
      and(
        eq(dmsExpiryAlerts.id, id),
        eq(dmsExpiryAlerts.tenantId, session.tenantId),
        isNull(dmsExpiryAlerts.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!alert) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "documents:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/document-management-system/expiry-alerts"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Expiry Alert</h1>
          <p className="text-sm text-gray-500">
            Alert for document {alert.documentId.slice(0, 8)}...
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/document-management-system/expiry-alerts/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">ID</dt>
            <dd className="mt-1 text-gray-900">{alert.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Document ID</dt>
            <dd className="mt-1 text-gray-900">{alert.documentId}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Alert Type</dt>
            <dd className="mt-1 text-gray-900">{alert.alertType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={STATUS_VARIANT[alert.status] ?? "secondary"}>
                {alert.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Days Before Expiry
            </dt>
            <dd className="mt-1 text-gray-900">{alert.alertDaysBefore}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Alert Date</dt>
            <dd className="mt-1 text-gray-900">
              {alert.alertDate.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Notified At</dt>
            <dd className="mt-1 text-gray-900">
              {alert.notifiedAt ? alert.notifiedAt.toLocaleString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Acknowledged At
            </dt>
            <dd className="mt-1 text-gray-900">
              {alert.acknowledgedAt
                ? alert.acknowledgedAt.toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Acknowledged By
            </dt>
            <dd className="mt-1 text-gray-900">
              {alert.acknowledgedBy ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Renewal Date</dt>
            <dd className="mt-1 text-gray-900">
              {alert.renewalDate
                ? alert.renewalDate.toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Renewal Document ID
            </dt>
            <dd className="mt-1 text-gray-900">
              {alert.renewalDocumentId ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
            <dd className="mt-1 text-gray-900">{alert.assignedTo ?? "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{alert.notes ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {alert.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {alert.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
