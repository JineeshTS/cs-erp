import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCargoTracking } from "@/lib/transshipment-hub-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  in_progress: "warning",
  completed: "success",
  verified: "success",
  rejected: "destructive",
} as const;

export default async function CargoTrackingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "thm:read")))
    redirect("/transshipment-hub-management");

  const { id } = await params;

  const record = await getCargoTracking(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "thm:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/transshipment-hub-management/cargo-trackings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.trackingRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.trackingType?.replace(/_/g, " ")} &middot; {record.containerNumber || "No container number"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/transshipment-hub-management/cargo-trackings/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Tracking Ref</dt>
            <dd className="mt-1 text-gray-900">{record.trackingRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tracking Type</dt>
            <dd className="mt-1 text-gray-900 capitalize">{record.trackingType?.replace(/_/g, " ")}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Number</dt>
            <dd className="mt-1 text-gray-900">{record.containerNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Booking Ref</dt>
            <dd className="mt-1 text-gray-900">{record.bookingRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Hub Port</dt>
            <dd className="mt-1 text-gray-900">{record.hubPort || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Current Location</dt>
            <dd className="mt-1 text-gray-900">{record.currentLocation || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Inbound Vessel</dt>
            <dd className="mt-1 text-gray-900">{record.inboundVessel || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Outbound Vessel</dt>
            <dd className="mt-1 text-gray-900">{record.outboundVessel || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Discharge Time</dt>
            <dd className="mt-1 text-gray-900">
              {record.dischargeTime ? record.dischargeTime.toLocaleDateString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Load Time</dt>
            <dd className="mt-1 text-gray-900">
              {record.loadTime ? record.loadTime.toLocaleDateString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Yard Position</dt>
            <dd className="mt-1 text-gray-900">{record.yardPosition || "-"}</dd>
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
