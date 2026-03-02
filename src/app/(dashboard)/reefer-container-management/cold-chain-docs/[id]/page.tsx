import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getColdChainDoc } from "@/lib/reefer-container-management/service";
import { Badge } from "@/components/ui/badge";

export default async function ColdChainDocDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "reefer:read")))
    redirect("/reefer-container-management");

  const { id } = await params;

  const record = await getColdChainDoc(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "reefer:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/reefer-container-management/cold-chain-docs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.documentRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.documentType} &middot;{" "}
            {record.containerNumber || "No container"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/reefer-container-management/cold-chain-docs/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Document Ref</dt>
            <dd className="mt-1 text-gray-900">{record.documentRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Document Type</dt>
            <dd className="mt-1 text-gray-900">{record.documentType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.containerNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Booking Ref</dt>
            <dd className="mt-1 text-gray-900">{record.bookingRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
            <dd className="mt-1 text-gray-900">
              {record.customerName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Commodity Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.commodityName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Origin Country
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.originCountry || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Destination Country
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.destinationCountry || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Phytosanitary Cert
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.phytosanitaryCert || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Health Cert</dt>
            <dd className="mt-1 text-gray-900">{record.healthCert || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Fumigation Cert
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.fumigationCert || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Temperature Log URL
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.temperatureLogUrl || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Compliance Standard
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.complianceStandard || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Regulatory Body
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.regulatoryBody || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Inspection Result
            </dt>
            <dd className="mt-1">
              {record.inspectionResult ? (
                <Badge
                  variant={
                    record.inspectionResult === "pass"
                      ? "success"
                      : record.inspectionResult === "fail"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {record.inspectionResult}
                </Badge>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Inspection Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.inspectionDate
                ? new Date(record.inspectionDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Inspector Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.inspectorName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.expiryDate
                ? new Date(record.expiryDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Document URL</dt>
            <dd className="mt-1 text-gray-900">
              {record.documentUrl || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Verified By</dt>
            <dd className="mt-1 text-gray-900">
              {record.verifiedByName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Verified At</dt>
            <dd className="mt-1 text-gray-900">
              {record.verifiedAt
                ? new Date(record.verifiedAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "verified"
                    ? "success"
                    : record.status === "rejected"
                      ? "destructive"
                      : record.status === "expired"
                        ? "warning"
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
