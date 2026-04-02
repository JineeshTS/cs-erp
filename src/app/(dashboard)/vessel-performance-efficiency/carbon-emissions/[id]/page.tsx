import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCarbonEmission } from "@/lib/vessel-performance-efficiency/service";
import { Badge } from "@/components/ui/badge";

export default async function CarbonEmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vpe:read")))
    redirect("/vessel-performance-efficiency");

  const { id } = await params;

  const record = await getCarbonEmission(id, session.tenantId);
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
          href="/vessel-performance-efficiency/carbon-emissions"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.emissionRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.emissionType} &middot;{" "}
            {record.vesselName || "No vessel"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/vessel-performance-efficiency/carbon-emissions/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Emission Ref</dt>
            <dd className="mt-1 text-gray-900">{record.emissionRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Emission Type
            </dt>
            <dd className="mt-1 text-gray-900">{record.emissionType}</dd>
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
            <dt className="text-sm font-medium text-gray-500">Voyage ID</dt>
            <dd className="mt-1 text-gray-900">{record.voyageId ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reporting Period Start
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.reportingPeriodStart
                ? new Date(record.reportingPeriodStart).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reporting Period End
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.reportingPeriodEnd
                ? new Date(record.reportingPeriodEnd).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total CO2 MT
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalCo2Mt ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total CH4 MT
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalCh4Mt ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total N2O MT
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalN2oMt ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">CO2e Total</dt>
            <dd className="mt-1 text-gray-900">
              {record.co2eTotal ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Fuel Consumed MT
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.fuelConsumedMt ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Emission Factor
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.emissionFactor ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              EU MRV Compliance
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.euMrvCompliance ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              IMO Data Collection
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.imoDataCollection ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              EU ETS Liability
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.euEtsLiability ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Carbon Intensity
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.carbonIntensity ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reduction Target
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.reductionTarget ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Reduction Achieved
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.reductionAchieved ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "verified"
                    ? "success"
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
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
