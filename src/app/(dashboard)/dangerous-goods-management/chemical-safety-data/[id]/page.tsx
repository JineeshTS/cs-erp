import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getChemicalSafetyDataRecord } from "@/lib/dangerous-goods-management/service";
import { Badge } from "@/components/ui/badge";

export default async function ChemicalSafetyDataDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "dangerous_goods:read")))
    redirect("/dangerous-goods-management");

  const { id } = await params;

  const record = await getChemicalSafetyDataRecord(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "dangerous_goods:edit"
  );

  const statusVariant = (s: string) => {
    switch (s) {
      case "active":
        return "success" as const;
      case "draft":
        return "secondary" as const;
      case "expired":
        return "destructive" as const;
      case "archived":
        return "outline" as const;
      default:
        return "secondary" as const;
    }
  };

  const formatDate = (d: Date | string | null | undefined) => {
    if (!d) return "-";
    const date = typeof d === "string" ? new Date(d) : d;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dangerous-goods-management/chemical-safety-data"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.chemicalName}
          </h1>
          <p className="text-sm text-gray-500">{record.safetyDataRef}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/dangerous-goods-management/chemical-safety-data/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Reference</dt>
            <dd className="mt-1 text-gray-900">{record.safetyDataRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Chemical Name</dt>
            <dd className="mt-1 text-gray-900">{record.chemicalName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">CAS Number</dt>
            <dd className="mt-1 text-gray-900">{record.casNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">UN Number</dt>
            <dd className="mt-1 text-gray-900">{record.unNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IMDG Class</dt>
            <dd className="mt-1 text-gray-900">{record.imdgClass || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Manufacturer</dt>
            <dd className="mt-1 text-gray-900">{record.manufacturer || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Supplier Name</dt>
            <dd className="mt-1 text-gray-900">{record.supplierName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">SDS Version</dt>
            <dd className="mt-1 text-gray-900">{record.sdsVersion || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">SDS Date</dt>
            <dd className="mt-1 text-gray-900">{formatDate(record.sdsDate)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">SDS Document URL</dt>
            <dd className="mt-1 text-gray-900">
              {record.sdsDocumentUrl ? (
                <a
                  href={record.sdsDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {record.sdsDocumentUrl}
                </a>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
            <dd className="mt-1 text-gray-900">{formatDate(record.expiryDate)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={statusVariant(record.status)}>
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Hazard Identification</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.hazardIdentification || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">First Aid Measures</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.firstAidMeasures || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Firefighting Measures</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.firefightingMeasures || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Accidental Release</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.accidentalRelease || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Handling and Storage</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.handlingAndStorage || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Exposure Controls</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.exposureControls || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Stability and Reactivity</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.stabilityReactivity || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Toxicological Info</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.toxicologicalInfo || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Ecological Info</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.ecologicalInfo || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Disposal Considerations</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.disposalConsiderations || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Transport Info</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.transportInfo || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Regulatory Info</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.regulatoryInfo || "-"}
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
