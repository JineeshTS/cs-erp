import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { eqyYardSlots } from "@/db/schema";
import { EqyForm } from "@/components/equipment-control-yard-managem/eqy-form";
import type { FieldConfig } from "@/components/equipment-control-yard-managem/eqy-form";

const FIELDS: FieldConfig[] = [
  { name: "yardCode", label: "Yard Code", type: "text", required: true },
  { name: "yardName", label: "Yard Name", type: "text", required: true },
  { name: "terminalCode", label: "Terminal Code", type: "text" },
  { name: "blockCode", label: "Block Code", type: "text" },
  { name: "bayCode", label: "Bay Code", type: "text" },
  { name: "rowCode", label: "Row Code", type: "text" },
  { name: "tierCode", label: "Tier Code", type: "text" },
  { name: "slotCapacity", label: "Slot Capacity", type: "number" },
  { name: "currentOccupancy", label: "Current Occupancy", type: "number" },
  {
    name: "slotType",
    label: "Slot Type",
    type: "select",
    options: [
      { value: "dry", label: "Dry" },
      { value: "reefer", label: "Reefer" },
      { value: "hazmat", label: "Hazmat" },
      { value: "oog", label: "OOG" },
      { value: "empty", label: "Empty" },
    ],
  },
  {
    name: "assignedContainerNumber",
    label: "Assigned Container Number",
    type: "text",
  },
  {
    name: "assignedContainerId",
    label: "Assigned Container ID",
    type: "text",
  },
  { name: "reservedFor", label: "Reserved For", type: "text" },
  { name: "reservedUntil", label: "Reserved Until", type: "datetime-local" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "available", label: "Available" },
      { value: "occupied", label: "Occupied" },
      { value: "reserved", label: "Reserved" },
      { value: "blocked", label: "Blocked" },
      { value: "maintenance", label: "Maintenance" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditYardSlotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "equipment:edit")))
    redirect("/equipment-control-yard-managem");

  const { id } = await params;

  const ys = await db
    .select()
    .from(eqyYardSlots)
    .where(
      and(
        eq(eqyYardSlots.id, id),
        eq(eqyYardSlots.tenantId, session.tenantId),
        isNull(eqyYardSlots.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!ys) notFound();

  const initialData: Record<string, unknown> = {
    yardCode: ys.yardCode,
    yardName: ys.yardName,
    terminalCode: ys.terminalCode ?? "",
    blockCode: ys.blockCode ?? "",
    bayCode: ys.bayCode ?? "",
    rowCode: ys.rowCode ?? "",
    tierCode: ys.tierCode ?? "",
    slotCapacity: Number(ys.slotCapacity ?? 0),
    currentOccupancy: Number(ys.currentOccupancy ?? 0),
    slotType: ys.slotType,
    assignedContainerNumber: ys.assignedContainerNumber ?? "",
    assignedContainerId: ys.assignedContainerId ?? "",
    reservedFor: ys.reservedFor ?? "",
    reservedUntil: ys.reservedUntil ? ys.reservedUntil.toISOString() : "",
    status: ys.status,
    notes: ys.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/equipment-control-yard-managem/yard-slots/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Yard Slot</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <EqyForm
          entityType="Yard Slot"
          apiPath={`/api/v1/equipment-control-yard-managem/yard-slots/${id}`}
          fields={FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/equipment-control-yard-managem/yard-slots/${id}`}
        />
      </div>
    </div>
  );
}
