import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getLastMileDelivery } from "@/lib/intermodal-icd-operations/service";
import { Badge } from "@/components/ui/badge";

export default async function LastMileDeliveryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "intermodal:read")))
    redirect("/intermodal-icd-operations");

  const { id } = await params;
  const record = await getLastMileDelivery(id, session.tenantId);
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
          href="/intermodal-icd-operations/last-mile-deliveries"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.deliveryRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.customerName}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/intermodal-icd-operations/last-mile-deliveries/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Delivery Ref</dt>
            <dd className="mt-1 text-gray-900">{record.deliveryRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Booking Ref</dt>
            <dd className="mt-1 text-gray-900">{record.bookingRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
            <dd className="mt-1 text-gray-900">{record.customerName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Customer Code</dt>
            <dd className="mt-1 text-gray-900">{record.customerCode || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Number</dt>
            <dd className="mt-1 text-gray-900">{record.containerNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Size</dt>
            <dd className="mt-1 text-gray-900">{record.containerSize || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Cargo Description</dt>
            <dd className="mt-1 text-gray-900">{record.cargoDescription || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Gross Weight (kg)</dt>
            <dd className="mt-1 text-gray-900">{record.grossWeightKg ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Delivery Type</dt>
            <dd className="mt-1 text-gray-900">{record.deliveryType || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Pickup Location</dt>
            <dd className="mt-1 text-gray-900">{record.pickupLocation || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Delivery Address</dt>
            <dd className="mt-1 text-gray-900">{record.deliveryAddress || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Delivery City</dt>
            <dd className="mt-1 text-gray-900">{record.deliveryCity || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Postal Code</dt>
            <dd className="mt-1 text-gray-900">{record.deliveryPostalCode || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Delivery Contact</dt>
            <dd className="mt-1 text-gray-900">{record.deliveryContactName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Contact Phone</dt>
            <dd className="mt-1 text-gray-900">{record.deliveryContactPhone || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Scheduled Delivery</dt>
            <dd className="mt-1 text-gray-900">
              {record.scheduledDeliveryAt
                ? new Date(record.scheduledDeliveryAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Actual Delivery</dt>
            <dd className="mt-1 text-gray-900">
              {record.actualDeliveryAt
                ? new Date(record.actualDeliveryAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Window Start</dt>
            <dd className="mt-1 text-gray-900">{record.deliveryWindowStart || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Window End</dt>
            <dd className="mt-1 text-gray-900">{record.deliveryWindowEnd || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Assigned Vehicle</dt>
            <dd className="mt-1 text-gray-900">{record.assignedVehicle || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Assigned Driver</dt>
            <dd className="mt-1 text-gray-900">{record.assignedDriver || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Delivery Attempts</dt>
            <dd className="mt-1 text-gray-900">{record.deliveryAttempts ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">POD URL</dt>
            <dd className="mt-1 text-gray-900">{record.podUrl || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">POD Signed At</dt>
            <dd className="mt-1 text-gray-900">
              {record.podSignedAt
                ? new Date(record.podSignedAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Delivery Cost</dt>
            <dd className="mt-1 text-gray-900">{record.deliveryCost ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Failure Reason</dt>
            <dd className="mt-1 text-gray-900">{record.failureReason || "-"}</dd>
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
                  record.status === "delivered"
                    ? "success"
                    : record.status === "failed"
                      ? "destructive"
                      : record.status === "cancelled"
                        ? "destructive"
                        : record.status === "in_transit"
                          ? "warning"
                          : record.status === "dispatched"
                            ? "warning"
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
