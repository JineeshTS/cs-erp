import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { IcdForm } from "@/components/intermodal-icd-operations/icd-form";
import type { FieldConfig } from "@/components/intermodal-icd-operations/icd-form";
import { getPortOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewTruckBookingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "intermodal:create"))
  )
    redirect("/intermodal-icd-operations/truck-bookings");

  const [portOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const FIELDS: FieldConfig[] = [
    { name: "transporterName", label: "Transporter Name", type: "text", required: true },
    { name: "transporterCode", label: "Transporter Code", type: "text" },
    { name: "driverName", label: "Driver Name", type: "text" },
    { name: "driverLicense", label: "Driver License", type: "text" },
    { name: "driverPhone", label: "Driver Phone", type: "text" },
    { name: "truckPlateNumber", label: "Truck Plate", type: "text" },
    { name: "trailerPlateNumber", label: "Trailer Plate", type: "text" },
    {
      name: "truckType",
      label: "Truck Type",
      type: "select",
      options: [
        { value: "flatbed", label: "Flatbed" },
        { value: "container_chassis", label: "Container Chassis" },
        { value: "lowbed", label: "Lowbed" },
        { value: "side_loader", label: "Side Loader" },
      ],
    },
    { name: "containerNumber", label: "Container Number", type: "text" },
    { name: "containerSize", label: "Container Size", type: "text" },
    { name: "cargoDescription", label: "Cargo Description", type: "textarea" },
    { name: "grossWeightKg", label: "Gross Weight (kg)", type: "text" },
    { name: "pickupLocation", label: "Pickup Location", type: "select", options: portOpts, required: true },
    { name: "deliveryLocation", label: "Delivery Location", type: "text", required: true },
    { name: "scheduledPickupAt", label: "Scheduled Pickup", type: "datetime-local" },
    { name: "scheduledDeliveryAt", label: "Scheduled Delivery", type: "datetime-local" },
    { name: "actualPickupAt", label: "Actual Pickup", type: "datetime-local" },
    { name: "actualDeliveryAt", label: "Actual Delivery", type: "datetime-local" },
    { name: "gpsTrackingId", label: "GPS Tracking ID", type: "text" },
    { name: "distanceKm", label: "Distance (km)", type: "text" },
    { name: "transportCost", label: "Transport Cost", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "podSignedByName", label: "POD Signed By", type: "text" },
    { name: "podSignedAt", label: "POD Signed At", type: "datetime-local" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/intermodal-icd-operations/truck-bookings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Truck Booking
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IcdForm
          entityType="Truck Booking"
          apiPath="/api/v1/intermodal-icd-operations/truck-bookings"
          fields={FIELDS}
          returnPath="/intermodal-icd-operations/truck-bookings"
        />
      </div>
    </div>
  );
}
