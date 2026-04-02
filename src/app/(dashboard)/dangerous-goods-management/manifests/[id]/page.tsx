import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDgmManifest } from "@/lib/dangerous-goods-management/service";
import { Badge } from "@/components/ui/badge";

export default async function ManifestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "dangerous_goods:read")))
    redirect("/dangerous-goods-management");

  const { id } = await params;

  const record = await getDgmManifest(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "dangerous_goods:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dangerous-goods-management/manifests"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.manifestRef}</h1>
          <p className="text-sm text-gray-500">
            {record.vesselName} &middot; Voyage {record.voyageNumber}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/dangerous-goods-management/manifests/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Manifest Ref</dt>
            <dd className="mt-1 text-gray-900">{record.manifestRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{record.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage Number</dt>
            <dd className="mt-1 text-gray-900">{record.voyageNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IMO Number</dt>
            <dd className="mt-1 text-gray-900">{record.imoNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Call Sign</dt>
            <dd className="mt-1 text-gray-900">{record.callSign || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Master Name</dt>
            <dd className="mt-1 text-gray-900">{record.masterName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port of Loading</dt>
            <dd className="mt-1 text-gray-900">{record.portOfLoading}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port of Discharge</dt>
            <dd className="mt-1 text-gray-900">{record.portOfDischarge}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Departure Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.departureDate
                ? new Date(record.departureDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Arrival Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.arrivalDate
                ? new Date(record.arrivalDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total DG Containers</dt>
            <dd className="mt-1 text-gray-900">{record.totalDgContainers ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total DG Weight</dt>
            <dd className="mt-1 text-gray-900">{record.totalDgWeight || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Weight Unit</dt>
            <dd className="mt-1 text-gray-900">{record.weightUnit || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Submitted to Authority</dt>
            <dd className="mt-1 text-gray-900">{record.submittedToAuthority || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Submission Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.submissionDate
                ? new Date(record.submissionDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Submission Reference</dt>
            <dd className="mt-1 text-gray-900">{record.submissionReference || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Acknowledged At</dt>
            <dd className="mt-1 text-gray-900">
              {record.acknowledgedAt
                ? new Date(record.acknowledgedAt).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Prepared By</dt>
            <dd className="mt-1 text-gray-900">{record.preparedByName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved By</dt>
            <dd className="mt-1 text-gray-900">{record.approvedByName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved At</dt>
            <dd className="mt-1 text-gray-900">
              {record.approvedAt
                ? new Date(record.approvedAt).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "approved" || record.status === "acknowledged"
                    ? "success"
                    : record.status === "rejected"
                      ? "destructive"
                      : record.status === "submitted"
                        ? "default"
                        : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
