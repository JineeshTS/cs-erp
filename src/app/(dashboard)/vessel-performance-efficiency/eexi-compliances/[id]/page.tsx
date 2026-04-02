import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getEexiCompliance } from "@/lib/vessel-performance-efficiency/service";
import { Badge } from "@/components/ui/badge";

export default async function EexiComplianceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vpe:read")))
    redirect("/vessel-performance-efficiency");

  const { id } = await params;

  const record = await getEexiCompliance(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "vpe:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/vessel-performance-efficiency/eexi-compliances"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.complianceRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.complianceType} &middot;{" "}
            {record.vesselName || "No vessel"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/vessel-performance-efficiency/eexi-compliances/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">
              Compliance Ref
            </dt>
            <dd className="mt-1 text-gray-900">{record.complianceRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Compliance Type
            </dt>
            <dd className="mt-1 text-gray-900">{record.complianceType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel ID</dt>
            <dd className="mt-1 text-gray-900">{record.vesselId ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">
              {record.vesselName ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IMO Number</dt>
            <dd className="mt-1 text-gray-900">
              {record.imoNumber ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Attained EEXI
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.attainedEexi ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Required EEXI
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.requiredEexi ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reference Line
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.referenceLine ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reduction Percentage
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.reductionPercentage ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Engine Power Limitation
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.enginePowerLimitation ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              EPL Percentage
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.eplPercentage ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Shaft Power Limitation
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.shaftPowerLimitation ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Survey Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.surveyDate
                ? new Date(record.surveyDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Certificate Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.certificateNumber ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Certificate Expiry
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.certificateExpiry
                ? new Date(record.certificateExpiry).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Flag State</dt>
            <dd className="mt-1 text-gray-900">
              {record.flagState ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Classification Society
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.classificationSociety ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "compliant"
                    ? "success"
                    : record.status === "pending"
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
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
