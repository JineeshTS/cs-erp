import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CapForm } from "@/components/capacity-voyage-management/cap-form";
import type { FieldConfig } from "@/components/capacity-voyage-management/cap-form";

const FIELDS: FieldConfig[] = [
  {
    name: "vesselScheduleId",
    label: "Vessel Schedule ID",
    type: "text",
  },
  {
    name: "portRotationId",
    label: "Port Rotation ID",
    type: "text",
  },
  {
    name: "bookingReference",
    label: "Booking Reference",
    type: "text",
    required: true,
    placeholder: "BK-2026-001",
  },
  {
    name: "containerType",
    label: "Container Type",
    type: "text",
    required: true,
    placeholder: "Dry, Reefer, Tank...",
  },
  {
    name: "containerSize",
    label: "Container Size",
    type: "text",
    required: true,
    placeholder: "20, 40, 45",
  },
  {
    name: "quantityTeu",
    label: "Quantity (TEU)",
    type: "number",
    required: true,
  },
  {
    name: "weightMt",
    label: "Weight (MT)",
    type: "number",
  },
  {
    name: "shipperName",
    label: "Shipper Name",
    type: "text",
  },
  {
    name: "consigneeName",
    label: "Consignee Name",
    type: "text",
  },
  {
    name: "commodity",
    label: "Commodity",
    type: "text",
  },
  {
    name: "hazmatClass",
    label: "Hazmat Class",
    type: "text",
    placeholder: "1.1, 2.1, 3, etc.",
  },
  {
    name: "reeferTemp",
    label: "Reefer Temperature",
    type: "number",
  },
  {
    name: "bookingDate",
    label: "Booking Date",
    type: "datetime-local",
  },
  {
    name: "cutOffDate",
    label: "Cut-Off Date",
    type: "datetime-local",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "pending", label: "Pending" },
      { value: "confirmed", label: "Confirmed" },
      { value: "waitlisted", label: "Waitlisted" },
      { value: "rejected", label: "Rejected" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
  },
];

export default async function NewSpaceControlPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "capacity:create"))
  )
    redirect("/capacity-voyage-management");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/capacity-voyage-management/space-controls"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Space Control
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CapForm
          entityType="Space Control"
          apiPath="/api/v1/capacity-voyage-management/space-controls"
          fields={FIELDS}
          returnPath="/capacity-voyage-management/space-controls"
        />
      </div>
    </div>
  );
}
