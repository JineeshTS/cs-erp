import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getReeferBooking } from "@/lib/reefer-container-management/service";
import { Badge } from "@/components/ui/badge";

export default async function ReeferBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "reefer:read")))
    redirect("/reefer-container-management");

  const { id } = await params;

  const record = await getReeferBooking(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "reefer:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/reefer-container-management/reefer-bookings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.bookingRef}</h1>
          <p className="text-sm text-gray-500">
            {record.customerName} &middot; {record.commodityName}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/reefer-container-management/reefer-bookings/${id}/edit`}
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
            <dd className="mt-1 text-gray-900">{record.bookingRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
            <dd className="mt-1 text-gray-900">{record.customerName}</dd>
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
          <div>
            <dt className="text-sm font-medium text-gray-500">Container Type</dt>
            <dd className="mt-1 text-gray-900">{record.containerType || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Commodity Name</dt>
            <dd className="mt-1 text-gray-900">{record.commodityName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Commodity Code</dt>
            <dd className="mt-1 text-gray-900">{record.commodityCode || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Required Temp (&deg;C)</dt>
            <dd className="mt-1 text-gray-900">{record.requiredTempC ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Required Humidity</dt>
            <dd className="mt-1 text-gray-900">{record.requiredHumidity ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Ventilation Setting</dt>
            <dd className="mt-1 text-gray-900">{record.ventilationSetting || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Atmosphere Control</dt>
            <dd className="mt-1 text-gray-900">{record.atmosphereControl || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">O2 Level</dt>
            <dd className="mt-1 text-gray-900">{record.o2Level ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">CO2 Level</dt>
            <dd className="mt-1 text-gray-900">{record.co2Level ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Origin Port</dt>
            <dd className="mt-1 text-gray-900">{record.originPort}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Destination Port</dt>
            <dd className="mt-1 text-gray-900">{record.destinationPort}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{record.vesselName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage Number</dt>
            <dd className="mt-1 text-gray-900">{record.voyageNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Load Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.loadDate
                ? new Date(record.loadDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Discharge Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.dischargeDate
                ? new Date(record.dischargeDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Transit Days</dt>
            <dd className="mt-1 text-gray-900">{record.transitDays ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Accepted By</dt>
            <dd className="mt-1 text-gray-900">{record.acceptedByName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Accepted At</dt>
            <dd className="mt-1 text-gray-900">
              {record.acceptedAt
                ? new Date(record.acceptedAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "completed" || record.status === "accepted"
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
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Special Instructions</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.specialInstructions || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {record.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
