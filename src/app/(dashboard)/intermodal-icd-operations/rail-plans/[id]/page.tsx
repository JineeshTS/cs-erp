import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getRailPlan } from "@/lib/intermodal-icd-operations/service";
import { Badge } from "@/components/ui/badge";

export default async function RailPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "intermodal:read")))
    redirect("/intermodal-icd-operations");

  const { id } = await params;
  const record = await getRailPlan(id, session.tenantId);
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
          href="/intermodal-icd-operations/rail-plans"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.trainNumber || record.railPlanRef}
          </h1>
          <p className="text-sm text-gray-500">{record.railPlanRef}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/intermodal-icd-operations/rail-plans/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Rail Plan Ref</dt>
            <dd className="mt-1 text-gray-900">{record.railPlanRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Train Number</dt>
            <dd className="mt-1 text-gray-900">
              {record.trainNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Train Operator
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.trainOperator || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Origin ICD</dt>
            <dd className="mt-1 text-gray-900">{record.originIcd || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Destination ICD
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.destinationIcd || "-"}
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
            <dt className="text-sm font-medium text-gray-500">Wagon Count</dt>
            <dd className="mt-1 text-gray-900">
              {record.wagonCount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Wagon Type</dt>
            <dd className="mt-1 text-gray-900">{record.wagonType || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Total Capacity (TEU)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.totalCapacityTeu ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Booked TEU</dt>
            <dd className="mt-1 text-gray-900">
              {record.bookedTeu ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Scheduled Departure
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.scheduledDepartureAt
                ? new Date(record.scheduledDepartureAt).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Scheduled Arrival
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.scheduledArrivalAt
                ? new Date(record.scheduledArrivalAt).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Actual Departure
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.actualDepartureAt
                ? new Date(record.actualDepartureAt).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Actual Arrival
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.actualArrivalAt
                ? new Date(record.actualArrivalAt).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Transit Time (days)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.transitTimeDays ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Railway Company
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.railwayCompany || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Booking Cutoff
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.bookingCutoffAt
                ? new Date(record.bookingCutoffAt).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Estimated Cost
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.estimatedCost ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "-"}</dd>
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
                  record.status === "completed"
                    ? "success"
                    : record.status === "cancelled"
                      ? "destructive"
                      : record.status === "in_transit"
                        ? "warning"
                        : record.status === "confirmed"
                          ? "default"
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
