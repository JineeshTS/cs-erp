import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getReeferBooking } from "@/lib/reefer-container-management/service";
import { RcmForm } from "@/components/reefer-container-management/rcm-form";
import type { FieldConfig } from "@/components/reefer-container-management/rcm-form";
import { getPortOptions, getVesselOptions, getCustomerOptions } from "@/lib/lookups";

export default async function EditReeferBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "reefer:edit")))
    redirect("/reefer-container-management");

  const [portOpts, vesselOpts, customerOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
    getCustomerOptions(session.tenantId),
  ]);

  const BOOKING_FIELDS: FieldConfig[] = [
    { name: "customerName", label: "Customer Name", type: "select", options: customerOpts, required: true },
    { name: "customerCode", label: "Customer Code", type: "select", options: customerOpts },
    { name: "containerNumber", label: "Container Number", type: "text" },
    {
      name: "containerSize",
      label: "Container Size",
      type: "select",
      required: true,
      options: [
        { value: "20RF", label: "20RF" },
        { value: "40RF", label: "40RF" },
        { value: "40RH", label: "40RH" },
        { value: "45RH", label: "45RH" },
      ],
    },
    {
      name: "containerType",
      label: "Container Type",
      type: "select",
      required: true,
      options: [
        { value: "integral", label: "Integral" },
        { value: "porthole", label: "Porthole" },
        { value: "clip_on", label: "Clip On" },
      ],
    },
    { name: "commodityName", label: "Commodity Name", type: "text", required: true },
    { name: "commodityCode", label: "Commodity Code", type: "text" },
    { name: "requiredTempC", label: "Required Temp (°C)", type: "text", required: true },
    { name: "requiredHumidity", label: "Required Humidity", type: "text" },
    { name: "ventilationSetting", label: "Ventilation Setting", type: "text" },
    {
      name: "atmosphereControl",
      label: "Atmosphere Control",
      type: "select",
      options: [
        { value: "CA", label: "CA" },
        { value: "MA", label: "MA" },
        { value: "none", label: "None" },
      ],
    },
    { name: "o2Level", label: "O2 Level", type: "text" },
    { name: "co2Level", label: "CO2 Level", type: "text" },
    { name: "originPort", label: "Origin Port", type: "select", options: portOpts, required: true },
    { name: "destinationPort", label: "Destination Port", type: "select", options: portOpts, required: true },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "voyageNumber", label: "Voyage Number", type: "text" },
    { name: "loadDate", label: "Load Date", type: "datetime-local" },
    { name: "dischargeDate", label: "Discharge Date", type: "datetime-local" },
    { name: "transitDays", label: "Transit Days", type: "number" },
    { name: "specialInstructions", label: "Special Instructions", type: "textarea" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;

  const record = await getReeferBooking(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/reefer-container-management/reefer-bookings/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Reefer Booking</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <RcmForm
          entityType="Reefer Booking"
          apiPath={`/api/v1/reefer-container-management/reefer-bookings/${id}`}
          fields={BOOKING_FIELDS}
          initialData={{
            customerName: record.customerName,
            customerCode: record.customerCode ?? "",
            containerNumber: record.containerNumber ?? "",
            containerSize: record.containerSize ?? "",
            containerType: record.containerType ?? "",
            commodityName: record.commodityName,
            commodityCode: record.commodityCode ?? "",
            requiredTempC: record.requiredTempC ?? "",
            requiredHumidity: record.requiredHumidity ?? "",
            ventilationSetting: record.ventilationSetting ?? "",
            atmosphereControl: record.atmosphereControl ?? "",
            o2Level: record.o2Level ?? "",
            co2Level: record.co2Level ?? "",
            originPort: record.originPort,
            destinationPort: record.destinationPort,
            vesselName: record.vesselName ?? "",
            voyageNumber: record.voyageNumber ?? "",
            loadDate: record.loadDate ? new Date(record.loadDate).toISOString() : "",
            dischargeDate: record.dischargeDate ? new Date(record.dischargeDate).toISOString() : "",
            transitDays: record.transitDays ?? "",
            specialInstructions: record.specialInstructions ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/reefer-container-management/reefer-bookings/${id}`}
        />
      </div>
    </div>
  );
}
