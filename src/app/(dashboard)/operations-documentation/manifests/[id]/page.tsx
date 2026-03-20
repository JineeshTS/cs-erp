import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { odmManifests } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";


function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

export default async function ManifestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "operations:read")))
    redirect("/operations-documentation");

  const { id } = await params;

  const record = await db
    .select()
    .from(odmManifests)
    .where(
      and(
        eq(odmManifests.id, id),
        eq(odmManifests.tenantId, session.tenantId),
        isNull(odmManifests.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "operations:edit");
  const canDelete = await hasPermission(session.id, session.tenantId, "operations:delete");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/operations-documentation/manifests" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.manifestNumber}</h1>
          <p className="text-sm text-gray-500">{record.vesselName} / {record.voyageNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link href={`/operations-documentation/manifests/${id}/edit`} className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          )}
          {canDelete && (
            <DeleteButton apiPath={`/api/v1/operations-documentation/manifests/${id}`} />
          )}
        </div>
      </div>

      {/* Overview */}
      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Manifest Number", value: record.manifestNumber },
            { label: "Manifest Type", value: record.manifestType },
            { label: "Vessel Name", value: record.vesselName },
            { label: "Voyage Number", value: record.voyageNumber },
            { label: "Port of Loading", value: record.portOfLoading ?? "-" },
            { label: "Port of Discharge", value: record.portOfDischarge ?? "-" },
            { label: "Est. Departure", value: fmtDate(record.estimatedDeparture) },
            { label: "Est. Arrival", value: fmtDate(record.estimatedArrival) },
            { label: "Total B/Ls", value: record.totalBls?.toString() ?? "-" },
            { label: "Total Containers", value: record.totalContainers?.toString() ?? "-" },
            { label: "Total Weight", value: record.totalWeight ? `${record.totalWeight} ${record.weightUnit ?? "KG"}` : "-" },
            { label: "Submitted To", value: record.submittedTo ?? "-" },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-xs font-medium text-gray-500">{field.label}</p>
              <p className="mt-0.5 text-sm text-gray-900">{field.value}</p>
            </div>
          ))}
          <div>
            <p className="text-xs font-medium text-gray-500">Status</p>
            <div className="mt-0.5">
              <Badge variant={record.status === "acknowledged" ? "success" : record.status === "rejected" ? "destructive" : record.status === "draft" ? "secondary" : "default"}>
                {record.status}
              </Badge>
            </div>
          </div>
          {record.rejectionReason && (
            <div>
              <p className="text-xs font-medium text-gray-500">Rejection Reason</p>
              <p className="mt-0.5 text-sm text-gray-900">{record.rejectionReason}</p>
            </div>
          )}
        </div>
        {record.notes && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{record.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
