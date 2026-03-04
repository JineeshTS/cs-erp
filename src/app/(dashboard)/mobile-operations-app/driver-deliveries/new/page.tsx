import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { MobForm, type FieldConfig } from "@/components/mobile-operations-app/mob-form";

const DRIVER_DELIVERY_FIELDS: FieldConfig[] = [
  {
    name: "deliveryType",
    label: "Delivery Type",
    type: "select",
    required: true,
    options: [
      { value: "pickup", label: "Pickup" },
      { value: "delivery", label: "Delivery" },
      { value: "return_empty", label: "Return Empty" },
      { value: "cross_dock", label: "Cross Dock" },
      { value: "relay", label: "Relay" },
    ],
  },
  { name: "containerNumber", label: "Container Number", type: "text" },
  { name: "driverName", label: "Driver Name", type: "text" },
  { name: "truckPlate", label: "Truck Plate", type: "text" },
  { name: "originLocation", label: "Origin Location", type: "text" },
  { name: "destinationLocation", label: "Destination Location", type: "text" },
  { name: "podReceivedBy", label: "POD Received By", type: "text" },
  { name: "podSignatureUrl", label: "POD Signature URL", type: "text" },
  { name: "deliveredAt", label: "Delivered At", type: "datetime-local" },
  { name: "podPhotoCount", label: "POD Photo Count", type: "number" },
  { name: "latitude", label: "Latitude", type: "text" },
  { name: "longitude", label: "Longitude", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewDriverDeliveryPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "mob:create"))
  )
    redirect("/mobile-operations-app/driver-deliveries");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/mobile-operations-app/driver-deliveries"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Driver Delivery
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MobForm
          entityType="Driver Delivery"
          apiPath="/api/v1/mobile-operations-app/driver-deliveries"
          fields={DRIVER_DELIVERY_FIELDS}
          returnPath="/mobile-operations-app/driver-deliveries"
        />
      </div>
    </div>
  );
}
