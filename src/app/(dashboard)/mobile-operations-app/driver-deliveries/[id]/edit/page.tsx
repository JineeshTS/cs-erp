import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDriverDelivery } from "@/lib/mobile-operations-app/service";
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

export default async function EditDriverDeliveryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mob:edit")))
    redirect("/mobile-operations-app/driver-deliveries");

  const { id } = await params;

  const record = await getDriverDelivery(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/mobile-operations-app/driver-deliveries/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Driver Delivery
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MobForm
          entityType="Driver Delivery"
          apiPath={`/api/v1/mobile-operations-app/driver-deliveries/${id}`}
          fields={DRIVER_DELIVERY_FIELDS}
          initialData={{
            deliveryType: record.deliveryType,
            containerNumber: record.containerNumber ?? "",
            driverName: record.driverName ?? "",
            truckPlate: record.truckPlate ?? "",
            originLocation: record.originLocation ?? "",
            destinationLocation: record.destinationLocation ?? "",
            podReceivedBy: record.podReceivedBy ?? "",
            podSignatureUrl: record.podSignatureUrl ?? "",
            deliveredAt: record.deliveredAt
              ? record.deliveredAt.toISOString().slice(0, 16)
              : "",
            podPhotoCount: record.podPhotoCount ?? "",
            latitude: record.latitude ?? "",
            longitude: record.longitude ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/mobile-operations-app/driver-deliveries/${id}`}
        />
      </div>
    </div>
  );
}
