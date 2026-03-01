import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getBooking } from "@/lib/customer-portal/service";
import { CspForm } from "@/components/customer-portal/csp-form";
import type { FieldConfig } from "@/components/customer-portal/csp-form";

const BOOKING_FIELDS: FieldConfig[] = [
  { name: "customerName", label: "Customer Name", type: "text", required: true },
  { name: "originPort", label: "Origin Port", type: "text", required: true },
  { name: "destinationPort", label: "Destination Port", type: "text", required: true },
  {
    name: "cargoType",
    label: "Cargo Type",
    type: "select",
    required: true,
    options: [
      { value: "general", label: "General" },
      { value: "reefer", label: "Reefer" },
      { value: "hazardous", label: "Hazardous" },
      { value: "bulk", label: "Bulk" },
      { value: "breakbulk", label: "Breakbulk" },
      { value: "roro", label: "RoRo" },
      { value: "tank", label: "Tank" },
      { value: "oversized", label: "Oversized" },
    ],
  },
  { name: "cargoDescription", label: "Cargo Description", type: "textarea" },
  {
    name: "containerType",
    label: "Container Type",
    type: "select",
    options: [
      { value: "20GP", label: "20GP" },
      { value: "40GP", label: "40GP" },
      { value: "40HC", label: "40HC" },
      { value: "20RF", label: "20RF" },
      { value: "40RF", label: "40RF" },
      { value: "20OT", label: "20OT" },
      { value: "40OT", label: "40OT" },
      { value: "20FR", label: "20FR" },
      { value: "40FR", label: "40FR" },
    ],
  },
  { name: "containerCount", label: "Container Count", type: "number" },
  { name: "weight", label: "Weight (kg)", type: "number" },
  { name: "volume", label: "Volume (cbm)", type: "number" },
  { name: "preferredVesselDate", label: "Preferred Vessel Date", type: "datetime-local" },
  { name: "hazardous", label: "Hazardous", type: "checkbox" },
  { name: "temperature", label: "Temperature (C)", type: "number" },
  {
    name: "incoterm",
    label: "Incoterm",
    type: "select",
    options: [
      { value: "FOB", label: "FOB" },
      { value: "CIF", label: "CIF" },
      { value: "CFR", label: "CFR" },
      { value: "EXW", label: "EXW" },
      { value: "FCA", label: "FCA" },
      { value: "CPT", label: "CPT" },
      { value: "CIP", label: "CIP" },
      { value: "DAP", label: "DAP" },
      { value: "DPU", label: "DPU" },
      { value: "DDP", label: "DDP" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "portal:edit")))
    redirect("/customer-portal/bookings");

  const { id } = await params;

  const booking = await getBooking(id, session.tenantId);
  if (!booking) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/customer-portal/bookings/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Booking</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CspForm
          entityType="Booking"
          apiPath={`/api/v1/customer-portal/bookings/${id}`}
          fields={BOOKING_FIELDS}
          initialData={{
            customerName: booking.customerName,
            originPort: booking.originPort,
            destinationPort: booking.destinationPort,
            cargoType: booking.cargoType,
            cargoDescription: booking.cargoDescription ?? "",
            containerType: booking.containerType ?? "",
            containerCount: booking.containerCount,
            weight: booking.weight ?? "",
            volume: booking.volume ?? "",
            preferredVesselDate: booking.preferredVesselDate
              ? booking.preferredVesselDate.toISOString()
              : "",
            hazardous: booking.hazardous,
            temperature: booking.temperature ?? "",
            incoterm: booking.incoterm ?? "",
            notes: booking.notes ?? "",
          }}
          isEdit
          returnPath={`/customer-portal/bookings/${id}`}
        />
      </div>
    </div>
  );
}
