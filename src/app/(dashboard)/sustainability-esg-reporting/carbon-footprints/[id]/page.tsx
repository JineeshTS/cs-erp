import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCarbonFootprint } from "@/lib/sustainability-esg-reporting/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  calculated: "success",
  verified: "success",
  submitted: "warning",
  rejected: "destructive",
} as const;

export default async function CarbonFootprintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ser:read")))
    redirect("/sustainability-esg-reporting");

  const { id } = await params;

  const record = await getCarbonFootprint(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "ser:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/sustainability-esg-reporting/carbon-footprints"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.footprintRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.footprintType} &middot; {record.vesselName || "No vessel"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/sustainability-esg-reporting/carbon-footprints/${id}/edit`}
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
              Footprint Ref
            </dt>
            <dd className="mt-1 text-gray-900">{record.footprintRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    record.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Footprint Type
            </dt>
            <dd className="mt-1 text-gray-900">{record.footprintType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage Ref</dt>
            <dd className="mt-1 text-gray-900">
              {record.voyageRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">
              {record.vesselName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel IMO</dt>
            <dd className="mt-1 text-gray-900">
              {record.vesselImo || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Route Description
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.routeDescription || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Distance (NM)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.distanceNm ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Fuel Consumed (MT)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.fuelConsumedMt ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Fuel Type</dt>
            <dd className="mt-1 text-gray-900">
              {record.fuelType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              CO2 Emissions (MT)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.co2EmissionsMt ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              CH4 Emissions (MT)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.ch4EmissionsMt ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              N2O Emissions (MT)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.n2oEmissionsMt ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              CO2e Emissions (MT)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.co2eEmissionsMt ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Emission Intensity
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.emissionIntensity ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Cargo Carried (MT)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.cargoCarriedMt ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Calculation Method
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.calculationMethod || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
