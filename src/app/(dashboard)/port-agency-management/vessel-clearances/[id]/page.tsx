import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getVesselClearance } from "@/lib/port-agency-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  pending: "secondary",
  submitted: "default",
  approved: "success",
  rejected: "destructive",
  expired: "outline",
} as const;

export default async function VesselClearanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "port_agency:read")))
    redirect("/");

  const { id } = await params;

  const clearance = await getVesselClearance(id, session.tenantId);
  if (!clearance) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "port_agency:edit"
  );

  function formatDate(d: Date | null | undefined): string {
    if (!d) return "-";
    return new Date(d).toLocaleString();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/port-agency-management/vessel-clearances"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {clearance.clearanceRef}
          </h1>
          <p className="text-sm text-gray-500">
            {clearance.clearanceType} &middot; {clearance.vesselName}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/port-agency-management/vessel-clearances/${id}/edit`}
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
              Clearance Ref
            </dt>
            <dd className="mt-1 text-gray-900">{clearance.clearanceRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Clearance Type
            </dt>
            <dd className="mt-1 text-gray-900">{clearance.clearanceType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    clearance.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {clearance.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{clearance.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IMO Number</dt>
            <dd className="mt-1 text-gray-900">
              {clearance.imoNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Port Call Ref
            </dt>
            <dd className="mt-1 text-gray-900">
              {clearance.portCallRef || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Name</dt>
            <dd className="mt-1 text-gray-900">{clearance.portName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Flag State</dt>
            <dd className="mt-1 text-gray-900">
              {clearance.flagState || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Port</dt>
            <dd className="mt-1 text-gray-900">
              {clearance.lastPort || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Next Port</dt>
            <dd className="mt-1 text-gray-900">
              {clearance.nextPort || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Gross Tonnage
            </dt>
            <dd className="mt-1 text-gray-900">
              {clearance.grossTonnage ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Net Tonnage</dt>
            <dd className="mt-1 text-gray-900">
              {clearance.netTonnage ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Crew Count</dt>
            <dd className="mt-1 text-gray-900">
              {clearance.crewCount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Passenger Count
            </dt>
            <dd className="mt-1 text-gray-900">
              {clearance.passengerCount ?? "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Cargo Description
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {clearance.cargoDescription || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Health Declaration
            </dt>
            <dd className="mt-1 text-gray-900">
              {clearance.healthDeclaration ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Customs Clearance
            </dt>
            <dd className="mt-1 text-gray-900">
              {clearance.customsClearance ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Immigration Clearance
            </dt>
            <dd className="mt-1 text-gray-900">
              {clearance.immigrationClearance ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Port Health Clearance
            </dt>
            <dd className="mt-1 text-gray-900">
              {clearance.portHealthClearance ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Quarantine Clearance
            </dt>
            <dd className="mt-1 text-gray-900">
              {clearance.quarantineClearance ? "Yes" : "No"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {clearance.notes || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {formatDate(clearance.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {formatDate(clearance.updatedAt)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
