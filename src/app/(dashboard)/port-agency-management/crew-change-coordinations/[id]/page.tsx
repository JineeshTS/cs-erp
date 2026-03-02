import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCrewChangeCoordination } from "@/lib/port-agency-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  planned: "secondary",
  in_progress: "default",
  completed: "success",
  cancelled: "destructive",
} as const;

export default async function CrewChangeCoordinationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "port_agency:read")))
    redirect("/");

  const { id } = await params;

  const coord = await getCrewChangeCoordination(id, session.tenantId);
  if (!coord) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "port_agency:edit"
  );

  function formatDate(d: Date | null | undefined): string {
    if (!d) return "-";
    return new Date(d).toLocaleString();
  }

  function formatAmount(
    amount: string | number | null | undefined,
    currency: string | null | undefined
  ): string {
    if (amount == null) return "-";
    return `${amount}${currency ? ` ${currency}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/port-agency-management/crew-change-coordinations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {coord.coordinationRef}
          </h1>
          <p className="text-sm text-gray-500">
            {coord.coordinationType} &middot; {coord.vesselName}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/port-agency-management/crew-change-coordinations/${id}/edit`}
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
              Coordination Ref
            </dt>
            <dd className="mt-1 text-gray-900">{coord.coordinationRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Coordination Type
            </dt>
            <dd className="mt-1 text-gray-900">{coord.coordinationType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    coord.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {coord.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{coord.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IMO Number</dt>
            <dd className="mt-1 text-gray-900">{coord.imoNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Port Call Ref
            </dt>
            <dd className="mt-1 text-gray-900">{coord.portCallRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Port Name</dt>
            <dd className="mt-1 text-gray-900">{coord.portName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Crew Member Name
            </dt>
            <dd className="mt-1 text-gray-900">{coord.crewMemberName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Crew Rank</dt>
            <dd className="mt-1 text-gray-900">{coord.crewRank || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Nationality</dt>
            <dd className="mt-1 text-gray-900">{coord.nationality || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Passport Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {coord.passportNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Seaman Book Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {coord.seamanBookNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Visa Required
            </dt>
            <dd className="mt-1 text-gray-900">
              {coord.visaRequired ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Visa Status</dt>
            <dd className="mt-1 text-gray-900">{coord.visaStatus || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Hotel Required
            </dt>
            <dd className="mt-1 text-gray-900">
              {coord.hotelRequired ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Transport Arranged
            </dt>
            <dd className="mt-1 text-gray-900">
              {coord.transportArranged ? "Yes" : "No"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Transport Details
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {coord.transportDetails || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Scheduled Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {formatDate(coord.scheduledDate)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Estimated Cost
            </dt>
            <dd className="mt-1 text-gray-900">
              {formatAmount(coord.estimatedCost, coord.currency)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Actual Cost</dt>
            <dd className="mt-1 text-gray-900">
              {formatAmount(coord.actualCost, coord.currency)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{coord.currency || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {coord.notes || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {coord.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {coord.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
