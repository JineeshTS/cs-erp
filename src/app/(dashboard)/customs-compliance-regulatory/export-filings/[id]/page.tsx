import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getExportFiling } from "@/lib/customs-compliance-regulatory/service";
import { Badge } from "@/components/ui/badge";

export default async function ExportFilingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customs:read")))
    redirect("/customs-compliance-regulatory");

  const { id } = await params;
  const record = await getExportFiling(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "customs:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/customs-compliance-regulatory/export-filings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.filingRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.exporterName || "Export Filing"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/customs-compliance-regulatory/export-filings/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Filing Ref</dt>
            <dd className="mt-1 text-gray-900">{record.filingRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Declaration Type</dt>
            <dd className="mt-1 text-gray-900">{record.declarationType || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Declaration Number</dt>
            <dd className="mt-1 text-gray-900">{record.declarationNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Customs Office</dt>
            <dd className="mt-1 text-gray-900">{record.customsOffice || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Exporter Name</dt>
            <dd className="mt-1 text-gray-900">{record.exporterName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Exporter Code</dt>
            <dd className="mt-1 text-gray-900">{record.exporterCode || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Exporter Tax ID</dt>
            <dd className="mt-1 text-gray-900">{record.exporterTaxId || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Consignee Name</dt>
            <dd className="mt-1 text-gray-900">{record.consigneeName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Consignee Country</dt>
            <dd className="mt-1 text-gray-900">{record.consigneeCountry || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">BL Number</dt>
            <dd className="mt-1 text-gray-900">{record.blNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Number</dt>
            <dd className="mt-1 text-gray-900">{record.containerNumber || "-"}</dd>
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
            <dt className="text-sm font-medium text-gray-500">Port of Loading</dt>
            <dd className="mt-1 text-gray-900">{record.portOfLoading || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port of Discharge</dt>
            <dd className="mt-1 text-gray-900">{record.portOfDischarge || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Cargo Description</dt>
            <dd className="mt-1 text-gray-900">{record.cargoDescription || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">HS Code</dt>
            <dd className="mt-1 text-gray-900">{record.hsCode || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Gross Weight (kg)</dt>
            <dd className="mt-1 text-gray-900">{record.grossWeightKg ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Number of Packages</dt>
            <dd className="mt-1 text-gray-900">{record.numberOfPackages ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">FOB Value</dt>
            <dd className="mt-1 text-gray-900">{record.fobValue ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Export License Required</dt>
            <dd className="mt-1 text-gray-900">
              {record.exportLicenseRequired ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Export License Number</dt>
            <dd className="mt-1 text-gray-900">{record.exportLicenseNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Filed At</dt>
            <dd className="mt-1 text-gray-900">
              {record.filedAt
                ? new Date(record.filedAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved At</dt>
            <dd className="mt-1 text-gray-900">
              {record.approvedAt
                ? new Date(record.approvedAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Broker Name</dt>
            <dd className="mt-1 text-gray-900">{record.brokerName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Broker License</dt>
            <dd className="mt-1 text-gray-900">{record.brokerLicense || "-"}</dd>
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
                  record.status === "approved"
                    ? "success"
                    : record.status === "rejected"
                      ? "destructive"
                      : record.status === "pending"
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
