import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { capSpaceControls } from "@/db/schema";
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
  },
  {
    name: "containerType",
    label: "Container Type",
    type: "text",
    required: true,
  },
  {
    name: "containerSize",
    label: "Container Size",
    type: "text",
    required: true,
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

export default async function EditSpaceControlPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "capacity:edit")))
    redirect("/capacity-voyage-management");

  const { id } = await params;
  const sc = await db
    .select()
    .from(capSpaceControls)
    .where(
      and(
        eq(capSpaceControls.id, id),
        eq(capSpaceControls.tenantId, session.tenantId),
        isNull(capSpaceControls.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!sc) notFound();

  const initialData: Record<string, unknown> = {
    vesselScheduleId: sc.vesselScheduleId ?? "",
    portRotationId: sc.portRotationId ?? "",
    bookingReference: sc.bookingReference,
    containerType: sc.containerType,
    containerSize: sc.containerSize,
    quantityTeu: Number(sc.quantityTeu),
    weightMt: sc.weightMt != null ? Number(sc.weightMt) : "",
    shipperName: sc.shipperName ?? "",
    consigneeName: sc.consigneeName ?? "",
    commodity: sc.commodity ?? "",
    hazmatClass: sc.hazmatClass ?? "",
    reeferTemp: sc.reeferTemp != null ? Number(sc.reeferTemp) : "",
    bookingDate: sc.bookingDate?.toISOString() ?? "",
    cutOffDate: sc.cutOffDate?.toISOString() ?? "",
    status: sc.status,
    notes: sc.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/capacity-voyage-management/space-controls/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Space Control
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CapForm
          entityType="Space Control"
          apiPath={`/api/v1/capacity-voyage-management/space-controls/${id}`}
          fields={FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/capacity-voyage-management/space-controls/${id}`}
        />
      </div>
    </div>
  );
}
