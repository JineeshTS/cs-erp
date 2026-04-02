import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { odmRegulatoryFilings } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";


function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

export default async function RegulatoryFilingDetailPage({
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
    .from(odmRegulatoryFilings)
    .where(
      and(
        eq(odmRegulatoryFilings.id, id),
        eq(odmRegulatoryFilings.tenantId, session.tenantId),
        isNull(odmRegulatoryFilings.deletedAt)
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
        <Link
          href="/operations-documentation/regulatory-filings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.filingReference}
          </h1>
          <p className="text-sm text-gray-500">
            {record.filingType.toUpperCase()} - {record.regulatoryBody}
          </p>
        </div>
        <Badge
          variant={
            record.status === "accepted"
              ? "success"
              : record.status === "rejected"
                ? "destructive"
                : record.status === "filed"
                  ? "default"
                  : "secondary"
          }
        >
          {record.status}
        </Badge>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/operations-documentation/regulatory-filings/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          )}
          {canDelete && (
            <DeleteButton apiPath={`/api/v1/operations-documentation/regulatory-filings/${id}`} />
          )}
        </div>
      </div>

      {/* Detail Fields */}
      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Filing Reference", value: record.filingReference },
            { label: "Filing Type", value: record.filingType },
            { label: "Regulatory Body", value: record.regulatoryBody },
            { label: "Country", value: record.country },
            { label: "BL Number", value: record.blNumber ?? "-" },
            { label: "Vessel Name", value: record.vesselName ?? "-" },
            { label: "Voyage Number", value: record.voyageNumber ?? "-" },
            { label: "Port of Loading", value: record.portOfLoading ?? "-" },
            { label: "Port of Discharge", value: record.portOfDischarge ?? "-" },
            { label: "Filing Deadline", value: fmtDate(record.filingDeadline) },
            { label: "Status", value: record.status },
            { label: "Shipper Name", value: record.shipperName ?? "-" },
            { label: "Consignee Name", value: record.consigneeName ?? "-" },
            { label: "Seller Name", value: record.sellerName ?? "-" },
            { label: "Buyer Name", value: record.buyerName ?? "-" },
            { label: "Manufacturer Name", value: record.manufacturerName ?? "-" },
            { label: "HS Code", value: record.hsCode ?? "-" },
            { label: "Cargo Description", value: record.cargoDescription ?? "-" },
            { label: "Container Number", value: record.containerNumber ?? "-" },
            { label: "Seal Number", value: record.sealNumber ?? "-" },
            { label: "Gross Weight", value: record.grossWeight != null ? String(record.grossWeight) : "-" },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-xs font-medium text-gray-500">
                {field.label}
              </p>
              <p className="mt-0.5 text-sm text-gray-900">{field.value}</p>
            </div>
          ))}
        </div>
        {record.notes && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
              {record.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
