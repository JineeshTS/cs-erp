import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { IcdForm } from "@/components/intermodal-icd-operations/icd-form";
import type { FieldConfig } from "@/components/intermodal-icd-operations/icd-form";
import { getPortOptions, getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewLastMileDeliveryPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "intermodal:create"))
  )
    redirect("/intermodal-icd-operations/last-mile-deliveries");

  const [portOpts, customerOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const LAST_MILE_DELIVERY_FIELDS: FieldConfig[] = [
    { name: "bookingRef", label: "Booking Ref", type: "text" },
    { name: "customerName", label: "Customer Name", type: "select", options: customerOpts, required: true },
    { name: "customerCode", label: "Customer Code", type: "select", options: customerOpts },
    { name: "containerNumber", label: "Container Number", type: "text" },
    { name: "containerSize", label: "Container Size", type: "text" },
    { name: "cargoDescription", label: "Cargo Description", type: "textarea" },
    { name: "grossWeightKg", label: "Gross Weight (kg)", type: "text" },
    {
      name: "deliveryType",
      label: "Delivery Type",
      type: "select",
      required: true,
      options: [
        { value: "door_to_door", label: "Door to Door" },
        { value: "port_to_door", label: "Port to Door" },
        { value: "icd_to_door", label: "ICD to Door" },
      ],
    },
    { name: "pickupLocation", label: "Pickup Location", type: "select", options: portOpts, required: true },
    { name: "deliveryAddress", label: "Delivery Address", type: "textarea", required: true },
    { name: "deliveryCity", label: "Delivery City", type: "text" },
    { name: "deliveryPostalCode", label: "Postal Code", type: "text" },
    { name: "deliveryContactName", label: "Delivery Contact", type: "text" },
    { name: "deliveryContactPhone", label: "Contact Phone", type: "text" },
    { name: "scheduledDeliveryAt", label: "Scheduled Delivery", type: "datetime-local" },
    { name: "actualDeliveryAt", label: "Actual Delivery", type: "datetime-local" },
    { name: "deliveryWindowStart", label: "Window Start", type: "text", placeholder: "08:00" },
    { name: "deliveryWindowEnd", label: "Window End", type: "text", placeholder: "17:00" },
    { name: "assignedVehicle", label: "Assigned Vehicle", type: "text" },
    { name: "assignedDriver", label: "Assigned Driver", type: "text" },
    { name: "deliveryAttempts", label: "Delivery Attempts", type: "number" },
    { name: "podUrl", label: "POD URL", type: "text" },
    { name: "podSignedAt", label: "POD Signed At", type: "datetime-local" },
    { name: "deliveryCost", label: "Delivery Cost", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "failureReason", label: "Failure Reason", type: "textarea" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/intermodal-icd-operations/last-mile-deliveries"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Last Mile Delivery
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IcdForm
          entityType="Last Mile Delivery"
          apiPath="/api/v1/intermodal-icd-operations/last-mile-deliveries"
          fields={LAST_MILE_DELIVERY_FIELDS}
          returnPath="/intermodal-icd-operations/last-mile-deliveries"
        />
      </div>
    </div>
  );
}
