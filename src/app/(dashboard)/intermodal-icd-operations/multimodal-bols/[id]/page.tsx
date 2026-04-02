import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getMultimodalBol } from "@/lib/intermodal-icd-operations/service";
import { Badge } from "@/components/ui/badge";

export default async function MultimodalBolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "intermodal:read")))
    redirect("/intermodal-icd-operations");

  const { id } = await params;
  const record = await getMultimodalBol(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "intermodal:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/intermodal-icd-operations/multimodal-bols"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.bolRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.bolNumber || "Multimodal B/L"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/intermodal-icd-operations/multimodal-bols/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">B/L Ref</dt>
            <dd className="mt-1 text-gray-900">{record.bolRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">B/L Number</dt>
            <dd className="mt-1 text-gray-900">{record.bolNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">B/L Type</dt>
            <dd className="mt-1 text-gray-900">{record.bolType || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Shipper Name</dt>
            <dd className="mt-1 text-gray-900">{record.shipperName || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Shipper Address</dt>
            <dd className="mt-1 text-gray-900">{record.shipperAddress || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Consignee Name</dt>
            <dd className="mt-1 text-gray-900">{record.consigneeName || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Consignee Address</dt>
            <dd className="mt-1 text-gray-900">{record.consigneeAddress || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Notify Party</dt>
            <dd className="mt-1 text-gray-900">{record.notifyPartyName || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Notify Address</dt>
            <dd className="mt-1 text-gray-900">{record.notifyPartyAddress || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Place of Receipt</dt>
            <dd className="mt-1 text-gray-900">{record.placeOfReceipt || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port of Loading</dt>
            <dd className="mt-1 text-gray-900">{record.portOfLoading || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port of Discharge</dt>
            <dd className="mt-1 text-gray-900">{record.portOfDischarge || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Place of Delivery</dt>
            <dd className="mt-1 text-gray-900">{record.placeOfDelivery || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{record.vesselName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage Number</dt>
            <dd className="mt-1 text-gray-900">{record.voyageNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Number</dt>
            <dd className="mt-1 text-gray-900">{record.containerNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Type</dt>
            <dd className="mt-1 text-gray-900">{record.containerType || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Cargo Description</dt>
            <dd className="mt-1 text-gray-900">{record.cargoDescription || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Gross Weight (kg)</dt>
            <dd className="mt-1 text-gray-900">{record.grossWeightKg ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Measurement (CBM)</dt>
            <dd className="mt-1 text-gray-900">{record.measurementCbm ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Number of Packages</dt>
            <dd className="mt-1 text-gray-900">{record.numberOfPackages ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Package Type</dt>
            <dd className="mt-1 text-gray-900">{record.packageType || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Freight Terms</dt>
            <dd className="mt-1 text-gray-900">{record.freightTerms || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Freight Amount</dt>
            <dd className="mt-1 text-gray-900">{record.freightAmount ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Issued At</dt>
            <dd className="mt-1 text-gray-900">
              {record.issuedAt
                ? new Date(record.issuedAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Issued By</dt>
            <dd className="mt-1 text-gray-900">{record.issuedByName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Issued At Place</dt>
            <dd className="mt-1 text-gray-900">{record.issuedAtPlace || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Number of Originals</dt>
            <dd className="mt-1 text-gray-900">{record.numberOfOriginals ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Surrendered</dt>
            <dd className="mt-1 text-gray-900">
              {record.surrendered ? "Yes" : "No"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "delivered"
                    ? "success"
                    : record.status === "cancelled"
                      ? "destructive"
                      : record.status === "surrendered"
                        ? "success"
                        : record.status === "in_transit"
                          ? "warning"
                          : record.status === "issued"
                            ? "warning"
                            : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
