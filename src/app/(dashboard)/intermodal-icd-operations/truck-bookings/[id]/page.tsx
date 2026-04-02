import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getTruckBooking } from "@/lib/intermodal-icd-operations/service";
import { Badge } from "@/components/ui/badge";

export default async function TruckBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "intermodal:read")))
    redirect("/intermodal-icd-operations");

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "intermodal:edit"
  );

  const record = await getTruckBooking(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/intermodal-icd-operations/truck-bookings"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {record.bookingRef}
          </h1>
        </div>
        {canEdit && (
          <Link
            href={`/intermodal-icd-operations/truck-bookings/${record.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Booking Ref</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.bookingRef}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Transporter Name
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.transporterName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Transporter Code
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.transporterCode || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Driver Name</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.driverName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Driver License
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.driverLicense || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Driver Phone</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.driverPhone || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Truck Plate Number
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.truckPlateNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Trailer Plate Number
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.trailerPlateNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Truck Type</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.truckType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Number
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.containerNumber || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Size
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.containerSize || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">
              Cargo Description
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.cargoDescription || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Gross Weight (kg)
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.grossWeightKg != null ? String(record.grossWeightKg) : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Pickup Location
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.pickupLocation || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Delivery Location
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.deliveryLocation || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Scheduled Pickup
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.scheduledPickupAt
                ? new Date(record.scheduledPickupAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Scheduled Delivery
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.scheduledDeliveryAt
                ? new Date(record.scheduledDeliveryAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Actual Pickup
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.actualPickupAt
                ? new Date(record.actualPickupAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Actual Delivery
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.actualDeliveryAt
                ? new Date(record.actualDeliveryAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              GPS Tracking ID
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.gpsTrackingId || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Distance (km)
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.distanceKm != null ? String(record.distanceKm) : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Transport Cost
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.transportCost != null
                ? String(record.transportCost)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.currency || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              POD Signed By
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.podSignedByName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              POD Signed At
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.podSignedAt
                ? new Date(record.podSignedAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.notes || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "delivered"
                    ? "success"
                    : record.status === "cancelled"
                      ? "destructive"
                      : record.status === "in_transit"
                        ? "default"
                        : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
