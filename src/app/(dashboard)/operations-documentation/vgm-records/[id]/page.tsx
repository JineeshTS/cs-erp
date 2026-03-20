import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { odmVgmRecords } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";


export default async function VgmRecordDetailPage({
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
    .from(odmVgmRecords)
    .where(
      and(
        eq(odmVgmRecords.id, id),
        eq(odmVgmRecords.tenantId, session.tenantId),
        isNull(odmVgmRecords.deletedAt)
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
        <Link href="/operations-documentation/vgm-records" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.vgmReference}</h1>
          <p className="text-sm text-gray-500">Container: {record.containerNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link href={`/operations-documentation/vgm-records/${id}/edit`} className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          )}
          {canDelete && (
            <DeleteButton apiPath={`/api/v1/operations-documentation/vgm-records/${id}`} />
          )}
        </div>
      </div>

      {/* Overview */}
      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "VGM Reference", value: record.vgmReference },
            { label: "Container Number", value: record.containerNumber },
            { label: "BL Number", value: record.blNumber ?? "-" },
            { label: "Booking Reference", value: record.bookingReference ?? "-" },
            { label: "Weighing Method", value: record.weighingMethod },
            { label: "Verified Gross Mass", value: `${record.verifiedGrossMass} ${record.weightUnit}` },
            { label: "Tare Weight", value: record.tareWeight?.toString() ?? "-" },
            { label: "Cargo Weight", value: record.cargoWeight?.toString() ?? "-" },
            { label: "Dunnage Weight", value: record.dunnageWeight?.toString() ?? "-" },
            { label: "Weight Unit", value: record.weightUnit },
            { label: "Weighing Date", value: record.weighingDate },
            { label: "Weighing Location", value: record.weighingLocation ?? "-" },
            { label: "Weighbridge ID", value: record.weighbridgeId ?? "-" },
            { label: "Certified By", value: record.certifiedBy },
            { label: "Certification Number", value: record.certificationNumber ?? "-" },
            { label: "Shipper Name", value: record.shipperName ?? "-" },
            { label: "Terminal Name", value: record.terminalName ?? "-" },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-xs font-medium text-gray-500">{field.label}</p>
              <p className="mt-0.5 text-sm text-gray-900">{field.value}</p>
            </div>
          ))}
          <div>
            <p className="text-xs font-medium text-gray-500">Status</p>
            <div className="mt-0.5">
              <Badge variant={record.status === "verified" ? "success" : record.status === "pending" ? "secondary" : record.status === "rejected" || record.status === "discrepancy" ? "destructive" : "default"}>
                {record.status}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Discrepancy Flag</p>
            <p className="mt-0.5 text-sm text-gray-900">{record.discrepancyFlag ? "Yes" : "No"}</p>
          </div>
        </div>
        {record.discrepancyNotes && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Discrepancy Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{record.discrepancyNotes}</p>
          </div>
        )}
        {record.notes && (
          <div className="mt-4 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{record.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
