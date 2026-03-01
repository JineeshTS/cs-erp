import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getBooking } from "@/lib/customer-portal/service";
import { Badge } from "@/components/ui/badge";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "portal:read")))
    redirect("/");

  const { id } = await params;

  const booking = await getBooking(id, session.tenantId);
  if (!booking) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "portal:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/customer-portal/bookings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {booking.bookingRef}
          </h1>
          <p className="text-sm text-gray-500">Booking details</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/customer-portal/bookings/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Booking Ref</dt>
            <dd className="mt-1 text-gray-900">{booking.bookingRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Customer Name
            </dt>
            <dd className="mt-1 text-gray-900">{booking.customerName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Origin Port</dt>
            <dd className="mt-1 text-gray-900">{booking.originPort}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Destination Port
            </dt>
            <dd className="mt-1 text-gray-900">{booking.destinationPort}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Cargo Type</dt>
            <dd className="mt-1 text-gray-900">{booking.cargoType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Type
            </dt>
            <dd className="mt-1 text-gray-900">
              {booking.containerType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Count
            </dt>
            <dd className="mt-1 text-gray-900">{booking.containerCount}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Weight</dt>
            <dd className="mt-1 text-gray-900">
              {booking.weight != null ? `${booking.weight} kg` : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Volume</dt>
            <dd className="mt-1 text-gray-900">
              {booking.volume != null ? `${booking.volume} cbm` : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Preferred Vessel Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {booking.preferredVesselDate
                ? new Date(booking.preferredVesselDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  booking.status === "confirmed"
                    ? "success"
                    : booking.status === "cancelled"
                      ? "destructive"
                      : "secondary"
                }
              >
                {booking.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Hazardous</dt>
            <dd className="mt-1 text-gray-900">
              {booking.hazardous ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Temperature</dt>
            <dd className="mt-1 text-gray-900">
              {booking.temperature != null ? `${booking.temperature} C` : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Incoterm</dt>
            <dd className="mt-1 text-gray-900">
              {booking.incoterm || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Cargo Description
            </dt>
            <dd className="mt-1 text-gray-900">
              {booking.cargoDescription || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{booking.notes || "-"}</dd>
          </div>
        </dl>
      </div>

      {(booking.confirmedAt || booking.cancelledAt) && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Status History
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {booking.confirmedAt && (
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Confirmed At
                </dt>
                <dd className="mt-1 text-gray-900">
                  {new Date(booking.confirmedAt).toLocaleString()}
                </dd>
              </div>
            )}
            {booking.cancelledAt && (
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Cancelled At
                </dt>
                <dd className="mt-1 text-gray-900">
                  {new Date(booking.cancelledAt).toLocaleString()}
                </dd>
              </div>
            )}
            {booking.cancellationReason && (
              <div className="sm:col-span-2 lg:col-span-3">
                <dt className="text-sm font-medium text-gray-500">
                  Cancellation Reason
                </dt>
                <dd className="mt-1 text-gray-900">
                  {booking.cancellationReason}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
